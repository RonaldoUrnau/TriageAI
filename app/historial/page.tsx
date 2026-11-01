import TriageHistory from "@/components/triage/TriageHistory";

export const metadata = {
  title: "Historial de Pacientes · TriageAI",
  description: "Registro cronológico de evaluaciones y clasificaciones de urgencia",
};

export default function HistorialPage() {
  return (
    <div className="container mx-auto py-8 px-4">
      <TriageHistory />
    </div>
  );
}
