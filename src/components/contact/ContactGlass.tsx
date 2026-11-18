import { useRef, useState, type FormEvent, type PointerEvent } from 'react';
import { useContactSubmit } from '../../hooks/useContactSubmit';
import logo404 from '../../assets/brand/logo-404-horizontal.png';
import './contact.css';

/**
 * Formulario de vidrio con etiquetas flotantes y borde cromado que sigue al
 * cursor. Port de Diseño_claude_desing/reality404-v2/components/ContactGlass/preview.html.
 */

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export function ContactGlass() {
  const { status, error, submit, reset } = useContactSubmit();
  const formRef = useRef<HTMLFormElement>(null);
  const [badEmail, setBadEmail] = useState(false);

  function handlePointerMove(e: PointerEvent<HTMLFormElement>) {
    const f = e.currentTarget;
    const r = f.getBoundingClientRect();
    f.style.setProperty('--mx', `${e.clientX - r.left}px`);
    f.style.setProperty('--my', `${e.clientY - r.top}px`);
  }

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    if (status === 'sending') return;
    const els = form.elements;
    const nameEl = els.namedItem('name') as HTMLInputElement;
    const emailEl = els.namedItem('email') as HTMLInputElement;
    const msgEl = els.namedItem('message') as HTMLTextAreaElement;
    const name = nameEl.value.trim();
    const email = emailEl.value.trim();
    const message = msgEl.value.trim();
    const bad = !EMAIL_RE.test(email);
    setBadEmail(bad);
    // el primer campo inválido recibe el foco (sin mover la página)
    const firstInvalid = !name ? nameEl : bad ? emailEl : !message ? msgEl : null;
    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      return;
    }
    const ok = await submit({ name, email, message });
    if (ok) form.reset();
  }

  function handleAgain() {
    formRef.current?.reset();
    setBadEmail(false);
    reset();
  }

  const sending = status === 'sending';
  const sent = status === 'sent';

  return (
    <div className="cg">
      <div className="cg-head">
        <div className="r4-eyebrow">Contacto</div>
        <h2 className="r4-title cg-title">Hablemos</h2>
        <p className="cg-sub">Cuéntame tu idea y te respondo pronto.</p>
      </div>
      <form
        ref={formRef}
        className={`cg-form r4-glass${sending ? ' sending' : ''}${sent ? ' sent' : ''}`}
        noValidate
        onPointerMove={handlePointerMove}
        onSubmit={handleSubmit}
      >
        <div className="cg-field">
          <input id="cg-n" name="name" placeholder=" " required autoComplete="name" />
          <label htmlFor="cg-n">Nombre</label>
        </div>
        <div className={`cg-field${badEmail ? ' bad' : ''}`}>
          <input
            id="cg-e"
            name="email"
            type="email"
            placeholder=" "
            required
            autoComplete="email"
            aria-invalid={badEmail}
          />
          <label htmlFor="cg-e">Email</label>
          <div className="cg-err">Ese email no parece válido.</div>
        </div>
        <div className="cg-field">
          <textarea id="cg-m" name="message" placeholder=" " required />
          <label htmlFor="cg-m">Mensaje</label>
        </div>
        <button className="r4-btn cg-send" type="submit" disabled={sending}>
          <span className="cg-lbl">Enviar mensaje</span>
          <span className="cg-orb" aria-hidden="true">
            <span>404</span>
          </span>
        </button>
        {status === 'error' && error && (
          <p className="cg-fail" role="alert">
            {error}
          </p>
        )}
        <div className="cg-done" role="status" aria-hidden={!sent}>
          <img src={logo404} alt="" />
          <strong>Mensaje encontrado.</strong>
          <span className="cg-done-sub">Gracias, te responderé muy pronto.</span>
          <button type="button" className="r4-btn-ghost" tabIndex={sent ? 0 : -1} onClick={handleAgain}>
            Enviar otro
          </button>
        </div>
      </form>
    </div>
  );
}
