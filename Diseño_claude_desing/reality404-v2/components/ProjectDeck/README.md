# ProjectDeck

Baraja de tarjetas de vidrio apiladas en abanico: se arrastran y se lanzan para pasar a la siguiente, y la de arriba reproduce el vídeo del proyecto.

**Sustituye a** `ProjectsCarousel` (el marquee infinito).

## Qué aporta quien lo usa
- `projects: Project[]` — el mismo tipo de `src/data/projects.ts` más un campo opcional `video?: string` (mp4/webm corto, muted, 6–12 s). Sin vídeo se usa `img` con un barrido lento; sin `img`, el placeholder 404.
- `onSelectProject(project, cardEl)` — la tarjeta "vuela" a `#tablet-frame` (`R4.flyTo`) y al aterrizar llama a `setOpenProjectId` y, si quieres, a `DeviceFullscreen.expand()`.
- Contenedor de al menos 340 px de alto.

## Interacción
- Arrastrar: la tarjeta sigue al puntero con rotación `dx/14`. Suelta a más de 120 px o con velocidad > 0.6 px/ms → sale volando y pasa al fondo.
- Clic sin arrastre (< 6 px) o Enter/Espacio → abre en la tablet. ← → cambian de tarjeta. Puntos = salto directo.
- Solo la tarjeta de arriba reproduce vídeo; el resto se pausa (ahorra batería y datos).

## Do / Don't
- Do: vídeos sin audio, `preload="metadata"` y `poster` = la captura.
- Do: máximo 4 tarjetas visibles en el abanico (el resto opacity 0).
- Don't: más de ~8 proyectos; a partir de ahí usa ProjectBento.
- `prefers-reduced-motion`: sin vuelo ni barrido; el clic abre directamente.
