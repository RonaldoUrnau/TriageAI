import { NextRequest, NextResponse } from 'next/server';
import { recuperarContextoTriage } from '@/lib/triage-rag';
import type { DatosPaciente, ResultadoTriage } from '@/lib/triage-history';

export const dynamic = 'force-dynamic';


// 1. Función para construir el prompt enriquecido con RAG para Ollama

function construirPromptRAG(datos: DatosPaciente, contextoRAG: string): string {
  return `
Eres un médico experto en Triage de Urgencias. Clasifica al paciente según los siguientes protocolos de referencia:

[PROTOCOLOS OFICIALES (RAG)]:
${contextoRAG}

[DATOS PACIENTE]:
- Nombre: ${datos.nombre}, Edad: ${datos.edad} años, Sexo: ${datos.sexo || 'N/E'}
- Motivo: ${datos.motivo}
- Signos vitales: FC ${datos.fc} lpm, FR ${datos.fr} rpm, SpO2 ${datos.spo2}%, TA ${datos.ta} mmHg, Temp ${datos.temp}°C, Glasgow ${datos.glasgow}/15
- Antecedentes: ${datos.antecedentes || 'Sin antecedentes'}

Devuelve EXCLUSIVAMENTE un JSON válido (sin explicaciones adicionales fuera del JSON):
{
  "nivel": "I" | "II" | "III" | "IV" | "V",
  "color": "ROJO" | "NARANJA" | "AMARILLO" | "VERDE" | "AZUL",
  "emoji": "🔴" | "🟠" | "🟡" | "🟢" | "🔵",
  "clase_css": "nivel-rojo" | "nivel-naranja" | "nivel-amarillo" | "nivel-verde" | "nivel-azul",
  "justificacion": "Explicación breve citando el protocolo o discriminador clínico aplicado",
  "acciones": ["Acción médica 1", "Acción médica 2"],
  "alarmas": ["Signo alarma 1", "Signo alarma 2"],
  "tiempo_espera": "tiempo de espera según protocolo (ej. 10 a 15 min)",
  "fuentes_rag": ["protocolo_aplicado"]
}`;
}


// 2. Función para consultar Ollama

async function consultarOllama(prompt: string): Promise<ResultadoTriage> {
  const url = process.env.OLLAMA_BASE_URL
    ? `${process.env.OLLAMA_BASE_URL}/api/chat`
    : 'http://127.0.0.1:11434/api/chat';

  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma2',
      messages: [
        { role: 'system', content: 'Eres un asistente experto en triage clínico basado en evidencia y protocolos. Siempre respondes exclusivamente en formato JSON válido.' },
        { role: 'user', content: prompt }
      ],
      stream: false,
      options: {
        temperature: 0.1,
        num_predict: 400,
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama respondió con error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  const content = data.message?.content || '';

  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('La respuesta de Ollama no contiene un JSON válido');
  }

  return JSON.parse(jsonMatch[0]);
}


// 4. Endpoint POST

export async function POST(request: NextRequest) {
  try {
    // 4.1 Leer el cuerpo de la solicitud
    const body = await request.json();
    console.log('📩 Datos del paciente recibidos en /api/triage:', body.nombre, body.motivo);

    // 4.2 Validar campos obligatorios
    const camposRequeridos: (keyof DatosPaciente)[] = [
      'nombre', 'edad', 'motivo', 'fc', 'spo2', 'ta'
    ];
    const faltantes = camposRequeridos.filter(campo => !body[campo]?.trim());

    if (faltantes.length > 0) {
      console.warn('⚠️ Campos faltantes:', faltantes);
      return NextResponse.json(
        { error: `Completá los campos obligatorios (*): ${faltantes.join(', ')}` },
        { status: 400 }
      );
    }

    // 4.3 Recuperar contexto semántico de protocolos clínicos vía RAG
    console.log('📚 Consultando base de conocimiento RAG para este paciente...');
    const { contexto, fuentes } = await recuperarContextoTriage(body as DatosPaciente);
    console.log('✅ RAG recuperó fuentes:', fuentes);

    // 4.4 Construir el prompt enriquecido con las guías clínicas
    const prompt = construirPromptRAG(body as DatosPaciente, contexto);

    // 4.5 Consultar a Ollama (gemma2)
    let resultado: ResultadoTriage;
    try {
      resultado = await consultarOllama(prompt);

      // Asegurarse de que las fuentes recuperadas por RAG estén presentes en el resultado
      if (!resultado.fuentes_rag || !Array.isArray(resultado.fuentes_rag) || resultado.fuentes_rag.length === 0) {
        resultado.fuentes_rag = fuentes;
      }
    } catch (ollamaError: any) {
      console.error('❌ Error al consultar Ollama:', ollamaError.message);

      resultado = {
        nivel: 'III',
        color: 'AMARILLO',
        emoji: '🟡',
        clase_css: 'nivel-amarillo',
        justificacion: `No se pudo conectar con el modelo de IA (${ollamaError.message}). Se devuelve resultado de contingencia basado en reglas generales.`,
        acciones: ['Registrar signos vitales', 'Mantener en observación', 'Esperar evaluación médica'],
        alarmas: ['Dificultad respiratoria', 'Pérdida de conocimiento', 'Dolor intenso'],
        tiempo_espera: '30 a 60 minutos',
        fuentes_rag: fuentes
      };
    }

    console.log('✅ Resultado del triage con RAG:', resultado.nivel, resultado.color);

    // 4.6 Devolver la respuesta al frontend con la información del RAG
    return NextResponse.json({
      datos: body,
      resultado
    });

  } catch (error: any) {
    console.error('❌ Error general en /api/triage:', error);
    console.error('Stack:', error.stack);

    const mensaje = process.env.NODE_ENV === 'development'
      ? `Error interno: ${error.message}`
      : 'Error al procesar el triage';

    return NextResponse.json(
      { error: mensaje },
      { status: 500 }
    );
  }
}


// 5. Endpoint GET para verificar estado del RAG

export async function GET() {
  return NextResponse.json({
    status: 'ok',
    sistema: 'Triage Clínico con RAG',
    knowledge_base: 'knowledge_base/triage',
    embed_model: 'nomic-embed-text',
    llm_model: 'gemma2'
  });
}

