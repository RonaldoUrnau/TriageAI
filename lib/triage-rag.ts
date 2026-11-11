import fs from "fs";
import path from "path";
import { Document } from "llamaindex/Node";
import { VectorStoreIndex } from "llamaindex/indices/vectorStore/index";
import { OllamaEmbedding } from "llamaindex/embeddings/OllamaEmbedding";
import { Ollama } from "llamaindex/llm/ollama";
import { serviceContextFromDefaults } from "llamaindex/ServiceContext";
import type { DatosPaciente } from "@/lib/triage-history";

export interface ResultadoRAG {
  contexto: string;
  fuentes: string[];
}

const KNOWLEDGE_DIR = path.join(process.cwd(), "knowledge_base", "triage");

// Cache en memoria para mantener el índice activo en el servidor
let cachedIndex: VectorStoreIndex | null = null;
let isIndexing = false;

/**
 * Carga todos los documentos de la base de conocimiento de triage (.md, .txt, .pdf)
 */
async function cargarDocumentosTriage(): Promise<Document[]> {
  const docs: Document[] = [];

  if (!fs.existsSync(KNOWLEDGE_DIR)) {
    console.warn(`[RAG Triage] No se encontró la carpeta ${KNOWLEDGE_DIR}`);
    return docs;
  }

  const files = await fs.promises.readdir(KNOWLEDGE_DIR);

  for (const file of files) {

    if (file.toLowerCase() === "readme.md" || file.startsWith(".")) {
      continue;
    }

    const fullPath = path.join(KNOWLEDGE_DIR, file);
    const stat = await fs.promises.stat(fullPath);

    if (stat.isDirectory()) continue;

    const ext = path.extname(file).toLowerCase();

    try {
      if (ext === ".md" || ext === ".txt") {
        const text = await fs.promises.readFile(fullPath, "utf-8");
        if (text && text.trim().length > 0) {
          docs.push(
            new Document({
              text: text.trim(),
              metadata: {
                source: file,
                tipo: "protocolo_clinico",
              },
            })
          );
          console.log(`[RAG Triage] Cargado texto: ${file} (${text.length} caracteres)`);
        }
      } else if (ext === ".pdf") {
        const pdf = require("pdf-parse");
        const buffer = await fs.promises.readFile(fullPath);
        const pdfData = await pdf(buffer);
        if (pdfData.text && pdfData.text.trim().length > 0) {
          docs.push(
            new Document({
              text: pdfData.text.trim(),
              metadata: {
                source: file,
                tipo: "pdf_protocolo",
                paginas: pdfData.numpages,
              },
            })
          );
          console.log(
            `[RAG Triage] Cargado PDF: ${file} (${pdfData.numpages} páginas, ${pdfData.text.length} caracteres)`
          );
        }
      }
    } catch (err: any) {
      console.error(`[RAG Triage] Error al leer archivo ${file}:`, err.message);
    }
  }

  return docs;
}

/**
 * Obtiene o inicializa el índice vectorial en memoria con LlamaIndex y nomic-embed-text
 */
export async function obtenerIndiceTriage(): Promise<VectorStoreIndex> {
  if (cachedIndex) {
    return cachedIndex;
  }

  // Si ya se está indexando, esperar un momento
  if (isIndexing) {
    let intentos = 0;
    while (isIndexing && intentos < 30) {
      await new Promise((res) => setTimeout(res, 500));
      if (cachedIndex) return cachedIndex;
      intentos++;
    }
  }

  isIndexing = true;
  console.log("[RAG Triage] Construyendo índice vectorial de protocolos clínicos...");

  try {
    const docs = await cargarDocumentosTriage();

    if (docs.length === 0) {
      console.warn("[RAG Triage] Advertencia: No se encontraron documentos clínicos. Creando documento base...");
      docs.push(
        new Document({
          text: "Protocolo General de Triage: Nivel I Reanimacion (inmediato, 0 min). Nivel II Emergencia (10 min). Nivel III Urgente (30-60 min). Nivel IV Estandar (120 min). Nivel V No Urgente (240 min).",
          metadata: { source: "protocolo_general.txt" },
        })
      );
    }

    const embedModel = new OllamaEmbedding({
      model: "nomic-embed-text",
    });

    const llm = new Ollama({
      model: "gemma2",
      options: {
        temperature: 0,
      },
    });

    const serviceContext = serviceContextFromDefaults({
      chunkSize: 400,
      chunkOverlap: 50,
      embedModel,
      llm,
    });

    const index = await VectorStoreIndex.fromDocuments(docs, {
      serviceContext,
    });

    cachedIndex = index;
    console.log(`[RAG Triage] Índice vectorial creado exitosamente con ${docs.length} documentos fuente.`);
    return index;
  } finally {
    isIndexing = false;
  }
}

/**
 * Invalida la caché del índice para forzar re-indexación (útil al añadir nuevos PDFs)
 */
