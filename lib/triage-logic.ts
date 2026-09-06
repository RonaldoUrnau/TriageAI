export interface DatosPaciente {
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

export interface ResultadoTriage {
  nivel: string;        // I, II, III, IV, V
  color: string;        // ROJO, NARANJA, AMARILLO, VERDE, AZUL
  emoji: string;        // 🔴, 🟠, 🟡, 🟢, 🔵
  clase_css: string;    // nivel-rojo, nivel-naranja, etc.
  justificacion: string;
  acciones: string[];
  alarmas: string[];
  tiempo_espera: string;
}

// Función para llamar a Ollama (gemma2) con un prompt
async function llamarOllama(prompt: string): Promise<string> {
  const url = process.env.OLLAMA_BASE_URL || 'http://127.0.0.1:11434/api/generate';
  const response = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: 'gemma2',  // También puedes usar 'argano-contract-assistant' si lo tienes
      prompt: prompt,
      stream: false,
      options: {
        temperature: 0.2,
        maxTokens: 500,
      }
    }),
  });

  if (!response.ok) {
    throw new Error(`Error en Ollama: ${response.status} ${response.statusText}`);
  }

  const data = await response.json();
  return data.response; // Ollama devuelve { response: "...", ... }
}

// Función principal de triage
export async function consultarModelo(datos: DatosPaciente): Promise<ResultadoTriage> {
  // Construir un prompt estructurado para el modelo
  const prompt = `
Eres un sistema de triage médico de urgencias. Evalúa al paciente con estos datos y devuelve ÚNICAMENTE un objeto JSON con el siguiente formato:
{
  "nivel": "I" | "II" | "III" | "IV" | "V",
  "color": "ROJO" | "NARANJA" | "AMARILLO" | "VERDE" | "AZUL",
  "justificacion": "breve justificación clínica",
  "acciones": ["acción1", "acción2", "acción3"],
  "alarmas": ["alarma1", "alarma2"],
  "tiempo_espera": "tiempo estimado de espera"
}

Datos del paciente:
- Edad: ${datos.edad} años
- Sexo: ${datos.sexo}
- Síntoma principal: ${datos.motivo}
- Frecuencia cardíaca: ${datos.fc} lpm
- Frecuencia respiratoria: ${datos.fr} rpm
- SpO₂: ${datos.spo2}%
- Presión arterial: ${datos.ta} mmHg
- Temperatura: ${datos.temp} °C
- Glasgow: ${datos.glasgow}/15
- Antecedentes: ${datos.antecedentes}

Usa los criterios de triaje avanzado (Manchester, NEWS2, etc.) y prioriza la gravedad.
Devuelve SOLO el objeto JSON, sin texto adicional.
`;

  try {
    // Llamar a Ollama
    const respuestaTexto = await llamarOllama(prompt);
    console.log('🤖 Respuesta de Ollama (cruda):', respuestaTexto);

    // Intentar parsear la respuesta como JSON
    // Ollama puede devolver texto con markdown, así que limpiamos
    const jsonMatch = respuestaTexto.match(/\{[\s\S]*\}/);
    if (!jsonMatch) {
      throw new Error('No se pudo extraer un objeto JSON de la respuesta de Ollama.');
    }

    const parsed = JSON.parse(jsonMatch[0]);

    // Mapear a nuestra interfaz (con emoji y clase CSS)
    const colorMap: Record<string, { emoji: string; clase: string; tiempo: string }> = {
      'ROJO': { emoji: '🔴', clase: 'nivel-rojo', tiempo: '0 minutos (inmediato)' },
      'NARANJA': { emoji: '🟠', clase: 'nivel-naranja', tiempo: '10 minutos' },
      'AMARILLO': { emoji: '🟡', clase: 'nivel-amarillo', tiempo: '30 minutos' },
      'VERDE': { emoji: '🟢', clase: 'nivel-verde', tiempo: '120 minutos' },
      'AZUL': { emoji: '🔵', clase: 'nivel-azul', tiempo: '240 minutos' },
    };

    const colorInfo = colorMap[parsed.color] || colorMap['AMARILLO'];

    return {
      nivel: parsed.nivel || 'III',
      color: parsed.color || 'AMARILLO',
      emoji: colorInfo.emoji,
      clase_css: colorInfo.clase,
      justificacion: parsed.justificacion || 'Evaluación automática con inteligencia artificial.',
      acciones: parsed.acciones || ['Registrar signos vitales', 'Observar evolución'],
      alarmas: parsed.alarmas || ['Monitorizar constantemente'],
      tiempo_espera: parsed.tiempo_espera || colorInfo.tiempo,
    };
  } catch (error) {
    console.error('❌ Error en consultarModelo:', error);
    // Fallback a simulación en caso de error
    return {
      nivel: 'III',
      color: 'AMARILLO',
      emoji: '🟡',
      clase_css: 'nivel-amarillo',
      justificacion: '⚠️ Error al conectar con el modelo de IA. Se muestra una evaluación simulada.',
      acciones: ['Registrar signos vitales', 'Esperar evaluación médica'],
      alarmas: ['Dificultad respiratoria', 'Pérdida de conocimiento'],
      tiempo_espera: '30 minutos',
    };
  }
}