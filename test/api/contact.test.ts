import { describe, it, expect, vi, beforeEach } from 'vitest';

const sendMock = vi.fn();
vi.mock('resend', () => ({
  Resend: vi.fn().mockImplementation(function Resend() {
    return { emails: { send: sendMock } };
  }),
}));

import handler from '../../api/contact';

function mockReqRes(body: unknown, method = 'POST') {
  const req = { method, body } as any;
  const res = {
    statusCode: 0,
    body: undefined as unknown,
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
