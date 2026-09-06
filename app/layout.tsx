import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Link from "next/link";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Sistema Integrado - Triage y PDF Chat",
  description: "Plataforma unificada de triage clínico y consulta de documentos PDF",
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
              <span className="text-2xl font-bold">✚ Sistema Integrado</span>
            </div>
            <nav className="flex gap-4">
              <Link href="/" className="hover:underline">
                Inicio
              </Link>
              <Link href="/triage" className="hover:underline">
                Triage
              </Link>
              <Link href="/pdf" className="hover:underline">
                PDF Chat
              </Link>
            </nav>
          </div>
        </header>
        <main className="min-h-screen bg-gray-50 py-8">{children}</main>
        <footer className="bg-gray-800 text-white py-4">
          <div className="container mx-auto px-4 text-center text-sm">
            ⚠ Las recomendaciones son de soporte y NO reemplazan el criterio
            del profesional de salud.
          </div>
        </footer>
      </body>
    </html>
  );
}