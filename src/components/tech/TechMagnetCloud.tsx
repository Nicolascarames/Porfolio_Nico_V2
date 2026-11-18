import { useEffect, useRef, useState } from 'react';
import { useInView } from '../../hooks/useInView';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import type { TechVariantProps } from './types';
import './tech.css';

/**
 * Nube de iconos que flotan unidos por hilos de luz; el cursor los repele o
 * los atrae como un imán y se pueden arrastrar. Sin dependencias. Port de
 * Diseño_claude_desing/reality404-v2/components/TechMagnetCloud/preview.html.
 */

const S = 58; // lado del icono
const COLS = 6;
const SPRING = 0.02;
const DAMPING = 0.86;
const RADIUS = 140; // influencia del cursor
const THREAD = 150; // distancia máxima de los hilos

interface Node {
  hx: number;
  hy: number;
  x: number;
  y: number;
  vx: number;
  vy: number;
  ph: number;
  drag: boolean;
  hot: boolean;
}

export function TechMagnetCloud({ tech, renderHead }: TechVariantProps) {
  const cloudRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const tipRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const nodes = useRef<Node[]>([]);
  const pointer = useRef({ x: -999, y: -999 });
  const [mode, setMode] = useState<1 | -1>(1); // 1 repeler, -1 atraer
  const modeRef = useRef(mode);
  modeRef.current = mode;
  const visible = useInView(cloudRef);

  // Geometría (rejilla escalonada de 6 columnas) y canvas a la resolución real.
  useEffect(() => {
    const cloud = cloudRef.current;
    const cv = canvasRef.current;
    if (!cloud || !cv) return;
    const W = cloud.clientWidth;
    const H = cloud.clientHeight;
    const dpr = window.devicePixelRatio || 1;
    cv.width = W * dpr;
    cv.height = H * dpr;
    cv.getContext('2d')?.setTransform(dpr, 0, 0, dpr, 0, 0);
    const rows = Math.ceil(tech.length / COLS);
    const reduced = prefersReducedMotion();
    nodes.current = tech.map((_, i) => {
      const row = Math.floor(i / COLS);
      const hx = ((i % COLS) + 0.5 + (row % 2 ? 0.25 : -0.25)) * (W / COLS);
      const hy = (row + 0.5) * (H / rows);
      // Con reduced motion aparecen ya en su sitio (sin salir del centro).
      return { hx, hy, x: reduced ? hx : W / 2, y: reduced ? hy : H / 2, vx: 0, vy: 0, ph: Math.random() * 6.28, drag: false, hot: false };
    });
  }, [tech]);

  // Bucle de animación, solo mientras se ve.
  useEffect(() => {
    if (!visible) return;
    const cloud = cloudRef.current;
    const ctx = canvasRef.current?.getContext('2d');
    if (!cloud || !ctx) return;
    const W = cloud.clientWidth;
    const H = cloud.clientHeight;
    const reduced = prefersReducedMotion();
    let raf = 0;

    const tick = (now: number) => {
      const tt = now / 1000;
      const ns = nodes.current;
      const { x: mx, y: my } = pointer.current;
      const m = modeRef.current;
      for (const n of ns) {
        if (n.drag) continue;
        const sway = reduced ? 0 : 1;
        const fx = n.hx + Math.sin(tt * 0.7 + n.ph) * 10 * sway - n.x;
        const fy = n.hy + Math.cos(tt * 0.9 + n.ph) * 8 * sway - n.y;
        n.vx += fx * SPRING;
        n.vy += fy * SPRING;
        const dx = n.x - mx;
        const dy = n.y - my;
        const d2 = dx * dx + dy * dy;
        if (d2 < RADIUS * RADIUS && !reduced) {
          const d = Math.sqrt(d2) || 1;
          const f = (1 - d / RADIUS) * 3.2 * m * (m < 0 ? 0.6 : 1);
          n.vx += (dx / d) * f;
          n.vy += (dy / d) * f;
        }
        n.vx *= DAMPING;
        n.vy *= DAMPING;
        n.x = Math.max(S / 2, Math.min(W - S / 2, n.x + n.vx));
        n.y = Math.max(S / 2, Math.min(H - S / 2, n.y + n.vy));
      }
      // Colisiones suaves entre fichas.
      for (let i = 0; i < ns.length; i++)
        for (let j = i + 1; j < ns.length; j++) {
          const a = ns[i];
          const b = ns[j];
          const dx = b.x - a.x;
          const dy = b.y - a.y;
          const d = Math.sqrt(dx * dx + dy * dy) || 1;
          const min = S + 6;
          if (d < min) {
            const p = (min - d) / 2;
            const ux = dx / d;
            const uy = dy / d;
            if (!a.drag) {
              a.x -= ux * p;
              a.y -= uy * p;
            }
            if (!b.drag) {
              b.x += ux * p;
              b.y += uy * p;
            }
          }
        }
      // Hilos de luz entre vecinos (los tubos del fondo, en línea).
      ctx.clearRect(0, 0, W, H);
      ctx.lineWidth = 1;
      for (let i = 0; i < ns.length; i++)
        for (let j = i + 1; j < ns.length; j++) {
          const d = Math.hypot(ns[i].x - ns[j].x, ns[i].y - ns[j].y);
          if (d < THREAD) {
            ctx.strokeStyle = `rgba(223,225,236,${(1 - d / THREAD) * 0.35})`;
            ctx.beginPath();
            ctx.moveTo(ns[i].x, ns[i].y);
            ctx.lineTo(ns[j].x, ns[j].y);
            ctx.stroke();
          }
        }
      const tip = tipRef.current;
      ns.forEach((n, i) => {
        const el = chipRefs.current[i];
        if (!el) return;
        const s = n.hot || n.drag ? 1.15 : 1;
        el.style.transform = `translate(${n.x - S / 2}px,${n.y - S / 2}px) scale(${s}) rotate(${n.vx * 2}deg)`;
        if (n.hot && tip) tip.style.transform = `translate(${n.x - tip.offsetWidth / 2}px,${n.y - S / 2 - 36}px)`;
      });
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  const showTip = (i: number, on: boolean) => {
    const n = nodes.current[i];
    if (n) n.hot = on;
    const tip = tipRef.current;
    if (!tip) return;
    if (on) tip.textContent = tech[i].name;
    tip.style.opacity = on ? '1' : '0';
  };

  return (
    <div className="flex flex-col gap-3.5">
      {renderHead(
        <div className="mc-seg r4-glass" role="group" aria-label="Modo del imán">
          <button type="button" aria-pressed={mode === 1} onClick={() => setMode(1)}>
            Repeler
          </button>
          <button type="button" aria-pressed={mode === -1} onClick={() => setMode(-1)}>
            Atraer
          </button>
        </div>,
      )}
      <div
        ref={cloudRef}
        className="mc-cloud r4-glass"
        onPointerMove={(e) => {
          const r = e.currentTarget.getBoundingClientRect();
          const p = { x: e.clientX - r.left, y: e.clientY - r.top };
          pointer.current = p;
          for (const n of nodes.current)
            if (n.drag) {
              n.x = p.x;
              n.y = p.y;
              n.vx = n.vy = 0;
            }
        }}
        onPointerLeave={() => (pointer.current = { x: -999, y: -999 })}
      >
        <canvas ref={canvasRef} aria-hidden="true" />
        {tech.map((t, i) => (
          <button
            key={t.name}
            type="button"
            ref={(el) => (chipRefs.current[i] = el)}
            className="mc-chip r4-frost-chip"
            aria-label={t.name}
            style={{ transform: 'translate(-200px,-200px)' }}
            onPointerDown={(e) => {
              const n = nodes.current[i];
              if (!n) return;
              n.drag = true;
              e.currentTarget.classList.add('drag');
              e.currentTarget.setPointerCapture(e.pointerId);
            }}
            onPointerUp={(e) => {
              const n = nodes.current[i];
              if (!n) return;
              n.drag = false;
              e.currentTarget.classList.remove('drag');
              n.vx += (Math.random() - 0.5) * 4;
            }}
            onPointerEnter={() => showTip(i, true)}
            onPointerLeave={() => showTip(i, false)}
            onFocus={() => showTip(i, true)}
            onBlur={() => showTip(i, false)}
          >
            <img src={t.src} alt="" draggable={false} />
          </button>
        ))}
        <div ref={tipRef} className="mc-tip" aria-hidden="true" />
      </div>
      <p className="r4-hint">Mueve el ratón por la caja · arrastra un icono y suéltalo</p>
    </div>
  );
}
