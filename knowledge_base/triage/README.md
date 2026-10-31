# Base de Conocimiento de Triage Clínico (RAG)

Esta carpeta contiene los documentos normativos, protocolos y algoritmos clínicos que el sistema utiliza como base de conocimiento para el sistema de Triaje con Inteligencia Artificial.

### Documentos incluidos por defecto:
1. `protocolo_manchester_mts.md`: Niveles de urgencia (I a V), tiempos de espera y criterios generales.
2. `signos_vitales_y_escalas_alerta.md`: Rangos numéricos y escalas críticas (FC, FR, SpO2, TA, Temperatura, Glasgow).
3. `algoritmos_patologias_frecuentes_urgencias.md`: Protocolos específicos para dolor torácico (IAM), dificultad respiratoria, ACV (código ictus), sepsis (qSOFA) y dolor abdominal.

### ¿Cómo agregar más información o PDFs?
Puedes agregar cualquier archivo de texto (`.md`, `.txt`) o documento PDF (`.pdf`) directamente en esta carpeta. El motor RAG los cargará automáticamente en la memoria vectorial al iniciar o actualizar la indexación.
