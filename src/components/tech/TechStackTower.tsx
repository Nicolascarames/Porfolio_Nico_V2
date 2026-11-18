import { useEffect, useRef, useState } from 'react';
import type MatterNS from 'matter-js';
import { useInView } from '../../hooks/useInView';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { detachMouse, loadMatter, releaseAnywhere } from './matter';
import { useElementWidth } from '../../hooks/useElementWidth';
import type { TechVariantProps } from './types';
import './tech.css';

/**
 * Torre piramidal de fichas (5-4-3-2-1-1 = 16) con física: se derriba
 * empujando, cogiendo bloques o lanzando una bola cromada, y se recompone
 * sola a los 5 s. Port de
 * Diseño_claude_desing/reality404-v2/components/TechStackTower/preview.html.
 */

// Lado del bloque según el ancho de la caja: 48 px por debajo de 520 px (móvil).
const blockSize = (w: number) => (w < 520 ? 48 : 60);
const GAP = 4;
const FLOOR_H = 24;
const ROWS = [5, 4, 3, 2, 1, 1]; // 16 bloques
const CAPACITY = ROWS.reduce((a, b) => a + b, 0);
const BALL_R = 23;
const IDLE_REBUILD = 5000; // ms sin tocar
const REBUILD_MS = 1100;

interface Controls {
  ball: () => void;
  rebuild: () => void;
}

