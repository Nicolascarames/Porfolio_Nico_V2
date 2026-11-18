import { useEffect, useRef, useState, type KeyboardEvent, type PointerEvent } from 'react';
import { useInView } from '../../hooks/useInView';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import nicoImg from '../../assets/profile/nico.png?w=700&format=webp';
import logo404 from '../../assets/brand/logo-404-cuadrado.png';
import './about.css';

/**
 * Credencial de vidrio colgada de una cinta: se arrastra, se balancea con
 * muelle y al hacer clic gira. Port de
 * Diseño_claude_desing/reality404-v2/components/AboutBadge/preview.html.
 */

const BW = 240; // ancho de la tarjeta
const AX = 170; // ancla de la cinta (fuera de la caja, por arriba)
const AY = -10;

const BACK_ROWS: [string, string][] = [
  ['BASE', 'A Coruña, España'],
  ['ROL', 'Developer con foco en calidad'],
  ['CICLO', 'Código → QA → lanzamiento'],
  ['EXTRA', 'Workflows y automatización con IA'],
  ['STACK', 'React · TypeScript · Node · Python'],
];

export function AboutBadge() {
  const wrapRef = useRef<HTMLDivElement>(null);
  const rigRef = useRef<HTMLDivElement>(null);
  const badgeRef = useRef<HTMLDivElement>(null);
  const s1Ref = useRef<SVGPathElement>(null);
  const s2Ref = useRef<SVGPathElement>(null);
  const clipRef = useRef<SVGRectElement>(null);
  const [flipped, setFlipped] = useState(false);
  const visible = useInView(wrapRef);

  // Estado de la física fuera de React: se actualiza cada frame.
  const phys = useRef({
    p: { x: AX + 60, y: AY + 150 - 40 },
    v: { x: 0, y: 0 },
    off: { x: 0, y: 0 },
    dragging: false,
    moved: 0,
    ang: 0,
  });

  useEffect(() => {
    if (!visible) return;
    const badge = badgeRef.current;
    const s1 = s1Ref.current;
    const s2 = s2Ref.current;
    const clip = clipRef.current;
    if (!badge || !s1 || !s2 || !clip) return;
    const reduced = prefersReducedMotion();
    const narrow = window.matchMedia('(max-width: 820px)');
    const st = phys.current;
    let raf = 0;

    const tick = () => {
      const LEN = narrow.matches ? 100 : 150; // cinta más corta en móvil
      const restX = AX;
      const restY = AY + LEN;
      const { p, v } = st;
      if (!st.dragging) {
        // muelle suave hacia el reposo + gravedad (G/K ≈ 11 px de caída en reposo);
        // la cuerda no se estira más de LEN*1.9 y la velocidad tiene tope
        const K = 0.016;
        const G = 0.18;
        const DAMP = 0.9;
        const VMAX = 14;
        v.x = (v.x + (restX - p.x) * K) * DAMP;
        v.y = (v.y + (restY - p.y) * K + G) * DAMP;
        const speed = Math.hypot(v.x, v.y);
        if (speed > VMAX) {
          v.x *= VMAX / speed;
          v.y *= VMAX / speed;
        }
        if (reduced) {
          p.x = restX;
          p.y = restY;
        } else {
          p.x += v.x;
          p.y += v.y;
        }
      }
      const dx = p.x - AX;
      const dy = p.y - AY;
      const d = Math.hypot(dx, dy);
      const max = LEN * 1.9;
      if (d > max) {
        p.x = AX + (dx / d) * max;
        p.y = AY + (dy / d) * max;
      }
      const target = Math.atan2(-(p.x - AX), p.y - AY) * 0.9 + v.x * -0.02;
      st.ang += (target - st.ang) * 0.25;
      const deg = (reduced ? 0 : (st.ang * 180) / Math.PI);
      badge.style.transform = `translate(${p.x - BW / 2}px,${p.y}px) rotate(${deg}deg)`;
      badge.style.transformOrigin = '50% 0';
      // cinta: curva desde el ancla hasta la pinza
      const mx = (AX + p.x) / 2 + (p.x - AX) * 0.1;
      const my = (AY + p.y) / 2 + 20;
      const path = `M${AX} ${AY} Q${mx} ${my} ${p.x} ${p.y - 8}`;
      s1.setAttribute('d', path);
      s2.setAttribute('d', path);
      clip.setAttribute('transform', `translate(${p.x - 17} ${p.y - 16}) rotate(${deg} 17 16)`);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [visible]);

  const rel = (e: PointerEvent) => {
    const r = rigRef.current!.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };

  const onPointerDown = (e: PointerEvent<HTMLDivElement>) => {
    const st = phys.current;
    const q = rel(e);
    st.dragging = true;
    st.moved = 0;
    st.off = { x: q.x - st.p.x, y: q.y - st.p.y };
    e.currentTarget.setPointerCapture(e.pointerId);
  };

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    const badge = e.currentTarget;
    const r = badge.getBoundingClientRect();
    badge.style.setProperty('--gx', ((e.clientX - r.left) / r.width) * 100 + '%');
    badge.style.setProperty('--gy', ((e.clientY - r.top) / r.height) * 100 + '%');
    const st = phys.current;
    if (!st.dragging) return;
    const q = rel(e);
    const nx = q.x - st.off.x;
    const ny = q.y - st.off.y;
    st.moved += Math.abs(nx - st.p.x) + Math.abs(ny - st.p.y);
    st.v.x = nx - st.p.x;
    st.v.y = ny - st.p.y;
    st.p.x = nx;
    st.p.y = ny;
  };

  const onPointerUp = () => {
    const st = phys.current;
    st.dragging = false;
    // soltar con la mitad de la inercia del arrastre: evita el latigazo
    st.v.x *= 0.5;
    st.v.y *= 0.5;
    if (st.moved < 6) setFlipped((f) => !f);
  };

  const onKeyDown = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      setFlipped((f) => !f);
      phys.current.v.x += 4;
    }
  };

  return (
    <div ref={wrapRef} className="ab-wrap">
      <div ref={rigRef} className="ab-rig">
        <svg aria-hidden="true">
          <defs>
            <linearGradient id="ab-strap" x1="0" x2="1">
              <stop offset="0" stopColor="#3a3b42" />
              <stop offset=".5" stopColor="#c9ccd8" />
              <stop offset="1" stopColor="#3a3b42" />
            </linearGradient>
          </defs>
          <path ref={s1Ref} stroke="#2c2d33" strokeWidth="14" fill="none" strokeLinecap="round" />
          <path ref={s2Ref} stroke="rgba(223,225,236,.45)" strokeWidth="2" fill="none" strokeDasharray="1 0" />
          <rect ref={clipRef} width="34" height="22" rx="6" fill="#8c8e9e" stroke="#dfe1ec" strokeWidth="1" />
        </svg>
        <div
          ref={badgeRef}
          className={`ab-badge${flipped ? ' flipped' : ''}`}
          tabIndex={0}
          role="button"
          aria-label="Credencial de Nico. Pulsa para darle la vuelta"
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={() => {
            phys.current.dragging = false;
          }}
          onKeyDown={onKeyDown}
        >
          <div className="ab-inner">
            <div className="ab-face ab-front r4-glass">
              <div className="ab-slot" />
              <div className="ab-top">
                <img src={logo404} alt="404" />
                <span className="ab-id">ID · 404-NC</span>
              </div>
              <div className="ab-photo">
                <img src={nicoImg} alt="Foto de Nico" draggable={false} />
              </div>
              <div className="ab-name r4-frost-text">Nico</div>
              <div className="ab-role">Developer · QA · Workflows con IA</div>
              <div className="ab-live">Disponible para proyectos</div>
            </div>
            <div className="ab-face ab-back r4-glass">
              <div className="ab-slot" />
              <h3>reality404 · acceso total</h3>
              <dl>
                {BACK_ROWS.map(([k, v]) => (
                  <div key={k} style={{ display: 'contents' }}>
                    <dt>{k}</dt>
                    <dd>{v}</dd>
                  </div>
                ))}
              </dl>
              <div className="ab-bars" />
            </div>
          </div>
        </div>
      </div>
      <div className="ab-copy">
        <div className="r4-eyebrow">Sobre mí</div>
        <h2 className="r4-title ab-title">
          Lo que se lanza,
          <br />
          funciona de verdad.
        </h2>
        <p>
          Soy <strong>developer</strong> con foco en calidad. Trabajo el ciclo completo: escribo
          código, hago <strong>QA</strong> y aseguro que lo que se lanza funciona de verdad.
        </p>
        <p>
          Diseño y automatizo <strong>workflows</strong> y aprovecho la <strong>IA</strong> para
          acelerar cada etapa del desarrollo sin perder control ni criterio.
        </p>
        <div className="r4-hint">Tira de la credencial · clic para ver el reverso</div>
      </div>
    </div>
  );
}
