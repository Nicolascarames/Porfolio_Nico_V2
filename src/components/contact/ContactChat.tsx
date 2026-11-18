import { useEffect, useRef, useState, type FormEvent } from 'react';
import { useContactSubmit, CONTACT_ERROR_MESSAGE, type ContactData } from '../../hooks/useContactSubmit';
import { useInView } from '../../hooks/useInView';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import nicoImg from '../../assets/profile/nico.png?w=200&format=webp';
import './contact.css';

/**
 * Formulario como conversación: Nico pregunta campo a campo. Port de
 * Diseño_claude_desing/reality404-v2/components/ContactChat/preview.html.
 */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const TYPING_MS = 700;
const NEXT_MS = 250;

interface Step {
  key: keyof ContactData;
  ask: (data: Partial<ContactData>) => string;
  ph: string;
  type?: string;
  autoComplete: string;
  quick?: string[];
  check: (v: string) => true | string;
}

const STEPS: Step[] = [
  {
    key: 'name',
    ask: () => '¡Hola! Soy Nico. ¿Cómo te llamas?',
    ph: 'Tu nombre',
    autoComplete: 'name',
    check: (v) => v.length > 1 || 'Dime al menos un nombre corto.',
  },
  {
    key: 'email',
    ask: (d) => `Encantado, ${d.name}. ¿A qué email te respondo?`,
    ph: 'tucorreo@ejemplo.com',
    type: 'email',
    autoComplete: 'email',
    check: (v) => EMAIL_RE.test(v) || 'Ese email no parece válido, ¿lo revisas?',
  },
  {
    key: 'message',
    ask: () => '¿Qué tienes en mente? Cuéntame tu idea o proyecto.',
    ph: 'Tu mensaje…',
    autoComplete: 'off',
    quick: ['Una web', 'Una app con IA', 'Automatizar un flujo', 'Solo saludar'],
    check: (v) => v.length > 2 || 'Cuéntame un poco más.',
  },
];

type Msg =
  | { id: number; who: 'bot'; kind: 'typing' }
  | { id: number; who: 'bot'; kind: 'text' | 'error'; text: string }
  | { id: number; who: 'bot'; kind: 'summary'; data: ContactData }
  | { id: number; who: 'bot'; kind: 'received'; email: string }
  | { id: number; who: 'me'; kind: 'text'; text: string; step: number | null };

type DistOmit<T> = T extends unknown ? Omit<T, 'id'> : never;
type MsgBody = DistOmit<Msg>;

