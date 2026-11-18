# AboutBento

Bento de vidrio con la información en piezas: foto con zoom, bio, estado disponible con pulso, hora local de A Coruña en vivo, contador de proyectos, stack diario y el ciclo de trabajo iluminándose en bucle.

**Sustituye a** `About`.

## Qué aporta quien lo usa
- Foto, bio (párrafos de `About.tsx`), número de proyectos (`projects.length`), las 10 primeras de `tech`, y los 4 pasos del ciclo (Código → QA → Workflow IA → Lanzar).
- La hora usa `Intl.DateTimeFormat('es-ES', { timeZone: 'Europe/Madrid' })`.

## Interacción
- Brillo radial que sigue al cursor en cada celda; foto en blanco y negro que coge color en hover.
- Contador que sube al entrar en pantalla; los iconos saltan al pasar por encima.

## Do / Don't
- Do: en móvil, 2 columnas; la foto arriba a ancho completo.
- Don't: inventar métricas para rellenar celdas; cada celda debe ser un dato real.
