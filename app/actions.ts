'use server'

import { Document } from "llamaindex/Node"
import { VectorStoreIndex } from "llamaindex/indices/vectorStore/index"
import { ContextChatEngine } from "llamaindex/engines/chat/ContextChatEngine"
import { OllamaEmbedding } from "llamaindex/embeddings/OllamaEmbedding"
import { serviceContextFromDefaults } from "llamaindex/ServiceContext"
import { Ollama } from "llamaindex/llm/ollama"

interface LCDoc {
  pageContent: string,
  metadata: any,
}

// Configuración de Ollama
const OLLAMA_BASE_URL = process.env.OLLAMA_BASE_URL || "http://127.0.0.1:11434";

const embedModel = new OllamaEmbedding({
  model: 'nomic-embed-text',
  baseUrl: OLLAMA_BASE_URL,
})

// Usamos gemma2 que ya tienes instalado
const llm = new Ollama({
  model: "gemma2",   // <--- Cambiado de 'argano-contract-assistant' a 'gemma2'
  baseUrl: OLLAMA_BASE_URL,
  modelMetadata: {
    temperature: 0,
    maxTokens: 1024,
  }
})

let chatEngine: ContextChatEngine | null = null;

export async function processDocs(lcDocs: LCDoc[]) {
  if (lcDocs.length == 0) return;
  const docs = lcDocs.map(lcDoc => new Document({
    text: lcDoc.pageContent,
    metadata: lcDoc.metadata
  }))

  console.log("Procesando documentos...");
  console.log("Usando embedding model:", embedModel.model);
  console.log("Usando LLM model:", llm.model);

  try {
    const index = await VectorStoreIndex.fromDocuments(docs, {
      serviceContext: serviceContextFromDefaults({
        chunkSize: 300,
        chunkOverlap: 20,
        embedModel,
        llm
      })
    })
    const retriever = index.asRetriever({
      similarityTopK: 2,
    })
    if (chatEngine) {
      chatEngine.reset()
    }
    chatEngine = new ContextChatEngine({
      retriever,
      chatModel: llm
    })
    console.log("Índice creado exitosamente.");
  } catch (error) {
    console.error("Error al crear el índice:", error);
    throw error; // Re-lanzamos para que el frontend vea el error
  }
}

export async function chat(query: string) {
  if (!chatEngine) {
    throw new Error("El chat engine no está inicializado. Sube un PDF primero.");
  }
  const queryResult = await chatEngine.chat({
    message: query
  })
  const response = queryResult.response
  const metadata = queryResult.sourceNodes?.map(node => node.metadata)
  return { response, metadata };
}

export async function resetChatEngine() {
  if (chatEngine) chatEngine.reset();
}