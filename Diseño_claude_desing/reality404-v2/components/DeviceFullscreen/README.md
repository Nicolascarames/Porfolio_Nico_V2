# DeviceFullscreen

Animación que amplía la tablet (o el móvil) desde su sitio en la página hasta ocupar toda la pantalla al abrir un proyecto, con velo desenfocado detrás y una barra de vidrio con el título y "Salir (Esc)".

**Envuelve a** `DeviceShowcase` sin tocar el `DeviceFrame` ni su contenido: solo anima el contenedor `#tablet-frame`.

## Qué aporta quien lo usa
- El nodo del dispositivo (el `div#tablet-frame`) y un hueco padre (`slot`) que conserva el tamaño mientras está ampliado.
- `expand()` / `collapse()` expuestos (hook `useDeviceFullscreen(ref)` en el sitio real). `HomePage.handleSelectProject` llama a `setOpenProjectId` y después a `expand()`.

## Cómo anima
1. Mide el rect actual y reserva el hueco en el slot.
2. Pasa el nodo a `position: fixed` y anima `left/top/width/height`, `padding` (bisel → 0) y `border-radius` (34 px → 0) en `duration-slow` con `ease-liquid`. El contenido (iframe) se redimensiona de verdad, no se escala, así que no se deforma.
3. Velo `rgba(0,0,0,.55)` + `blur-overlay` y la HUD bajan con `ease-spring`.
4. Esc, clic en el velo o "Salir" hacen la inversa hacia el rect del slot.
- Opcional: tras animar, `el.requestFullscreen()` para ocultar también la UI del navegador.
- Doble clic en el dispositivo alterna; Tablet/Móvil cambia el marco con su propia transición (en el sitio real lo decide `useMediaQuery('(max-width: 820px)')`).

## Do / Don't
- Do: bloquear el scroll del body mientras está ampliado.
- Don't: animar con `transform: scale` el iframe; deforma el contenido y emborrona el texto.
- `prefers-reduced-motion`: cambia de estado sin transición.
