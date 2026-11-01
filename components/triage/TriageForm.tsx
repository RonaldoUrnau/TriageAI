"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { guardarEnHistorial, DatosPaciente } from "@/lib/triage-history";

// Casos clínicos de prueba rápida para testing y demostraciones
const CASOS_EJEMPLO: { etiqueta: string; color: string; datos: DatosPaciente }[] = [
  {
    etiqueta: "🟠 Sospecha IAM (Dolor Torácico)",
    color: "bg-orange-50 border-orange-200 text-orange-800 hover:bg-orange-100",
    datos: {
      nombre: "Carlos González",
      edad: "58",
      sexo: "Masculino",
      dni: "28.475.923",
      motivo: "Dolor en el pecho opresivo irradiado al brazo izquierdo y mandíbula con sudoración fría de 30 min de evolución",
      fc: "112",
      fr: "22",
      spo2: "92",
      ta: "150/95",
      temp: "36.8",
      glasgow: "15",
      antecedentes: "Hipertensión arterial, tabaquista pesado",
    },
  },
  {
    etiqueta: "🔴 Emergencia Vital (Glasgow ≤ 8 / Coma)",
    color: "bg-red-50 border-red-200 text-red-800 hover:bg-red-100",
    datos: {
      nombre: "Marta Benítez",
      edad: "72",
      sexo: "Femenino",
      dni: "14.220.890",
      motivo: "Pérdida súbita de conocimiento, respiración agónica y estupor sin respuesta a estímulos",
      fc: "135",
      fr: "30",
      spo2: "84",
      ta: "80/50",
      temp: "37.5",
      glasgow: "7",
      antecedentes: "Diabetes tipo 2, antecedente de ACV previo",
    },
  },
  {
    etiqueta: "🟡 Urgencia / Sepsis Potencial",
    color: "bg-yellow-50 border-yellow-200 text-yellow-800 hover:bg-yellow-100",
    datos: {
      nombre: "Esteban Morales",
      edad: "45",
      sexo: "Masculino",
      dni: "34.192.401",
      motivo: "Fiebre persistente de 3 días (39.2°C), escalofríos intensos, tos productiva y decaimiento general",
      fc: "108",
      fr: "24",
      spo2: "93",
      ta: "105/70",
      temp: "39.2",
      glasgow: "14",
      antecedentes: "Asma bronquial en tratamiento",
    },
  },
  {
    etiqueta: "🟢 Menos Urgente (Traumatismo Leve)",
    color: "bg-green-50 border-green-200 text-green-800 hover:bg-green-100",
    datos: {
      nombre: "Lucía Fernández",
      edad: "26",
      sexo: "Femenino",
      dni: "41.982.314",
      motivo: "Traumatismo en tobillo derecho tras torsión practicando deporte. Edema moderado sin deformidad ósea.",
      fc: "76",
      fr: "16",
      spo2: "99",
      ta: "118/75",
      temp: "36.5",
      glasgow: "15",
      antecedentes: "Ninguno relevante",
    },
  },
];

