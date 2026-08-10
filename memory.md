# memory.md — Portfolio_Nico_V2

Memoria viva del proyecto y del usuario. Leer entera al inicio de cada sesión.

**Disciplina de este fichero**
- Cada entrada debe cambiar cómo actuará Claude mañana; si no, no entra.
- Un hecho, una vez: si ya existe una entrada sobre el tema, se actualiza, no se duplica.
- Al superar ~150 líneas: consolidar (fusionar repetidos, reducir correcciones asimiladas a reglas de una línea, borrar obsoletos).

## Sobre el usuario

- Prefiere código en inglés y commits en formato Conventional Commits.
- Sin preferencia de testing estricta por ahora: portfolio personal, prioridad velocidad y diseño sobre cobertura de tests.
- Rechazó la visualización 3D del grafo de codebase-memory (2026-07-17) — no volver a proponerla salvo que cambie de idea.

## Conceptos clave del proyecto

- `Diseño_claude_desing/Portfolio.dc.html` y `Login.dc.html` son mockups exportados de una herramienta de diseño de Claude (runtime `dc-runtime`, ver comentario en `support.js`). Son la referencia visual aprobada para reconstruir el sitio real — no el código final.
- Decisión (2026-07-17): stack de la app real = Vite + React + TypeScript + Tailwind CSS + React Router. Despliegue en Vercel.
- Propósito del portfolio: marca personal, no exclusivamente caza de empleo.
- Spec de la migración: `docs/superpowers/specs/2026-07-17-portfolio-migration-design.md`.
- **DeviceShowcase usa `Iphone_Clone` (`C:\GitHub\Iphone_Clone`) como dependencia**, no un componente propio. Ese repo amplía su `<device-frame>` con `mode="inline"` (ver `Iphone_Clone/docs/superpowers/specs/2026-07-17-device-frame-inline-mode-design.md`) para poder incrustarse en el flujo normal de página (el modo `overlay` original es fijo a pantalla completa, pensado para Game_Nav). Decisión explícita del usuario: tratar Iphone_Clone como librería base reutilizable para más webs, no como código a copiar.
- **2026-07-19 — corregido**: era dependencia `file:../Iphone_Clone`, rompía el build de Vercel (esa carpeta hermana no existe fuera de esta máquina, y `dist/` de Iphone_Clone está en `.gitignore`). Ahora es `"device-frame": "github:Nicolascarames/Iphone_Clone#<sha>"` (dependencia git pineada a un commit, con script `prepare` en Iphone_Clone que autocompila `dist/` al instalar). Detalle completo y cómo bumpear el pin: `Iphone_Clone/CLAUDE.md` sección "Distribution". Antes de tocar esta dependencia, leer eso.
- ContactForm envía de verdad (Resend vía `api/contact.ts`, Vercel Serverless Function) — no es un formulario decorativo.
- **Excepción a "sin tests"**: `api/contact.ts` sí lleva test (Vitest, Resend mockeado) porque es lógica de backend real. Es la única excepción; el resto del portfolio sigue sin tests. No proponer tests en otras partes sin que el usuario lo pida.
- **Login real ya implementado** (commit `dd7cbca`, vía skill `/generar_login`): `src/auth-kit/` completo (AuthCard, ProfilePage, AdminPanel, RoleGate), rutas `/login` `/profile` `/admin` en `App.tsx`. Backend: Supabase `Caramesgarcianico` (`rucrcjcizdbsdrqmrcon`), schema `portfolio` (`profiles` con roles user/mid/admin, RLS y triggers correctos — ver `[[supabase]]`). `/admin` YA es la sección de gestión de roles de todos los usuarios (tabla + dropdown de rol + borrar, solo accesible a role admin) — no hace falta construirla, ya pedida y ya existe.
- **2026-08-09 — bug login en producción, causa y fix**: `nicolascaramesgarcia.vercel.app/login` fallaba con cualquier credencial porque Vercel **nunca tuvo configuradas** `VITE_SUPABASE_URL`/`VITE_SUPABASE_ANON_KEY` (no eran valores viejos de antes de la migración, simplemente no estaban puestas) — el build cae al fallback `placeholder.supabase.co` de `kit.config.ts:62-63`, que da `ERR_NAME_NOT_RESOLVED`. `.env.local` local siempre estuvo correcto (verificado con login real en `localhost:5173`, pega bien contra `rucrcjcizdbsdrqmrcon`). Fix: añadir esas 2 vars en Vercel dashboard → Settings → Environment Variables (Production) con los valores de `.env.local`, y redeploy. Si en el futuro cualquier feature con env vars falla solo en prod y no en local, sospechar primero de vars no configuradas en Vercel antes que de proyecto/config incorrectos.
- **DeviceShowcase abre proyectos dentro de la Tablet, no en pestaña nueva** (2026-07-20): `BASE_URL` apunta a `https://desktop-nav.vercel.app/portfolio` (no la raíz `/` — esa exige login real vía `ProtectedRoute`; `/portfolio` es el entry point público que activa `guestMode`). Cada `Project` de `src/data/projects.ts` puede llevar `desktopNavId` (coincide con el id en `Desktop_Nav/src/data/projects.ts`); al pulsar una tarjeta, `contentUrl` cambia a `${BASE_URL}?open=<id>`, lo que **recarga el iframe entero** (se pierde cualquier ventana abierta en el escritorio — trade-off aceptado por velocidad de implementación frente a un puente `postMessage`). El lado que lee ese parámetro vive en `Desktop_Nav/src/pages/PortfolioEntry.tsx`. Ya desplegado (commit `5c88b5a`, confirmado en `origin/main` 2026-07-26).
- Tamaño de la Tablet/iPhone limitado a 100vh sin perder aspect-ratio: como `device-frame` en `mode="inline"` solo fija el ancho (`min(px, 100%)`) y deriva el alto vía `aspect-ratio` CSS (ver `Iphone_Clone/src/device-frame.ts`), el tope se aplica al ANCHO del contenedor con `calc(100vh * W/H)` usando los ratios exactos de `Iphone_Clone/src/geometry.ts` (tablet `1195/960`, phone `2500/4722`) — no sirve poner `max-height` directamente.
- Scroll al pulsar un proyecto: `scrollToId(id, { align: 'bottom' })` (en `src/lib/scroll.ts`) alinea el borde inferior del propio frame (`id="tablet-frame"`, solo el `<DeviceFrame>`, sin la fila de botones) con el borde inferior del viewport — no el superior ni el offset de nav (72px), porque la Tablet puede llegar a 100vh y cualquier offset la recorta. Confirmado con el usuario tras 3 iteraciones (top con offset → top sin offset → bottom del bloque completo → bottom solo del frame). **Reconfirmado 2026-07-26**: es el único scroll programado que se mantiene a propósito en todo el sitio — no tocar salvo petición explícita.
- **`npm run dev` de Porfolio_Nico_V2 SIEMPRE embebe el Desktop_Nav de PRODUCCIÓN** (`BASE_URL` hardcodeado a `desktop-nav.vercel.app`, sin variante de entorno). Un cambio hecho en `C:\GitHub\Desktop_Nav` en local no se ve dentro de la Tablet — ni en local ni en prod — hasta hacer commit+push ahí (Vercel autodespliega). Para probar un cambio de Desktop_Nav antes de desplegar: servirlo con `npm run dev` (puerto 5173) y montar un HTML suelto que cargue `<device-frame content-url="http://localhost:5173/...">` con el `dist/device-frame.js` compilado en local — no editar `DeviceShowcase.tsx` para apuntar a localhost (ver sesión 2026-07-26).
- **Gotcha de scroll entre iframes** (2026-07-26): dentro del iframe embebido (Desktop_Nav), tanto `Element.scrollIntoView()` como el `focus()` por defecto (incl. el atributo `autoFocus`) **encadenan el scroll hasta la página que lo embebe** (Porfolio_Nico_V2), incluso entre orígenes distintos — no es un bug de Desktop_Nav aislado, es como funciona el navegador. Causó 2 bugs reales en `Desktop_Nav/src/apps/Terminal.tsx`: el auto-scroll del panel de chat (fix: `el.scrollTop = el.scrollHeight` en vez de `scrollIntoView`) y el salto de página al abrir la Tablet desde cero (fix: `focus({ preventScroll: true })` en vez de `autoFocus`). Regla general para cualquier código que viva dentro de la Tablet: nunca `scrollIntoView()` ni `autoFocus`/`.focus()` sin `preventScroll: true`.
- **Puente de scroll con rueda de ratón** (2026-07-26): la rueda del ratón tampoco se propaga de un iframe al host. Implementado un protocolo `postMessage` (`{ source: 'device-frame-content', type: 'wheel', deltaX, deltaY }`): el emisor vive en `Desktop_Nav/src/lib/scrollBridge.ts`, el receptor en `Iphone_Clone/src/device-frame.ts` (valida `event.source` contra el `contentWindow` del propio iframe, no el origen). Documentado en `Iphone_Clone/CLAUDE.md` ("Scroll bridge") — cualquier consumidor nuevo de `device-frame` que quiera este comportamiento debe implementar el mismo emisor en su contenido embebido.

## Decisiones pendientes

- Login real (auth, backend, formulario) — sesión aparte, todavía sin diseñar.
- Indexar el repo en codebase-memory (MCP) en cuanto exista el scaffold de Vite+React (inminente).

## Correcciones

(vacío — sin correcciones registradas todavía)
