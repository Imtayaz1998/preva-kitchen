import dns from 'node:dns';

/* ══════════════════════════════════════════════════════════════════════════
   Email check for event inquiries
   ─────────────────────────────────────────────────────────────────────────
   Same rule as the site's other forms (frontend/src/lib/email-validation.js):
   the address must be well formed and its domain must accept mail (MX
   records), so made-up addresses like name@fakedomain123.com are rejected.
   On top of that: throwaway inbox services are refused, and common typos of
   the big providers (gmial.com, gmail.con…) get a "did you mean" message.
   ══════════════════════════════════════════════════════════════════════════ */

const EMAIL_PATTERN = /^[A-Za-z0-9.!#$%&'*+/=?^_`{|}~-]+@[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?(?:\.[A-Za-z0-9](?:[A-Za-z0-9-]{0,61}[A-Za-z0-9])?)*\.[A-Za-z]{2,}$/;
const MISSING_DOMAIN_CODES = new Set(['ENOTFOUND', 'ENODATA', 'NXDOMAIN']);
const DNS_TIMEOUT_MS = 5000;

// Public resolvers first: some resolvers answer unknown domains with a slow
// EREFUSED instead of NXDOMAIN, which would let fake domains slip through.
const resolver = new dns.promises.Resolver({ timeout: 2000, tries: 1 });
resolver.setServers(['1.1.1.1', '8.8.8.8', ...dns.getServers()]);

const DISPOSABLE = new Set([
  'mailinator.com', 'guerrillamail.com', 'guerrillamail.net', 'sharklasers.com', '10minutemail.com', '10minutemail.net',
  'tempmail.com', 'temp-mail.org', 'temp-mail.io', 'tempmail.net', 'tempmailo.com', 'throwawaymail.com', 'yopmail.com',
  'yopmail.net', 'getnada.com', 'nada.email', 'dispostable.com', 'maildrop.cc', 'mailnesia.com', 'trashmail.com',
  'fakeinbox.com', 'mintemail.com', 'mohmal.com', 'emailondeck.com', 'spamgourmet.com', 'mailcatch.com', 'moakt.com',
  'tempinbox.com', 'burnermail.io', 'inboxkitten.com', 'mail.tm', 'tmail.ws', 'tmpmail.org', 'tmpmail.net', 'discard.email',
  'example.com', 'example.org', 'example.net', 'test.com'
]);

const TYPOS = {
  'gmial.com': 'gmail.com', 'gmal.com': 'gmail.com', 'gamil.com': 'gmail.com', 'gmaill.com': 'gmail.com', 'gnail.com': 'gmail.com',
  'gmail.co': 'gmail.com', 'gmail.con': 'gmail.com', 'gmail.cm': 'gmail.com', 'gmail.om': 'gmail.com', 'gmai.com': 'gmail.com',
  'yahooo.com': 'yahoo.com', 'yaho.com': 'yahoo.com', 'yahoo.con': 'yahoo.com', 'yahoo.co': 'yahoo.com',
  'hotmial.com': 'hotmail.com', 'hotmal.com': 'hotmail.com', 'hotmail.con': 'hotmail.com', 'hotmail.co': 'hotmail.com',
  'outlok.com': 'outlook.com', 'outloo.com': 'outlook.com', 'outlook.con': 'outlook.com',
  'icloud.con': 'icloud.com', 'iclod.com': 'icloud.com', 'aol.con': 'aol.com'
};

export const INVALID_EMAIL_MESSAGE = 'Please enter a valid, working email address.';

/** Returns null when the address is acceptable, otherwise the message to show. */
export async function emailProblem(email) {
  const value = String(email || '').trim().toLowerCase();
  if (value.length > 254 || !EMAIL_PATTERN.test(value)) return INVALID_EMAIL_MESSAGE;

  const [local, domain] = value.split('@');
  if (local.length > 64 || local.startsWith('.') || local.endsWith('.') || local.includes('..')) return INVALID_EMAIL_MESSAGE;
  if (TYPOS[domain]) return `Please check your email address — did you mean ${local}@${TYPOS[domain]}?`;
  if (DISPOSABLE.has(domain)) return 'Please use your regular email address, not a temporary inbox.';

  try {
    const records = await Promise.race([
      resolver.resolveMx(domain),
      new Promise((_, reject) => setTimeout(() => reject(Object.assign(new Error('DNS timeout'), { code: 'ETIMEOUT' })), DNS_TIMEOUT_MS))
    ]);
    // A "null MX" (single record with an empty exchange) means the domain accepts no mail.
    return records.some((record) => record.exchange && record.exchange !== '.') ? null : INVALID_EMAIL_MESSAGE;
  } catch (err) {
    if (MISSING_DOMAIN_CODES.has(err.code)) return INVALID_EMAIL_MESSAGE;
    // DNS outage / timeout: don't lose a real inquiry because our lookup failed.
    console.warn('[emailCheck] MX lookup failed, allowing address:', err.code || err.message);
    return null;
  }
}
