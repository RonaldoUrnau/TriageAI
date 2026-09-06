"use client";

import { useEffect, useState } from "react";
import Link from "next/link";

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

interface ResultadoTriage {
  nivel: string;
  color: string;
  emoji: string;
  clase_css: string;
  justificacion: string;
  acciones: string[];
  alarmas: string[];
  tiempo_espera: string;
}

export default function TriageResult() {
  const [datos, setDatos] = useState<DatosPaciente | null>(null);
  const [resultado, setResultado] = useState<ResultadoTriage | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    const stored = sessionStorage.getItem("resultadoTriage");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        setDatos(parsed.datos);
        setResultado(parsed.resultado);
      } catch {
        setError("Error al cargar los datos del triage.");
      }
    } else {
      setError("No se encontraron datos del triage.");
    }
  }, []);

  if (error) {
    return (
      <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
          ⚠ {error}
        </div>
        <div className="mt-4">
          <Link href="/triage" className="text-blue-600 hover:underline">
            ← Volver al formulario
          </Link>
        </div>
      </div>
    );
  }

  if (!datos || !resultado) {
    return <div className="text-center py-8">Cargando...</div>;
  }

  const colorMap: Record<string, string> = {
    "nivel-amarillo": "bg-yellow-100 border-yellow-500 text-yellow-800",
    "nivel-rojo": "bg-red-100 border-red-500 text-red-800",
    "nivel-verde": "bg-green-100 border-green-500 text-green-800",
    "nivel-azul": "bg-blue-100 border-blue-500 text-blue-800",
  };

  return (
    <div className="max-w-3xl mx-auto p-6 bg-white shadow-md rounded-lg">
      {/* Paciente info */}
      <div className="flex justify-between items-center border-b pb-4 mb-6">
        <div>
          <span className="font-semibold text-xl">{datos.nombre}</span>
          <span className="text-gray-600 ml-3">
            {datos.edad} años{datos.sexo && ` · ${datos.sexo}`}
            {datos.dni && ` · DNI ${datos.dni}`}
          </span>
        </div>
        <span className="text-sm text-gray-500">Evaluado ahora</span>
      </div>

      {/* Nivel badge */}
      <div
        className={`p-4 rounded-lg border-l-4 mb-6 ${
          colorMap[resultado.clase_css] || "bg-gray-100"
        }`}
      >
        <div className="flex items-center gap-3">
          <span className="text-3xl">{resultado.emoji}</span>
          <div>
            <div className="font-bold text-xl">
              NIVEL {resultado.nivel} — {resultado.color}
            </div>
            <div className="text-sm">{resultado.tiempo_espera}</div>
          </div>
        </div>
      </div>

      {/* Secciones */}
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg border-b pb-1">
            Justificación clínica
          </h3>
          <p className="mt-2 text-gray-700">{resultado.justificacion}</p>
        </div>

        <div>
          <h3 className="font-semibold text-lg border-b pb-1">
            Acciones inmediatas
          </h3>
          <ul className="mt-2 list-disc list-inside text-gray-700">
            {resultado.acciones.map((accion, idx) => (
              <li key={idx}>{accion}</li>
            ))}
          </ul>
        </div>

        <div>
          <h3 className="font-semibold text-lg border-b pb-1">
            Signos de alarma a vigilar
          </h3>
          <ul className="mt-2 list-disc list-inside text-red-600">
            {resultado.alarmas.map((alarma, idx) => (
              <li key={idx}>{alarma}</li>
            ))}
          </ul>
        </div>
      </div>

      {/* Advertencia */}
      <div className="mt-6 p-4 bg-yellow-50 border border-yellow-200 rounded text-sm text-yellow-800">
        ⚠ Esta recomendación es de soporte y{" "}
        <strong>NO reemplaza</strong> el criterio del profesional de salud.
      </div>

      {/* Acciones */}
      <div className="mt-6 flex flex-wrap gap-4">
        <Link
          href="/triage"
          className="px-4 py-2 bg-gray-200 rounded hover:bg-gray-300 transition-colors"
        >
          ← Nuevo paciente
        </Link>
        <button
          onClick={() => window.print()}
          className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors"
        >
          Imprimir resultado
        </button>
      </div>
    </div>
  );
}