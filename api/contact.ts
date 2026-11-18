import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

// Topes para que nadie use el formulario para mandar correos enormes.
const MAX_NAME = 100;
const MAX_EMAIL = 254;
const MAX_MESSAGE = 5000;

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function asText(value: unknown): string {
  return typeof value === 'string' ? value.trim() : '';
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const body = (req.body ?? {}) as Record<string, unknown>;
  // Sin saltos de línea en el nombre: va al asunto del correo.
  const name = asText(body.name).replace(/[\r\n]+/g, ' ');
  const email = asText(body.email);
  const message = asText(body.message);

  if (!name || !email || !message) {
    res.status(400).json({ error: 'Faltan campos obligatorios' });
    return;
  }
  if (name.length > MAX_NAME || email.length > MAX_EMAIL || message.length > MAX_MESSAGE) {
    res.status(400).json({ error: 'Mensaje demasiado largo' });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'Email no válido' });
    return;
  }

  const to = process.env.CONTACT_TO_EMAIL;
  if (!to) {
    console.error('CONTACT_TO_EMAIL no configurado');
    res.status(500).json({ error: 'No se pudo enviar el mensaje' });
    return;
  }

  // Un fallo de red de Resend (excepción) se responde igual que un error suyo.
  let failed = false;
  try {
    const resend = new Resend(process.env.RESEND_API_KEY);
    const { error } = await resend.emails.send({
      from: process.env.CONTACT_FROM_EMAIL ?? 'onboarding@resend.dev',
      to,
      replyTo: email,
      subject: `Nuevo mensaje de contacto — ${name}`,
      text: `${message}\n\n— ${name} (${email})`,
    });
    failed = Boolean(error);
  } catch {
    failed = true;
  }

  if (failed) {
    res.status(502).json({ error: 'No se pudo enviar el mensaje' });
    return;
  }

  res.status(200).json({ ok: true });
}
