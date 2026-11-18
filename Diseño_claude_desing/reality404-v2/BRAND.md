reality404 es la marca personal de Nico: developer, design and workflows with AI. El sitio es negro puro con tubos de cromo líquido al fondo; encima, todo es **vidrio esmerilado** con el brillo blanco del logo 404. Monocromo, frío, táctil: los componentes se cogen, se lanzan, se inclinan y responden al cursor.

## Voz y contenido

- Español, tuteo, frases cortas y directas: "Cuéntame tu idea y te respondo pronto.", "Hablemos".
- El titular del hero se queda en inglés: "Developer, design and workflows with AI".
- Palabras clave en **negrita** dentro del párrafo (developer, QA, workflows, IA), nunca en mayúsculas.
- El chiste 404 se usa con moderación y siempre ligado al contexto: "Mensaje no encontrado.", "comando no encontrado — error 404", "Mensaje encontrado." al enviar.
- Sin emojis en la interfaz. Sin métricas inventadas: cada número es un dato real (`projects.length`, `tech.length`).
- Etiquetas de sección (`eyebrow`) en mayúsculas espaciadas: PROYECTOS, STACK, SOBRE MÍ, CONTACTO.

## Color

- Fondo de página siempre `void` (#000). La imagen `assets/Fondos/fondo-404-cromo-1920.webp` va `fixed` detrás a opacidad .30–.35 con un degradado radial hacia negro (clase `.r4-stage`).
- Superficies = vidrio: relleno `glass`, borde 1px `glass-edge`, sombra `shadow-glass` (incluye el brillo especular `glass-highlight` arriba) y `backdrop-filter: blur(var(--blur-glass))`. Clase `.r4-glass`.
- La escala `frost-100…400` sale del logo: `frost-100` es el halo, `frost-300` el cuerpo esmerilado. Úsala para acentos, trazos, botones primarios y estados activos. No hay color de marca saturado.
- Texto: `ink` principal, `ink-muted` secundario, `ink-faint` solo metadatos y placeholders. Sobre rellenos `frost-100`/`frost-200`, el texto es `on-frost`.
- `signal-live` (disponible / enviado) y `signal-error` siempre acompañados de texto.
- Logos de tecnologías con tinta oscura (Next.js, GitHub) van sobre ficha clara `.r4-frost-chip`, nunca sobre vidrio oscuro.
- Foco de teclado: `focus-ring` 2px sólido con 2px de separación en todo lo interactivo.

## Tipografía

- `display` (Space Grotesk) para titulares, nombres de proyecto, botones y eyebrows; tracking negativo en tamaños grandes (`hero` -0.04em, `section-title` -0.03em).
- `body` (Manrope) para párrafos: `lead` en hero y sobre mí, `body` en el resto.
- `mono` (JetBrains Mono) solo en las variantes terminal y en metadatos tipo `ID · 404-NC`.
- Texto con aspecto de logo: clase `.r4-frost-text` (frost-100 + halo). Solo en una palabra o cifra por sección.

## Forma, profundidad y movimiento

- Radios generosos: `radius-lg` tarjetas, `radius-xl` paneles grandes, `radius-pill` CTAs y chips (las formas de tubo del fondo).
- Profundidad con luz, no con color: `shadow-frost-glow` en hover/activo, `shadow-lift` en lo que se arrastra.
- Curva por defecto `ease-liquid`; `ease-spring` para soltar objetos y voltear. `duration-fast` hover, `duration-base` paneles, `duration-slow` vuelos y pantalla completa.
- Todo componente interactivo respeta `prefers-reduced-motion`: sin vuelos, sin barridos, sin física de caída; el estado final aparece directamente.

## Proyectos y la tablet

- El dispositivo (`DeviceShowcase` con `device-frame`) y su contenido no se tocan.
- Cualquier variante de proyectos (`ProjectDeck`, `ProjectCoverflow`, `ProjectBento`) reproduce el vídeo del proyecto (`video`, mp4/webm muted loop, `poster` = captura) cuando está activa o en hover; sin vídeo, la captura hace un barrido lento con la etiqueta PREVIEW.
- Al pinchar, la tarjeta vuela hasta la pantalla de la tablet (`R4.flyTo`, `duration-slow`) y `DeviceFullscreen` amplía la tablet o el móvil a pantalla completa. Esc o "Salir" la devuelve a su sitio.

## Iconografía

- Logos de tecnologías: devicon 2.16.0 (`cdn.jsdelivr.net/npm/devicon@2.16.0/icons/…`), versión `original` salvo Jest (`plain`). En el repo actual se cargan sin versión: fíjala.
- Flechas y controles con glifos de texto (← → ↑ ✕ ⛶), sin librería de iconos.
- Logo 404: PNGs de `assets/Logos/` sobre negro o con `mix-blend-mode: screen`. Nunca dibujarlo de nuevo.

## Variantes por sección

Cada sección tiene tres propuestas intercambiables y reutilizables en otros proyectos:

| Sección | Opciones |
| --- | --- |
| Proyectos | ProjectDeck · ProjectCoverflow · ProjectBento |
| Tecnologías | TechPhysicsBox · TechMagnetCloud · TechStackTower |
| Sobre mí | AboutBadge · AboutBento · AboutTerminal |
| Contacto | ContactGlass · ContactChat · ContactTerminal |
| Dispositivo | DeviceFullscreen |

Las previews son HTML + JS sin framework; comparten `components/bundle.css` (clases `r4-*`) y `components/bundle.js` (`window.R4`: datos de proyectos y tecnologías, `media`, `miniTablet`, `flyTo`). Para el sitio React, porta cada una a un componente `.tsx` que reciba `projects`/`tech` de `src/data/` y mantén los nombres de clase o pásalos a utilidades Tailwind leyendo los mismos tokens.
