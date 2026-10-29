import { afterEach, describe, expect, it, vi } from 'vitest';

const { smtpSend } = vi.hoisted(() => ({ smtpSend: vi.fn() }));

vi.mock('server-only', () => ({}));
vi.mock('nodemailer', () => ({
  default: {
    createTransport: vi.fn(() => ({ sendMail: smtpSend }))
  }
}));

import {
  getCareerRecipient,
  getFromAddress,
  getSmtpConfig,
  isSmtpConfigured,
  sendCareerEmail
} from '../../src/lib/nodemailer.js';
import { saveToBackend } from '../../src/lib/backend-sync.js';

const originalEnv = {};
const envKeys = [
  'CAREER_EMAIL',
  'CAREER_SMTP_USER',
  'CAREER_SMTP_PASS',
  'CONTACT_SMTP_PASS',
  'SMTP_USER',
  'SMTP_PASS',
  'FROM_EMAIL'
];

afterEach(() => {
  smtpSend.mockReset();
  vi.unstubAllGlobals();
  for (const key of envKeys) {
    if (originalEnv[key] === undefined) delete process.env[key];
    else process.env[key] = originalEnv[key];
  }
});

describe('career email routing', () => {
  it('forces career mailbox config independent of reservation SMTP settings', () => {
    for (const key of envKeys) originalEnv[key] = process.env[key];
    process.env.CAREER_EMAIL = 'reservations@prevakitchen.com';
    process.env.CAREER_SMTP_USER = 'reservations@prevakitchen.com';
    process.env.CAREER_SMTP_PASS = 'career-test-password';
    process.env.CONTACT_SMTP_PASS = 'contact-test-password';
    process.env.SMTP_USER = 'reservations@prevakitchen.com';
    process.env.SMTP_PASS = 'default-test-password';
    process.env.FROM_EMAIL = 'Preva Kitchen <reservations@prevakitchen.com>';

    expect(getCareerRecipient()).toBe('careers@prevakitchen.com');
    expect(getFromAddress('career')).toBe('Preva Kitchen Careers <careers@prevakitchen.com>');
    expect(getSmtpConfig('career')).toMatchObject({
      user: 'careers@prevakitchen.com',
      pass: 'career-test-password'
    });
    expect(getFromAddress()).toBe('Preva Kitchen <reservations@prevakitchen.com>');

    process.env.CAREER_SMTP_PASS = '';
    expect(getSmtpConfig('career')).toMatchObject({
      user: 'careers@prevakitchen.com',
      pass: ''
    });
    expect(isSmtpConfigured('career')).toBe(false);
  });

  it.each([
    ['role-specific', 'line-cook'],
    ['general application', 'general-application']
  ])('routes %s submissions to careers and confirms the applicant separately', async (_label, role) => {
    for (const key of envKeys) originalEnv[key] = process.env[key];
    process.env.CAREER_EMAIL = 'reservations@prevakitchen.com';
    process.env.CAREER_SMTP_USER = 'reservations@prevakitchen.com';
    process.env.CAREER_SMTP_PASS = 'career-test-password';
    process.env.SMTP_USER = 'reservations@prevakitchen.com';
    process.env.SMTP_PASS = 'default-test-password';
    process.env.FROM_EMAIL = 'Preva Kitchen <reservations@prevakitchen.com>';
    smtpSend.mockResolvedValue({ messageId: 'career-test' });

    await sendCareerEmail({
      firstName: 'Test',
      lastName: 'Applicant',
      email: 'applicant@example.com',
      role,
      resume: { name: 'resume.pdf', type: 'application/pdf', data: 'data:application/pdf;base64,JVBERi0xLjQK' }
    });

    expect(smtpSend).toHaveBeenCalledTimes(2);
    const [staffNotice, applicantConfirmation] = smtpSend.mock.calls.map(([message]) => message);
    expect(staffNotice).toMatchObject({
      from: 'Preva Kitchen Careers <careers@prevakitchen.com>',
      to: 'careers@prevakitchen.com',
      replyTo: 'applicant@example.com'
    });
    expect(applicantConfirmation).toMatchObject({
      from: 'Preva Kitchen Careers <careers@prevakitchen.com>',
      to: 'applicant@example.com',
      replyTo: 'careers@prevakitchen.com'
    });
    for (const message of [staffNotice, applicantConfirmation]) {
      expect(message).not.toHaveProperty('cc');
      expect(message).not.toHaveProperty('bcc');
    }
  });

  it('never sends an applicant confirmation to a staff inbox', async () => {
    for (const key of envKeys) originalEnv[key] = process.env[key];
    process.env.CAREER_SMTP_PASS = 'career-test-password';
    smtpSend.mockResolvedValue({ messageId: 'career-test' });

    await sendCareerEmail({
      firstName: 'Test',
      lastName: 'Applicant',
      email: 'reservations@prevakitchen.com',
      role: 'general-application'
    });

    expect(smtpSend).toHaveBeenCalledTimes(1);
    expect(smtpSend.mock.calls[0][0]).toMatchObject({
      to: 'careers@prevakitchen.com',
      replyTo: 'reservations@prevakitchen.com'
    });
  });

  it('forwards career applications to storage without triggering duplicate backend emails', async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true });
    vi.stubGlobal('fetch', fetchMock);
    const request = { headers: { get: () => 'https://prevakitchen.com/careers/apply' } };

    await saveToBackend('/career-applications', { role: 'general-application' }, request, 'career-applications');

    expect(fetchMock).toHaveBeenCalledOnce();
    const [, options] = fetchMock.mock.calls[0];
    expect(options.headers['x-internal-forward']).toBe('true');
    expect(JSON.parse(options.body)).toMatchObject({
      role: 'general-application',
      skipEmail: true,
      pageUrl: 'https://prevakitchen.com/careers/apply'
    });
  });
});
