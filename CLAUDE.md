# CLAUDE.md — Portfolio_Nico_V2

Portfolio personal de Nico (marca personal, no solo caza de empleo). Estado: app real en `src/` (Vite + React + TS + Tailwind v4), desplegada en Vercel. En curso: rediseño reality404 v2 (ver `memory.md`).

## Idioma y trato

Responde y pregunta SIEMPRE en castellano (español de España), incluidas las preguntas de aclaración y los resúmenes. El código y los identificadores van en inglés; los commits siguen Conventional Commits (feat/fix/chore/docs/refactor...).

## Estilo de trabajo — profesional, no complaciente

El objetivo de cada sesión es sacar trabajo productivo y terminado, no volumen de cambios. Para eso:

- Antes de implementar nada no trivial, interroga los detalles: presenta las decisiones abiertas con opciones concretas y espera la elección. Una pregunta a tiempo cuesta una línea; una suposición equivocada cuesta la sesión.
- "Hecho" significa: funciona y está verificado abriendo la app real en el navegador (no basta con que compile o pase el build).
- Testing: sin tests por ahora (portfolio personal, prioridad velocidad y diseño). Si en algún momento se añade backend/lógica real (login, formularios), replantear.
- No amplíes el alcance por iniciativa propia. Mejoras no pedidas se proponen, no se hacen.

## Inicio de cada sesión

1. Lee `memory.md` entero antes de la primera tarea. Es la memoria del proyecto y del usuario; ignorarla repite errores ya corregidos.
2. No uses skills ni plugins en este repo (desactivados en `.claude/settings.json`): decide tú cómo actuar en cada caso.

## Memoria (`memory.md`)

- Cuando el usuario corrija algo — código, un supuesto, una preferencia, una forma de trabajar — regístralo en `memory.md` ANTES de continuar. No pidas permiso: es parte del flujo.
- Registra también lo que convenga recordar del proyecto: decisiones tomadas, conceptos clave, dónde vive cada cosa.
- El fichero debe seguir siendo pequeño: consolida entradas repetidas, convierte correcciones asimiladas en reglas de una línea, borra lo obsoleto. Si supera ~150 líneas, toca compactar.

## Exploración del código y economía de tokens

- Para localizar código usa Grep/Glob y lee rangos concretos.
- Lee estrecho: secciones concretas, no ficheros enteros; nunca releas lo que ya está en contexto.
- Piensa caro, ejecuta barato: la planificación y el diagnóstico difícil van al modelo potente (opusplan); la ejecución mecánica y las búsquedas, al barato. No uses el modelo caro para trabajo de peón.

## Seguridad y producción

Antes de cualquier despliegue a producción (Vercel) — y tras tocar autenticación, claves, formularios o subida de ficheros — haz una revisión de seguridad propia (secretos, validación de entrada en `api/`, cabeceras) y resuelve lo que encuentres.

## Mapa del proyecto

- Mockups de diseño (referencia visual, exportados de la herramienta de diseño de Claude — formato `dc-runtime`): `Diseño_claude_desing/Portfolio.dc.html`, `Diseño_claude_desing/Login.dc.html`.
- `Diseño_claude_desing/support.js`: runtime generado ("do not edit"), no forma parte del stack final — no reutilizar en la app real.
- Capturas y assets de referencia: `Diseño_claude_desing/screenshots/`, `Diseño_claude_desing/uploads/`.
- Código de la app: `src/` (componentes en `src/components/`, datos en `src/data/`, auth en `src/auth-kit/`), función serverless `api/contact.ts`.
- Rediseño v2: `Diseño_claude_desing/reality404-v2/` (brief `BRIEF_CLAUDE_CODE.md`, demos `components/*/preview.html`).

## Comandos

- `npm run dev` — servidor Vite
- `npm run build` — build de producción
- `npm test` — Vitest (solo `api/contact.ts`)