export default function TriageForm() {
  const [formData, setFormData] = useState<DatosPaciente>({
    nombre: "",
    edad: "",
    sexo: "",
    dni: "",
    motivo: "",
    fc: "",
    fr: "",
    spo2: "",
    ta: "",
    temp: "",
    glasgow: "15",
    antecedentes: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError("");
  };

  const cargarEjemplo = (datos: DatosPaciente) => {
    setFormData({ ...datos });
    setError("");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/triage", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Error al procesar la evaluación");
        setLoading(false);
        return;
      }

      // Guardar de forma persistente en el historial
      const nuevoRegistro = guardarEnHistorial(data.datos || formData, data.resultado);

      // Guardar también en sessionStorage para transición directa
      sessionStorage.setItem("resultadoTriage", JSON.stringify(nuevoRegistro));

      // Navegar a resultados pasando el ID del registro
      router.push(`/triage/resultado?id=${nuevoRegistro.id}`);
    } catch (err) {
      console.error(err);
      setError("Error de conexión al evaluar el triage. Intentá de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Tarjeta de bienvenida y ejemplos rápidos */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4 mb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-black bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
                TriageAI
              </span>
              <span className="text-xs px-2.5 py-0.5 rounded-full font-semibold bg-blue-100 text-blue-800 border border-blue-200">
                v2.0 RAG
              </span>
            </div>
            <p className="text-slate-600 text-sm mt-1">
              Evaluación y priorización clínica asistida por Inteligencia Artificial y protocolos normativos oficiales.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-50 text-emerald-700 text-xs font-semibold rounded-full border border-emerald-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              Base de Conocimiento RAG Activa
            </span>
          </div>
        </div>

        {/* Botones de Casos Rápidos */}
        <div>
          <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
            ⚡ Cargar casos clínicos de prueba rápida:
          </label>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
            {CASOS_EJEMPLO.map((caso, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => cargarEjemplo(caso.datos)}
                className={`text-left text-xs p-2.5 rounded-xl border transition-all ${caso.color}`}
              >
                <div className="font-semibold">{caso.etiqueta}</div>
                <div className="text-[11px] opacity-80 mt-0.5 truncate">{caso.datos.nombre}</div>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Formulario Principal */}
      <div className="bg-white p-6 sm:p-8 rounded-2xl shadow-sm border border-slate-200">
        {error && (
          <div className="p-4 mb-6 bg-red-50 border border-red-200 text-red-700 text-sm rounded-xl flex items-center gap-2">
            <span className="text-lg">⚠</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Sección 1: Datos del Paciente */}
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <span className="text-blue-600">👤</span> Datos Personales y Demográficos
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Nombre Completo <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ej: Juan Pérez"
                  value={formData.nombre}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Edad <span className="text-red-500">*</span>
                </label>
                <input
                  type="number"
                  name="edad"
                  min={0}
                  max={120}
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ej: 58"
                  value={formData.edad}
                  onChange={handleChange}
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Sexo
                </label>
                <select
                  name="sexo"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  value={formData.sexo}
                  onChange={handleChange}
                >
                  <option value="">Seleccionar...</option>
                  <option value="Masculino">Masculino</option>
                  <option value="Femenino">Femenino</option>
                  <option value="Otro">Otro</option>
                </select>
              </div>

              <div className="lg:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Documento / DNI
                </label>
                <input
                  type="text"
                  name="dni"
                  className="w-full px-3.5 py-2.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                  placeholder="Ej: 30.123.456"
                  value={formData.dni}
                  onChange={handleChange}
                />
              </div>
            </div>
          </div>

          {/* Sección 2: Motivo de Consulta */}
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <span className="text-blue-600">🩺</span> Motivo de Consulta y Síntoma Principal <span className="text-red-500">*</span>
            </h2>
            <div>
              <textarea
                name="motivo"
                rows={3}
                className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Describa el motivo de consulta, tiempo de inicio, características del síntoma o dolor, localización..."
                value={formData.motivo}
                onChange={handleChange}
                required
              />
              <p className="text-xs text-slate-500 mt-1">
                💡 Consejo: El motor RAG utiliza este campo para buscar algoritmos específicos (ej: dolor torácico, disnea, ACV, traumatismo).
              </p>
            </div>
          </div>

          {/* Sección 3: Signos Vitales y Constantes Clínicas */}
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <span className="text-blue-600">📊</span> Constantes y Signos Vitales
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {/* FC */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  FC <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="fc"
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                    placeholder="112"
                    value={formData.fc}
                    onChange={handleChange}
                    required
                  />
                  <span className="absolute right-2.5 top-2.5 text-[11px] text-slate-400 font-bold">lpm</span>
                </div>
              </div>

              {/* FR */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  FR
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="fr"
                    className="w-full px-3 py-2 pr-10 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                    placeholder="22"
                    value={formData.fr}
                    onChange={handleChange}
                  />
                  <span className="absolute right-2.5 top-2.5 text-[11px] text-slate-400 font-bold">rpm</span>
                </div>
              </div>

              {/* SpO2 */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  SpO₂ <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="spo2"
                    min={0}
                    max={100}
                    className="w-full px-3 py-2 pr-8 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                    placeholder="92"
                    value={formData.spo2}
                    onChange={handleChange}
                    required
                  />
                  <span className="absolute right-2.5 top-2.5 text-[11px] text-slate-400 font-bold">%</span>
                </div>
              </div>

              {/* TA */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  TA <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    name="ta"
                    className="w-full px-3 py-2 pr-12 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                    placeholder="120/80"
                    value={formData.ta}
                    onChange={handleChange}
                    required
                  />
                  <span className="absolute right-2 top-2.5 text-[10px] text-slate-400 font-bold">mmHg</span>
                </div>
              </div>

              {/* Temp */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Temp
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="temp"
                    step="0.1"
                    className="w-full px-3 py-2 pr-8 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                    placeholder="36.8"
                    value={formData.temp}
                    onChange={handleChange}
                  />
                  <span className="absolute right-2.5 top-2.5 text-[11px] text-slate-400 font-bold">°C</span>
                </div>
              </div>

              {/* Glasgow */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Glasgow
                </label>
                <div className="relative">
                  <input
                    type="number"
                    name="glasgow"
                    min={3}
                    max={15}
                    className="w-full px-3 py-2 pr-8 border border-slate-300 rounded-xl text-sm font-semibold focus:ring-2 focus:ring-blue-500"
                    placeholder="15"
                    value={formData.glasgow}
                    onChange={handleChange}
                  />
                  <span className="absolute right-2.5 top-2.5 text-[11px] text-slate-400 font-bold">/15</span>
                </div>
              </div>
            </div>
          </div>

          {/* Sección 4: Antecedentes */}
          <div>
            <h2 className="text-base font-bold text-slate-800 flex items-center gap-2 border-b border-slate-100 pb-2 mb-4">
              <span className="text-blue-600">📋</span> Antecedentes Patológicos y Medicación
            </h2>
            <div>
              <textarea
                name="antecedentes"
                rows={2}
                className="w-full p-3.5 border border-slate-300 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
                placeholder="Ej: Hipertensión arterial, Diabetes mellitus tipo 2, toma Enalapril 10mg..."
                value={formData.antecedentes}
                onChange={handleChange}
              />
            </div>
          </div>

          {/* Estado de carga con indicador animado */}
          {loading && (
            <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-2xl flex items-center gap-3">
              <svg className="animate-spin h-6 w-6 text-blue-600 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
              </svg>
              <div>
                <p className="font-bold text-slate-800 text-sm">
                  Evaluando paciente con TriageAI (RAG + Ollama)...
                </p>
                <p className="text-xs text-blue-700 mt-0.5">
                  Recuperando protocolos de referencia clínica y determinando el nivel de prioridad médica.
                </p>
              </div>
            </div>
          )}

          {/* Botón Submit */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-4 px-6 rounded-2xl font-bold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 active:scale-[0.99] transition-all shadow-md hover:shadow-lg disabled:opacity-60 disabled:cursor-not-allowed text-base flex items-center justify-center gap-2"
          >
            <span>{loading ? "Evaluando con TriageAI..." : "⚡ Evaluar Prioridad de Triage (RAG)"}</span>
          </button>
        </form>
      </div>
    </div>
  );
}