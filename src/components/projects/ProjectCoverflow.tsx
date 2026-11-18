import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { ProjectMedia } from '../ui/ProjectMedia';
import { useInView } from '../../hooks/useInView';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import type { ProjectVariantProps } from './types';
import './projects.css';

/**
 * Carrusel 3D con perspectiva: la central se agranda, reproduce su vídeo y
 * muestra "Abrir en tablet"; las laterales giran ±48° con reflejo. Port de
 * Diseño_claude_desing/reality404-v2/components/ProjectCoverflow/preview.html.
 */

const STEP_PX = 210; // arrastre equivalente a una tarjeta
const EASING = 0.14; // aproximación por frame hacia el objetivo
const DRAG_SLOP = 4; // px

export function ProjectCoverflow({ projects, onSelectProject }: ProjectVariantProps) {
  const N = projects.length;
  const rootRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const pos = useRef(0);
  const target = useRef(0);
  const [center, setCenter] = useState(0);
  const centerRef = useRef(0);
  const inView = useInView(rootRef, { rootMargin: '100px' });

  // Distancia circular más corta entre dos índices.
  const wrap = (d: number) => {
    d = ((d % N) + N) % N;
    return d > N / 2 ? d - N : d;
  };

  useEffect(() => {
    if (!inView) return;
    const reduced = prefersReducedMotion();
    let raf = 0;
    const render = () => {
      pos.current += (target.current - pos.current) * (reduced ? 1 : EASING);
      if (Math.abs(target.current - pos.current) < 0.001) pos.current = target.current;
      cardRefs.current.forEach((c, i) => {
        if (!c) return;
        const d = wrap(i - pos.current);
        const a = Math.abs(d);
        const rot = Math.max(-1, Math.min(1, d)) * -48;
        const x = d * STEP_PX - Math.sign(d) * Math.max(0, a - 1) * 70;
        const z = -a * 160;
        c.style.transform = `translateX(${x}px) translateZ(${z}px) rotateY(${rot}deg) scale(${a < 0.5 ? 1.06 - a * 0.12 : 1})`;
        c.style.zIndex = String(100 - Math.round(a * 10));
        c.style.opacity = a > 2.4 ? '0' : '1';
        c.style.filter = `brightness(${Math.max(0.35, 1 - a * 0.35)})`;
      });
      const ci = ((Math.round(pos.current) % N) + N) % N;
      if (ci !== centerRef.current) {
        centerRef.current = ci;
        setCenter(ci);
      }
      raf = requestAnimationFrame(render);
    };
    raf = requestAnimationFrame(render);
    return () => cancelAnimationFrame(raf);
  }, [inView, N]); // wrap solo depende de N

  // Rueda: avanza una tarjeta por gesto (listener no pasivo para poder cancelar el scroll).
  useEffect(() => {
    const el = rootRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      target.current = Math.round(target.current + Math.sign(e.deltaY || e.deltaX));
    };
    el.addEventListener('wheel', onWheel, { passive: false });
    return () => el.removeEventListener('wheel', onWheel);
  }, []);

  const open = (i: number) => {
    const el = cardRefs.current[i];
    if (el) onSelectProject(projects[i], el);
  };

  // Arrastre con inercia
  const drag = useRef<{ sx: number; start: number; moved: boolean; vx: number; lastX: number; lastT: number } | null>(null);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    e.currentTarget.setPointerCapture(e.pointerId);
    e.currentTarget.classList.add('dragging');
    drag.current = { sx: e.clientX, start: target.current, moved: false, vx: 0, lastX: e.clientX, lastT: performance.now() };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    const dx = e.clientX - d.sx;
    if (Math.abs(dx) > DRAG_SLOP) d.moved = true;
    const now = performance.now();
    d.vx = (e.clientX - d.lastX) / Math.max(1, now - d.lastT);
    d.lastX = e.clientX;
    d.lastT = now;
    target.current = d.start - dx / STEP_PX;
  }

  function onPointerUp(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    e.currentTarget.classList.remove('dragging');
    drag.current = null;
    if (!d) return;
    if (d.moved) {
      target.current = Math.round(target.current - d.vx * 3);
      return;
    }
    const hit = document
      .elementsFromPoint(e.clientX, e.clientY)
      .find((n) => n instanceof HTMLElement && n.classList.contains('cf-card'));
    const i = hit ? cardRefs.current.indexOf(hit as HTMLDivElement) : -1;
    if (i < 0) return;
    if (i === centerRef.current) open(i);
    else target.current = Math.round(pos.current) + wrap(i - pos.current);
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      target.current = Math.round(target.current) + 1;
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      target.current = Math.round(target.current) - 1;
    } else if (e.key === 'Enter') {
      e.preventDefault();
      open(centerRef.current);
    }
  }

  return (
    <div className="flex flex-col gap-[18px]">
      <div
        ref={rootRef}
        className="cf"
        tabIndex={0}
        role="region"
        aria-roledescription="carrusel"
        aria-label="Proyectos"
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerCancel={(e) => {
          e.currentTarget.classList.remove('dragging');
          drag.current = null;
        }}
        onKeyDown={onKeyDown}
      >
        {projects.map((p, i) => (
          <div
            key={p.id}
            ref={(el) => (cardRefs.current[i] = el)}
            className={`cf-card r4-glass ${i === center ? 'is-center' : ''}`}
          >
            <ProjectMedia project={p} playing={i === center} />
            <div className="pv-shade" />
            <div className="meta">
              <h3>{p.title}</h3>
              <p>{p.desc}</p>
            </div>
            {/* Indicador visual: el clic lo resuelve el contenedor (captura del puntero) y el teclado, Enter. */}
            <span className="r4-btn open" aria-hidden="true">
              Abrir en tablet
            </span>
          </div>
        ))}
      </div>
      <p className="r4-hint" aria-live="polite">
        {projects[center]?.title} — clic en la central o Enter para abrirla en la tablet · arrastra, rueda o ← →
      </p>
    </div>
  );
}
