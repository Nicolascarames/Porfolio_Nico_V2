# Brief para Claude Code — rediseño reality404 v2

Implementar en la app real (Vite + React 18 + TypeScript + Tailwind v4) los 13 componentes de esta carpeta. Nico se queda con **todas** las variantes.

> Nota: `CLAUDE.md` dice que la app aún no está scaffoldeada, pero eso ya no es verdad: el código vive en `src/`. Actualiza esa sección del `CLAUDE.md` como parte del trabajo.

## Qué hay en esta carpeta (`Diseño_claude_desing/reality404-v2/`)

| Ruta | Qué es |
| --- | --- |
| `index.html` | Galería con todas las demos en vivo. Ábrela en el navegador antes de empezar. |
| `components/<Comp>/preview.html` | Demo funcional en HTML + JS sin framework. **Es la referencia de comportamiento**: tiempos, curvas, umbrales y estados. Pórtala, no la reinventes. |
| `components/<Comp>/README.md` | Guía: qué datos recibe, interacción exacta, do/don't. |
| `BRAND.md` | Reglas de marca: color, tipografía, voz, movimiento. |
| `tokens.json` / `tokens.css` | Tokens. `tokens.css` es la traducción a variables CSS. |
| `shared/bundle.css` | Clases compartidas `r4-*`: vidrio, ficha clara, botones, barrido de medios, mini tablet. |
| `shared/bundle.js` | `window.R4`: datos de demo, `media()`, `miniTablet()`, `flyTo()`. Solo para las demos. |
| `assets/` | Logos 404 (PNG con fondo negro), fondo cromado (WebP 1920) y capturas WebP. |

## Restricciones (no negociables)

- **No tocar** `DeviceFrame` (paquete `device-frame`) ni lo que muestra la tablet/móvil. `DeviceFullscreen` solo anima el contenedor `#tablet-frame`.
- Mantener `POST /api/contact` con el mismo payload `{ name, email, message }` en las 3 variantes de contacto.
- Mantener `scrollToId` y el flujo actual de `handleSelectProject → setOpenProjectId` (abre `?open=<id>` en Desktop_Nav).
- Respetar `prefers-reduced-motion` en todo lo que se mueve: el estado final aparece directamente, sin animación.
- Sin dependencias nuevas salvo `matter-js@0.19.0` (+ `@types/matter-js`), cargado con `import()` solo cuando la sección entra en pantalla.
- Iconos devicon con versión fija: `https://cdn.jsdelivr.net/npm/devicon@2.16.0/icons/...` (ahora se cargan sin versión en `src/data/tech.ts`).

## Decisiones abiertas: pregúntale a Nico antes de implementar

1. **Cómo conviven las 3 variantes de cada sección.** Recomendado: un `config/sections.ts` con la variante por defecto de cada sección, más un selector de vidrio en la cabecera de cada sección para que el visitante cambie de estilo (se guarda en `localStorage`). Alternativas: solo el config, sin selector visible; o una página `/lab` con todas las variantes.
2. **Fondo:** sustituir `fondoSicodelico.jpg` por `assets/fondo-404-cromo-1920.webp` (es lo que asumen los componentes).
3. **Paleta:** el acento crema `--color-accent: #f2efcf` pasa a `frost-100` (#dfe1ec) en todo el sitio, o solo en las secciones nuevas.
4. **Vídeos de proyecto:** dónde viven (`public/videos/*.mp4` o un CDN). Mientras no existan, se usa la captura con barrido lento, como en las demos.

## Plan por fases (verificar cada una en el navegador antes de seguir)

**Fase 0 — Base**
- Copiar `assets/` a `src/assets/brand/` (logos, fondo).
- Pasar los tokens a `@theme` en `src/styles/index.css`. Colores como `--color-*`, para que existan utilidades tipo `bg-glass` y `text-ink-muted`, y el resto como variables. Mover las clases `r4-*` de `shared/bundle.css` a `src/styles/r4.css`. Añadir JetBrains Mono a las fuentes.
- `src/data/projects.ts`: añadir `id`, `tags: string[]` y `video?: string`.
- Utilidades compartidas: `src/hooks/useInView.ts`, `src/hooks/useReducedMotion.ts`, `src/lib/flyTo.ts` (port de `R4.flyTo`), `src/components/ui/ProjectMedia.tsx` (port de `R4.media`: `<video muted loop playsInline preload="metadata" poster>` o imagen con barrido, controlado por una prop `playing`).

**Fase 1 — DeviceFullscreen**
- Hook `useDeviceFullscreen(ref)` con `expand()`, `collapse()` e `isFull`. Anima `left/top/width/height/padding/border-radius` con WAAPI desde el rect hasta el viewport (ver la demo), con un velo `blur-overlay`, una barra de vidrio con título, Esc y "Salir", y bloqueo del scroll del body. No escalar el iframe con `transform`.
- Integrarlo en `DeviceShowcase` y exponerlo a `HomePage`.

**Fase 2 — Proyectos**: `ProjectDeck`, `ProjectCoverflow`, `ProjectBento` en `src/components/projects/`.
- Todas reciben `projects` y `onSelectProject(project, el)`.
- Al seleccionar: `flyTo(el, #tablet-frame)`, después `setOpenProjectId`, y después `expand()`.

**Fase 3 — Tecnologías**: `TechPhysicsBox`, `TechStackTower` (Matter.js) y `TechMagnetCloud` (sin dependencias) en `src/components/tech/`.
- Sincronizar los nodos del DOM con los cuerpos de física en un `requestAnimationFrame`, y limpiar engine, eventos y rAF en el unmount.
- Pausar cuando la sección sale de pantalla.

**Fase 4 — Sobre mí**: `AboutBadge`, `AboutBento`, `AboutTerminal` en `src/components/about/`.
- Los textos salen de `About.tsx`.
- "Lo que se lanza, funciona de verdad." y "Nico, en piezas." son textos propuestos: confírmalos con Nico.

**Fase 5 — Contacto**: `ContactGlass`, `ContactChat`, `ContactTerminal` en `src/components/contact/`.
- Lógica de envío compartida en `useContactSubmit()`, con los estados idle, sending, sent y error.

**Fase 6 — Selector de variantes**, según la decisión 1. Después, el responsive (≤ 820 px):
- En móvil, Coverflow cae a Deck.
- La torre necesita al menos 340 px de ancho.
- Bento pasa a 1–2 columnas.

## Definición de hecho

- Abres `npm run dev` y cada variante se comporta como su `preview.html`: arrastre, lanzamiento, vuelo a la tablet, pantalla completa, física, chat y terminal.
- Se navega con teclado (Tab, Enter, ← →, Esc) y se ve el foco con `focus-ring`.
- Con reduced motion activado en DevTools, no hay animaciones.
- No hay errores en consola, y `npm run build` pasa.
- `memory.md` y `CLAUDE.md` quedan actualizados con las decisiones tomadas.
