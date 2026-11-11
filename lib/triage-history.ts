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
  nivel: string;
  color: string;
  emoji: string;
  clase_css: string;
  justificacion: string;
  acciones: string[];
  alarmas: string[];
  tiempo_espera: string;
  fuentes_rag?: string[];
}

export interface RegistroHistorialTriage {
  id: string;
  timestamp: string; // ISO format
  datos: DatosPaciente;
  resultado: ResultadoTriage;
}

export interface EstiloNivelTriage {
  bg: string;
  border: string;
  text: string;
  badge: string;
}

export const COLOR_STYLES_TRIAGE: Record<string, EstiloNivelTriage> = {
  "nivel-rojo": {
    bg: "bg-red-50",
    border: "border-red-500",
    text: "text-red-900",
    badge: "bg-red-600 text-white",
  },
  "nivel-naranja": {
    bg: "bg-orange-50",
    border: "border-orange-500",
    text: "text-orange-900",
    badge: "bg-orange-500 text-white",
  },
  "nivel-amarillo": {
    bg: "bg-yellow-50",
    border: "border-yellow-500",
    text: "text-yellow-900",
    badge: "bg-yellow-500 text-slate-900 font-bold",
  },
  "nivel-verde": {
    bg: "bg-emerald-50",
    border: "border-emerald-500",
    text: "text-emerald-900",
    badge: "bg-emerald-600 text-white",
  },
  "nivel-azul": {
    bg: "bg-blue-50",
    border: "border-blue-500",
    text: "text-blue-900",
    badge: "bg-blue-600 text-white",
  },
};

export function formatearFechaTriage(timestamp: string): string {
  return new Date(timestamp).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });
}

const STORAGE_KEY = "triage_ai_history";

/**
 * Obtiene todos los registros guardados en el historial
 */
export function obtenerHistorial(): RegistroHistorialTriage[] {
  if (typeof window === "undefined") return [];
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (err) {
    console.error("Error al leer el historial de TriageAI:", err);
    return [];
  }
}

/**
 * Guarda una nueva evaluación en el historial
 */
export function guardarEnHistorial(
  datos: DatosPaciente,
  resultado: ResultadoTriage
): RegistroHistorialTriage {
  const nuevoRegistro: RegistroHistorialTriage = {
    id: `eval_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    timestamp: new Date().toISOString(),
    datos,
    resultado,
  };

  if (typeof window !== "undefined") {
    try {
      const historial = obtenerHistorial();
      const actualizado = [nuevoRegistro, ...historial];
      localStorage.setItem(STORAGE_KEY, JSON.stringify(actualizado));
    } catch (err) {
      console.error("Error al guardar en el historial:", err);
    }
  }

  return nuevoRegistro;
}

/**
 * Busca un registro específico por ID
 */
export function obtenerRegistroPorId(id: string): RegistroHistorialTriage | null {
  const historial = obtenerHistorial();
  return historial.find((reg) => reg.id === id) || null;
}

/**
 * Elimina un registro individual por ID
 */
export function eliminarRegistroPorId(id: string): RegistroHistorialTriage[] {
  if (typeof window === "undefined") return [];
  try {
    const historial = obtenerHistorial();
    const filtrado = historial.filter((reg) => reg.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtrado));
    return filtrado;
  } catch (err) {
    console.error("Error al eliminar del historial:", err);
    return obtenerHistorial();
  }
}

/**
 * Limpia todo el historial
 */
export function limpiarTodoHistorial(): void {
  if (typeof window !== "undefined") {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (err) {
      console.error("Error al limpiar historial:", err);
    }
  }
}

/**
 * Exporta el historial en formato JSON descargable
 */
export function descargarHistorialJSON(): void {
  if (typeof window === "undefined") return;
  const data = obtenerHistorial();
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `triage_ai_historial_${new Date().toISOString().slice(0, 10)}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
