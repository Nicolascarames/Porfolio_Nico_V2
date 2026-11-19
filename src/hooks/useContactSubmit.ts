import { useCallback, useState } from 'react';

export type ContactStatus = 'idle' | 'sending' | 'sent' | 'error';

export interface ContactData {
  name: string;
  email: string;
  message: string;
}

/** Mismo texto de error que el ContactForm original. */
export const CONTACT_ERROR_MESSAGE =
  'Algo falló al enviar el mensaje. Inténtalo de nuevo o escríbeme directamente.';

/** POST /api/contact con { name, email, message }; true si el servidor responde 2xx. */
export async function sendContact(data: ContactData): Promise<boolean> {
  try {
    const res = await fetch('/api/contact', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ name: data.name, email: data.email, message: data.message }),
    });
    return res.ok;
  } catch {
    return false;
  }
}

/**
 * Envío del formulario de contacto: POST /api/contact con { name, email, message }
 * (misma petición y manejo de errores que ContactForm.tsx). Lo comparten las
 * tres variantes de Contacto.
 */
export function useContactSubmit() {
  const [status, setStatus] = useState<ContactStatus>('idle');
  const [error, setError] = useState<string | null>(null);

  const submit = useCallback(async (data: ContactData): Promise<boolean> => {
    setStatus('sending');
    setError(null);
    const ok = await sendContact(data);
    setStatus(ok ? 'sent' : 'error');
    if (!ok) setError(CONTACT_ERROR_MESSAGE);
    return ok;
  }, []);

  const reset = useCallback(() => {
    setStatus('idle');
    setError(null);
  }, []);

  return { status, error, submit, reset };
}
