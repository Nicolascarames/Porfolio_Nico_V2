# TechMagnetCloud

Nube de iconos que flotan suavemente dentro de una caja de vidrio, unidos por hilos de luz; el cursor los repele (o los atrae) como un imán y se pueden arrastrar.

**Sustituye a** `TechMarquee`. Sin dependencias.

## Qué aporta quien lo usa
- `tech: Tech[]`. Las posiciones de reposo se calculan en rejilla escalonada de 6 columnas.
- Contenedor con altura fija (~360 px).

## Interacción
- Cada icono oscila alrededor de su sitio (muelle .02, amortiguación .86).
- Radio de influencia del cursor 140 px; modo Repeler / Atraer con el selector.
- Arrastrar un icono lo despega de su muelle; al soltarlo vuelve flotando.
- Hilos `frost-100` entre vecinos a < 150 px, opacidad según distancia (los tubos del fondo, en versión línea).
- Tooltip con el nombre en hover y foco; cada icono es un `<button>` con `aria-label`.

## Do / Don't
- Do: buena opción para móvil (el toque actúa como cursor).
- Don't: ponerlo sobre otro fondo con líneas; los hilos se pierden.
