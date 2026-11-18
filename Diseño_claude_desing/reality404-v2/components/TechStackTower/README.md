# TechStackTower

Torre piramidal de fichas (5-4-3-2-1-1 = 16) con física: el usuario la derriba empujando, cogiendo bloques o lanzando una bola cromada, y se recompone sola a los 5 s.

**Sustituye a** `TechMarquee`. Usa Matter.js 0.19.0 como TechPhysicsBox.

## Qué aporta quien lo usa
- `tech: Tech[]` — exactamente 16 para la pirámide; con otro número ajusta el array `rows`.
- Contenedor de ~400 px de alto con suelo de 24 px.

## Interacción
- Contador "N / 16 en pie" (aria-live).
- "Lanzar bola": esfera cromada (el material del fondo) con velocidad 22 px/frame.
- "Reconstruir" o 5 s sin tocar: cada bloque vuela en arco a su sitio (1,1 s, escalonado 35 ms por bloque) y vuelve a tener física.

## Do / Don't
- Do: es la más "juego" de las tres; úsala si quieres que la sección sea un momento lúdico.
- Don't: en móvil estrecho; la pirámide de 5 necesita ≥ 340 px de ancho.
