# Migración a Vite+React — spec de diseño

Fecha: 2026-07-17

## Objetivo

Convertir el mockup `Diseño_claude_desing/Portfolio.dc.html` (HTML/CSS/JS exportado de la
herramienta de diseño) en una web de producción real: Vite + React + TypeScript, desplegada en
Vercel. Alcance de esta sesión: **solo el landing/portfolio** (`Portfolio.dc.html`). El login
(`Login.dc.html`) queda fuera — ver "Fuera de alcance".

## Stack

- **Vite + React + TypeScript.** TS por consistencia con `Iphone_Clone` (dependencia tipada) y
  porque el portfolio es también carta de presentación profesional.
- **Tailwind CSS**, con el theme configurado a partir de los tokens del mockup: colores
  (`#0a0a0a` fondo, `#f2efcf` acento, `#f4f3ee` texto, grises intermedios), tipografías
  (`Space Grotesk` para títulos/UI, `Manrope` para cuerpo, vía Google Fonts `preconnect` + `link`
  igual que el mockup), radios (`999px` píldoras, `22px`/`28px` tarjetas/paneles).
- **React Router** (`react-router-dom`): ruta `/` (portfolio) y `/login` (placeholder). Se instala
  ahora porque hará falta igualmente cuando se aborde el login real.
- Deploy en Vercel (decisión previa, `memory.md`).

## Componentes (`src/components/`)

Un componente por sección del mockup, ensamblados en `src/pages/HomePage.tsx`:

`Nav` · `Hero` · `DeviceShowcase` · `ProjectsCarousel` · `TechMarquee` · `About` · `ContactForm` · `Footer`.

- **Nav**: sticky, blur de fondo. Botones "Get Started"/"Sign in" navegan con React Router a
  `/login` (placeholder "Próximamente"). Enlaces "Contacto"/"Sobre mí" hacen scroll suave a
  `#contacto`/`#sobre-mi` vía un hook propio `useScrollTo(id)` que respeta
  `prefers-reduced-motion` (sin `behavior:'smooth'` si el usuario lo prefiere reducido).
- **Hero**: título + párrafo + CTAs, igual que el mockup (tipografía fluida por `clamp()`).
- **DeviceShowcase**: ver sección dedicada abajo.
- **ProjectsCarousel**: marquee horizontal infinito con las tarjetas de `src/data/projects.ts`.
- **TechMarquee**: marquee horizontal infinito con los iconos de `src/data/tech.ts`.
- **About**: foto + bio, igual que el mockup.
- **ContactForm**: ver sección dedicada abajo.
- **Footer**: estático.

## DeviceShowcase — integración con Iphone_Clone

`Portfolio_Nico_V2` toma una dependencia `file:` sobre el paquete `device-frame` del repo
`C:\GitHub\Iphone_Clone`:

```json
"dependencies": {
  "device-frame": "file:../Iphone_Clone"
}
```

Ese paquete se amplía con un nuevo modo `mode="inline"` (sin overlay fijo, sin toolbar) para
poder posicionarse dentro del flujo normal de una sección — ver el spec dedicado en el otro repo:
`Iphone_Clone/docs/superpowers/specs/2026-07-17-device-frame-inline-mode-design.md`. Ese spec es
la fuente de verdad para el comportamiento interno del componente; aquí solo se documenta cómo lo
consume el portfolio.

`DeviceShowcase.tsx`:

```tsx
import { DeviceFrame } from 'device-frame/react';

const isMobile = useMediaQuery('(max-width: 820px)'); // mismo breakpoint que el mockup

<DeviceFrame
  mode="inline"
  device={isMobile ? 'phone' : 'tablet'}
  contentUrl="https://desktop-nav.vercel.app/"
  background="transparent"
  controls="off"
  switcher="off"
  open
/>
```

`device-frame/react` requiere que el paquete esté compilado (`npm run build` en `Iphone_Clone`
genera `dist/react.js`/`dist/device-frame.js`) antes de `npm install` en el portfolio.

`size` (por defecto `m`) y `scale` quedan como valores de partida — se ajustan a ojo durante la
implementación para que las proporciones queden bien dentro del Hero; no son una medida exacta a
respetar del mockup anterior (ese usaba un MacBook con slider `mbWidth`, dispositivo distinto al
iPad actual, no comparable 1:1).

