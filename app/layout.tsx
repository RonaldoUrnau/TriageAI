import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "TriageAI · Sistema Inteligente de Triage Clínico (RAG)",
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
        <header className="bg-gradient-to-r from-blue-900 via-indigo-900 to-slate-900 text-white shadow-md sticky top-0 z-50">
          <div className="container mx-auto px-4 py-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            {/* Logo y Branding */}
            <div className="flex items-center gap-3">
              <Link href="/triage" className="flex items-center gap-2.5 hover:opacity-90 transition-opacity">
                <span className="flex items-center justify-center w-9 h-9 rounded-xl bg-blue-500 text-white font-black text-xl shadow-inner">
                  ✚
                </span>
                <div>
                  <div className="flex items-center gap-1.5 leading-none">
                    <span className="text-xl font-black tracking-tight text-white">TriageAI</span>
                    <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-300 border border-blue-400/30">
                      RAG Clínico
                    </span>
                  </div>
                  <span className="text-[11px] text-blue-200/70 font-medium">
                    Priorización Médica Asistida por IA
                  </span>
                </div>
              </Link>
            </div>

            {/* Navegación y Badges */}
            <div className="flex items-center gap-3 sm:gap-6">
              <nav className="flex items-center gap-2 sm:gap-3 text-sm font-semibold">
                <Link
                  href="/triage"
                  className="px-3 py-1.5 rounded-lg hover:bg-white/10 text-blue-100 hover:text-white transition-colors"
                >
                  + Nuevo Paciente
                </Link>
                <Link
                  href="/historial"
                  className="px-3 py-1.5 rounded-lg hover:bg-white/10 text-blue-100 hover:text-white transition-colors flex items-center gap-1.5"
                >
                  <span>📋</span> Historial
                </Link>
              </nav>

              <div className="hidden lg:flex items-center gap-2 text-xs">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full border border-emerald-500/30 font-medium">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
                  Ollama gemma2
                </span>
              </div>
            </div>
          </div>
        </header>

        <main className="min-h-screen bg-slate-50 py-8 px-4">{children}</main>

        <footer className="bg-slate-900 text-slate-400 py-6 border-t border-slate-800">
          <div className="container mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-300">TriageAI</span>
              <span>· Sistema de Soporte Clínico Basado en Protocolos Manchester (MTS) y NEWS2</span>
            </div>
            <div className="text-center sm:text-right text-slate-500">
              ⚠ Este sistema es una herramienta de soporte asistencial y NO reemplaza el criterio médico profesional.
            </div>
          </div>
        </footer>
      </body>
    </html>
  );
}