# memory.md — Portfolio_Nico_V2

Memoria viva del proyecto y del usuario. Leer entera al inicio de cada sesión.
Detalle y porqués largos: `docs/memoria/2026-11-19-memoria-detalle.md` (y `2026-11-18-feedback-rediseno-v2.md`).

**Disciplina de este fichero**
- Cada entrada debe cambiar cómo actuará Claude mañana; si no, no entra.
- Un hecho, una vez: se actualiza, no se duplica. Límite duro 15KB en bytes; al pasarse, mover detalle a `docs/memoria/`.

## Sobre el usuario

- Código en inglés, commits Conventional Commits.
- Sin tests salvo `api/contact.ts` (Vitest, Resend mockeado; única excepción). No proponer más tests sin que lo pida.
- Rechazó la visualización 3D del grafo de codebase-memory (2026-07-17): no volver a proponerla.
- **Rol del usuario: "QA Engineer · Automatización · Arquitectura"** (no "Developer"). No publicar su número de teléfono.
- Sin skills ni plugins en este repo (2026-11-18; desactivados en `.claude/settings.json`). No preguntar por claude-brain. Playwright sí, para verificar en navegador.
- En esta máquina (servidor Linux) los repos están en `~/github/proyectos/`, no en `C:\GitHub\`.

## Conceptos clave del proyecto

- Mockups `Diseño_claude_desing/*.dc.html` = referencia visual, no código final. Stack: Vite + React + TS + Tailwind + React Router, en Vercel. Portfolio = marca personal. Spec: `docs/superpowers/specs/2026-07-17-portfolio-migration-design.md`.
- **DeviceShowcase usa `Iphone_Clone` como dependencia git pineada** (`github:Nicolascarames/Iphone_Clone#<sha>`), nunca `file:` ni copia (rompió Vercel). Antes de tocarla leer `Iphone_Clone/CLAUDE.md` "Distribution".
- Tablet/iPhone con tope 100vh: limitar el ANCHO con `calc(100vh * W/H)`; `max-height` no sirve.
- Scroll al pulsar proyecto: `scrollToId(id, { align: 'bottom' })` sobre `#tablet-frame`. Único scroll programado del sitio; no tocar sin petición explícita.
- Proyectos se abren dentro de la Tablet vía `Project.desktopNavId` → `${BASE_URL}?open=<id>` (recarga el iframe, aceptado). Los de `externalUrl` abren pestaña nueva.
- `npm run dev` embebe SIEMPRE el Desktop_Nav de producción; no apuntar `DeviceShowcase.tsx` a localhost (cómo probar en local: detalle).
- Dentro de la Tablet: nunca `scrollIntoView()` ni `autoFocus`/`.focus()` sin `preventScroll: true` (encadenan scroll al host). Puente de rueda por `postMessage` documentado en `Iphone_Clone/CLAUDE.md`; Esc desde el iframe ya cierra la pantalla completa.
- ContactForm envía de verdad (Resend vía `api/contact.ts`).
- Supabase `Caramesgarcianico` (`rucrcjcizdbsdrqmrcon`), schema `portfolio`. Login real en `src/auth-kit/`; `/admin` gestiona roles de TODOS los `auth.users` (solo rol de Portfolio, independiente de Desktop_Nav). Botón "Privado" fuera del `Nav.tsx` a propósito; `/login` `/profile` `/admin` solo por URL. caramesgarcianico@gmail.com es admin.
- Si algo falla solo en prod: sospechar primero de env vars sin configurar en Vercel (`VITE_SUPABASE_*` ya faltaron una vez).
- Panel privado `/admin/panel`: datos en tabla Supabase con RLS solo-admin (el repo es PÚBLICO, nada de datos en código); sin IPs ni claves; una sección visible a la vez.
- Carrusel: GiveMe, Gastos, Agente QA(+MCP), QA Pruebas con `externalUrl`. Pendiente: rediseño de fichas cuando el usuario pase imagen de referencia.
- **Rediseño reality404 v2 (2026-11-18)**: variantes por `src/config/sections.ts`; selector visible solo en contacto (terminal|glass, def. terminal) y tech (3); proyectos y about solo config (about fijo en badge). Acento `frost-100` (#dfe1ec) en todo el sitio, **el login (auth-kit, morado) se queda como está**. Tokens/clases: `@theme static` en `src/styles/index.css`, radios `rounded-r4-*`, clases `r4-*` en `r4.css`; el token `surface` NO se mapeó.
- Variantes v2: la tarjeta vuela a `fullscreenBox()`, no a `#tablet-frame`; la rueda del Coverflow secuestra el scroll (lo quiere así). La tablet real `device-frame` NO se borra: elegible con `device` en `sections.ts`. Animación elegida: marco CSS del mock + entrada (b). Coverflow cae a Deck en ≤820 px (revisado).
- Matter.js en táctil: no reenviar eventos de ventana a `Matter.Mouse` salvo con arrastre en curso (`releaseAnywhere`, `src/components/tech/matter.ts`).
- Windows: lanzar `npm test` y `npm run dev` desde `C:\GitHub\...` (C mayúscula), no `c:`.
- Seguridad: `api/contact.ts` endurecida; `vercel.json` con `frame-ancestors 'none'` (quitarla si algún sitio debe incrustar este). Sin anti-spam ni CSP completa; `npm audit` 24, solo tooling.

## Decisiones vigentes

- **Feedback v2**: probar todo en 360/390/768/1024/1440/1920. Carrusel dentro del contenedor de 1200 px (Coverflow tope 600, Deck 720); el usuario no quiere tarjetas a pantalla completa. Hecho y commiteado salvo lo de abajo.
- **Desktop_Nav con estilos reality404 (2026-11-19)**: rama `feat/reality404-styles` en Desktop_Nav, 4 fases juntas; tokens y `r4-*` copiados (no paquete compartido), siempre negro, fondos de pantalla no se tocan. Consola con aspecto `AboutTerminal` + sus comandos e IA; Proyectos = `ProjectBento`; Contacto = `ContactGlass` (solo email al `/api/contact` del portfolio, CORS). Misma función Supabase `chat-llm-bridge-desktop-nav` (orígenes en `CHAT_ALLOWED_ORIGINS`). Fuente de verdad de datos: `public/CV_Nicolas_Carames_QA.pdf`. Portfolio en `reality404.app`; Desktop_Nav en `desktop.reality404.app` (2026-11-19; CORS de chat/contacto y `frame-ancestors` ya lo incluyen).
- **IA solo en la terminal de "Sobre mí"** (`aboutTerminal: true` en `sections.ts`, bajo el badge); la terminal de Contacto no lleva IA.
- **Terminales y chat IA (decidido 2026-11-19)**: la terminal de "Sobre mí" tiene pestañas Terminal (por defecto) | Chat (IA que conversa y recoge contacto → `/api/contact`). Ninguna terminal ni el chat del portfolio llevan presentación: solo el prompt. En Desktop_Nav el invitado abre el **chat IA** (no la terminal) y es el chat quien da la bienvenida (`GUEST_INTRO_SENTENCES`). El prompt `~$` va en otro color y se oculta mientras responde la IA. Login de Desktop_Nav: **solo mismo aspecto** que el del portfolio; perfiles siguen en `public.profiles` (portfolio usa `portfolio.profiles`; mismas cuentas `auth.users`).
- **IA = Claude en Supabase (decidido 2026-11-19)**: la Edge Function `chat-llm-bridge-desktop-nav` usa Anthropic (`claude-haiku-5-5`, secreto Supabase `ANTHROPIC_API_KEY`), Groq eliminado. **No se hace `/api/chat` en Vercel**: la pestaña de config de `/admin` guarda en `portfolio.site_config` y la función la lee (modelo, personalidad, on/off, límite). Desplegar funciones requiere `--yes` (el CLI pide consentimiento).
- **`/admin/sections` hecho (2026-11-19)**: variantes en `portfolio.site_config` (fila `id=1`, lectura anon, escritura `is_admin()`; SQL en `supabase/unified/site_config.sql`); `sections.ts` = defaults/opciones; la web usa `useSections()` con caché localStorage `r4.sections.v1`; al guardar se aplica con `useApplySections()`. Área privada en estilo r4 con `private/R4Input`/`R4Button`; el login morado sigue intacto.
- **Siguiente: config de IA en el admin (sesión nueva)**: modelo, personalidad, on/off y límite diario por visitante. El prompt de sistema NO va en `site_config` (lectura pública), sino en una tabla privada (admin + función). La función `chat-llm-bridge-desktop-nav` (repo Desktop_Nav) la lee y aplica el límite; hoy solo hay freno por minuto en memoria.
