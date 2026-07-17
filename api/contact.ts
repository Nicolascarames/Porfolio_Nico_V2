import type { VercelRequest, VercelResponse } from '@vercel/node';
import { Resend } from 'resend';

function isValidEmail(value: string): boolean {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    res.status(405).json({ error: 'Method not allowed' });
    return;
  }

  const { name, email, message } = (req.body ?? {}) as {
    name?: string;
    email?: string;
    message?: string;
  };

  if (!name?.trim() || !email?.trim() || !message?.trim()) {
    res.status(400).json({ error: 'Faltan campos obligatorios' });
    return;
  }
  if (!isValidEmail(email)) {
    res.status(400).json({ error: 'Email no válido' });
    return;
  }

  const to = process.env.CONTACT_TO_EMAIL;
  if (!to) {
    res.status(500).json({ error: 'CONTACT_TO_EMAIL no configurado' });
    return;
  }

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: process.env.CONTACT_FROM_EMAIL ?? 'onboarding@resend.dev',
    to,
    replyTo: email,
    subject: `Nuevo mensaje de contacto — ${name}`,
    text: `${message}\n\n— ${name} (${email})`,
  });

  if (error) {
    res.status(502).json({ error: 'No se pudo enviar el mensaje' });
    return;
  }

  res.status(200).json({ ok: true });
}
