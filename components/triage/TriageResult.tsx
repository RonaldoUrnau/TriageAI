"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import {
  obtenerRegistroPorId,
  DatosPaciente,
  ResultadoTriage,
  RegistroHistorialTriage,
} from "@/lib/triage-history";

export default function TriageResult() {
  const searchParams = useSearchParams();
  const id = searchParams.get("id");

  const [registro, setRegistro] = useState<RegistroHistorialTriage | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    // 1. Intentar cargar por ID desde el historial
    if (id) {
      const reg = obtenerRegistroPorId(id);
      if (reg) {
        setRegistro(reg);
        return;
      }
    }

    // 2. Intentar cargar desde sessionStorage (sesión actual)
    const stored = sessionStorage.getItem("resultadoTriage");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (parsed.resultado && parsed.datos) {
          setRegistro({
            id: parsed.id || "eval_temp",
            timestamp: parsed.timestamp || new Date().toISOString(),
            datos: parsed.datos,
            resultado: parsed.resultado,
          });
          return;
        }
      } catch {
        setError("Error al leer los datos de la evaluación.");
      }
    } else {
      setError("No se encontraron datos de la evaluación clínica.");
    }
  }, [id]);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-sm border border-red-200 rounded-2xl">
        <div className="p-4 bg-red-50 text-red-700 rounded-xl flex items-center gap-2">
          <span className="text-xl">⚠</span>
          <span>{error}</span>
        </div>
        <div className="mt-6 flex gap-4">
          <Link
            href="/triage"
            className="px-4 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-colors"
          >
            ← Evaluar Paciente
          </Link>
          <Link
            href="/historial"
            className="px-4 py-2 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-colors"
          >
            Ver Historial
          </Link>
        </div>
      </div>
    );
  }

  if (!registro) {
    return (
      <div className="max-w-3xl mx-auto p-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
        <p className="font-medium text-sm">Cargando evaluación de TriageAI...</p>
      </div>
    );
  }

  const { datos, resultado, timestamp } = registro;

  const colorStyles: Record<string, { bg: string; border: string; text: string; badge: string }> = {
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

  const estiloNivel = colorStyles[resultado.clase_css] || colorStyles["nivel-amarillo"];

  const fechaFormateada = new Date(timestamp).toLocaleString("es-ES", {
    dateStyle: "medium",
    timeStyle: "short",
  });

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Encabezado del Paciente */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4 mb-4">
          <div>
            <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
              Ficha Clínica de Triage
            </span>
            <h1 className="text-2xl font-bold text-slate-900 mt-0.5">{datos.nombre}</h1>
            <div className="flex flex-wrap gap-2 text-sm text-slate-600 mt-1">
              <span>{datos.edad} años</span>
              {datos.sexo && <span>· {datos.sexo}</span>}
              {datos.dni && <span>· DNI: {datos.dni}</span>}
            </div>
          </div>

          <div className="text-right">
            <span className="text-xs font-semibold px-3 py-1 bg-slate-100 text-slate-600 rounded-full border border-slate-200">
              🕒 {fechaFormateada}
            </span>
          </div>
        </div>

        {/* Tarjeta de Nivel Asignado */}
        <div className={`p-6 rounded-2xl border-2 ${estiloNivel.border} ${estiloNivel.bg} shadow-sm`}>
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <span className="text-5xl">{resultado.emoji}</span>
              <div>
                <span className={`inline-block px-3 py-0.5 rounded-full text-xs uppercase tracking-wider ${estiloNivel.badge}`}>
                  NIVEL {resultado.nivel}
                </span>
                <h2 className={`text-2xl font-black ${estiloNivel.text} mt-1`}>
                  PRIORIDAD {resultado.color}
                </h2>
                <p className="text-sm font-semibold opacity-90 mt-0.5">
                  Tiempo estimado de atención: {resultado.tiempo_espera}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Constantes vitales registradas */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">
          Signos Vitales del Ingreso
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-center">
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs text-slate-500 font-semibold uppercase">FC</div>
            <div className="text-lg font-black text-slate-800 mt-1">{datos.fc}</div>
            <div className="text-[10px] text-slate-400">lpm</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs text-slate-500 font-semibold uppercase">FR</div>
            <div className="text-lg font-black text-slate-800 mt-1">{datos.fr || "-"}</div>
            <div className="text-[10px] text-slate-400">rpm</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs text-slate-500 font-semibold uppercase">SpO₂</div>
            <div className="text-lg font-black text-slate-800 mt-1">{datos.spo2}%</div>
            <div className="text-[10px] text-slate-400">saturación</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs text-slate-500 font-semibold uppercase">TA</div>
            <div className="text-lg font-black text-slate-800 mt-1">{datos.ta}</div>
            <div className="text-[10px] text-slate-400">mmHg</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs text-slate-500 font-semibold uppercase">Temp</div>
            <div className="text-lg font-black text-slate-800 mt-1">{datos.temp || "-"}</div>
            <div className="text-[10px] text-slate-400">°C</div>
          </div>
          <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <div className="text-xs text-slate-500 font-semibold uppercase">Glasgow</div>
            <div className="text-lg font-black text-slate-800 mt-1">{datos.glasgow}/15</div>
            <div className="text-[10px] text-slate-400">escala coma</div>
          </div>
        </div>

        <div className="mt-4 pt-3 border-t border-slate-100 grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
          <div>
            <span className="font-bold text-slate-700">Motivo de consulta:</span>
            <p className="text-slate-600 mt-0.5">{datos.motivo}</p>
          </div>
          <div>
            <span className="font-bold text-slate-700">Antecedentes:</span>
            <p className="text-slate-600 mt-0.5">{datos.antecedentes || "Sin antecedentes informados."}</p>
          </div>
        </div>
      </div>

      {/* Protocolos RAG Aplicados */}
      {resultado.fuentes_rag && resultado.fuentes_rag.length > 0 && (
        <div className="p-5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl shadow-sm">
          <div className="flex items-center gap-2 mb-2">
            <span className="text-xl">📚</span>
            <h3 className="font-bold text-blue-950 text-sm tracking-wide uppercase">
              Base de Conocimiento RAG · Guías Clínicas Consultadas
            </h3>
          </div>
          <p className="text-xs text-blue-800 mb-3">
            Para garantizar exactitud médica, la IA contrastó los signos y síntomas contra las siguientes normativas:
          </p>
          <div className="flex flex-wrap gap-2">
            {resultado.fuentes_rag.map((fuente, idx) => (
              <span
                key={idx}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-blue-300 text-blue-900 text-xs font-semibold rounded-full shadow-sm"
              >
                📄 {fuente}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Bloques de Justificación, Acciones y Alarmas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Justificación Clínica */}
        <div className="md:col-span-3 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
            <span className="text-blue-600">🧠</span> Justificación Médica y Criterio de Triage
          </h3>
          <p className="text-slate-700 text-sm leading-relaxed whitespace-pre-line">
            {resultado.justificacion}
          </p>
        </div>

        {/* Acciones Inmediatas */}
        <div className="md:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
            <span className="text-emerald-600">⚡</span> Acciones Asistenciales Inmediatas
          </h3>
          <ul className="space-y-2">
            {resultado.acciones.map((accion, idx) => (
              <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-700">
                <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center text-xs font-bold flex-shrink-0 mt-0.5">
                  ✓
                </span>
                <span>{accion}</span>
              </li>
            ))}
          </ul>
        </div>

        {/* Signos de Alarma */}
        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h3 className="font-bold text-slate-900 text-base border-b border-slate-100 pb-2 mb-3 flex items-center gap-2">
            <span className="text-red-500">🚨</span> Signos de Alarma a Vigilar
          </h3>
          <ul className="space-y-2">
            {resultado.alarmas.map((alarma, idx) => (
              <li key={idx} className="flex items-start gap-2 text-xs font-semibold text-red-700">
                <span className="text-red-500 font-bold">•</span>
                <span>{alarma}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Botones de acción */}
      <div className="flex flex-wrap items-center justify-between gap-4 pt-2 pb-8">
        <div className="flex gap-3">
          <Link
            href="/triage"
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all shadow-sm"
          >
            ← Evaluar Nuevo Paciente
          </Link>
          <Link
            href="/historial"
            className="px-5 py-2.5 bg-slate-100 text-slate-700 rounded-xl text-sm font-semibold hover:bg-slate-200 transition-all"
          >
            📋 Ver Historial
          </Link>
        </div>

        <button
          onClick={() => window.print()}
          className="px-5 py-2.5 bg-slate-800 text-white rounded-xl text-sm font-semibold hover:bg-slate-900 transition-all flex items-center gap-2 shadow-sm"
        >
          <span>🖨 Imprimir Ficha</span>
        </button>
      </div>
    </div>
  );
}