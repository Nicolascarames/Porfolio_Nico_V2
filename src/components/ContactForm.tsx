import { useState, type FormEvent } from 'react';

type Status = 'idle' | 'sending' | 'sent' | 'error';

export function ContactForm() {
  const [status, setStatus] = useState<Status>('idle');

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const data = new FormData(form);
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: data.get('name'),
          email: data.get('email'),
          message: data.get('message'),
        }),
      });
      if (!res.ok) throw new Error('request failed');
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  return (
    <section
      id="contacto"
      className="flex justify-center border-t border-white/5 px-5 py-16 sm:px-[60px] sm:py-[120px]"
    >
      <div className="w-full max-w-[560px]">
        <div className="mb-8 text-center">
          <span className="font-display text-xs uppercase tracking-[0.12em] text-neutral-500">
            Contacto
          </span>
          <h2 className="mt-2.5 font-display text-[clamp(28px,4vw,46px)] font-semibold tracking-tighter">
            Hablemos
          </h2>
          <p className="mt-2 text-[15px] text-neutral-400">
            Cuéntame tu idea y te respondo pronto.
          </p>
        </div>
        <form
          onSubmit={handleSubmit}
          className="flex flex-col gap-[18px] rounded-[22px] border border-white/10 bg-white/[0.03] p-[30px] backdrop-blur-md"
        >
          <label className="flex flex-col gap-2 text-[13px] font-semibold text-neutral-300">
            Nombre
            <input
              name="name"
              type="text"
              required
              placeholder="Tu nombre"
              className="rounded-xl border border-neutral-800 bg-bg px-4 py-3.5 text-[15px] text-text focus:border-accent focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-[13px] font-semibold text-neutral-300">
            Email
            <input
              name="email"
              type="email"
              required
              placeholder="tucorreo@ejemplo.com"
              className="rounded-xl border border-neutral-800 bg-bg px-4 py-3.5 text-[15px] text-text focus:border-accent focus:outline-none"
            />
          </label>
          <label className="flex flex-col gap-2 text-[13px] font-semibold text-neutral-300">
            Mensaje
            <textarea
              name="message"
              rows={4}
              required
              placeholder="Cuéntame sobre tu proyecto…"
              className="resize-y rounded-xl border border-neutral-800 bg-bg px-4 py-3.5 text-[15px] text-text focus:border-accent focus:outline-none"
            />
          </label>
          <button
            type="submit"
            disabled={status === 'sending'}
            className="mt-1 rounded-xl bg-accent py-[15px] font-display text-[15px] font-semibold text-bg transition hover:bg-white disabled:opacity-60"
          >
            {status === 'sending' ? 'Enviando…' : 'Enviar mensaje'}
          </button>
          {status === 'sent' && (
            <p className="mt-1 text-center text-sm text-green-400">
              ¡Gracias! Te responderé muy pronto.
            </p>
          )}
          {status === 'error' && (
            <p className="mt-1 text-center text-sm text-red-400">
              Algo falló al enviar el mensaje. Inténtalo de nuevo o escríbeme directamente.
            </p>
          )}
        </form>
      </div>
    </section>
  );
}