export function TechStackTower({ tech, renderHead }: TechVariantProps) {
  const blocksTech = tech.slice(0, CAPACITY);
  const total = blocksTech.length;
  const stageRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const ballRef = useRef<HTMLDivElement>(null);
  const statusRef = useRef<HTMLDivElement>(null);
  const controls = useRef<Controls | null>(null);
  const visible = useInView(stageRef, { threshold: 0.2 });
  const visibleRef = useRef(false);
  visibleRef.current = visible;
  const loop = useRef<{ start: () => void; stop: () => void } | null>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  if (visible && !started) setStarted(true);
  // El mundo se recrea si cambia el ancho de la caja (giro, redimensionado).
  const width = useElementWidth(stageRef);
  const S = blockSize(width);

  useEffect(() => {
    if (!started || !width) return;
    let disposed = false;
    let cleanup = () => {};

    loadMatter()
      .then((M) => {
        const st = stageRef.current;
        if (disposed || !st) return;
        const W = st.clientWidth;
        const H = st.clientHeight;
        const FLOOR = H - FLOOR_H;
        const engine = M.Engine.create();
        engine.gravity.y = 1;
        engine.positionIterations = 10;
        const wall = { isStatic: true };
        M.Composite.add(engine.world, [
          M.Bodies.rectangle(W / 2, FLOOR + 100, W * 3, 200, wall),
          M.Bodies.rectangle(-100, H / 2, 200, H * 4, wall),
          M.Bodies.rectangle(W + 100, H / 2, 200, H * 4, wall),
        ]);

        // Posiciones de reposo de la pirámide.
        const homes: { x: number; y: number }[] = [];
        ROWS.forEach((n, r) => {
          for (let k = 0; k < n; k++) homes.push({ x: W / 2 + (k - (n - 1) / 2) * (S + GAP), y: FLOOR - S / 2 - r * (S + 0.5) });
        });
        const blocks = blocksTech.map((_, i) =>
          M.Bodies.rectangle(homes[i].x, homes[i].y, S, S, {
            chamfer: { radius: 12 },
            friction: 0.6,
            frictionStatic: 1,
            restitution: 0.1,
            density: 0.003,
          }),
        );
        M.Composite.add(engine.world, blocks);

        const mouse = M.Mouse.create(st);
        detachMouse(mouse, true);
        const stopRelease = releaseAnywhere(mouse);
        const mc = M.MouseConstraint.create(engine, {
          mouse,
          constraint: { stiffness: 0.25, render: { visible: false } } as MatterNS.IConstraintDefinition,
        });
        M.Composite.add(engine.world, mc);

        let lastTouch = 0;
        let rebuilding = false;
        let ball: MatterNS.Body | null = null;
        let rebuildRaf = 0;
        M.Events.on(mc, 'startdrag', () => (lastTouch = performance.now()));
        M.Events.on(mc, 'mousemove', () => {
          if (mc.body) lastTouch = performance.now();
        });

        const setStatus = (text: string) => {
          const el = statusRef.current;
          if (el && el.textContent !== text) el.textContent = text;
        };
        const standing = () =>
          blocks.filter(
            (b, i) => Math.hypot(b.position.x - homes[i].x, b.position.y - homes[i].y) < 16 && Math.abs(b.angle) < 0.15,
          ).length;

        const removeBall = () => {
          if (!ball) return;
          M.Composite.remove(engine.world, ball);
          ball = null;
          if (ballRef.current) ballRef.current.style.display = 'none';
        };

        const rebuild = () => {
          if (rebuilding) return;
          rebuilding = true;
          setStatus('reconstruyendo…');
          removeBall();
          const from = blocks.map((b) => {
            M.Body.setStatic(b, true);
            return { x: b.position.x, y: b.position.y, a: b.angle % (Math.PI * 2) };
          });
          const t0 = performance.now();
          const dur = prefersReducedMotion() ? 1 : REBUILD_MS;
          const step = (now: number) => {
            const k = Math.min(1, (now - t0) / dur);
            blocks.forEach((b, i) => {
              // Cada bloque vuela en arco a su sitio, escalonado 35 ms.
              const kk = Math.max(0, Math.min(1, k * 1.6 - i * 0.035));
              const e = 1 - Math.pow(1 - kk, 3);
              const f = from[i];
              const h = homes[i];
              const arc = Math.sin(e * Math.PI) * -60;
              M.Body.setPosition(b, { x: f.x + (h.x - f.x) * e, y: f.y + (h.y - f.y) * e + arc });
              M.Body.setAngle(b, f.a * (1 - e));
            });
            if (k < 1) rebuildRaf = requestAnimationFrame(step);
            else {
              blocks.forEach((b) => {
                M.Body.setStatic(b, false);
                M.Body.setVelocity(b, { x: 0, y: 0 });
                M.Body.setAngularVelocity(b, 0);
              });
              rebuilding = false;
              lastTouch = 0;
            }
          };
          rebuildRaf = requestAnimationFrame(step);
        };

        const launchBall = () => {
          removeBall();
          ball = M.Bodies.circle(30, FLOOR - 180, BALL_R, { density: 0.04, restitution: 0.3, frictionAir: 0.001 });
          if (ballRef.current) ballRef.current.style.display = 'block';
          M.Composite.add(engine.world, ball);
          M.Body.setVelocity(ball, { x: 22, y: -4 });
          lastTouch = performance.now();
        };

        let raf = 0;
        let last = performance.now();
        const tick = (now: number) => {
          M.Engine.update(engine, Math.min(25, now - last));
          last = now;
          blocks.forEach((b, i) => {
            const el = chipRefs.current[i];
            if (el) el.style.transform = `translate(${b.position.x - S / 2}px,${b.position.y - S / 2}px) rotate(${b.angle}rad)`;
          });
          if (ball && ballRef.current)
            ballRef.current.style.transform = `translate(${ball.position.x - BALL_R}px,${ball.position.y - BALL_R}px) rotate(${ball.angle}rad)`;
          if (!rebuilding) {
            const up = standing();
            setStatus(up === total ? `${total} tecnologías en pie` : `${up} / ${total} en pie`);
            if (up < total && lastTouch && now - lastTouch > IDLE_REBUILD && !mc.body) rebuild();
          }
          raf = requestAnimationFrame(tick);
        };
        loop.current = {
          start: () => {
            if (raf) return;
            last = performance.now();
            raf = requestAnimationFrame(tick);
          },
          stop: () => {
            cancelAnimationFrame(raf);
            raf = 0;
          },
        };
        if (visibleRef.current) loop.current.start();
        controls.current = { ball: launchBall, rebuild };

        cleanup = () => {
          loop.current?.stop();
          loop.current = null;
          controls.current = null;
          cancelAnimationFrame(rebuildRaf);
          detachMouse(mouse);
          stopRelease();
          M.Composite.clear(engine.world, false, true);
          M.Engine.clear(engine);
        };
      })
      .catch(() => !disposed && setFailed(true));

    return () => {
      disposed = true;
      cleanup();
    };
  }, [started, tech, width, S]); // blocksTech se deriva de tech

  useEffect(() => {
    if (visible) loop.current?.start();
    else loop.current?.stop();
  }, [visible]);

  return (
    <div className="flex flex-col gap-3.5">
      {renderHead(
        <div className="flex gap-2">
          <button type="button" className="r4-btn-ghost" onClick={() => controls.current?.ball()}>
            Lanzar bola
          </button>
          <button type="button" className="r4-btn" onClick={() => controls.current?.rebuild()}>
            Reconstruir
          </button>
        </div>,
      )}
      <div ref={stageRef} className="tw-stage r4-glass" aria-label="Torre interactiva con las tecnologías que uso">
        <div className="tw-floor" />
        {failed ? (
          <p className="r4-hint p-10">No se pudo cargar el motor de física.</p>
        ) : (
          blocksTech.map((t, i) => (
            <div
              key={t.name}
              ref={(el) => (chipRefs.current[i] = el)}
              className="tw-chip r4-frost-chip"
              style={{ transform: 'translate(-200px,-200px)', width: S, height: S }}
            >
              <img src={t.src} alt={t.name} draggable={false} />
            </div>
          ))
        )}
        <div ref={ballRef} className="tw-ball" style={{ display: 'none' }} aria-hidden="true" />
        <div ref={statusRef} className="tw-status" aria-live="polite">
          {total} tecnologías en pie
        </div>
      </div>
      <p className="r4-hint">Empuja o coge un bloque · se recompone sola a los 5 s</p>
    </div>
  );
}
