import { useEffect, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { projects } from '../../data/projects';
import { tech } from '../../data/tech';
import { useInView } from '../../hooks/useInView';
import { useReducedMotion } from '../../hooks/useReducedMotion';
import nicoImg from '../../assets/profile/nico.png?w=700&format=webp';
import logo404 from '../../assets/brand/logo-404-cuadrado.png';
import './about.css';

/**
 * Bento de vidrio con la información en piezas. Port de
 * Diseño_claude_desing/reality404-v2/components/AboutBento/preview.html.
 */

const STEPS = ['Código', 'QA', 'CI/CD', 'Lanzar'];
const fmt = new Intl.DateTimeFormat('es-ES', {
  timeZone: 'Europe/Madrid',
  hour: '2-digit',
  minute: '2-digit',
  second: '2-digit',
});

/** Celda de vidrio con brillo radial que sigue al cursor. */
function Cell({ className = '', children }: { className?: string; children: ReactNode }) {
  const onMove = (e: PointerEvent<HTMLDivElement>) => {
    const el = e.currentTarget;
    const r = el.getBoundingClientRect();
    el.style.setProperty('--gx', e.clientX - r.left + 'px');
    el.style.setProperty('--gy', e.clientY - r.top + 'px');
  };
  return (
    <div className={`abt-cell r4-glass ${className}`} onPointerMove={onMove}>
      {children}
    </div>
  );
}

export function AboutBento() {
  const gridRef = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();
  const seen = useInView(gridRef, { once: true });
  const total = projects.length;
  const [count, setCount] = useState(0);
  const [time, setTime] = useState(() => fmt.format(new Date()));
  const [step, setStep] = useState(0);

  // Reloj en Europe/Madrid.
  useEffect(() => {
    const id = setInterval(() => setTime(fmt.format(new Date())), 1000);
    return () => clearInterval(id);
  }, []);

  // Contador al entrar en pantalla (ease-out cúbico, 900 ms). Con reduced motion, valor final.
  useEffect(() => {
    if (!seen) return;
    if (reduced) {
      setCount(total);
      return;
    }
    let raf = 0;
    const t0 = performance.now();
    const s = (now: number) => {
      const k = Math.min(1, (now - t0) / 900);
      setCount(Math.round(total * (1 - Math.pow(1 - k, 3))));
      if (k < 1) raf = requestAnimationFrame(s);
    };
    raf = requestAnimationFrame(s);
    return () => cancelAnimationFrame(raf);
  }, [seen, reduced, total]);

  // Ciclo de trabajo que se ilumina en bucle (fijo en el primer paso con reduced motion).
  useEffect(() => {
    if (reduced) return;
    const id = setInterval(() => setStep((s) => (s + 1) % STEPS.length), 1200);
    return () => clearInterval(id);
  }, [reduced]);

  return (
    <div>
      <div className="r4-eyebrow">Sobre mí</div>
      <h2 className="r4-title" style={{ fontSize: 'clamp(28px,4vw,38px)', marginTop: 8 }}>
        Nico, en piezas.
      </h2>
      <div ref={gridRef} className="abt-grid">
        <Cell className="abt-photo">
          <img src={nicoImg} alt="Foto de Nico" />
          <div className="abt-tag r4-glass">
            <span>Nico</span>
            <img src={logo404} alt="404" />
          </div>
        </Cell>
        <Cell className="abt-bio">
          <div className="abt-k">bio</div>
          <p>
            Soy <strong>QA Engineer</strong> con perfil SDET y más de 3 años en desarrollo,
            automatización e integraciones. En Inditex (Minsait) soy el <strong>quality gate</strong>{' '}
            de varios equipos: reviso, pruebo y valido su código antes de producción. Automatizo
            con <strong>Playwright</strong>, Python, TypeScript y Java, y uso la <strong>IA</strong>{' '}
            para acelerar cada etapa sin perder control ni criterio.
          </p>
        </Cell>
        <Cell>
          <div className="abt-k">estado</div>
          <div className="abt-live">
            <i />
            Disponible
          </div>
          <div className="abt-sub">para proyectos nuevos</div>
        </Cell>
        <Cell>
          <div className="abt-k">A Coruña · ES</div>
          <div className="abt-clock">{time}</div>
          <div className="abt-sub">hora local</div>
        </Cell>
        <Cell>
          <div className="abt-k">proyectos</div>
          <div className="abt-big r4-frost-text">{count}</div>
        </Cell>
        <Cell className="abt-stack">
          <div className="abt-k">stack diario</div>
          <div className="abt-icons">
            {tech.slice(0, 10).map((t) => (
              <span key={t.name} className="r4-frost-chip" title={t.name}>
                <img alt="" src={t.src} />
              </span>
            ))}
          </div>
        </Cell>
        <Cell className="abt-cycle">
          <div className="abt-k">cómo trabajo</div>
          <div className="abt-steps">
            {STEPS.map((s, i) => (
              <div key={s} style={{ display: 'contents' }}>
                {i > 0 && <span className="abt-arrow">→</span>}
                <div className={`abt-step${i === step ? ' on' : ''}`}>{s}</div>
              </div>
            ))}
          </div>
        </Cell>
      </div>
    </div>
  );
}
