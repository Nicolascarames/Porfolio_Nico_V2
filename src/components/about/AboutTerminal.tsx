import { useCallback, useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { projects } from '../../data/projects';
import { tech } from '../../data/tech';
import { useInView } from '../../hooks/useInView';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { scrollToId } from '../../lib/scroll';
import { createTerminalAi, terminalAiAvailable } from '../../lib/terminalAi';
import type { ChatLlmBridge } from '../../lib/chat-llm-bridge/chat-client';
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
      <Hi>Nico</Hi> — QA Engineer · Automatización · Arquitectura
    </>,
  ],
  'cat sobre-mi.txt': () => [
    <>
      Soy <Hi>QA Engineer</Hi> con más de 3 años en desarrollo, automatización e integraciones.
    </>,
    <>
      Ahora soy Arquitecto de Software en <Hi>Minsait (Indra)</Hi> para Inditex.
    </>,
    <>
      Actúo como <Hi>quality gate</Hi>: reviso, pruebo y valido el código antes de producción.
    </>,
    <>
      Automatizo con <Hi>Python</Hi>, <Hi>TypeScript</Hi> y <Hi>Java</Hi>. E2E con <Hi>Playwright</Hi>.
    </>,
    <>
      Rendimiento con <Hi>k6</Hi> y Grafana. CI/CD con <Hi>GitHub Actions</Hi>.
    </>,
    <>
      Integro con <Hi>IBM ACE</Hi> e <Hi>IBM MQ</Hi>. Preparando ISTQB CTFL.
    </>,
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
      <span className="ok">●</span> QA Engineer en Minsait (Indra) · Preparando ISTQB CTFL · A Coruña, ES
    </>,
  ],
  help: () => [
    'comandos: whoami · cat sobre-mi.txt · ls stack/ · ls proyectos/ · status · contacto · clear',
    <>
      también puedes <Hi>preguntarme lo que quieras</Hi>: escribe una frase y te responde la IA.
    </>,
  ],
  contacto: () => [
    <>
      → baja a <Hi>#contacto</Hi> o escribe <Hi>hola</Hi> en el formulario 404
    </>,
  ],
};

const NO_AI = 'IA no disponible ahora mismo';
const notFound = () => (
  <>
    comando no encontrado — error 404, prueba <Hi>help</Hi>
  </>
);

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
  const [stream, setStream] = useState<string | null>(null); // texto de la IA en curso ('' = pensando)
  const busyRef = useRef(false);
  const bridgeRef = useRef<ChatLlmBridge | null>(null);
  const visible = useInView(outRef, { once: true });

  // Mantiene la salida pegada al final (sin scrollIntoView: no mueve la página).
  useEffect(() => {
    const el = outRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, typing, stream]);

  const print = useCallback((...ls: Line[]) => setLines((cur) => [...cur, ...ls]), []);

  const getBridge = useCallback(() => {
    if (!bridgeRef.current) {
      const reduced = prefersReducedMotion();
      bridgeRef.current = createTerminalAi({
        // Con movimiento reducido no se pinta progresivo: solo el texto final.
        onText: (d) => {
          if (!reduced) setStream((cur) => (cur ?? '') + d);
        },
        onDone: (full) => {
          busyRef.current = false;
          setStream(null);
          const text = full.trim();
          if (text) print(...text.split(String.fromCharCode(10)).map((l) => mk(l.trim() || String.fromCharCode(160), 'ai')));
          else print(mk(notFound()), mk(NO_AI));
        },
        onError: () => {
          busyRef.current = false;
          setStream(null);
          print(mk(notFound()), mk(NO_AI));
        },
      });
    }
    return bridgeRef.current;
  }, [print]);

  const askAi = useCallback(
    (prompt: string) => {
      if (busyRef.current) return; // rate-limit: un turno a la vez
      if (!terminalAiAvailable) {
        print(mk(notFound()), mk(NO_AI));
        return;
      }
      busyRef.current = true;
      setStream('');
      void getBridge().send(prompt);
    },
    [getBridge, print],
  );

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
      const known = CMDS[key];
      if (!known) {
        askAi(cmd);
        return;
      }
      print(...known().map((n) => mk(n)));
    },
    [print, askAi],
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
          {stream !== null && (
            <div className="ln ai">
              {stream === '' ? (
                <span className="at-think">pensando<span className="at-caret" /></span>
              ) : (
                <>
                  {stream}
                  <span className="at-caret" />
                </>
              )}
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
