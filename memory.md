# memory.md — Portfolio_Nico_V2

Memoria viva del proyecto y del usuario. Leer entera al inicio de cada sesión.

**Disciplina de este fichero**
- Cada entrada debe cambiar cómo actuará Claude mañana; si no, no entra.
- Un hecho, una vez: si ya existe una entrada sobre el tema, se actualiza, no se duplica.
- Al superar ~150 líneas: consolidar (fusionar repetidos, reducir correcciones asimiladas a reglas de una línea, borrar obsoletos).

## Sobre el usuario

- Prefiere código en inglés y commits en formato Conventional Commits.
- Sin preferencia de testing estricta por ahora: portfolio personal, prioridad velocidad y diseño sobre cobertura de tests.
- Rechazó la visualización 3D del grafo de codebase-memory (2026-07-17) — no volver a proponerla salvo que cambie de idea.

## Conceptos clave del proyecto

- `Diseño_claude_desing/Portfolio.dc.html` y `Login.dc.html` son mockups exportados de una herramienta de diseño de Claude (runtime `dc-runtime`, ver comentario en `support.js`). Son la referencia visual aprobada para reconstruir el sitio real — no el código final.
- Decisión (2026-07-17): stack de la app real = Vite + React + TypeScript + Tailwind CSS + React Router. Despliegue en Vercel.
- Propósito del portfolio: marca personal, no exclusivamente caza de empleo.
- Spec de la migración: `docs/superpowers/specs/2026-07-17-portfolio-migration-design.md`.
- **DeviceShowcase usa `Iphone_Clone` (`C:\GitHub\Iphone_Clone`) como dependencia**, no un componente propio. Ese repo amplía su `<device-frame>` con `mode="inline"` (ver `Iphone_Clone/docs/superpowers/specs/2026-07-17-device-frame-inline-mode-design.md`) para poder incrustarse en el flujo normal de página (el modo `overlay` original es fijo a pantalla completa, pensado para Game_Nav). Decisión explícita del usuario: tratar Iphone_Clone como librería base reutilizable para más webs, no como código a copiar.
- **2026-07-19 — corregido**: era dependencia `file:../Iphone_Clone`, rompía el build de Vercel (esa carpeta hermana no existe fuera de esta máquina, y `dist/` de Iphone_Clone está en `.gitignore`). Ahora es `"device-frame": "github:Nicolascarames/Iphone_Clone#<sha>"` (dependencia git pineada a un commit, con script `prepare` en Iphone_Clone que autocompila `dist/` al instalar). Detalle completo y cómo bumpear el pin: `Iphone_Clone/CLAUDE.md` sección "Distribution". Antes de tocar esta dependencia, leer eso.
- ContactForm envía de verdad (Resend vía `api/contact.ts`, Vercel Serverless Function) — no es un formulario decorativo.
- **Excepción a "sin tests"**: `api/contact.ts` sí lleva test (Vitest, Resend mockeado) porque es lógica de backend real. Es la única excepción; el resto del portfolio sigue sin tests. No proponer tests en otras partes sin que el usuario lo pida.
- Login (`Login.dc.html`) queda fuera de esta migración: `/login` es solo un placeholder "Próximamente" vía React Router. Abordar el login real es una sesión aparte.

## Decisiones pendientes

- Login real (auth, backend, formulario) — sesión aparte, todavía sin diseñar.
- Indexar el repo en codebase-memory (MCP) en cuanto exista el scaffold de Vite+React (inminente).

## Correcciones

(vacío — sin correcciones registradas todavía)