export function ContactChat() {
  const { status, submit, reset } = useContactSubmit();
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const inView = useInView(logRef, { once: true });

  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [step, setStep] = useState(0);
  const [value, setValue] = useState('');
  const [disabled, setDisabled] = useState(true);
  const [quick, setQuick] = useState<'none' | 'review' | string[]>('none');
  const [focusNonce, setFocusNonce] = useState(0);

  // Estado imperativo que usan los temporizadores (evita cierres obsoletos)
  const dataRef = useRef<Partial<ContactData>>({});
  const stepRef = useRef(0);
  const nextId = useRef(1);
  const busy = useRef(false);
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

  // Mantiene el registro abajo sin mover la página
  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs]);

  useEffect(() => {
    if (focusNonce) inputRef.current?.focus({ preventScroll: true });
  }, [focusNonce]);

  function later(fn: () => void, ms: number) {
    timers.current.push(window.setTimeout(() => mounted.current && fn(), ms));
  }

  function add(body: MsgBody): number {
    const id = nextId.current++;
    setMsgs((m) => [...m, { ...body, id } as Msg]);
    return id;
  }

  function replace(id: number, body: MsgBody) {
    setMsgs((m) => m.map((x) => (x.id === id ? ({ ...body, id } as Msg) : x)));
  }

  /** Nico "escribe…" 700 ms y después dice el mensaje. */
  function botSay(body: MsgBody, cb?: () => void) {
    busy.current = true;
    const id = add({ who: 'bot', kind: 'typing' });
    later(
      () => {
        replace(id, body);
        busy.current = false;
        cb?.();
      },
      prefersReducedMotion() ? 0 : TYPING_MS,
    );
  }

  function ask() {
    setStep(stepRef.current);
    setQuick('none');
    if (stepRef.current >= STEPS.length) return review();
    const s = STEPS[stepRef.current];
    setDisabled(false);
    botSay({ who: 'bot', kind: 'text', text: s.ask(dataRef.current) }, () => {
      setQuick(s.quick ?? 'none');
      setFocusNonce((n) => n + 1);
    });
  }

  function review() {
    setDisabled(true);
    botSay({ who: 'bot', kind: 'summary', data: dataRef.current as ContactData }, () => setQuick('review'));
  }

  function answer(raw: string) {
    if (stepRef.current >= STEPS.length || busy.current) return;
    const v = raw.trim();
    const s = STEPS[stepRef.current];
    const ok = s.check(v);
    if (ok !== true) {
      botSay({ who: 'bot', kind: 'error', text: ok });
      return;
    }
    const k = stepRef.current;
    dataRef.current = { ...dataRef.current, [s.key]: v };
    setValue('');
    setDisabled(true);
    setQuick('none');
    add({ who: 'me', kind: 'text', text: v, step: k });
    stepRef.current = k + 1;
    later(ask, NEXT_MS);
  }

  function edit(k: number) {
    if (busy.current || status === 'sending' || status === 'sent') return;
    stepRef.current = k;
    setStep(k);
    setQuick('none');
    setValue(dataRef.current[STEPS[k].key] ?? '');
    setDisabled(false);
    setFocusNonce((n) => n + 1);
  }

  async function send() {
    setQuick('none');
    add({ who: 'me', kind: 'text', text: 'Enviar', step: null });
    const id = add({ who: 'bot', kind: 'typing' });
    busy.current = true;
    const data = dataRef.current as ContactData;
    const ok = await submit(data);
    if (!mounted.current) return;
    busy.current = false;
    if (ok) {
      replace(id, { who: 'bot', kind: 'received', email: data.email });
    } else {
      replace(id, { who: 'bot', kind: 'error', text: CONTACT_ERROR_MESSAGE });
      setQuick('review'); // permite reintentar
    }
  }

  function restart() {
    setMsgs([]);
    dataRef.current = {};
    stepRef.current = 0;
    setValue('');
    reset();
    ask();
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    answer(value);
  }

  useEffect(() => {
    if (inView && !started.current) {
      started.current = true;
      ask();
    }
    // ask() solo usa refs y setters: arranca una única vez al entrar en pantalla
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  const current = STEPS[Math.min(step, STEPS.length - 1)];
  const locked = status === 'sending' || status === 'sent';

  return (
    <div className="cc-wrap">
      <div className="cc-chat r4-glass">
        <div className="cc-top">
          <div className="cc-av">
            <img src={nicoImg} alt="" />
          </div>
          <div>
            <b>Nico</b>
            <small>Disponible para proyectos</small>
          </div>
          <div className="cc-prog" aria-hidden="true">
            {STEPS.map((s, i) => (
              <i key={s.key} className={i < step ? 'on' : ''} />
            ))}
          </div>
        </div>
        <div className="cc-log" ref={logRef} aria-live="polite">
          {msgs.map((m) => (
            <div key={m.id} className={`cc-msg ${m.who === 'bot' ? 'cc-bot' : 'cc-me'}`}>
              {m.kind === 'typing' && (
                <span className="cc-typing" aria-label="Nico está escribiendo">
                  <i />
                  <i />
                  <i />
                </span>
              )}
              {m.kind === 'text' && m.text}
              {m.kind === 'error' && <span className="cc-hint-err">{m.text}</span>}
              {m.kind === 'summary' && (
                <>
                  Perfecto, esto es lo que me llega:
                  <dl className="cc-summary">
                    <dt>NOMBRE</dt>
                    <dd>{m.data.name}</dd>
                    <dt>EMAIL</dt>
                    <dd>{m.data.email}</dd>
                    <dt>MENSAJE</dt>
                    <dd>{m.data.message}</dd>
                  </dl>
                </>
              )}
              {m.kind === 'received' && (
                <>
                  ¡Recibido! Te escribo muy pronto a <b>{m.email}</b>.
                </>
              )}
              {m.who === 'me' && m.step !== null && !locked && (
                <button type="button" onClick={() => edit(m.step as number)}>
                  editar
                </button>
              )}
            </div>
          ))}
        </div>
        <div className="cc-quick">
          {Array.isArray(quick) &&
            quick.map((q) => (
              <button key={q} type="button" className="r4-btn-ghost cc-qbtn" onClick={() => answer(q)}>
                {q}
              </button>
            ))}
          {quick === 'review' && (
            <>
              <button type="button" className="r4-btn cc-qbtn cc-qsend" onClick={send}>
                Enviar
              </button>
              <button type="button" className="r4-btn-ghost cc-qbtn" onClick={restart}>
                Empezar de nuevo
              </button>
            </>
          )}
        </div>
        <form className="cc-bar" onSubmit={handleSubmit} noValidate>
          <input
            ref={inputRef}
            value={value}
            onChange={(e) => setValue(e.target.value)}
            type={current.type ?? 'text'}
            placeholder={disabled ? '' : current.ph}
            disabled={disabled}
            autoComplete={current.autoComplete}
            aria-label="Tu respuesta"
          />
          <button className="r4-btn" aria-label="Enviar" disabled={disabled}>
            &#8593;
          </button>
        </form>
      </div>
    </div>
  );
}
