"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function TriageForm() {
  const [formData, setFormData] = useState({
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
    glasgow: "",
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
        setError(data.error || "Error al procesar el triage");
        setLoading(false);
        return;
      }

      // Guardar en sessionStorage para la página de resultados
      sessionStorage.setItem("resultadoTriage", JSON.stringify(data));
      router.push("/triage/resultado");
    } catch (err) {
      setError("Error de conexión. Intentá de nuevo.");
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      <div className="flex items-center justify-between border-b pb-3 mb-4">
        <div>
          <h1 className="text-2xl font-bold">Nuevo paciente</h1>
          <p className="text-gray-600 text-sm mt-1">
            Evaluación de urgencia con Inteligencia Artificial asistida por RAG
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 text-xs font-semibold rounded-full border border-green-300">
          ● RAG Clínico Activo
        </span>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          ⚠ {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Datos personales */}
        <div>
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">
            Datos personales
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium">
                Nombre completo <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                className="mt-1 w-full border rounded p-2"
                placeholder="Ej: Juan Pérez"
                value={formData.nombre}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                Edad <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="edad"
                className="mt-1 w-full border rounded p-2"
                placeholder="Ej: 58"
                min={0}
                max={120}
                value={formData.edad}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Sexo</label>
              <select
                name="sexo"
                className="mt-1 w-full border rounded p-2"
                value={formData.sexo}
                onChange={handleChange}
              >
                <option value="">Seleccionar...</option>
                <option value="Masculino">Masculino</option>
                <option value="Femenino">Femenino</option>
                <option value="Otro">Otro</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium">DNI / ID</label>
              <input
                type="text"
                name="dni"
                className="mt-1 w-full border rounded p-2"
                placeholder="Ej: 30.123.456"
                value={formData.dni}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Motivo de consulta */}
        <div>
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">
            Motivo de consulta <span className="text-red-600">*</span>
          </h2>
          <div>
            <label className="block text-sm font-medium">
              Síntoma principal y tiempo de inicio
            </label>
            <textarea
              name="motivo"
              className="mt-1 w-full border rounded p-2 h-24"
              placeholder="Ej: Dolor en el pecho irradiado al brazo izquierdo desde hace 45 minutos..."
              value={formData.motivo}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Signos vitales */}
        <div>
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">
            Signos vitales <span className="text-red-600">*</span>
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium">
                FC (lpm) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="fc"
                className="mt-1 w-full border rounded p-2"
                placeholder="Ej: 112"
                value={formData.fc}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">FR (rpm)</label>
              <input
                type="number"
                name="fr"
                className="mt-1 w-full border rounded p-2"
                placeholder="Ej: 26"
                value={formData.fr}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                SpO₂ (%) <span className="text-red-600">*</span>
              </label>
              <input
                type="number"
                name="spo2"
                className="mt-1 w-full border rounded p-2"
                placeholder="Ej: 89"
                min={0}
                max={100}
                value={formData.spo2}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">
                TA (mmHg) <span className="text-red-600">*</span>
              </label>
              <input
                type="text"
                name="ta"
                className="mt-1 w-full border rounded p-2"
                placeholder="Ej: 88/60"
                value={formData.ta}
                onChange={handleChange}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Temperatura (°C)</label>
              <input
                type="number"
                name="temp"
                className="mt-1 w-full border rounded p-2"
                placeholder="Ej: 36.8"
                step="0.1"
                value={formData.temp}
                onChange={handleChange}
              />
            </div>
            <div>
              <label className="block text-sm font-medium">Glasgow (/15)</label>
              <input
                type="number"
                name="glasgow"
                className="mt-1 w-full border rounded p-2"
                placeholder="Ej: 14"
                min={3}
                max={15}
                value={formData.glasgow}
                onChange={handleChange}
              />
            </div>
          </div>
        </div>

        {/* Antecedentes */}
        <div>
          <h2 className="text-lg font-semibold border-b pb-2 mb-4">
            Antecedentes y medicación
          </h2>
          <div>
            <label className="block text-sm font-medium">
              Enfermedades previas y medicación habitual
            </label>
            <textarea
              name="antecedentes"
              className="mt-1 w-full border rounded p-2 h-24"
              placeholder="Ej: HTA, Diabetes tipo 2, IAM hace 3 años..."
              value={formData.antecedentes}
              onChange={handleChange}
            />
          </div>
        </div>

        {loading && (
          <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-800 flex items-center gap-3">
            <svg className="animate-spin h-5 w-5 text-blue-600 flex-shrink-0" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8H4z"></path>
            </svg>
            <div>
              <p className="font-semibold">Evaluando con Inteligencia Artificial (RAG)...</p>
              <p className="text-xs text-blue-600 mt-0.5">Recuperando protocolos clínicos oficiales y clasificando el nivel de prioridad.</p>
            </div>
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 rounded-lg font-semibold hover:bg-blue-700 transition-colors disabled:bg-gray-400 disabled:cursor-not-allowed shadow-sm"
        >
          {loading ? "Procesando triage con RAG..." : "Evaluar Triage Clínico (RAG) →"}
        </button>
      </form>
    </div>
  );
}