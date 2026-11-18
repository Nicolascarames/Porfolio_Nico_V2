import { useEffect, useRef, useState, type KeyboardEvent, type ReactNode } from 'react';
import { useContactSubmit, CONTACT_ERROR_MESSAGE, type ContactData } from '../../hooks/useContactSubmit';
import { useInView } from '../../hooks/useInView';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import logo404 from '../../assets/brand/logo-404-horizontal.png';
import './contact.css';

/**
 * Terminal 404: tres preguntas y confirmación [s/n] antes del POST. Port de
 * Diseño_claude_desing/reality404-v2/components/ContactTerminal/preview.html.
 */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const BOOT_MS = 380;
const SEND_MS = 1300;

const Q: { key: keyof ContactData; label: string; check: (v: string) => boolean; err: string }[] = [
  { key: 'name', label: 'nombre', check: (v) => v.length > 1, err: 'necesito al menos 2 caracteres' },
  { key: 'email', label: 'email', check: (v) => EMAIL_RE.test(v), err: 'formato de email inválido' },
  { key: 'message', label: 'mensaje', check: (v) => v.length > 2, err: 'el mensaje está vacío' },
];

interface Line {
  id: number;
  cls: string;
  node: ReactNode;
}

interface Prompt {
  id: number;
  label: string;
  cb: (v: string) => void;
}

/** Barra de progreso cromada: se llena al montarse. */
function ProgressLine() {
  const [full, setFull] = useState(prefersReducedMotion());
  useEffect(() => {
    const raf = requestAnimationFrame(() => setFull(true));
    return () => cancelAnimationFrame(raf);
  }, []);
  return (
    <div className="ct-bar2" aria-hidden="true">
      <i style={{ width: full ? '100%' : 0 }} />
    </div>
  );
}

export function ContactTerminal() {
  const { submit, reset } = useContactSubmit();
  const outRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inView = useInView(outRef, { once: true });

  const [lines, setLines] = useState<Line[]>([]);
  const [active, setActive] = useState<Prompt | null>(null);

  const dataRef = useRef<Partial<ContactData>>({});
  const nextId = useRef(1);
  const started = useRef(false);
  const mounted = useRef(true);
  const timers = useRef<number[]>([]);

  useEffect(() => {
    mounted.current = true;
    const pending = timers.current;
    return () => {
      mounted.current = false;
      pending.forEach((t) => window.clearTimeout(t));
    };
  }, []);

  // Mantiene la terminal abajo sin mover la página
  useEffect(() => {
    const el = outRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [lines, active]);

  useEffect(() => {
    if (active) inputRef.current?.focus({ preventScroll: true });
  }, [active]);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(() => mounted.current && fn(), ms));
  }

  function print(node: ReactNode, cls = '') {
    setLines((l) => [...l, { id: nextId.current++, cls, node }]);
  }

  function prompt(label: string, cb: (v: string) => void) {
    setActive({ id: nextId.current++, label, cb });
  }

  function onKeyDown(e: KeyboardEvent<HTMLInputElement>) {
    if (e.key !== 'Enter' || !active) return;
    const v = e.currentTarget.value.trim();
    const { label, cb } = active;
    setActive(null);
    print(
      <>
        <span className="ps">{label} ›</span> <span className="hi">{v}</span>
      </>,
      'ct-line',
    );
    cb(v);
  }

  function ask(k: number) {
    if (k >= Q.length) return confirm();
    const q = Q[k];
    prompt(q.label, (v) => {
      if (!q.check(v)) {
        print(<span className="err">✕ {q.err}</span>);
        return ask(k);
      }
      dataRef.current = { ...dataRef.current, [q.key]: v };
      ask(k + 1);
    });
  }

  function confirm() {
    print(' ');
    print(
      <>
        enviar mensaje a nico? <span className="hi">[s/n]</span>
      </>,
    );
    prompt('', (v) => {
      if (/^s/i.test(v)) return post();
      print('cancelado. empecemos de nuevo.');
      ask(0);
    });
  }

  async function post() {
    const data = dataRef.current as ContactData;
    print(<span className="glitch">POST /api/contact</span>);
    print(<ProgressLine />);
    const [ok] = await Promise.all([
      submit(data),
      new Promise<void>((res) => later(res, prefersReducedMotion() ? 0 : SEND_MS)),
    ]);
    if (!mounted.current) return;
    if (!ok) {
      print(<span className="err">✕ {CONTACT_ERROR_MESSAGE.toLowerCase()}</span>);
      print('puedes reintentarlo:');
      return confirm();
    }
    print(
      <>
        <span className="ok">200 OK</span> · mensaje encontrado. gracias, {data.name} — te respondo a {data.email}
      </>,
    );
    print(
      <>
        escribe <span className="hi">otra</span> para enviar otro
      </>,
    );
    again();
  }

  function again() {
    prompt('$', (w) => {
      if (w === 'otra') {
        setLines([]);
        dataRef.current = {};
        reset();
        boot();
      } else {
        again();
      }
    });
  }

  function boot() {
    const rows: ReactNode[] = [
      <span className="err">GET /mensaje → 404 Not Found</span>,
      'nadie ha escrito aún. vamos a crearlo:',
      ' ',
    ];
    let i = 0;
    const next = () => {
      if (i < rows.length) {
        print(rows[i++]);
        later(next, prefersReducedMotion() ? 0 : BOOT_MS);
      } else {
        ask(0);
      }
    };
    next();
  }

  useEffect(() => {
    if (inView && !started.current) {
      started.current = true;
      boot();
    }
    // boot() solo usa refs y setters: arranca una única vez al entrar en pantalla
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  return (
    <div className="ct-wrap">
      <div className="ct-side">
        <div className="r4-eyebrow">Contacto</div>
        <img src={logo404} alt="404" className="ct-logo" />
        <h2 className="r4-title ct-title">Mensaje no encontrado.</h2>
        <p>Todavía no me has escrito. Arréglalo desde la terminal: tres preguntas y listo.</p>
      </div>
      <div className="ct-term r4-glass">
        <div className="ct-bar">
          <i />
          <i />
          <i />
          <span>nico@reality404: ~/contacto</span>
        </div>
        <div className="ct-out" ref={outRef} aria-live="polite" onClick={() => inputRef.current?.focus({ preventScroll: true })}>
          {lines.map((l) => (
            <div key={l.id} className={l.cls}>
              {l.node}
            </div>
          ))}
          {active && (
            <div className="ct-line">
              <span className="ps">{active.label} ›</span>
              <input
                key={active.id}
                ref={inputRef}
                aria-label={active.label || 'respuesta'}
                autoComplete={active.label === 'email' ? 'email' : active.label === 'nombre' ? 'name' : 'off'}
                spellCheck={false}
                onKeyDown={onKeyDown}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
