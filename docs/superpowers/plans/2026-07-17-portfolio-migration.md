# Portfolio Vite+React Migration Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Rebuild `Diseño_claude_desing/Portfolio.dc.html` as a real Vite + React + TypeScript app, deployed to Vercel: 8 components (Nav, Hero, DeviceShowcase, ProjectsCarousel, TechMarquee, About, ContactForm, Footer), a real device mockup (iPad/iPhone) showing `desktop-nav.vercel.app` embedded via the `device-frame` package, dynamic project data, optimized images, and a real contact form backed by a Vercel Serverless Function + Resend.

**Architecture:** Single-page app (`/`) plus a `/login` placeholder route (React Router) — no CMS, no auth backend. Styling via Tailwind CSS v4 (CSS-first `@theme`, no `tailwind.config.js`). One component per file, assembled top-to-bottom in `src/pages/HomePage.tsx` in the same order as the mockup. Images optimized at build time via `vite-imagetools`. The only backend code is `api/contact.ts` (Vercel Node Serverless Function) — the only part of the repo that gets an automated test.

**Tech Stack:** Vite 6, React 18, TypeScript 5, React Router 6, Tailwind CSS v4 (`@tailwindcss/vite`), `vite-imagetools`, `resend`, Vitest (node environment, `api/` only), `device-frame` (file: dependency on `C:\GitHub\Iphone_Clone`).

## Global Constraints

- **Prerequisite:** `C:\GitHub\Iphone_Clone`'s own plan (`Iphone_Clone/docs/superpowers/plans/2026-07-17-device-frame-inline-mode.md`) must be executed and built (`npm run build` there produces `dist/`) before Task 7 (DeviceShowcase) can `npm install` successfully.
- No automated tests for React components/UI — only `api/contact.ts` gets a test (`memory.md`, `CLAUDE.md` exception).
- "Done" for any UI-touching task = confirmed by actually running `npm run dev` and looking at it in a browser, not just a successful build (`CLAUDE.md`).
- `/login` is a placeholder only — no real auth in this plan (`docs/superpowers/specs/2026-07-17-portfolio-migration-design.md`, "Fuera de alcance").
- UI copy stays in Spanish (matches the mockup and the target audience).
- Real screenshot/photo assets come from `Diseño_claude_desing/uploads/` (copy, don't regenerate) — do not invent placeholder images.

---

### Task 1: Vite + TypeScript scaffold

**Files:**
- Create: `package.json`, `tsconfig.json`, `vite.config.ts`, `index.html`, `.gitignore`
- Create: `src/main.tsx`, `src/App.tsx`, `src/vite-env.d.ts`

**Interfaces:**
- Produces: a running `npm run dev` Vite dev server rendering `<App />`. Later tasks replace `App.tsx`'s body (Task 3).

- [ ] **Step 1: Create `package.json`**

```json
{
  "name": "portfolio-nico",
  "private": true,
  "version": "0.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "test": "vitest run"
  },
  "dependencies": {
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
  "devDependencies": {
    "@types/react": "^18.3.12",
    "@types/react-dom": "^18.3.1",
    "@vitejs/plugin-react": "^4.3.4",
    "typescript": "^5.7.2",
    "vite": "^6.0.5"
  }
}
```

- [ ] **Step 2: Create `tsconfig.json`**

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "useDefineForClassFields": true,
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "verbatimModuleSyntax": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "skipLibCheck": true
  },
  "include": ["src", "api", "test", "vite.config.ts", "vitest.config.ts"]
}
```

- [ ] **Step 3: Create `vite.config.ts`**

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
});
```

- [ ] **Step 4: Create `index.html`**

```html
<!doctype html>
<html lang="es">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Nico — Developer, design and workflows with AI</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

- [ ] **Step 5: Create `.gitignore`**

```
node_modules
dist
.env
.env.local
```

- [ ] **Step 6: Create `src/vite-env.d.ts`**

```ts
/// <reference types="vite/client" />
```

- [ ] **Step 7: Create `src/App.tsx`**

```tsx
export function App() {
  return <div>Portfolio scaffold OK</div>;
}
```

- [ ] **Step 8: Create `src/main.tsx`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
```

- [ ] **Step 9: Install and verify**

Run: `npm install`
Expected: installs without errors.

Run: `npm run dev`, open the printed local URL in a browser.
Expected: page shows "Portfolio scaffold OK".

- [ ] **Step 10: Commit**

```bash
git add package.json tsconfig.json vite.config.ts index.html .gitignore src
git commit -m "chore: scaffold Vite + React + TypeScript project"
```

---

### Task 2: Tailwind CSS v4 + Google Fonts + design tokens

**Files:**
- Modify: `vite.config.ts`, `index.html`, `package.json`, `src/main.tsx`
- Create: `src/styles/index.css`

**Interfaces:**
- Produces: Tailwind utility classes generated from theme CSS variables `--color-bg`, `--color-accent`, `--color-text`, `--font-display`, `--font-body` (used as `bg-bg`, `text-accent`, `font-display`, etc. by every component task from here on).

- [ ] **Step 1: Install Tailwind v4**

Run: `npm install -D tailwindcss @tailwindcss/vite`

- [ ] **Step 2: Add the Tailwind Vite plugin**

Replace `vite.config.ts` with:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
});
```

- [ ] **Step 3: Create `src/styles/index.css`**

```css
@import "tailwindcss";

@theme {
  --color-bg: #0a0a0a;
  --color-accent: #f2efcf;
  --color-text: #f4f3ee;
  --font-display: "Space Grotesk", sans-serif;
  --font-body: "Manrope", sans-serif;
}

html {
  scroll-behavior: smooth;
}
@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
}

body {
  margin: 0;
  background: var(--color-bg);
  color: var(--color-text);
  font-family: var(--font-body);
}

