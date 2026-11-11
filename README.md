# 🏥 TriageAI — Sistema Inteligente de Triage Clínico con RAG Local

**TriageAI** es una plataforma clínica de soporte a la decisión médica para la evaluación, clasificación y priorización de pacientes en servicios de urgencias. El sistema combina modelos de lenguaje locales (LLM) con una arquitectura **RAG (Retrieval-Augmented Generation)** fundamentada en protocolos médicos oficiales como el **Sistema Manchester de Triage (MTS)**, escalas **NEWS2** y guías de actuación para patologías críticas (Síndrome Coronario Agudo, ACV/Código Ictus, Sepsis, Insuficiencia Respiratoria, etc.).

---

## 🚀 Características Principales

1. **Clasificación Basada en Evidencia (RAG Local):**
   * El modelo no califica "de memoria" ni alucina criterios: contrasta las constantes vitales y síntomas con normativas oficiales almacenadas en `knowledge_base/triage/`.
   * Cita explícitamente los protocolos y discriminadores aplicados en el campo de justificación médica.
   * Admite ampliación dinámica de la base de conocimiento agregando archivos `.md`, `.txt` o documentos `.pdf`.

2. **5 Niveles de Prioridad Médica (Sistema Manchester MTS):**
   * 🔴 **Nivel I - Reanimación (Rojo):** Riesgo vital inmediato (0 minutos / Inmediato).
   * 🟠 **Nivel II - Emergencia / Muy Urgente (Naranja):** Riesgo potencial o dolor severo (10 a 15 minutos).
   * 🟡 **Nivel III - Urgente (Amarillo):** Paciente con patología aguda o requerimiento diagnóstico (30 a 60 minutos).
   * 🟢 **Nivel IV - Menos Urgente (Verde):** Complejidad baja sin riesgo vital (120 minutos).
   * 🔵 **Nivel V - No Urgente (Azul):** Problemas crónicos o administrativos (240 minutos).

3. **Módulo de Historial Clínico (`/historial`):**
   * Registro persistente en `localStorage` de todas las evaluaciones realizadas.
   * Dashboard con métricas de pacientes críticos, urgentes y leves.
   * Buscador en tiempo real por Nombre, DNI o Motivo de consulta.
   * Filtros interactivos por nivel de urgencia.
   * Visualización histórica de fichas de triage e impresión clínica directa.
   * Descarga y exportación completa del historial en formato `.json`.

4. **100% Privado y Offline:**
   * Toda la inferencia y vectorización se realiza localmente mediante **Ollama**, sin enviar datos sensibles de pacientes a servicios en la nube.

---

## 🛠️ Stack Tecnológico

* **Frontend & Backend Web:** [Next.js](https://nextjs.org/) (App Router, React 18, TailwindCSS).
* **Framework RAG:** [LlamaIndex.TS](https://ts.llamaindex.ai/) (Índices vectoriales y búsqueda semántica).
* **Inferencia Local (LLM):** [Ollama](https://ollama.com/) con el modelo `gemma2`.
* **Modelo de Embeddings:** `nomic-embed-text` a través de Ollama.
* **Procesamiento de Documentos:** Soporte nativo para Markdown y extracción de texto en PDFs (`pdf-parse`).

---

## 📋 Requisitos Previos

1. **Node.js:** Versión 18 o superior (se recomienda Node 20+).
2. **Ollama:** Instalado en el sistema operativo ([descargar aquí](https://ollama.com/)).

---

## ⚙️ Instalación y Puesta en Marcha

### 1. Descargar los modelos en Ollama

Abre una terminal y descarga los modelos requeridos:

```bash
# Modelo de razonamiento y clasificación clínica
ollama pull gemma2

# Modelo de embeddings vectoriales para el RAG
ollama pull nomic-embed-text
```

Asegúrate de que el servicio de Ollama esté ejecutándose:
```bash
ollama serve
```

### 2. Instalar dependencias del proyecto

En la raíz del proyecto, ejecuta:

```bash
npm install
```

### 3. Iniciar el entorno de desarrollo

```bash
npm run dev
```

La aplicación quedará disponible en:
👉 **[http://localhost:3000](http://localhost:3000)** (redirige automáticamente a `/triage`).

---

## 🗂️ Estructura del Proyecto

```text
TriageAI/
├── app/
│   ├── api/triage/route.ts      # Endpoint de evaluación (recuperación RAG + Ollama)
│   ├── historial/page.tsx       # Página del historial clínico de pacientes
│   ├── triage/
│   │   ├── page.tsx             # Formulario de nuevo paciente
│   │   └── resultado/page.tsx   # Ficha de resultado de triage
│   ├── layout.tsx               # Layout general con branding TriageAI y barra de navegación
│   └── page.tsx                 # Redirección raíz a /triage
├── components/
│   ├── triage/
│   │   ├── TriageForm.tsx       # Formulario con presets rápidos y badges de unidades
│   │   ├── TriageResult.tsx     # Tarjeta de resultados, justificación y RAG consultado
│   │   └── TriageHistory.tsx    # Dashboard, buscador, filtros y exportación
│   └── ui/                      # Primitivas de interfaz (Button, Input, Label)
├── knowledge_base/triage/       # Base de conocimiento normativo de Triage (RAG)
│   ├── protocolo_manchester_mts.md
│   ├── signos_vitales_y_escalas_alerta.md
│   └── algoritmos_patologias_frecuentes_urgencias.md
├── lib/
│   ├── triage-rag.ts            # Motor LlamaIndex de indexación y búsqueda semántica
│   ├── triage-history.ts        # Tipos compartidos, estilos de nivel y persistencia de historial
│   └── utils.ts
├── tailwind.config.ts
├── package.json
└── README.md
```

---

## 🧪 Pruebas Rápidas en la Interfaz

En el formulario de **Nuevo Paciente**, dispones de botones para autocompletar casos clínicos de prueba en 1 clic:
* **🟠 Sospecha IAM:** Dolor torácico opresivo con diaforesis → Dispara Nivel II (Naranja - 10-15 min) para ECG inmediato.
* **🔴 Emergencia Vital:** Glasgow 7 con respiración agónica → Dispara Nivel I (Rojo - Inmediato) por vía aérea en riesgo.
* **🟡 Sepsis Potencial:** Fiebre alta, taquipnea y taquicardia → Dispara Nivel III (Amarillo - 30-60 min).
* **🟢 Traumatismo Leve:** Esguince de tobillo sin compromiso óseo → Dispara Nivel IV (Verde - 120 min).

---

## ⚖️ Descargo de Responsabilidad (Disclaimer)

Esta aplicación es una prueba de concepto tecnológica y herramienta de soporte asistencial orientada a la investigación y el entrenamiento. **No reemplaza en ningún caso el juicio clínico de un profesional de la salud matriculado.**