# TechPhysicsBox

Caja de vidrio con física real (Matter.js 0.19.0): las fichas de tecnologías caen al entrar en pantalla, se apilan, se cogen con el ratón y se lanzan unas contra otras.

**Sustituye a** `TechMarquee`.

## Qué aporta quien lo usa
- `tech: Tech[]` de `src/data/tech.ts` (nombre + SVG). Fichas de 64 px en `r4-frost-chip` (vidrio claro, para que los logos oscuros como Next.js o GitHub se lean).
- Dependencia: `npm i matter-js@0.19.0` (≈ 80 KB gzip). Cárgalo con `import()` cuando la sección entra en el viewport.
- Contenedor con altura fija (380 px escritorio, 300 px móvil).

## Interacción
- Caen al hacerse visibles (IntersectionObserver), el techo se cierra a los 3,2 s.
- Arrastrar = `MouseConstraint` (stiffness .2). La ficha cogida se ilumina y muestra su nombre.
- "Agitar caja" da un impulso aleatorio; "Invertir gravedad" las manda al techo.
- La rueda del ratón NO se captura (la página sigue haciendo scroll).
- Hay una `<ul>` oculta con los nombres para lectores de pantalla.

## Do / Don't
- Do: pausar el bucle (`cancelAnimationFrame`) cuando la sección sale de pantalla.
- Don't: más de ~24 fichas; el coste crece y la caja se satura.
- Con `prefers-reduced-motion`, muestra las fichas ya apiladas y sin animación de caída.
