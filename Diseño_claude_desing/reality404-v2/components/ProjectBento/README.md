# ProjectBento

Rejilla bento de tarjetas de vidrio de distintos tamaños; cada una se inclina en 3D siguiendo al ratón con un brillo especular, y el vídeo arranca al pasar por encima.

**Sustituye a** `ProjectsCarousel` cuando quieres ver todos los proyectos a la vez.

## Qué aporta quien lo usa
- `projects: Project[]`; el primero ocupa 2×2 (el destacado). Patrón de spans: `2×2, 2×1, 1×1, 1×2, 2×1` sobre 4 columnas de 150 px de alto.
- `onSelectProject(project, tileEl)`.

## Interacción
- Hover/foco: tilt máx. 10° X / 12° Y, brillo radial en la posición del cursor, flecha que gira a 0° y se rellena de `frost-100`, descripción que aparece.
- Clic → vuelo a la tablet.
- Todo es `<button>`: navegable con Tab, el foco reproduce el vídeo igual que el hover.

## Do / Don't
- Do: en móvil, una sola columna con todas las tarjetas 1×1 y la descripción siempre visible.
- Don't: poner texto encima de zonas claras de la captura sin el degradado `shade`.
