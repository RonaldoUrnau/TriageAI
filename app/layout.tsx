import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema de Triage Clínico con IA (RAG)",
  description: "Plataforma de evaluación y priorización de urgencias asistida por Inteligencia Artificial y protocolos clínicos oficiales",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <header className="bg-blue-900 text-white py-4 shadow-md">
          <div className="container mx-auto px-4 flex justify-between items-center">
            <div className="flex items-center gap-2">
              <Link href="/triage" className="flex items-center gap-2 hover:opacity-90">
                <span className="text-2xl font-bold">🏥 Sistema de Triage Clínico</span>
              </Link>
            </div>
            <nav className="flex items-center gap-4">
              <Link href="/triage" className="hover:underline text-sm font-medium">
                Nuevo Paciente
              </Link>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-blue-800 text-blue-200 text-xs font-semibold rounded-full border border-blue-700">
                ● RAG Clínico Activo
              </span>
            </nav>
          </div>
        </header>
        <main className="min-h-screen bg-gray-50 py-8">{children}</main>
        <footer className="bg-gray-800 text-white py-4">
          <div className="container mx-auto px-4 text-center text-sm text-gray-300">
            ⚠ Las recomendaciones emitidas son de soporte asistencial y NO reemplazan el criterio médico profesional.
          </div>
        </footer>
      </body>
    </html>
  );
}