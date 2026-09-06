import { NextRequest, NextResponse } from 'next/server';

// ============================================================
// 1. Definimos la estructura de datos que esperamos del frontend
// ============================================================
interface DatosPaciente {
  nombre: string;
  edad: string;
  sexo: string;
  dni: string;
  motivo: string;
  fc: string;
  fr: string;
  spo2: string;
  ta: string;
  temp: string;
  glasgow: string;
  antecedentes: string;
}

// ============================================================
// 2. Función para construir el prompt para Ollama
// ============================================================
function construirPrompt(datos: DatosPaciente): string {
  return `
Eres un experto en triage clínico. Basándote en los siguientes datos del paciente, 
debes asignar un nivel de urgencia (I a V) y proporcionar recomendaciones.

Datos del paciente:
- Nombre: ${datos.nombre}
- Edad: ${datos.edad} años
- Sexo: ${datos.sexo}
- Motivo de consulta: ${datos.motivo}
- Frecuencia cardíaca: ${datos.fc} lpm
- Frecuencia respiratoria: ${datos.fr} rpm
- SpO₂: ${datos.spo2} %
- Tensión arterial: ${datos.ta} mmHg
- Temperatura: ${datos.temp} °C
- Glasgow: ${datos.glasgow}/15
- Antecedentes: ${datos.antecedentes}

Responde ÚNICAMENTE con un objeto JSON con la siguiente estructura exacta:
{
  "nivel": "I" | "II" | "III" | "IV" | "V",
  "color": "ROJO" | "NARANJA" | "AMARILLO" | "VERDE" | "AZUL",
  "emoji": "🔴" | "🟠" | "🟡" | "🟢" | "🔵",
  "clase_css": "nivel-rojo" | "nivel-naranja" | "nivel-amarillo" | "nivel-verde" | "nivel-azul",
  "justificacion": "Texto breve explicando por qué se asigna este nivel",
  "acciones": ["Acción 1", "Acción 2", "Acción 3"],
  "alarmas": ["Alarma 1", "Alarma 2"],
  "tiempo_espera": "texto del tiempo de espera estimado"
}

No incluyas texto adicional, solo el JSON.`;
}

// ============================================================
// 3. Función para consultar Ollama
// ============================================================
async function consultarOllama(prompt: string): Promise<any> {
  const url = 'http://127.0.0.1:11434/api/chat';
  
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma2',  // o 'argano-contract-assistant' si lo tienes
      messages: [
        { role: 'system', content: 'Eres un asistente experto en triage clínico. Siempre respondes en formato JSON.' },
        { role: 'user', content: prompt }
      ],
      stream: false,
      options: {
        temperature: 0.1,  // Bajo para respuestas más deterministas
      }
    })
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Ollama respondió con error: ${response.status} - ${errorText}`);
  }

  const data = await response.json();
  // En /api/chat, la respuesta está en data.message.content
  const content = data.message?.content || '';
  
  // Intentamos extraer el JSON de la respuesta (por si hay texto adicional)
  const jsonMatch = content.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    throw new Error('La respuesta de Ollama no contiene un JSON válido');
  }

  return JSON.parse(jsonMatch[0]);
}

// ============================================================
// 4. Endpoint POST
// ============================================================
export async function POST(request: NextRequest) {
  try {
    // 4.1 Leer el cuerpo de la solicitud
    const body = await request.json();
    console.log('📩 Datos recibidos en /api/triage:', body);

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

    // 4.3 Construir el prompt con los datos del paciente
    const prompt = construirPrompt(body as DatosPaciente);
    console.log('📝 Prompt enviado a Ollama:', prompt);

    // 4.4 Consultar a Ollama
    let resultado;
    try {
      resultado = await consultarOllama(prompt);
    } catch (ollamaError: any) {
      console.error('❌ Error al consultar Ollama:', ollamaError.message);
      
      // Si falla Ollama, devolvemos un resultado simulado (para no dejar al usuario sin respuesta)
      resultado = {
        nivel: 'III',
        color: 'AMARILLO',
        emoji: '🟡',
        clase_css: 'nivel-amarillo',
        justificacion: `No se pudo conectar con el modelo de IA (${ollamaError.message}). Se devuelve resultado simulado.`,
        acciones: ['Registrar signos vitales', 'Mantener en observación', 'Esperar evaluación médica'],
        alarmas: ['Dificultad respiratoria', 'Pérdida de conocimiento', 'Dolor intenso'],
        tiempo_espera: '30 minutos'
      };
    }

    console.log('✅ Resultado del triage:', resultado);

    // 4.5 Devolver la respuesta al frontend
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