Comportamiento del iframe interno (lazy loading + fallback si el navegador bloquea el embed) vive
dentro de `device-frame` (ver spec de ese repo) — el portfolio no necesita lógica propia para eso.

## Datos

- `src/data/projects.ts`: array tipado, mismo contenido que `Portfolio.dc.html` (BabIA, SonAI,
  AI Nav Corp, Desktop Nav), imágenes propias importadas y optimizadas.
- `src/data/tech.ts`: array tipado de tecnologías. Los iconos siguen sirviéndose desde el CDN
  `jsdelivr/devicon` (no son assets propios, sin necesidad de optimizarlos localmente).

```ts
export interface Project {
  title: string;
  desc: string;
  img: string; // import de asset optimizado (srcset)
}
```

## Optimización de imágenes

Plugin `vite-imagetools`. Los assets propios (capturas de proyectos, foto de perfil) se importan
así:

```ts
import babiaImg from '../assets/babia.png?w=800&format=webp&as=srcset';
```

y se usan con `<img srcset={babiaImg} loading="lazy" decoding="async" ... />`. Sin servicio
externo, sin coste, coherente con "portfolio estático en Vercel".

## Animaciones

Los dos marquees (`ProjectsCarousel`, `TechMarquee`) conservan las animaciones CSS del mockup
(`marqL`/`marqR`, `translateX`), con dos añadidos:

```css
.marquee-track:hover { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; }
}
```

## ContactForm y `/api/contact`

Formulario funcional real:

1. `ContactForm.tsx` hace `fetch('/api/contact', { method: 'POST', body: JSON.stringify({ name, email, message }) })`.
2. `api/contact.ts` (Vercel Serverless Function): valida los campos (no vacíos, email con formato
   válido), y si son correctos llama a la API de Resend con `RESEND_API_KEY` (variable de entorno
   de Vercel, **no** committeada) para enviar el email a la dirección del usuario.
3. Respuesta `200` → el form muestra el mensaje "¡Gracias!" (igual que el mockup); `4xx/5xx` → error
   visible junto al form.

### Testing (excepción puntual a "sin tests")

`CLAUDE.md` fija "sin tests por ahora" pero pide replantear en cuanto haya backend/lógica real —
`api/contact.ts` es exactamente eso. Se añade **un único fichero de test** en todo el repo:

`test/api/contact.test.ts` (Vitest): valida que rechaza email con formato inválido, rechaza
campos vacíos, y que con datos válidos llama a Resend con el payload esperado (cliente de Resend
mockeado, sin llamada de red real). El resto del portfolio (componentes, UI) sigue sin tests.

## Desarrollo local

`npm run dev` (Vite) sirve el front pero **no** ejecuta `api/contact.ts` — es una Vercel
Serverless Function. Para probar el formulario de contacto de extremo a extremo en local hace
falta `vercel dev` (Vercel CLI), que levanta Vite y las funciones `/api` juntos. "Hecho" para
`ContactForm`/`/api/contact` significa haberlo probado así, no solo con `npm run dev`.

## Fuera de alcance (esta sesión)

- **Login real**: `Login.dc.html` no se migra. `/login` es una página placeholder
  ("Próximamente"), sin formulario ni backend de auth.
- **CMS para proyectos**: los proyectos viven en `src/data/projects.ts` (array TS), no en un CMS
  externo — revisar si el volumen de proyectos crece mucho en el futuro.
- **Rate limiting / anti-spam en `/api/contact`**: no se implementa en esta pasada; a revisar en
  la auditoría `seguridad-seo` antes de producción.

## Antes de producción

- Skill `seguridad-seo` (obligatoria por `CLAUDE.md` antes de cualquier deploy) — más relevante
  ahora al existir un endpoint real con API key y un formulario que acepta input de usuarios.
- `vercel.json` con rewrite SPA: las rutas de React Router (`/login`) deben servir `index.html` en
  un refresh directo, o devuelven 404 en Vercel por defecto.
- Confirmar que `RESEND_API_KEY` está configurada como env var en el proyecto de Vercel (no en el
  repo).
