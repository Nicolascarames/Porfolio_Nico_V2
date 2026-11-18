import { useEffect, useRef, useState } from 'react';
import type MatterNS from 'matter-js';
import { useInView } from '../../hooks/useInView';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { detachMouse, loadMatter, releaseAnywhere } from './matter';
import { useElementWidth } from '../../hooks/useElementWidth';
import type { TechVariantProps } from './types';
import './tech.css';

/**
 * Caja de vidrio con física real: las fichas caen al entrar en pantalla, se
 * apilan, se cogen y se lanzan. Port de
 * Diseño_claude_desing/reality404-v2/components/TechPhysicsBox/preview.html.
 */

// Lado de la ficha según el ancho de la caja: 48 px por debajo de 520 px (móvil).
const chipSize = (w: number) => (w < 520 ? 48 : 64);
const WALL = 200; // grosor de paredes invisibles
const CEILING_DELAY = 3200; // ms hasta cerrar el techo

interface Controls {
  shake: () => void;
  flip: () => void;
}

export function TechPhysicsBox({ tech, renderHead }: TechVariantProps) {
  const boxRef = useRef<HTMLDivElement>(null);
  const chipRefs = useRef<(HTMLDivElement | null)[]>([]);
  const controls = useRef<Controls | null>(null);
  const visible = useInView(boxRef, { threshold: 0.3 });
  const visibleRef = useRef(false);
  visibleRef.current = visible;
  const loop = useRef<{ start: () => void; stop: () => void } | null>(null);
  const [started, setStarted] = useState(false);
  const [failed, setFailed] = useState(false);

  if (visible && !started) setStarted(true);
  // El mundo se recrea si cambia el ancho de la caja (giro, redimensionado).
  const width = useElementWidth(boxRef);
  const S = chipSize(width);

  // Crea el mundo la primera vez que la caja se ve.
  useEffect(() => {
    if (!started || !width) return;
    let disposed = false;
    let cleanup = () => {};

    loadMatter()
      .then((M) => {
        const box = boxRef.current;
        if (disposed || !box) return;
        const W = box.clientWidth;
        const H = box.clientHeight;
        const engine = M.Engine.create();
        engine.gravity.y = 1;
        const wall = { isStatic: true, render: { visible: false } };
        M.Composite.add(engine.world, [
          M.Bodies.rectangle(W / 2, H + WALL / 2, W * 3, WALL, wall),
          M.Bodies.rectangle(-WALL / 2, 0, WALL, H * 6, wall),
          M.Bodies.rectangle(W + WALL / 2, 0, WALL, H * 6, wall),
        ]);

        const items = tech.map((_, i) =>
          M.Bodies.rectangle(60 + ((i * 97) % (W - 120)), -60 - i * 45, S, S, {
            chamfer: { radius: S / 4 },
            restitution: 0.45,
            friction: 0.08,
            frictionAir: 0.012,
            density: 0.002,
          }),
        );
        M.Composite.add(engine.world, items);
        const ceiling = M.Bodies.rectangle(W / 2, -WALL / 2, W * 3, WALL, wall);

        const mouse = M.Mouse.create(box);
        detachMouse(mouse, true);
        const stopRelease = releaseAnywhere(mouse);
        const mc = M.MouseConstraint.create(engine, {
          mouse,
          constraint: { stiffness: 0.2, damping: 0.1, render: { visible: false } } as MatterNS.IConstraintDefinition,
        });
        M.Composite.add(engine.world, mc);
        // Los eventos de drag de Matter traen `body`, aunque sus tipos no lo declaran.
        const chipOf = (e: object) => chipRefs.current[items.indexOf((e as { body: MatterNS.Body }).body)];
        M.Events.on(mc, 'startdrag', (e) => chipOf(e)?.classList.add('hot'));
        M.Events.on(mc, 'enddrag', (e) => chipOf(e)?.classList.remove('hot'));

        const paint = () => {
          items.forEach((b, i) => {
            const el = chipRefs.current[i];
            if (el) el.style.transform = `translate(${b.position.x - S / 2}px,${b.position.y - S / 2}px) rotate(${b.angle}rad)`;
          });
        };

        let ceilingTimer = 0;
        if (prefersReducedMotion()) {
          // Sin animación de caída: se simula en silencio y aparecen apiladas.
          for (let k = 0; k < 400; k++) M.Engine.update(engine, 16);
          M.Composite.add(engine.world, ceiling);
          paint();
        } else {
          ceilingTimer = window.setTimeout(() => M.Composite.add(engine.world, ceiling), CEILING_DELAY);
        }

        let raf = 0;
        let last = performance.now();
        const tick = (now: number) => {
          M.Engine.update(engine, Math.min(32, now - last));
          last = now;
          paint();
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

        controls.current = {
          shake: () =>
            items.forEach((b) => {
              M.Body.setVelocity(b, { x: (Math.random() - 0.5) * 26, y: -10 - Math.random() * 16 });
              M.Body.setAngularVelocity(b, (Math.random() - 0.5) * 0.5);
            }),
          flip: () => {
            engine.gravity.y *= -1;
          },
        };

        cleanup = () => {
          loop.current?.stop();
          loop.current = null;
          controls.current = null;
          window.clearTimeout(ceilingTimer);
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
  }, [started, tech, width, S]);

  // Pausa el bucle cuando la caja sale de pantalla.
  useEffect(() => {
    if (visible) loop.current?.start();
    else loop.current?.stop();
  }, [visible]);

  return (
    <div className="flex flex-col gap-3.5">
      {renderHead(
        <div className="flex gap-2">
          <button type="button" className="r4-btn-ghost" onClick={() => controls.current?.shake()}>
            Agitar caja
          </button>
          <button type="button" className="r4-btn-ghost" onClick={() => controls.current?.flip()}>
            Invertir gravedad
          </button>
        </div>,
      )}
      <div ref={boxRef} className="tp-box r4-glass" aria-label="Caja interactiva con las tecnologías que uso">
        {failed ? (
          <p className="r4-hint p-10">No se pudo cargar el motor de física.</p>
        ) : (
          tech.map((t, i) => (
            <div
              key={t.name}
              ref={(el) => (chipRefs.current[i] = el)}
              className="tp-chip r4-frost-chip"
              style={{ transform: 'translate(-200px,-200px)', width: S, height: S }}
              aria-hidden="true"
            >
              <img src={t.src} alt="" draggable={false} />
              <span>{t.name}</span>
            </div>
          ))
        )}
      </div>
      <ul className="r4-sr">
        {tech.map((t) => (
          <li key={t.name}>{t.name}</li>
        ))}
      </ul>
      <p className="r4-hint">Coge una ficha y lánzala contra las demás</p>
    </div>
  );
}
