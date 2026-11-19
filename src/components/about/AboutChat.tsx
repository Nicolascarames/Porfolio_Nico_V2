import { useCallback, useEffect, useRef, useState, type FormEvent } from 'react';
import { prefersReducedMotion } from '../../hooks/useReducedMotion';
import { sendContact } from '../../hooks/useContactSubmit';
import { createTerminalAi, terminalAiAvailable } from '../../lib/terminalAi';
import type { ChatLlmBridge } from '../../lib/chat-llm-bridge/chat-client';
import nicoImg from '../../assets/profile/nico.png?w=200&format=webp';
import '../contact/contact.css';
import './about.css';

/** Chat con la IA de Nico, con el aspecto de ContactChat. Sin mensaje de bienvenida. */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const ERR_AI = 'IA no disponible ahora mismo. Si quieres contactar, usa el formulario de Contacto.';

interface Msg {
  id: number;
  who: 'bot' | 'me';
  text: string;
  error?: boolean;
}

let nextId = 0;
const mk = (who: Msg['who'], text: string, error?: boolean): Msg => ({ id: nextId++, who, text, error });

export function AboutChat() {
  const logRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const [msgs, setMsgs] = useState<Msg[]>([]);
  const [value, setValue] = useState('');
  const [stream, setStream] = useState<string | null>(null); // '' = esperando primer token
  const busyRef = useRef(false);
  const refocusRef = useRef(false);
  const bridgeRef = useRef<ChatLlmBridge | null>(null);

  useEffect(() => {
    const el = logRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [msgs, stream]);

  const busy = stream !== null;
  // Al reaparecer el formulario recupera el foco solo si lo tenia (sin robar el de la pagina).
  useEffect(() => {
    if (!busy && refocusRef.current) {
      refocusRef.current = false;
      inputRef.current?.focus({ preventScroll: true });
    }
  }, [busy]);

  const push = useCallback((m: Msg) => setMsgs((cur) => [...cur, m]), []);

  const getBridge = useCallback(() => {
    if (!bridgeRef.current) {
      const reduced = prefersReducedMotion();
      bridgeRef.current = createTerminalAi({
        integrationId: 'nico-chat',
        onText: (d) => {
          if (!reduced) setStream((cur) => (cur ?? '') + d);
        },
        onDone: (full) => {
          busyRef.current = false;
          setStream(null);
          const text = full.trim();
          push(text ? mk('bot', text) : mk('bot', ERR_AI, true));
        },
        onError: () => {
          busyRef.current = false;
          setStream(null);
          push(mk('bot', ERR_AI, true));
        },
        handlers: {
          contact_owner: async ({ name, email, message }) => {
            const n = String(name ?? '').trim();
            const e = String(email ?? '').trim();
            const m = String(message ?? '').trim();
            if (!n || !EMAIL_RE.test(e) || !m) {
              return 'Faltan datos válidos (nombre, email o mensaje) para enviar el aviso.';
            }
            const ok = await sendContact({ name: n, email: e, message: m });
            return ok ? 'Aviso enviado a Nico.' : 'No se pudo enviar el aviso.';
          },
        },
      });
    }
    return bridgeRef.current;
  }, [push]);

  const handleSubmit = (ev: FormEvent) => {
    ev.preventDefault();
    const text = value.trim();
    if (!text || busyRef.current) return;
    setValue('');
    push(mk('me', text));
    if (!terminalAiAvailable) {
      push(mk('bot', ERR_AI, true));
      return;
    }
    busyRef.current = true;
    refocusRef.current = document.activeElement === inputRef.current;
    setStream('');
    void getBridge().send(text);
  };

  return (
    <div className="cc-wrap">
      <div className="cc-chat ac-chat r4-glass">
        <div className="cc-top">
          <div className="cc-av">
            <img src={nicoImg} alt="" />
          </div>
          <div>
            <b>Nico</b>
            <small>en línea</small>
          </div>
        </div>
        <div className="cc-log" ref={logRef} aria-live="polite">
          {msgs.map((m) => (
            <div key={m.id} className={`cc-msg ${m.who === 'bot' ? 'cc-bot' : 'cc-me'}`}>
              {m.error ? <span className="cc-hint-err">{m.text}</span> : m.text}
            </div>
          ))}
          {stream !== null && (
            <div className="cc-msg cc-bot">
              {stream === '' ? (
                <span className="cc-typing" aria-label="Nico está escribiendo">
                  <i />
                  <i />
                  <i />
                </span>
              ) : (
                stream
              )}
            </div>
          )}
        </div>
        {!busy && (
          <form className="cc-bar" onSubmit={handleSubmit} noValidate>
            <input
              ref={inputRef}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              placeholder="Escribe para hablar con la IA…"
              autoComplete="off"
              aria-label="Tu mensaje"
            />
            <button className="r4-btn" aria-label="Enviar">
              &#8593;
            </button>
          </form>
        )}
      </div>
    </div>
  );
}