export function invalidarIndiceTriage() {
  cachedIndex = null;
  console.log("[RAG Triage] Índice invalidado. Se reconstruirá en la próxima consulta.");
}

/**
 * Construye una consulta semántica inteligente basada en los síntomas y signos del paciente
 */
function construirQueryBusqueda(datos: DatosPaciente): string {
  const terminos: string[] = [];

  terminos.push(datos.motivo);

  // Analizar signos vitales clave para activar discriminadores del protocolo
  const fc = parseInt(datos.fc, 10);
  const fr = parseInt(datos.fr, 10);
  const spo2 = parseInt(datos.spo2, 10);
  const glasgow = parseInt(datos.glasgow, 10);

  if (!isNaN(spo2) && spo2 < 92) {
    terminos.push("hipoxemia severa insuficiencia respiratoria oxigenoterapia nivel I II");
  } else if (!isNaN(spo2) && spo2 < 95) {
    terminos.push("dificultad respiratoria disnea saturacion de oxigeno");
  }

  if (!isNaN(fc) && fc > 120) {
    terminos.push("taquicardia severa riesgo arritmia shock nivel II");
  } else if (!isNaN(fc) && fc < 50) {
    terminos.push("bradicardia severa bloqueo gasto cardiaco");
  }

  if (!isNaN(fr) && fr >= 25) {
    terminos.push("taquipnea severa agotamiento respiratorio");
  }

  if (!isNaN(glasgow) && glasgow <= 8) {
    terminos.push("glasgow menor o igual a 8 coma via aerea nivel I reanimacion");
  } else if (!isNaN(glasgow) && glasgow <= 13) {
    terminos.push("alteracion de conciencia glasgow deficit neurologico nivel II");
  }

  // Palabras clave según motivo o antecedentes
  const textoGeneral = `${datos.motivo} ${datos.antecedentes || ""}`.toLowerCase();
  if (textoGeneral.includes("pecho") || textoGeneral.includes("torac") || textoGeneral.includes("infarto") || textoGeneral.includes("coronario")) {
    terminos.push("dolor toracico sindrome coronario agudo IAM electrocardiograma nivel II");
  }
  if (textoGeneral.includes("acv") || textoGeneral.includes("ictus") || textoGeneral.includes("facial") || textoGeneral.includes("brazo") || textoGeneral.includes("habla")) {
    terminos.push("accidente cerebrovascular codigo ictus deficit focal FAST Cincinnati nivel II");
  }
  if (textoGeneral.includes("abdomen") || textoGeneral.includes("abdominal") || textoGeneral.includes("periton")) {
    terminos.push("dolor abdominal agudo peritonitis banderas rojas");
  }
  if (textoGeneral.includes("infecc") || textoGeneral.includes("fiebre") || textoGeneral.includes("sepsis")) {
    terminos.push("sepsis shock septico qSOFA hipotension");
  }

  return terminos.join(" | ");
}

/**
 * Recupera el contexto clínico relevante de la base de conocimiento usando RAG
 */
export async function recuperarContextoTriage(datos: DatosPaciente): Promise<ResultadoRAG> {
  try {
    const index = await obtenerIndiceTriage();
    const query = construirQueryBusqueda(datos);

    console.log(`[RAG Triage] Buscando en base de conocimiento con query: "${query}"`);

    const retriever = index.asRetriever({
      similarityTopK: 2,
    });

    const nodos = await retriever.retrieve({ query });

    if (!nodos || nodos.length === 0) {
      console.warn("[RAG Triage] No se encontraron nodos similares para la consulta.");
      return {
        contexto: "No se encontraron protocolos específicos. Utilizar directrices generales de clasificación de urgencia.",
        fuentes: ["Protocolo General de Triage"],
      };
    }

    const fuentesSet = new Set<string>();
    const fragmentos: string[] = [];

    nodos.forEach((n, idx) => {
      const source = n.node.metadata?.source || "Guía Clínica";
      fuentesSet.add(source);

      // Extraer texto
      const text = (n.node as any).text || (n.node as any).getContent?.() || "";
      if (text) {
        fragmentos.push(`--- Protocolo de Referencia (${source}) ---\n${text.trim()}`);
      }
    });

    return {
      contexto: fragmentos.join("\n\n"),
      fuentes: Array.from(fuentesSet),
    };
  } catch (error: any) {
    console.error("[RAG Triage] Error al recuperar contexto RAG:", error.message);
    // Fallback gracioso para que nunca interrumpa el flujo
    return {
      contexto: "Sistema de Triage MTS / ESI: Evaluar estabilidad de vía aérea, ventilación, circulación y estado neurológico (Glasgow). Priorizar Nivel I (inmediato) ante compromiso vital o Glasgow <= 8, Nivel II (10-15 min) ante riesgo potencial o dolor severo, Nivel III (30-60 min) en pacientes estables con requerimiento diagnóstico.",
      fuentes: ["Guía Estándar de Emergencias (Fallback)"],
    };
  }
}
