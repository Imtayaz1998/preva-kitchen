import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getCareerRecipients,
  getSmtpConfig,
  notifyCareerApplicationCustomer
} from '../src/lib/email.js';

const envKeys = [
  'CAREER_EMAIL',
  'CAREER_ADMIN_EMAIL',
  'HR_EMAIL',
  'CAREER_SMTP_USER',
  'CAREER_SMTP_PASS',
  'FROM_EMAIL',
  'SMTP_USER',
  'SMTP_PASS'
];

test('career mail cannot inherit reservation recipients or sender settings', async () => {
  const originalEnv = Object.fromEntries(envKeys.map((key) => [key, process.env[key]]));
  try {
    process.env.CAREER_EMAIL = 'reservations@prevakitchen.com';
    process.env.CAREER_ADMIN_EMAIL = 'reservations@prevakitchen.com';
    process.env.HR_EMAIL = 'reservations@prevakitchen.com';
    process.env.CAREER_SMTP_USER = 'reservations@prevakitchen.com';
    process.env.CAREER_SMTP_PASS = 'career-test-password';
    process.env.FROM_EMAIL = 'Preva Kitchen <reservations@prevakitchen.com>';
    process.env.SMTP_USER = 'reservations@prevakitchen.com';
    process.env.SMTP_PASS = 'default-test-password';

    assert.deepEqual(getCareerRecipients(), ['careers@prevakitchen.com']);
    const careerSmtp = getSmtpConfig('career');
    assert.equal(careerSmtp.user, 'careers@prevakitchen.com');
    assert.equal(careerSmtp.pass, 'career-test-password');
    assert.equal(careerSmtp.from, 'Preva Kitchen Careers <careers@prevakitchen.com>');
    assert.equal(
      getSmtpConfig('default').from,
      'Preva Kitchen <reservations@prevakitchen.com>'
    );

    process.env.CAREER_SMTP_PASS = '';
    const unconfiguredCareerSmtp = getSmtpConfig('career');
    assert.equal(unconfiguredCareerSmtp.user, 'careers@prevakitchen.com');
    assert.equal(unconfiguredCareerSmtp.pass, '');
    assert.equal(
      await notifyCareerApplicationCustomer({ email: 'reservations@prevakitchen.com' }),
      false
    );
  } finally {
    for (const key of envKeys) {
      if (originalEnv[key] === undefined) delete process.env[key];
      else process.env[key] = originalEnv[key];
    }
  }
});
