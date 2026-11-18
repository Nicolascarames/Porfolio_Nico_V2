import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { projects } from '../../data/projects';
import { tech } from '../../data/tech';
import { useInView } from '../../hooks/useInView';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { scrollToId } from '../../lib/scroll';
import logo404 from '../../assets/brand/logo-404-cuadrado.png';
import './about.css';

/**
 * Terminal de vidrio que escribe sola una sesión y luego acepta comandos.
 * Port de Diseño_claude_desing/reality404-v2/components/AboutTerminal/preview.html.
 * El texto del visitante se renderiza siempre como nodo de texto de React (escapado).
 */

const ART = ' _  _    ___   _  _\n| || |  / _ \\ | || |\n| || |_| | | || || |_\n|__   _| |_| ||__   _|\n   |_|  \\___/    |_|';

const Hi = ({ children }: { children: ReactNode }) => <span className="hi">{children}</span>;
const PS = <span className="ps">reality404 ~ $ </span>;

const CMDS: Record<string, () => ReactNode[]> = {
  whoami: () => [
    <>
      <Hi>Nico</Hi> — developer, design and workflows with AI
    </>,
  ],
  'cat sobre-mi.txt': () => [
    <>
      Soy <Hi>developer</Hi> con foco en calidad. Trabajo el ciclo completo:
    </>,
    <>
      escribo código, hago <Hi>QA</Hi> y aseguro que lo que se lanza funciona de verdad.
    </>,
    <>
      Diseño y automatizo <Hi>workflows</Hi> y aprovecho la <Hi>IA</Hi> para acelerar
    </>,
    'cada etapa del desarrollo sin perder control ni criterio.',
  ],
  'ls stack/': () => [tech.map((t) => t.name).join('  ')],
  'ls proyectos/': () => [
    <>
      {projects.map((p, i) => (
        <span key={p.title}>
          {i > 0 && '  '}
          <Hi>{p.title}/</Hi>
        </span>
      ))}
    </>,
  ],
  status: () => [
    <>
      <span className="ok">●</span> Disponible para proyectos · A Coruña, ES
    </>,
  ],
  help: () => ['comandos: whoami · cat sobre-mi.txt · ls stack/ · ls proyectos/ · status · contacto · clear'],
  contacto: () => [
    <>
      → baja a <Hi>#contacto</Hi> o escribe <Hi>hola</Hi> en el formulario 404
    </>,
  ],
};

const CHIPS = ['whoami', 'cat sobre-mi.txt', 'ls stack/', 'ls proyectos/', 'status', 'help', 'clear'];
const SCRIPT = ['whoami', 'cat sobre-mi.txt', 'status'];

interface Line {
  id: number;
  node: ReactNode;
  cls?: string;
}

let nextId = 0;
const mk = (node: ReactNode, cls?: string): Line => ({ id: nextId++, node, cls });

export function AboutTerminal() {
  const outRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [lines, setLines] = useState<Line[]>(() => [mk(ART, 'art'), mk('\u00a0')]);
  const [typing, setTyping] = useState<string | null>(null);
  const [value, setValue] = useState('');
  const visible = useInView(outRef, { once: true });

  // Mantiene la salida pegada al final (sin scrollIntoView: no mueve la página).
  useEffect(() => {
    const el = outRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, typing]);

  const print = useCallback((...ls: Line[]) => setLines((cur) => [...cur, ...ls]), []);

  const run = useCallback(
    (raw: string, echo: boolean) => {
      const cmd = raw.trim();
      if (!cmd) return;
      if (echo)
        print(
          mk(
            <>
              {PS}
              <span className="cmd">{cmd}</span>
            </>,
          ),
        );
      const key = cmd.toLowerCase();
      if (key === 'clear') {
        setLines([]);
        return;
      }
      if (key === 'contacto') scrollToId('contacto');
      const out = CMDS[key]?.() ?? [
        <>
          comando no encontrado — error 404, prueba <Hi>help</Hi>
        </>,
      ];
      print(...out.map((n) => mk(n)));
    },
    [print],
  );

  // Intro: sesión escrita sola, arranca al entrar en pantalla.
  useEffect(() => {
    if (!visible) return;
    const reduced = prefersReducedMotion();
    let cancelled = false;
    const timers = new Set<ReturnType<typeof setTimeout>>();
    const later = (fn: () => void, ms: number) => {
      const id = setTimeout(() => {
        timers.delete(id);
        if (!cancelled) fn();
      }, ms);
      timers.add(id);
    };

    if (reduced) {
      // Estado final directo, sin escribir carácter a carácter.
      SCRIPT.forEach((c) => run(c, true));
      print(mk('\u00a0'), mk(<>escribe <Hi>help</Hi> o pulsa un comando ↓</>));
      return;
    }

    let si = 0;
    const typeNext = () => {
      if (si >= SCRIPT.length) {
        print(mk('\u00a0'), mk(<>escribe <Hi>help</Hi> o pulsa un comando ↓</>));
        return;
      }
      const cmd = SCRIPT[si++];
      let k = 0;
      const t = () => {
        if (k <= cmd.length) {
          setTyping(cmd.slice(0, k++));
          later(t, 55 + Math.random() * 40);
        } else {
          setTyping(null);
          run(cmd, true);
          later(typeNext, 500);
        }
      };
      t();
    };
    later(typeNext, 400);

    return () => {
      cancelled = true;
      timers.forEach(clearTimeout);
      setTyping(null);
    };
  }, [visible, run, print]);

  const onKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key !== 'Enter') return;
    const v = value;
    setValue('');
    run(v, true);
  };

  return (
    <div className="at-wrap">
      <div className="at-term r4-glass">
        <div className="at-bar">
          <i />
          <i />
          <i />
          <span>nico@reality404: ~/sobre-mi</span>
          <img src={logo404} alt="" />
        </div>
        <div
          ref={outRef}
          className="at-out"
          aria-live="polite"
          onClick={() => inputRef.current?.focus({ preventScroll: true })}
        >
          {lines.map((l) => (
            <div key={l.id} className={`ln${l.cls ? ' ' + l.cls : ''}`}>
              {l.node}
            </div>
          ))}
          {typing !== null && (
            <div className="ln">
              {PS}
              <span className="cmd">{typing}</span>
              <span className="at-caret" />
            </div>
          )}
          <div className="at-line">
            {PS}
            <input
              ref={inputRef}
              aria-label="Escribe un comando"
              autoComplete="off"
              spellCheck={false}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={onKeyDown}
            />
          </div>
        </div>
        <div className="at-chips">
          {CHIPS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                run(c, true);
                inputRef.current?.focus({ preventScroll: true });
              }}
            >
              {c}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
