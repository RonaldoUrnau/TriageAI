import Link from "next/link";

export default function Home() {
  return (
    <div className="max-w-4xl mx-auto p-8">
      <h1 className="text-3xl font-bold mb-6">Bienvenido al Sistema Integrado</h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Link
          href="/triage"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-blue-600">🏥 Triage Clínico</h2>
          <p className="text-gray-600 mt-2">
            Evaluación de pacientes con inteligencia artificial
          </p>
        </Link>
        <Link
          href="/pdf"
          className="block p-6 bg-white rounded-lg shadow hover:shadow-lg transition-shadow border border-gray-200"
        >
          <h2 className="text-xl font-semibold text-green-600">📄 Chat con PDF</h2>
          <p className="text-gray-600 mt-2">
            Sube documentos y realiza preguntas inteligentes
          </p>
        </Link>
      </div>
    </div>
  );
}