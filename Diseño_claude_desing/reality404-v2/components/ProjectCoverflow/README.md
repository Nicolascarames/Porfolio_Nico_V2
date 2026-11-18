# ProjectCoverflow

Carrusel 3D con perspectiva: la tarjeta central se agranda, reproduce su vídeo y muestra "Abrir en tablet"; las laterales giran ±48° con reflejo de cristal debajo.

**Sustituye a** `ProjectsCarousel`.

## Qué aporta quien lo usa
- `projects: Project[]` (con `video?` opcional, como ProjectDeck).
- `onSelectProject(project, cardEl)` — igual que ProjectDeck.
- Ancho completo de sección; altura ~330 px + reflejo.

## Interacción
- Arrastre horizontal con inercia (210 px = una tarjeta), rueda del ratón, ← →.
- Clic en una lateral la centra; clic en la central (o Enter) la manda a la tablet.
- Circular: tras el último vuelve el primero.
- El texto del `aria-live` anuncia el proyecto central.

## Do / Don't
- Do: títulos cortos; la descripción se corta a 2 líneas.
- Don't: usarlo en móvil < 420 px; ahí cambia a ProjectDeck (más táctil).
- `-webkit-box-reflect` solo pinta en Chromium/Safari; en Firefox simplemente no hay reflejo.
