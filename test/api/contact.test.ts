import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function Resend() {
    return { emails: { send: sendMock } };
  }),
}));

import handler from '../../api/contact';

function mockReqRes(body: unknown, method = 'POST', headers: Record<string, string> = {}) {
  const req = { method, body, headers } as any;
  const res = {
    statusCode: 0,
    body: undefined as unknown,
    headers: {} as Record<string, string>,
    setHeader(k: string, v: string) {
      this.headers[k] = v;
    },
    end() {
      return this;
    },
    status(code: number) {
      this.statusCode = code;
      return this;
    },
    json(payload: unknown) {
      this.body = payload;
      return this;
    },
  };
  return { req, res: res as any };
}

describe('POST /api/contact', () => {
  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: '1' }, error: null });
    process.env.RESEND_API_KEY = 'test-key';
    process.env.CONTACT_TO_EMAIL = 'nico@example.com';
  });

  it('rejects non-POST requests', async () => {
    const { req, res } = mockReqRes(undefined, 'GET');
    await handler(req, res);
    expect(res.statusCode).toBe(405);
  });

  it('rejects empty fields', async () => {
    const { req, res } = mockReqRes({ name: '', email: '', message: '' });
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('rejects an invalid email format', async () => {
    const { req, res } = mockReqRes({ name: 'Nico', email: 'not-an-email', message: 'Hola' });
    await handler(req, res);
    expect(res.statusCode).toBe(400);
  });

  it('calls Resend with the expected payload and returns 200', async () => {
    const { req, res } = mockReqRes({
      name: 'Nico',
      email: 'nico@test.com',
      message: 'Hola, quiero hablar',
    });
    await handler(req, res);
    expect(sendMock).toHaveBeenCalledWith(
      expect.objectContaining({
        to: 'nico@example.com',
        replyTo: 'nico@test.com',
        subject: expect.stringContaining('Nico'),
      }),
    );
    expect(res.statusCode).toBe(200);
  });

  it('rejects non-string fields without crashing', async () => {
    const { req, res } = mockReqRes({ name: ['x'], email: { a: 1 }, message: 42 });
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('rejects an oversized message', async () => {
    const { req, res } = mockReqRes({ name: 'Nico', email: 'nico@test.com', message: 'a'.repeat(5001) });
    await handler(req, res);
    expect(res.statusCode).toBe(400);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('strips line breaks from the name used in the subject', async () => {
    const { req, res } = mockReqRes({ name: 'Nico\r\nBcc: x@y.com', email: 'nico@test.com', message: 'Hola' });
    await handler(req, res);
    expect(sendMock).toHaveBeenCalledWith(expect.objectContaining({ subject: expect.not.stringMatching(/[\r\n]/) }));
    expect(res.statusCode).toBe(200);
  });

  it('returns 502 when Resend throws', async () => {
    sendMock.mockRejectedValue(new Error('network'));
    const { req, res } = mockReqRes({ name: 'Nico', email: 'nico@test.com', message: 'Hola' });
    await handler(req, res);
    expect(res.statusCode).toBe(502);
  });
});

describe('CORS /api/contact', () => {
  const ok = { name: 'Nico', email: 'nico@test.com', message: 'Hola' };

  beforeEach(() => {
    sendMock.mockReset();
    sendMock.mockResolvedValue({ data: { id: '1' }, error: null });
    process.env.RESEND_API_KEY = 'test-key';
    process.env.CONTACT_TO_EMAIL = 'nico@example.com';
    process.env.CONTACT_ALLOWED_ORIGINS = 'https://desktop-nav.vercel.app, http://localhost:5181';
  });

  it('answers an allowed preflight with 204 and CORS headers', async () => {
    const { req, res } = mockReqRes(undefined, 'OPTIONS', { origin: 'https://desktop-nav.vercel.app', host: 'portfolio.test' });
    await handler(req, res);
    expect(res.statusCode).toBe(204);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('https://desktop-nav.vercel.app');
    expect(res.headers['Access-Control-Allow-Methods']).toBe('POST, OPTIONS');
    expect(res.headers['Access-Control-Allow-Headers']).toBe('content-type');
    expect(res.headers['Access-Control-Max-Age']).toBeDefined();
    expect(res.headers['Vary']).toBe('Origin');
  });

  it('rejects a preflight from a disallowed origin', async () => {
    const { req, res } = mockReqRes(undefined, 'OPTIONS', { origin: 'https://evil.example', host: 'portfolio.test' });
    await handler(req, res);
    expect(res.statusCode).toBe(403);
    expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
  });

  it('sets Access-Control-Allow-Origin on a POST from an allowed origin', async () => {
    const { req, res } = mockReqRes(ok, 'POST', { origin: 'http://localhost:5181', host: 'portfolio.test' });
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBe('http://localhost:5181');
  });

  it('returns 403 for a POST from a disallowed origin without sending', async () => {
    const { req, res } = mockReqRes(ok, 'POST', { origin: 'https://evil.example', host: 'portfolio.test' });
    await handler(req, res);
    expect(res.statusCode).toBe(403);
    expect(sendMock).not.toHaveBeenCalled();
  });

  it('keeps same-origin POSTs working without CORS headers', async () => {
    const { req, res } = mockReqRes(ok, 'POST', { origin: 'https://portfolio.test', host: 'portfolio.test' });
    await handler(req, res);
    expect(res.statusCode).toBe(200);
    expect(res.headers['Access-Control-Allow-Origin']).toBeUndefined();
  });
});
