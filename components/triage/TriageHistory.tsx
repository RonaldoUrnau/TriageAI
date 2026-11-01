"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  obtenerHistorial,
  eliminarRegistroPorId,
  limpiarTodoHistorial,
  descargarHistorialJSON,
  RegistroHistorialTriage,
} from "@/lib/triage-history";

export default function TriageHistory() {
  const [historial, setHistorial] = useState<RegistroHistorialTriage[]>([]);
  const [busqueda, setBusqueda] = useState("");
  const [filtroNivel, setFiltroNivel] = useState("TODOS");
  const [cargado, setCargado] = useState(false);

  useEffect(() => {
    setHistorial(obtenerHistorial());
    setCargado(true);
  }, []);

  const handleEliminar = (id: string, nombre: string) => {
    if (confirm(`¿Deseas eliminar la evaluación de ${nombre}?`)) {
      const actualizado = eliminarRegistroPorId(id);
      setHistorial(actualizado);
    }
  };

  const handleLimpiarTodo = () => {
    if (historial.length === 0) return;
    if (
      confirm(
        "¿Estás seguro de que deseas borrar TODO el historial de evaluaciones? Esta acción no se puede deshacer."
      )
    ) {
      limpiarTodoHistorial();
      setHistorial([]);
    }
  };

  // Filtrado reactivo
  const registrosFiltrados = historial.filter((item) => {
    const coincideNivel =
      filtroNivel === "TODOS" || item.resultado.nivel === filtroNivel;

    const textoBusqueda = `${item.datos.nombre} ${item.datos.dni || ""} ${
      item.datos.motivo
    }`.toLowerCase();
    const coincideTexto = textoBusqueda.includes(busqueda.toLowerCase());

    return coincideNivel && coincideTexto;
  });

  // Métricas
  const total = historial.length;
  const criticos = historial.filter(
    (h) => h.resultado.nivel === "I" || h.resultado.nivel === "II"
  ).length;
  const urgentes = historial.filter((h) => h.resultado.nivel === "III").length;
  const leves = historial.filter(
    (h) => h.resultado.nivel === "IV" || h.resultado.nivel === "V"
  ).length;

  const colorStyles: Record<string, { bg: string; badge: string; border: string }> = {
    "nivel-rojo": { bg: "bg-red-50", badge: "bg-red-600 text-white", border: "border-red-200" },
    "nivel-naranja": { bg: "bg-orange-50", badge: "bg-orange-500 text-white", border: "border-orange-200" },
    "nivel-amarillo": { bg: "bg-yellow-50", badge: "bg-yellow-500 text-slate-900 font-bold", border: "border-yellow-200" },
    "nivel-verde": { bg: "bg-emerald-50", badge: "bg-emerald-600 text-white", border: "border-emerald-200" },
    "nivel-azul": { bg: "bg-blue-50", badge: "bg-blue-600 text-white", border: "border-blue-200" },
  };

  if (!cargado) {
    return (
      <div className="max-w-5xl mx-auto p-12 text-center text-slate-500">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-4 border-blue-600 border-t-transparent mb-3"></div>
        <p className="font-medium text-sm">Cargando historial de TriageAI...</p>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Encabezado Principal */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              TriageAI
            </span>
            <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800 border border-blue-200">
              Historial Clínico
            </span>
          </div>
          <p className="text-slate-600 text-sm mt-1">
            Registro cronológico de evaluaciones y clasificaciones de urgencia realizadas.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link
            href="/triage"
            className="px-4 py-2 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm flex items-center gap-1.5"
          >
            <span>+</span> Nuevo Paciente
          </Link>

          {historial.length > 0 && (
            <button
              onClick={descargarHistorialJSON}
              className="px-3.5 py-2 bg-slate-100 text-slate-700 text-sm font-semibold rounded-xl hover:bg-slate-200 transition-all flex items-center gap-1.5"
              title="Descargar historial en formato JSON"
            >
              📥 Exportar
            </button>
          )}

          {historial.length > 0 && (
            <button
              onClick={handleLimpiarTodo}
              className="px-3.5 py-2 bg-red-50 text-red-600 text-sm font-semibold rounded-xl hover:bg-red-100 border border-red-200 transition-all"
              title="Borrar todas las evaluaciones"
            >
              🗑 Limpiar
            </button>
          )}
        </div>
      </div>

      {/* Tarjetas de Métricas Rápidas */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm text-center sm:text-left">
          <div className="text-xs font-bold text-slate-400 uppercase">Total Evaluados</div>
          <div className="text-2xl font-black text-slate-900 mt-1">{total}</div>
          <div className="text-[11px] text-slate-500 mt-0.5">pacientes registrados</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-red-200 shadow-sm text-center sm:text-left bg-gradient-to-br from-white to-red-50/50">
          <div className="text-xs font-bold text-red-600 uppercase">Nivel I y II (Críticos)</div>
          <div className="text-2xl font-black text-red-700 mt-1">{criticos}</div>
          <div className="text-[11px] text-red-600/80 mt-0.5">atención inmediata / 15m</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-yellow-200 shadow-sm text-center sm:text-left bg-gradient-to-br from-white to-yellow-50/50">
          <div className="text-xs font-bold text-yellow-700 uppercase">Nivel III (Urgentes)</div>
          <div className="text-2xl font-black text-yellow-800 mt-1">{urgentes}</div>
          <div className="text-[11px] text-yellow-700/80 mt-0.5">atención 30 a 60 min</div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-emerald-200 shadow-sm text-center sm:text-left bg-gradient-to-br from-white to-emerald-50/50">
          <div className="text-xs font-bold text-emerald-700 uppercase">Nivel IV y V (Leves)</div>
          <div className="text-2xl font-black text-emerald-800 mt-1">{leves}</div>
          <div className="text-[11px] text-emerald-700/80 mt-0.5">menor urgencia</div>
        </div>
      </div>

      {/* Barra de Búsqueda y Filtros */}
      <div className="bg-white p-4 rounded-2xl shadow-sm border border-slate-200 flex flex-col md:flex-row gap-4 justify-between items-center">
        {/* Buscador */}
        <div className="relative w-full md:w-96">
          <span className="absolute left-3.5 top-2.5 text-slate-400 text-sm">🔍</span>
          <input
            type="text"
            placeholder="Buscar por nombre, DNI o motivo..."
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          />
          {busqueda && (
            <button
              onClick={() => setBusqueda("")}
              className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-600"
            >
              ✕
            </button>
          )}
        </div>

        {/* Filtros por nivel */}
        <div className="flex flex-wrap gap-1.5 w-full md:w-auto">
          {["TODOS", "I", "II", "III", "IV", "V"].map((nivel) => (
            <button
              key={nivel}
              onClick={() => setFiltroNivel(nivel)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${
                filtroNivel === nivel
                  ? "bg-slate-900 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {nivel === "TODOS" ? "Todos" : `Nivel ${nivel}`}
            </button>
          ))}
        </div>
      </div>

      {/* Lista de Registros */}
      {registrosFiltrados.length === 0 ? (
        <div className="bg-white p-12 rounded-2xl border border-slate-200 text-center shadow-sm">
          <span className="text-4xl block mb-3">📋</span>
          <h3 className="text-lg font-bold text-slate-800">
            {historial.length === 0
              ? "Aún no hay evaluaciones registradas"
              : "No se encontraron pacientes con los filtros seleccionados"}
          </h3>
          <p className="text-sm text-slate-500 mt-1 max-w-md mx-auto">
            {historial.length === 0
              ? "Las evaluaciones realizadas mediante el formulario de Triage se guardarán automáticamente aquí."
              : "Probá limpiando el buscador o seleccionando otro nivel de prioridad."}
          </p>
          {historial.length === 0 && (
            <Link
              href="/triage"
              className="mt-4 inline-block px-5 py-2.5 bg-blue-600 text-white text-sm font-semibold rounded-xl hover:bg-blue-700 transition-all shadow-sm"
            >
              + Evaluar Primer Paciente
            </Link>
          )}
        </div>
      ) : (
        <div className="space-y-3">
          {registrosFiltrados.map((item) => {
            const estilo = colorStyles[item.resultado.clase_css] || colorStyles["nivel-amarillo"];
            const fecha = new Date(item.timestamp).toLocaleString("es-ES", {
              dateStyle: "medium",
              timeStyle: "short",
            });

            return (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow flex flex-col md:flex-row md:items-center justify-between gap-4"
              >
                {/* Lado Izquierdo: Info Paciente y Badge */}
                <div className="space-y-2 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${estilo.badge}`}>
                      {item.resultado.emoji} NIVEL {item.resultado.nivel} · {item.resultado.color}
                    </span>
                    <span className="text-xs text-slate-400 font-medium">🕒 {fecha}</span>
                    <span className="text-xs text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      ⏱ {item.resultado.tiempo_espera}
                    </span>
                  </div>

                  <div>
                    <h4 className="text-base font-bold text-slate-900">
                      {item.datos.nombre}
                      <span className="font-normal text-xs text-slate-500 ml-2">
                        {item.datos.edad} años {item.datos.sexo && `· ${item.datos.sexo}`}
                        {item.datos.dni && ` · DNI ${item.datos.dni}`}
                      </span>
                    </h4>
                    <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                      <span className="font-semibold text-slate-700">Motivo:</span> {item.datos.motivo}
                    </p>
                  </div>

                  {/* Pills de signos vitales */}
                  <div className="flex flex-wrap gap-2 text-[11px] text-slate-600 pt-1">
                    <span className="px-2 py-0.5 bg-slate-100 rounded">
                      FC: <strong>{item.datos.fc}</strong> lpm
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded">
                      SpO₂: <strong>{item.datos.spo2}</strong>%
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded">
                      TA: <strong>{item.datos.ta}</strong>
                    </span>
                    <span className="px-2 py-0.5 bg-slate-100 rounded">
                      Glasgow: <strong>{item.datos.glasgow}</strong>/15
                    </span>
                    {item.resultado.fuentes_rag && item.resultado.fuentes_rag.length > 0 && (
                      <span className="px-2 py-0.5 bg-blue-50 text-blue-700 border border-blue-200 rounded font-semibold">
                        📚 RAG: {item.resultado.fuentes_rag[0]}
                      </span>
                    )}
                  </div>
                </div>

                {/* Lado Derecho: Acciones */}
                <div className="flex md:flex-col items-center justify-end gap-2 shrink-0">
                  <Link
                    href={`/triage/resultado?id=${item.id}`}
                    className="w-full md:w-auto px-4 py-2 bg-blue-50 text-blue-700 hover:bg-blue-100 text-xs font-bold rounded-xl text-center transition-colors"
                  >
                    Ver Ficha Completa →
                  </Link>
                  <button
                    onClick={() => handleEliminar(item.id, item.datos.nombre)}
                    className="px-3 py-2 text-slate-400 hover:text-red-600 text-xs font-semibold transition-colors"
                    title="Eliminar registro"
                  >
                    Eliminar
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
