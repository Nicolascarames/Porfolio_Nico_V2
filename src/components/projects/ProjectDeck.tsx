import { useEffect, useRef, useState, type CSSProperties, type KeyboardEvent, type PointerEvent } from 'react';
import { ProjectMedia } from '../ui/ProjectMedia';
import type { ProjectVariantProps } from './types';
import './projects.css';

/**
 * Baraja de tarjetas en abanico: se arrastran y se lanzan para pasar a la
 * siguiente; la de arriba reproduce el vídeo. Port de
 * Diseño_claude_desing/reality404-v2/components/ProjectDeck/preview.html.
 */

const MAX_FAN = 3; // 4 tarjetas visibles como máximo
const FLING_DISTANCE = 120; // px
const FLING_VELOCITY = 0.6; // px/ms
const CLICK_SLOP = 6; // px

function fanStyle(pos: number): CSSProperties {
  const fan = Math.min(pos, MAX_FAN);
  return {
    zIndex: 10 - pos,
    transform: `translate3d(${fan * 26}px,${fan * 14}px,${-fan * 70}px) rotate(${fan * 3.5}deg)`,
    opacity: pos > MAX_FAN ? 0 : 1 - fan * 0.12,
    filter: pos ? `brightness(${1 - fan * 0.18}) blur(${fan * 0.6}px)` : 'none',
    pointerEvents: pos ? 'none' : 'auto',
  };
}

export function ProjectDeck({ projects, onSelectProject }: ProjectVariantProps) {
  // order[0] = índice del proyecto de la tarjeta de arriba
  const [order, setOrder] = useState(() => projects.map((_, i) => i));
  const cardRefs = useRef<(HTMLDivElement | null)[]>([]);
  const drag = useRef<{ el: HTMLDivElement; sx: number; sy: number; dx: number; dy: number; t0: number } | null>(null);

  const top = order[0];

  const cycle = (dir: 1 | -1) =>
    setOrder((o) => (dir > 0 ? [...o.slice(1), o[0]] : [o[o.length - 1], ...o.slice(0, -1)]));

  const goTo = (i: number) =>
    setOrder((o) => {
      const at = o.indexOf(i);
      return [...o.slice(at), ...o.slice(0, at)];
    });

  // Con teclado, el foco sigue a la nueva tarjeta de arriba tras reordenar.
  const pendingFocus = useRef(false);
  const focusTopSoon = () => (pendingFocus.current = true);
  useEffect(() => {
    if (!pendingFocus.current) return;
    pendingFocus.current = false;
    cardRefs.current[order[0]]?.focus({ preventScroll: true });
  }, [order]);

  // Tras un arrastre que no cambia el orden, React no reaplica el estilo (no
  // ha cambiado su prop), así que se devuelve a mano a su sitio del abanico.
  const resetTop = (el: HTMLElement) => Object.assign(el.style, fanStyle(0));

  const open = (el: HTMLElement) => onSelectProject(projects[top], el);

  function onPointerDown(e: PointerEvent<HTMLDivElement>) {
    const el = e.currentTarget;
    el.setPointerCapture(e.pointerId);
    el.classList.add('dragging');
    drag.current = { el, sx: e.clientX, sy: e.clientY, dx: 0, dy: 0, t0: performance.now() };
  }

  function onPointerMove(e: PointerEvent<HTMLDivElement>) {
    const d = drag.current;
    if (!d) return;
    d.dx = e.clientX - d.sx;
    d.dy = e.clientY - d.sy;
    d.el.style.transform = `translate3d(${d.dx}px,${d.dy * 0.4}px,40px) rotate(${d.dx / 14}deg)`;
  }

  function onPointerUp(cancelled: boolean) {
    const d = drag.current;
    if (!d) return;
    drag.current = null;
    const { el, dx, dy } = d;
    el.classList.remove('dragging');
    const v = Math.abs(dx) / Math.max(1, performance.now() - d.t0);

    if (Math.abs(dx) < CLICK_SLOP && Math.abs(dy) < CLICK_SLOP) {
      resetTop(el);
      if (!cancelled) open(el);
      return;
    }
    if (!cancelled && (Math.abs(dx) > FLING_DISTANCE || v > FLING_VELOCITY)) {
      const out = dx > 0 ? 1 : -1;
      el.style.transform = `translate3d(${out * 520}px,${dy * 0.4}px,0) rotate(${out * 28}deg)`;
      el.style.opacity = '0';
      window.setTimeout(() => cycle(1), 220);
    } else {
      resetTop(el);
    }
  }

  function onKeyDown(e: KeyboardEvent<HTMLDivElement>) {
    if (e.key === 'ArrowRight') {
      e.preventDefault();
      cycle(1);
      focusTopSoon();
    } else if (e.key === 'ArrowLeft') {
      e.preventDefault();
      cycle(-1);
      focusTopSoon();
    } else if ((e.key === 'Enter' || e.key === ' ') && e.target === cardRefs.current[top]) {
      e.preventDefault();
      open(e.target as HTMLElement);
    }
  }

  return (
    <div className="flex flex-col gap-[22px]">
      <div className="deck" role="region" aria-roledescription="carrusel" aria-label="Proyectos" onKeyDown={onKeyDown}>
        {projects.map((p, i) => {
          const pos = order.indexOf(i);
          return (
            <div
              key={p.id}
              ref={(el) => (cardRefs.current[i] = el)}
              className="deck-card r4-glass"
              style={fanStyle(pos)}
              role="button"
              tabIndex={pos === 0 ? 0 : -1}
              aria-hidden={pos !== 0}
              aria-label={`Abrir ${p.title} en la tablet`}
              onPointerDown={pos === 0 ? onPointerDown : undefined}
              onPointerMove={onPointerMove}
              onPointerUp={() => onPointerUp(false)}
              onPointerCancel={() => onPointerUp(true)}
            >
              <ProjectMedia project={p} playing={pos === 0} />
              <div className="pv-shade" />
              <div className="meta">
                <h3>{p.title}</h3>
                <p>{p.desc}</p>
                <div className="pv-tags">
                  {p.tags.map((t) => (
                    <span key={t} className="pv-tag">
                      {t}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <div className="deck-nav">
        <button type="button" className="r4-btn-ghost r4-icon-btn" aria-label="Proyecto anterior" onClick={() => cycle(-1)}>
          ←
        </button>
        <div className="deck-dots">
          {projects.map((p, i) => (
            <button
              key={p.id}
              type="button"
              className="deck-dot"
              aria-label={p.title}
              aria-current={i === top}
              onClick={() => goTo(i)}
            />
          ))}
        </div>
        <button type="button" className="r4-btn-ghost r4-icon-btn" aria-label="Proyecto siguiente" onClick={() => cycle(1)}>
          →
        </button>
      </div>
      <p className="r4-hint">Arrastra o lanza la tarjeta · ← → con teclado · clic / Enter para abrir en la tablet</p>
    </div>
  );
}
