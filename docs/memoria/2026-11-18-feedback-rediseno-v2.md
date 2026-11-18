# Feedback del usuario tras las Fases 0–6 del rediseño v2 (2026-11-18)

Estado al escribir esto: Fases 0–6 commiteadas en local (último commit `1c7a201`), sin push.
Servidor de desarrollo: arrancar SIEMPRE desde `C:\GitHub\Porfolio_Nico_V2` (C mayúscula, ver memory.md).

## Tareas pedidas (todas deben funcionar en todo tipo de pantallas: 360, 390, 768, 1024, 1440, 1920+)

1. **ProjectDeck y ProjectCoverflow, demasiado pequeños en pantallas grandes.** Escalarlos con el viewport:
   - Deck: hoy la tarjeta es `min(440px, 82%)` con el contenedor a 340 px de alto, en `src/components/projects/projects.css`.
   - Coverflow: hoy las tarjetas tienen 380 px fijos, `STEP_PX` = 210 y el contenedor 330 px, en `ProjectCoverflow.tsx` y `projects.css`.
   - En ambos, tamaños en clamp()/vw y paso proporcional al ancho de la tarjeta.
2. **La animación proyecto → tablet a pantalla completa se ve mal.**
   - Causa: son dos animaciones sin conexión. Primero `flyTo` (`src/lib/flyTo.ts`) estira un clon de la tarjeta, que es 3:2, hasta la caja de la tablet. El escalado no es uniforme, así que deforma y desenfoca. Después la tablet real entra desde su hueco, a menudo fuera de pantalla (`useDeviceFullscreen`).
   - El usuario pregunta por qué no se usa "la tablet de Claude Design". En `DeviceFullscreen/preview.html` es un marco de juguete (div con bisel). La tablet real es `device-frame` (Iphone_Clone), que no se puede tocar.
   - Hay que proponer una coreografía de una sola pieza, por ejemplo:
     - (a) La tablet ampliada aparece primero (velo + tablet) y la tarjeta vuela a su PANTALLA (el iframe), con escala uniforme y fundido.
     - (b) Prescindir del clon y hacer un crossfade de la tarjeta hacia la tablet.
   - Enseñárselo antes de implementar.
3. **Tech `tower` y `physics` en pantallas pequeñas no caben y los botones no funcionan.**
   - Investigar con Playwright a 360/390/768 por qué no responden los botones. Sospechas:
     - Matter `MouseConstraint` y los listeners `touchstart` sobre la caja.
     - El `touch-action: none` de la caja.
     - El mundo de física creado con el ancho del primer render, que no se recrea al girar o redimensionar.
   - Logos más pequeños en móvil: `S` = 64/60 en `TechPhysicsBox.tsx` y `TechStackTower.tsx`.
   - Recalcular paredes y posiciones de la pirámide al cambiar el tamaño.
4. **About `badge`: el rebote es demasiado brusco** ("tira mucho y se devuelve muy rápido"). Suavizarlo: menos rigidez del muelle y más amortiguación (hoy k .035 / damping .93 en `AboutBadge.tsx`) y quizá un tope de velocidad.
5. **About `terminal` con IA** como el Terminal de Desktop_Nav. **Queda APUNTADO para el futuro, no se hace ahora.** Referencia: `C:\GitHub\Desktop_Nav\src\apps\Terminal.tsx`; para integrarlo, mirar cómo conecta allí con el LLM. Mientras tanto, about se queda en `'badge'`.
6. **Selectores visibles (cambia la decisión "solo config"):**
   - Contacto: un botón para elegir entre `terminal` y `glass`, con **terminal por defecto**. El chat ya no se ofrece al visitante.
   - Tecnologías: un botón para elegir entre las 3 (physics, tower, magnet).
   - Proyectos y about siguen eligiéndose solo en `config/sections.ts`.
   - Propuesta del brief original: control segmentado de vidrio (`.mc-seg` / `.seg` de las previews) en la cabecera de la sección; recordar la elección en `localStorage` con try/catch.

## Otros pendientes ya conocidos
- Puente de Esc en Desktop_Nav: `C:\GitHub\Desktop_Nav\docs\PENDIENTES.md`.
- Hilos de la nube imán apenas visibles en escritorio (la distancia entre iconos supera a la de los hilos). El usuario no ha decidido.
- Revisión de seguridad propia antes del deploy, incluidas las 37 vulnerabilidades de `npm audit`. Después, push.