a { color: var(--color-accent); text-decoration: none; }
a:hover { color: #ffffff; }
input::placeholder, textarea::placeholder { color: #6b6b66; }
```

- [ ] **Step 4: Import the stylesheet in `src/main.tsx`**

Replace the import block at the top of `src/main.tsx`:

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { App } from './App';
import './styles/index.css';
```

- [ ] **Step 5: Add Google Fonts to `index.html`**

Replace the `<head>` of `index.html`:

```html
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link
      href="https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@400;500;600;700&family=Manrope:wght@400;500;600;700&display=swap"
      rel="stylesheet"
    />
    <title>Nico — Developer, design and workflows with AI</title>
  </head>
```

- [ ] **Step 6: Verify in the browser**

Run: `npm run dev`, open the local URL.
Expected: background is near-black (`#0a0a0a`), text is off-white — confirms the Tailwind theme and fonts are loading (check the Network tab for the Google Fonts CSS request, or just that text renders in Manrope, not the browser default serif/sans).

- [ ] **Step 7: Commit**

```bash
git add vite.config.ts index.html package.json package-lock.json src/main.tsx src/styles/index.css
git commit -m "feat: add Tailwind CSS v4 with design tokens from the mockup"
```

---

### Task 3: React Router + HomePage shell + Login placeholder

**Files:**
- Modify: `src/App.tsx`, `src/main.tsx`, `package.json`
- Create: `src/pages/HomePage.tsx`, `src/pages/LoginPlaceholder.tsx`

**Interfaces:**
- Produces: `HomePage` (default page at `/`) with an inner `<div className="relative z-10">` container — every component task from Task 5 onward adds its component as a child of that container, in mockup order. `LoginPlaceholder` (page at `/login`).

- [ ] **Step 1: Install React Router**

Run: `npm install react-router-dom`

(already listed in Task 1's `package.json` — this step makes sure `node_modules` actually has it; if `npm install` in Task 1 already succeeded, this is a no-op confirmation: run `npm ls react-router-dom` and expect a version to print.)

- [ ] **Step 2: Create `src/pages/LoginPlaceholder.tsx`**

```tsx
export function LoginPlaceholder() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-3 bg-bg px-5 text-center text-text">
      <span className="font-display text-2xl font-bold">Nico</span>
      <p className="text-neutral-400">Próximamente</p>
    </div>
  );
}
```

- [ ] **Step 3: Create `src/pages/HomePage.tsx`**

```tsx
export function HomePage() {
  return (
    <div className="relative overflow-x-hidden font-body text-text">
      <div className="relative z-10">
        {/* Nav/Hero/DeviceShowcase/... se añaden en tareas siguientes */}
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Replace `src/App.tsx`**

```tsx
import { Routes, Route } from 'react-router-dom';
import { HomePage } from './pages/HomePage';
import { LoginPlaceholder } from './pages/LoginPlaceholder';

export function App() {
  return (
    <Routes>
      <Route path="/" element={<HomePage />} />
      <Route path="/login" element={<LoginPlaceholder />} />
    </Routes>
  );
}
```

- [ ] **Step 5: Wrap `src/main.tsx` in `BrowserRouter`**

```tsx
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { App } from './App';
import './styles/index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </StrictMode>,
);
```

- [ ] **Step 6: Verify in the browser**

Run: `npm run dev`. Visit `/` — expect a blank near-black page (no runtime errors in the console). Visit `/login` — expect "Nico" + "Próximamente" centered.

- [ ] **Step 7: Commit**

```bash
git add src/App.tsx src/main.tsx src/pages package.json package-lock.json
git commit -m "feat: add React Router with HomePage shell and login placeholder"
```

---

### Task 4: Data, real assets, image optimization, shared hooks

**Files:**
- Create: `src/data/projects.ts`, `src/data/tech.ts`, `src/hooks/useMediaQuery.ts`, `src/lib/scroll.ts`
- Create (binary copies): `src/assets/projects/babia.png`, `src/assets/projects/sonai.png`, `src/assets/projects/ai-nav-corp.png`, `src/assets/projects/desktop-nav.png`, `src/assets/profile/nico.png`, `src/assets/hero-bg.png`
- Modify: `vite.config.ts`, `src/vite-env.d.ts`, `src/pages/HomePage.tsx`, `package.json`

**Interfaces:**
- Produces: `projects: Project[]` (`{ title, desc, img }`) and `tech: Tech[]` (`{ name, src }`) from `src/data/` — consumed by Task 8 (ProjectsCarousel) and Task 9 (TechMarquee). `useMediaQuery(query: string): boolean` — consumed by Task 7 (DeviceShowcase). `scrollToId(id: string): void` — consumed by Task 5 (Nav) and Task 6 (Hero).

- [ ] **Step 1: Install `vite-imagetools`**

Run: `npm install -D vite-imagetools`

- [ ] **Step 2: Copy the real assets from the mockup**

Run (from the repo root):

```bash
mkdir -p src/assets/projects src/assets/profile
cp "Diseño_claude_desing/uploads/Captura de pantalla 2026-07-14 101124.png" src/assets/projects/babia.png
cp "Diseño_claude_desing/uploads/Captura de pantalla 2026-07-14 101150.png" src/assets/projects/sonai.png
cp "Diseño_claude_desing/uploads/Captura de pantalla 2026-07-16 104114.png" src/assets/projects/ai-nav-corp.png
cp "Diseño_claude_desing/uploads/pasted-1784191634288-0.png" src/assets/projects/desktop-nav.png
cp "Diseño_claude_desing/uploads/referenciadoPromt/yo_crop.png" src/assets/profile/nico.png
cp "Diseño_claude_desing/uploads/pasted-1784192346008-0.png" src/assets/hero-bg.png
```

Expected: 6 new files under `src/assets/`.

- [ ] **Step 3: Register the `imagetools` plugin**

Replace `vite.config.ts`:

```ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { imagetools } from 'vite-imagetools';

export default defineConfig({
  plugins: [react(), tailwindcss(), imagetools()],
});
```

- [ ] **Step 4: Add imagetools' TypeScript types**

Replace `src/vite-env.d.ts`:

```ts
/// <reference types="vite/client" />
/// <reference types="vite-imagetools/client" />
```

- [ ] **Step 5: Create `src/data/projects.ts`**

```ts
import babiaImg from '../assets/projects/babia.png?w=800&format=webp';
import sonaiImg from '../assets/projects/sonai.png?w=800&format=webp';
import aiNavCorpImg from '../assets/projects/ai-nav-corp.png?w=800&format=webp';
import desktopNavImg from '../assets/projects/desktop-nav.png?w=800&format=webp';

export interface Project {
  title: string;
  desc: string;
  img: string;
}

export const projects: Project[] = [
  {
    title: 'BabIA',
    desc: 'App para el sueño de tu bebé: registro, evolución e integración con Telegram.',
    img: babiaImg,
  },
  {
    title: 'SonAI',
    desc: 'Landing page para vender automatizaciones por voz con IA.',
    img: sonaiImg,
  },
  {
    title: 'AI Nav Corp',
    desc: 'Juego en pixel art y portfolio jugable: cada personaje integra una IA y una misión.',
    img: aiNavCorpImg,
  },
  {
    title: 'Desktop Nav',
    desc: 'Simula un escritorio en la web, con IA y flujos de trabajo integrados.',
    img: desktopNavImg,
  },
];
```

- [ ] **Step 6: Create `src/data/tech.ts`**

```ts
export interface Tech {
  name: string;
  src: string;
}

export const tech: Tech[] = [
  { name: 'JavaScript', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg' },
  { name: 'TypeScript', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg' },
  { name: 'React', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg' },
  { name: 'Next.js', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nextjs/nextjs-original.svg' },
  { name: 'Node.js', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg' },
  { name: 'Python', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg' },
  { name: 'HTML5', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg' },
  { name: 'CSS3', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg' },
  { name: 'Tailwind', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/tailwindcss/tailwindcss-original.svg' },
  { name: 'Git', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/git/git-original.svg' },
  { name: 'Docker', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/docker/docker-original.svg' },
  { name: 'PostgreSQL', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg' },
  { name: 'Jest', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/jest/jest-plain.svg' },
  { name: 'Selenium', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/selenium/selenium-original.svg' },
  { name: 'Figma', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/figma/figma-original.svg' },
  { name: 'GitHub', src: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/github/github-original.svg' },
];
```

- [ ] **Step 7: Create `src/hooks/useMediaQuery.ts`**

```ts
import { useEffect, useState } from 'react';

export function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => window.matchMedia(query).matches);

  useEffect(() => {
    const mql = window.matchMedia(query);
    const onChange = () => setMatches(mql.matches);
    onChange();
    mql.addEventListener('change', onChange);
    return () => mql.removeEventListener('change', onChange);
  }, [query]);

  return matches;
}
```

- [ ] **Step 8: Create `src/lib/scroll.ts`**

```ts
export function scrollToId(id: string) {
  const el = document.getElementById(id);
  if (!el) return;
  const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const top = el.getBoundingClientRect().top + window.scrollY - 72;
  window.scrollTo({ top, behavior: prefersReducedMotion ? 'auto' : 'smooth' });
}
```

- [ ] **Step 9: Add the fixed background to `HomePage.tsx`**

Replace `src/pages/HomePage.tsx`:

```tsx
import bgImg from '../assets/hero-bg.png?w=1600&format=webp';

export function HomePage() {
  return (
    <div className="relative overflow-x-hidden font-body text-text">
      <div
        className="pointer-events-none fixed inset-0 z-0 bg-cover bg-center opacity-30"
        style={{ backgroundImage: `url(${bgImg})` }}
      />
      <div className="pointer-events-none fixed inset-0 z-0 bg-[radial-gradient(ellipse_at_center,rgba(10,10,10,0.2)_0%,rgba(10,10,10,0.75)_100%)]" />
      <div className="relative z-10">
        {/* Nav/Hero/DeviceShowcase/... se añaden en tareas siguientes */}
      </div>
    </div>
  );
}
```

- [ ] **Step 10: Verify in the browser**

Run: `npm run dev`, visit `/`.
Expected: no console errors (confirms all `?w=...&format=webp` image imports resolve); page shows the dark radial-gradient background photo faintly, same as the mockup's hero backdrop.

- [ ] **Step 11: Commit**

```bash
git add src/data src/hooks src/lib src/assets src/pages/HomePage.tsx vite.config.ts src/vite-env.d.ts package.json package-lock.json
git commit -m "feat: add project/tech data, real optimized assets, and shared hooks"
```

---

### Task 5: Nav component

**Files:**
- Create: `src/components/Nav.tsx`
- Modify: `src/pages/HomePage.tsx`

**Interfaces:**
- Consumes: `scrollToId` (Task 4).
- Produces: `<Nav />` — no props.

- [ ] **Step 1: Create `src/components/Nav.tsx`**

```tsx
import { Link } from 'react-router-dom';
import { scrollToId } from '../lib/scroll';

export function Nav() {
  return (
    <nav className="sticky top-0 z-50 flex flex-wrap items-center justify-between gap-4 bg-bg/72 px-5 py-[18px] backdrop-blur-md sm:px-[60px]">
      <a href="#top" className="font-display text-2xl font-bold tracking-tighter text-text">
        Nico
      </a>
      <div className="flex flex-wrap items-center gap-4 sm:gap-7">
        <Link
          to="/login"
          className="order-first rounded-full bg-accent px-[18px] py-[9px] font-display text-sm font-semibold text-bg transition hover:bg-white hover:-translate-y-px"
        >
          Get Started
        </Link>
        <Link to="/login" className="text-sm font-semibold text-neutral-300 hover:text-white">
          Sign in
        </Link>
        <button
          type="button"
          onClick={() => scrollToId('contacto')}
          className="text-sm font-semibold text-neutral-300 hover:text-white"
        >
          Contacto
        </button>
        <button
          type="button"
          onClick={() => scrollToId('sobre-mi')}
          className="text-sm font-semibold text-neutral-300 hover:text-white"
        >
          Sobre mí
        </button>
      </div>
    </nav>
  );
}
```

- [ ] **Step 2: Mount it in `HomePage.tsx`**

In `src/pages/HomePage.tsx`, replace:

```tsx
      <div className="relative z-10">
        {/* Nav/Hero/DeviceShowcase/... se añaden en tareas siguientes */}
      </div>
```

with:

```tsx
      <div className="relative z-10">
        <Nav />
        {/* Hero/DeviceShowcase/... se añaden en tareas siguientes */}
      </div>
```

and add the import at the top of the file:

```tsx
import { Nav } from '../components/Nav';
```

- [ ] **Step 3: Verify in the browser**

Run: `npm run dev`, visit `/`.
Expected: sticky nav bar at the top with "Nico", "Get Started" (pill button), "Sign in", "Contacto", "Sobre mí". Clicking "Get Started"/"Sign in" navigates to `/login`. Clicking "Contacto"/"Sobre mí" does nothing yet (no target sections exist until Tasks 10–11) — that's expected at this point.

- [ ] **Step 4: Commit**

```bash
git add src/components/Nav.tsx src/pages/HomePage.tsx
git commit -m "feat: add Nav component"
```

---

### Task 6: Hero component

**Files:**
- Create: `src/components/Hero.tsx`
- Modify: `src/pages/HomePage.tsx`

**Interfaces:**
- Consumes: `scrollToId` (Task 4).
- Produces: `<Hero />` — no props.

- [ ] **Step 1: Create `src/components/Hero.tsx`**

```tsx
import { Link } from 'react-router-dom';
import { scrollToId } from '../lib/scroll';

export function Hero() {
  return (
    <section id="top" className="flex flex-col px-5 pt-10 sm:px-[60px] sm:pt-20">
      <div className="max-w-[1000px]">
        <h1 className="text-balance font-display text-[clamp(42px,7.5vw,96px)] font-bold leading-[0.98] tracking-tighter">
          Developer, design
          <br />
          and workflows
          <br />
          with AI
        </h1>
      </div>
      <div className="mt-7 flex flex-wrap items-end justify-between gap-7 sm:mt-13">
        <p className="max-w-[560px] text-pretty text-base leading-relaxed text-neutral-400 sm:text-lg">
          Construyo productos digitales de principio a fin: interfaces limpias, código
          mantenible y experiencias potenciadas por inteligencia artificial. Combino desarrollo,
          QA y automatización de flujos de trabajo para lanzar más rápido y con mayor calidad.
        </p>
        <div className="flex gap-3">
          <Link
            to="/login"
            className="rounded-full bg-accent px-[22px] py-[13px] font-display text-[15px] font-semibold text-bg transition hover:bg-white hover:-translate-y-px"
          >
            Get Started →
          </Link>
          <button
            type="button"
            onClick={() => scrollToId('contacto')}
            className="rounded-full border border-neutral-800 px-[22px] py-[13px] font-display text-[15px] font-semibold transition hover:border-accent"
          >
            Contacto
          </button>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Mount it in `HomePage.tsx`**

Replace:

```tsx
        <Nav />
        {/* Hero/DeviceShowcase/... se añaden en tareas siguientes */}
```

with:

```tsx
        <Nav />
        <Hero />
        {/* DeviceShowcase/ProjectsCarousel/... se añaden en tareas siguientes */}
```

and add the import:

```tsx
import { Hero } from '../components/Hero';
```

- [ ] **Step 3: Verify in the browser**

Run: `npm run dev`, visit `/`.
Expected: big "Developer, design and workflows with AI" heading below the nav, paragraph + two buttons underneath, matching the mockup's hero copy.

- [ ] **Step 4: Commit**

```bash
git add src/components/Hero.tsx src/pages/HomePage.tsx
git commit -m "feat: add Hero component"
```

---

### Task 7: DeviceShowcase component (Iphone_Clone integration)

**Files:**
- Create: `src/components/DeviceShowcase.tsx`
- Modify: `package.json`, `src/pages/HomePage.tsx`

**Interfaces:**
- Consumes: `useMediaQuery` (Task 4); `DeviceFrame` from `device-frame/react` — requires the `mode` prop added in `Iphone_Clone`'s plan (Task 2 of that plan) and the `mode="inline"` behavior (Task 1 of that plan) to already be built (`npm run build` in `Iphone_Clone`).
- Produces: `<DeviceShowcase />` — no props.

- [ ] **Step 0: Prerequisite check**

Confirm `Iphone_Clone`'s inline-mode plan has been executed: run (from `C:\GitHub\Iphone_Clone`) `npm test` (expect PASS) and `npm run build` (expect `dist/device-frame.js` and `dist/react.js` to exist). If that plan hasn't been run yet, stop and run it first — this task's `npm install` will otherwise fail to resolve `device-frame/react`'s `mode` prop correctly (it'll still install, but `mode="inline"` will silently no-op against the old build).

- [ ] **Step 1: Add the `file:` dependency**

In `package.json`, add to `"dependencies"` (alphabetical, so it goes first):

```json
  "dependencies": {
    "device-frame": "file:../Iphone_Clone",
    "react": "^18.3.1",
    "react-dom": "^18.3.1",
    "react-router-dom": "^6.28.0"
  },
```

Run: `npm install`
Expected: installs without errors; `node_modules/device-frame` is a symlink/junction to `../Iphone_Clone`.

- [ ] **Step 2: Create `src/components/DeviceShowcase.tsx`**

```tsx
import { DeviceFrame } from 'device-frame/react';
import { useMediaQuery } from '../hooks/useMediaQuery';

const CONTENT_URL = 'https://desktop-nav.vercel.app/';

export function DeviceShowcase() {
  const isMobile = useMediaQuery('(max-width: 820px)');

  return (
    <section className="flex justify-center py-12 sm:py-20">
      <div className="w-full max-w-[640px] px-5">
        <DeviceFrame
          mode="inline"
          device={isMobile ? 'phone' : 'tablet'}
          contentUrl={CONTENT_URL}
          background="transparent"
          controls={false}
          switcher={false}
          open
        />
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Mount it in `HomePage.tsx`**

Replace:

```tsx
        <Nav />
        <Hero />
        {/* DeviceShowcase/ProjectsCarousel/... se añaden en tareas siguientes */}
```

with:

```tsx
        <Nav />
        <Hero />
        <DeviceShowcase />
        {/* ProjectsCarousel/TechMarquee/... se añaden en tareas siguientes */}
```

and add the import:

```tsx
import { DeviceShowcase } from '../components/DeviceShowcase';
```

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev`, visit `/`.
Expected: below the Hero, an iPad frame (desktop viewport) sitting inside the normal page flow — no fullscreen dark backdrop, no toolbar/gear/switcher buttons — with `desktop-nav.vercel.app` loading inside it. Resize the browser window to under 820px width: the frame swaps to the iPhone bezel. If the embed doesn't load within ~6s, an "Abrir en pestaña nueva ↗" overlay should appear over the screen area (this exercises `Iphone_Clone`'s fallback from its own Task 3).

- [ ] **Step 5: Commit**

```bash
git add package.json package-lock.json src/components/DeviceShowcase.tsx src/pages/HomePage.tsx
git commit -m "feat: add DeviceShowcase using device-frame inline mode"
```

---

### Task 8: ProjectsCarousel component + marquee animation rules

**Files:**
- Create: `src/components/ProjectsCarousel.tsx`
- Modify: `src/styles/index.css`, `src/pages/HomePage.tsx`

**Interfaces:**
- Consumes: `projects: Project[]` (Task 4).
- Produces: `<ProjectsCarousel />` — no props. CSS class `.marquee-track` (also reused by Task 9's TechMarquee) with hover-pause + `prefers-reduced-motion` handling.

- [ ] **Step 1: Add marquee keyframes + accessibility rules to `src/styles/index.css`**

Append to `src/styles/index.css`:

```css
@keyframes marqL { from { transform: translateX(0); } to { transform: translateX(-50%); } }
@keyframes marqR { from { transform: translateX(-50%); } to { transform: translateX(0); } }

.marquee-track:hover { animation-play-state: paused; }

@media (prefers-reduced-motion: reduce) {
  .marquee-track { animation: none; }
}
```

- [ ] **Step 2: Create `src/components/ProjectsCarousel.tsx`**

```tsx
import type { Project } from '../data/projects';
import { projects } from '../data/projects';

function ProjectCard({ title, desc, img }: Project) {
  return (
    <div className="relative aspect-[3/2] w-[clamp(300px,34vw,440px)] shrink-0 overflow-hidden rounded-[22px] border border-neutral-800">
      <img
        src={img}
        alt={title}
        loading="lazy"
        decoding="async"
        className="absolute inset-0 h-full w-full object-cover object-top"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/92 via-black/35 to-transparent" />
      <div className="absolute inset-x-0 bottom-0 p-[22px]">
        <h3 className="font-display text-[22px] font-semibold text-white">{title}</h3>
        <p className="mt-1.5 text-sm leading-snug text-neutral-300">{desc}</p>
      </div>
    </div>
  );
}

export function ProjectsCarousel() {
  return (
    <section className="border-t border-white/5 py-16 sm:py-[90px]">
      <div className="mb-8 px-5 sm:px-[60px]">
        <span className="font-display text-xs uppercase tracking-[0.12em] text-neutral-500">
          Proyectos
        </span>
        <h2 className="mt-2.5 font-display text-[clamp(28px,4vw,46px)] font-semibold tracking-tighter">
          Cosas que he construido
        </h2>
      </div>
      <div className="overflow-hidden [-webkit-mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
        <div className="marquee-track flex w-max animate-[marqL_55s_linear_infinite]">
          <div className="flex gap-6 pr-6">
            {projects.map((p) => (
              <ProjectCard key={p.title} {...p} />
            ))}
          </div>
          <div className="flex gap-6 pr-6" aria-hidden="true">
            {projects.map((p) => (
              <ProjectCard key={`${p.title}-dup`} {...p} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 3: Mount it in `HomePage.tsx`**

Replace:

```tsx
        <DeviceShowcase />
        {/* ProjectsCarousel/TechMarquee/... se añaden en tareas siguientes */}
```

with:

```tsx
        <DeviceShowcase />
        <ProjectsCarousel />
        {/* TechMarquee/About/... se añaden en tareas siguientes */}
```

and add the import:

```tsx
import { ProjectsCarousel } from '../components/ProjectsCarousel';
```

- [ ] **Step 4: Verify in the browser**

Run: `npm run dev`, visit `/`.
Expected: "Proyectos" / "Cosas que he construido" heading, followed by an infinitely-scrolling row of the 4 project cards (BabIA, SonAI, AI Nav Corp, Desktop Nav) with real screenshots. Hovering the row pauses the scroll. In your OS/browser accessibility settings, enable "reduce motion" and reload — the row should be static (no animation).

- [ ] **Step 5: Commit**

```bash
git add src/components/ProjectsCarousel.tsx src/styles/index.css src/pages/HomePage.tsx
git commit -m "feat: add ProjectsCarousel with reduced-motion and hover-pause marquee"
```

---

### Task 9: TechMarquee component

**Files:**
- Create: `src/components/TechMarquee.tsx`
- Modify: `src/pages/HomePage.tsx`

**Interfaces:**
- Consumes: `tech: Tech[]` (Task 4), `.marquee-track` CSS rules (Task 8 — already handle both this and ProjectsCarousel).
- Produces: `<TechMarquee />` — no props.

- [ ] **Step 1: Create `src/components/TechMarquee.tsx`**

```tsx
import type { Tech } from '../data/tech';
import { tech } from '../data/tech';

function TechIcon({ name, src }: Tech) {
  return (
    <div
      title={name}
      className="flex h-[62px] w-[62px] items-center justify-center rounded-2xl bg-text shadow-lg"
    >
      <img src={src} alt={name} loading="lazy" className="h-[60%] w-[60%] object-contain" />
    </div>
  );
}

export function TechMarquee() {
  return (
    <div className="mt-6 overflow-hidden [-webkit-mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)] [mask-image:linear-gradient(90deg,transparent,#000_6%,#000_94%,transparent)]">
      <div className="marquee-track flex w-max animate-[marqR_42s_linear_infinite]">
        <div className="flex gap-[18px] pr-[18px]">
          {tech.map((t) => (
            <TechIcon key={t.name} {...t} />
          ))}
        </div>
        <div className="flex gap-[18px] pr-[18px]" aria-hidden="true">
          {tech.map((t) => (
            <TechIcon key={`${t.name}-dup`} {...t} />
          ))}
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Mount it inside `ProjectsCarousel`'s section in `HomePage.tsx`**

`TechMarquee` renders directly below the projects row, inside the same section (matches the mockup, where both marquees share one section). Replace:

```tsx
        <ProjectsCarousel />
        {/* TechMarquee/About/... se añaden en tareas siguientes */}
```

with:

```tsx
        <ProjectsCarousel />
        <TechMarquee />
        {/* About/ContactForm/... se añaden en tareas siguientes */}
```

and add the import:

```tsx
import { TechMarquee } from '../components/TechMarquee';
```

- [ ] **Step 3: Verify in the browser**

Run: `npm run dev`, visit `/`.
Expected: below the project cards, a second infinite row of 16 rounded tech icons (JS, TS, React, Next.js, Node, Python, HTML5, CSS3, Tailwind, Git, Docker, PostgreSQL, Jest, Selenium, Figma, GitHub) scrolling in the opposite direction, also pausable on hover and respecting reduced motion.

- [ ] **Step 4: Commit**

```bash
git add src/components/TechMarquee.tsx src/pages/HomePage.tsx
git commit -m "feat: add TechMarquee component"
```

---

### Task 10: About component

**Files:**
- Create: `src/components/About.tsx`
- Modify: `src/pages/HomePage.tsx`

**Interfaces:**
- Produces: `<About />` — no props. Renders the `id="sobre-mi"` section Nav's "Sobre mí" button (Task 5) scrolls to.

- [ ] **Step 1: Create `src/components/About.tsx`**

```tsx
import nicoImg from '../assets/profile/nico.png?w=600&format=webp';

export function About() {
  return (
    <section
      id="sobre-mi"
      className="flex justify-center border-t border-white/5 px-5 py-16 sm:px-[60px] sm:py-[120px]"
    >
      <div className="flex w-full max-w-[940px] flex-wrap items-center gap-8 rounded-[28px] border border-white/10 bg-white/[0.03] p-6 backdrop-blur-md sm:gap-12 sm:p-10">
        <div className="relative w-[clamp(220px,26vw,300px)] rounded-xl bg-text p-3 pb-10 shadow-2xl">
          <div className="aspect-[4/5] overflow-hidden rounded-md bg-neutral-300">
            <img src={nicoImg} alt="Nico" className="h-full w-full object-cover" />
          </div>
          <span className="absolute bottom-3 left-5 font-display text-[15px] font-semibold text-neutral-900">
            Nico
          </span>
        </div>
        <div className="min-w-[260px] flex-1">
          <div className="mb-4 inline-flex items-center gap-2 text-[13px] text-neutral-400">
            <span className="inline-block h-[9px] w-[9px] rounded-full bg-green-400" />
            Disponible para proyectos
          </div>
          <h2 className="mb-4 font-display text-[clamp(26px,3.4vw,40px)] font-semibold tracking-tighter">
            Sobre mí
          </h2>
          <p className="mb-3.5 text-pretty text-[15px] leading-relaxed text-neutral-300 sm:text-lg">
            Soy <strong className="font-semibold text-text">developer</strong> con foco en
            calidad. Trabajo el ciclo completo: escribo código, hago{' '}
            <strong className="font-semibold text-text">QA</strong> y aseguro que lo que se
            lanza funciona de verdad.
          </p>
          <p className="text-pretty text-[15px] leading-relaxed text-neutral-300 sm:text-lg">
            Diseño y automatizo <strong className="font-semibold text-text">workflows</strong> y
            aprovecho la <strong className="font-semibold text-text">IA</strong> para acelerar
            cada etapa del desarrollo sin perder control ni criterio.
          </p>
        </div>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Mount it in `HomePage.tsx`**

Replace:

```tsx
        <TechMarquee />
        {/* About/ContactForm/... se añaden en tareas siguientes */}
```

with:

```tsx
        <TechMarquee />
        <About />
        {/* ContactForm/Footer se añaden en tareas siguientes */}
```

and add the import:

```tsx
import { About } from '../components/About';
```

- [ ] **Step 3: Verify in the browser**

Run: `npm run dev`, visit `/`. Click "Sobre mí" in the Nav (Task 5).
Expected: smooth-scrolls to a card with Nico's photo, "Disponible para proyectos" badge, and the bio paragraphs.

- [ ] **Step 4: Commit**

```bash
git add src/components/About.tsx src/pages/HomePage.tsx
git commit -m "feat: add About component"
```

---

### Task 11: `/api/contact` serverless function + Resend (only test in the repo)

**Files:**
- Create: `api/contact.ts`, `test/api/contact.test.ts`, `vitest.config.ts`, `.env.example`
- Modify: `package.json`

**Interfaces:**
- Produces: `POST /api/contact` accepting JSON `{ name: string, email: string, message: string }`, returning `200 { ok: true }` on success or `4xx/5xx { error: string }` on failure. Consumed by Task 12's `ContactForm`.

- [ ] **Step 1: Install `resend`, `@vercel/node`, and `vitest`**

Run: `npm install resend` and `npm install -D @vercel/node vitest`

- [ ] **Step 2: Create `vitest.config.ts`**

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'node',
    include: ['test/**/*.test.ts'],
  },
});
```

- [ ] **Step 3: Create `.env.example`**

```
RESEND_API_KEY=
CONTACT_TO_EMAIL=
CONTACT_FROM_EMAIL=onboarding@resend.dev
```

- [ ] **Step 4: Write the failing test — `test/api/contact.test.ts`**

```ts
import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(() => ({
    emails: { send: sendMock },
  })),
}));

import handler from '../../api/contact';

function mockReqRes(body: unknown, method = 'POST') {
  const req = { method, body } as any;
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return { req, res: res as any };
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: '1' }, error: null });
    process.env.RESEND_API_KEY = 'test-key';
    process.env.CONTACT_TO_EMAIL = 'nico@example.com';
  });

  it('rejects non-POST requests', async () => {
    const { req, res } = mockReqRes(undefined, 'GET');
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  it('rejects empty fields', async () => {
    const { req, res } = mockReqRes({ name: '', email: '', message: '' });
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('rejects an invalid email format', async () => {
    const { req, res } = mockReqRes({ name: 'Nico', email: 'not-an-email', message: 'Hola' });
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('calls Resend with the expected payload and returns 200', async () => {
    const { req, res } = mockReqRes({
      name: 'Nico',
      email: 'nico@test.com',
      message: 'Hola, quiero hablar',
    });
    await handler(req, res);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'nico@example.com',
        replyTo: 'nico@test.com',
        subject: expect.stringContaining('Nico'),
      }),
    );
    expect(res.statusCode).toBe(200);
  });
});
```

- [ ] **Step 5: Run the test to verify it fails**

Run: `npm test`
Expected: FAIL — `Cannot find module '../../api/contact'` (the file doesn't exist yet).

- [ ] **Step 6: Create `api/contact.ts`**

```ts
import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, email, message } = (req.body ?? {}) as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    res.status(400).json({ error: 'Faltan campos obligatorios' });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'Email no válido' });
    return;
  }

  const to = process.env.CONTACT_TO_EMAIL;
  if (!to) {
    res.status(500).json({ error: 'CONTACT_TO_EMAIL no configurado' });
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL ?? 'onboarding@resend.dev',
    to,
    replyTo: email,
    subject: `Nuevo mensaje de contacto — ${name}`,
    text: `${message}\n\n— ${name} (${email})`,
  });

  if (error) {
    res.status(502).json({ error: 'No se pudo enviar el mensaje' });
    return;
  }

  res.status(200).json({ ok: true });
}
```

- [ ] **Step 7: Run the test to verify it passes**

Run: `npm test`
Expected: PASS — all 4 tests in `test/api/contact.test.ts`.

- [ ] **Step 8: Commit**

```bash
git add api test vitest.config.ts .env.example package.json package-lock.json
git commit -m "feat: add /api/contact serverless function with Resend"
```

---

### Task 12: ContactForm component

**Files:**
- Create: `src/components/ContactForm.tsx`
- Modify: `src/pages/HomePage.tsx`

**Interfaces:**
- Consumes: `POST /api/contact` (Task 11).
- Produces: `<ContactForm />` — no props. Renders the `id="contacto"` section Nav/Hero (Tasks 5–6) scroll to.

- [ ] **Step 1: Create `src/components/ContactForm.tsx`**

```tsx
import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
        }),
      });
      if (!res.ok) throw new Error('request failed');
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  return (
    <section
      id="contacto"
      className="flex justify-center border-t border-white/5 px-5 py-16 sm:px-[60px] sm:py-[120px]"
    >
      <div className="w-full max-w-[560px]">
        <div className="mb-8 text-center">
          <span className="font-display text-xs uppercase tracking-[0.12em] text-neutral-500">
            Contacto
          </span>
          <h2 className="mt-2.5 font-display text-[clamp(28px,4vw,46px)] font-semibold tracking-tighter">
            Hablemos
          </h2>
          <p className="mt-2 text-[15px] text-neutral-400">
            Cuéntame tu idea y te respondo pronto.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-[18px] rounded-[22px] border border-white/10 bg-white/[0.03] p-[30px] backdrop-blur-md"
        >
          <label className="flex flex-col gap-2 text-[13px] font-semibold text-neutral-300">
            Nombre
            <input
              name="name"
              type="text"
              required
              placeholder="Tu nombre"
              className="rounded-xl border border-neutral-800 bg-bg px-4 py-3.5 text-[15px] text-text focus:border-accent focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-[13px] font-semibold text-neutral-300">
            Email
            <input
              name="email"
              type="email"
              required
              placeholder="tucorreo@ejemplo.com"
              className="rounded-xl border border-neutral-800 bg-bg px-4 py-3.5 text-[15px] text-text focus:border-accent focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-[13px] font-semibold text-neutral-300">
            Mensaje
            <textarea
              name="message"
              rows={4}
              required
              placeholder="Cuéntame sobre tu proyecto…"
              className="resize-y rounded-xl border border-neutral-800 bg-bg px-4 py-3.5 text-[15px] text-text focus:border-accent focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="mt-1 rounded-xl bg-accent py-[15px] font-display text-[15px] font-semibold text-bg transition hover:bg-white disabled:opacity-60"
          >
            {status === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
          </button>
          {status === 'sent' && (
            <p className="mt-1 text-center text-sm text-green-400">
              ¡Gracias! Te responderé muy pronto.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-1 text-center text-sm text-red-400">
              Algo falló al enviar el mensaje. Inténtalo de nuevo o escríbeme directamente.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
```

- [ ] **Step 2: Mount it in `HomePage.tsx`**

Replace:

```tsx
        <About />
        {/* ContactForm/Footer se añaden en tareas siguientes */}
```

with:

```tsx
        <About />
        <ContactForm />
        {/* Footer se añade en la tarea siguiente */}
```

and add the import:

```tsx
import { ContactForm } from '../components/ContactForm';
```

- [ ] **Step 3: Verify with `vercel dev`**

`npm run dev` (plain Vite) does **not** run `api/contact.ts` — `fetch('/api/contact')` will 404. To test end-to-end:

1. Run: `npx vercel dev` (first run prompts to link/create a Vercel project — accept the defaults).
2. In the Vercel dashboard (or a local `.env` file per `vercel dev`'s instructions), set `RESEND_API_KEY` and `CONTACT_TO_EMAIL` (see `.env.example` from Task 11).
3. Open the local URL `vercel dev` prints, scroll to "Hablemos", submit the form with a real email.
4. Expected: button shows "Enviando…", then "¡Gracias! Te responderé muy pronto." appears, and the configured `CONTACT_TO_EMAIL` inbox receives the message.

- [ ] **Step 4: Commit**

```bash
git add src/components/ContactForm.tsx src/pages/HomePage.tsx
git commit -m "feat: add ContactForm wired to /api/contact"
```

---

### Task 13: Footer component + full visual walkthrough

**Files:**
- Create: `src/components/Footer.tsx`
- Modify: `src/pages/HomePage.tsx`

**Interfaces:**
- Produces: `<Footer />` — no props. Last piece of `HomePage`; after this task the page is visually complete top-to-bottom.

- [ ] **Step 1: Create `src/components/Footer.tsx`**

```tsx
export function Footer() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3 border-t border-white/5 px-5 py-8 sm:px-[60px]">
      <span className="font-display text-lg font-bold">Nico</span>
      <span className="text-[13px] text-neutral-500">
        © 2026 · Developer, design &amp; workflows with AI
      </span>
    </footer>
  );
}
```

- [ ] **Step 2: Mount it in `HomePage.tsx`**

Replace:

```tsx
        <ContactForm />
        {/* Footer se añade en la tarea siguiente */}
```

with:

```tsx
        <ContactForm />
        <Footer />
```

and add the import:

```tsx
import { Footer } from '../components/Footer';
```

- [ ] **Step 3: Full visual walkthrough against the mockup**

Run: `npm run dev`, visit `/`, and compare section-by-section against `Diseño_claude_desing/Portfolio.dc.html` (open that file directly in a browser side by side, or refer to its content):

- Nav sticky + blurred background on scroll.
- Hero heading/copy/buttons match.
- DeviceShowcase: iPad on wide viewports, iPhone under 820px (resize to check both).
- ProjectsCarousel: 4 real screenshots, infinite scroll, pauses on hover.
- TechMarquee: 16 icons, opposite scroll direction, pauses on hover.
- About: photo + bio, "Sobre mí" nav link scrolls here.
- ContactForm: "Contacto" nav link and Hero's "Contacto" button scroll here.
- Footer: "Nico" + copyright line.
- Resize to a narrow (mobile) width: no horizontal scrollbar anywhere, text stays readable (this exercises the `clamp()`-based type scale).

- [ ] **Step 4: Commit**

```bash
git add src/components/Footer.tsx src/pages/HomePage.tsx
git commit -m "feat: add Footer component, completing the HomePage"
```

---

### Task 14: Vercel SPA rewrite + build sanity check

**Files:**
- Create: `vercel.json`

**Interfaces:**
- Produces: a rewrite rule so client-side routes (`/login`) don't 404 on a hard refresh once deployed to Vercel.

- [ ] **Step 1: Create `vercel.json`**

```json
{
  "rewrites": [
    { "source": "/((?!api/).*)", "destination": "/index.html" }
  ]
}
```

- [ ] **Step 2: Run the production build**

Run: `npm run build`
Expected: exits 0, produces a `dist/` folder.

- [ ] **Step 3: Preview the production build**

Run: `npm run preview`, open the printed URL.
Expected: same page as `npm run dev`, served from the built `dist/` files. Navigate to `/login` directly by typing the URL — expect the placeholder page, not a 404 (this is what `vercel.json`'s rewrite guarantees once actually deployed on Vercel; `vite preview` itself doesn't need the rewrite since it always serves `index.html` for unknown routes by default in dev/preview, but the file must exist before deploying).

- [ ] **Step 4: Run the test suite**

Run: `npm test`
Expected: PASS (the 4 `api/contact` tests from Task 11 — the only automated tests in the repo).

- [ ] **Step 5: Commit**

```bash
git add vercel.json
git commit -m "chore: add Vercel SPA rewrite for client-side routes"
```

---

### Task 15: Cross-repo integration + final end-to-end verification

**Files:** none (verification-only task).

**Interfaces:** none — this task confirms the whole system (both repos) works together.

- [ ] **Step 1: Confirm `Iphone_Clone` is built**

From `C:\GitHub\Iphone_Clone`: run `npm test` (expect PASS) and `npm run build` (expect `dist/device-frame.js`, `dist/react.js`, and their `.d.ts` files to exist/be up to date). If either plan task there changed since the last build, rerun `npm run build`.

- [ ] **Step 2: Reinstall in the portfolio to pick up any Iphone_Clone rebuild**

From `C:\GitHub\Porfolio_Nico_V2`: run `npm install` (re-links the `file:../Iphone_Clone` dependency against the latest `dist/`).

- [ ] **Step 3: Full end-to-end browser pass**

Run: `npm run dev`, and separately `npx vercel dev` (for the contact form, per Task 12 Step 3) with `RESEND_API_KEY`/`CONTACT_TO_EMAIL` set. Walk the whole page as in Task 13 Step 3, plus:

- Submit the real contact form via `vercel dev` and confirm an email arrives.
- Toggle "reduce motion" in OS/browser settings and confirm both marquees go static.
- Resize across the 820px breakpoint and confirm the device swaps between iPad/iPhone without reloading `desktop-nav.vercel.app` (check the Network tab: only one request to that URL, not one per resize).

- [ ] **Step 4: Run both test suites one last time**

From `C:\GitHub\Iphone_Clone`: `npm test` — expect PASS.
From `C:\GitHub\Porfolio_Nico_V2`: `npm test` — expect PASS.

- [ ] **Step 5: Report status**

No commit for this task (verification-only). If everything in Step 3 checks out, the migration is complete and ready for the mandatory `seguridad-seo` skill pass before any production deploy (per `CLAUDE.md` and the spec's "Antes de producción" section) — that pass is a separate, explicit next step, not part of this plan.
