import { col } from '../lib/db.js';
import { cleanText, cleanEmail, cleanBool } from '../lib/sanitize.js';
import { post, badRequest } from '../router.js';
import { logActivity } from '../lib/activity.js';
import { buildReferenceId, notifyEventInquiry, notifyEventInquiryCustomer } from '../lib/email.js';
import {
  isHoneypotTripped, enforceRateLimit, getIdempotentResponse, rememberIdempotentResponse
} from '../lib/formGuard.js';

/* ══════════════════════════════════════════════════════════════════════════
   Event landing-page inquiries (/corporate-events, /birthday-parties,
   /baby-showers, /weddings)
   ─────────────────────────────────────────────────────────────────────────
   Kept apart from the reservation / contact / VIP routes on purpose: these
   leads have their own shape (event type, guest count, use_case attribution)
   and land in their own `eventInquiry` collection. Each lead emails the
   reservations inbox and sends the visitor a copy.
   ══════════════════════════════════════════════════════════════════════════ */

/** The pages allowed to post here, and the attribution each one carries. */
const LANDING_PAGES = {
  'corporate-events': { useCase: 'corporate_event', eventType: 'Corporate Event / Holiday Party' },
  'birthday-parties': { useCase: 'birthday_party', eventType: 'Birthday Party' },
  'baby-showers': { useCase: 'baby_shower', eventType: 'Baby / Bridal Shower' },
  weddings: { useCase: 'wedding', eventType: 'Wedding Reception' }
};

/** Whitelisted page-specific select values. Anything else is stored as ''. */
const DETAIL_OPTIONS = {
  eventFormat: ['meeting', 'presentation', 'holiday_party', 'client_event', 'team_social', 'reception_only', 'ceremony_reception', 'multi_day'],
  avNeeds: ['none', 'screen', 'screen_mic', 'full'],
  underTwentyOne: ['all_21', 'some_under', 'mostly_under'],
  showerType: ['baby', 'bridal', 'sip_and_see', 'gender_reveal'],
  barArrangement: ['open_bar', 'beer_wine', 'cash_bar', 'alcohol_free']
};

/** Readable labels for the select values above, used in the emails. */
const DETAIL_LABELS = {
  eventFormat: ['Event Format', {
    meeting: 'Meeting or training day', presentation: 'Presentation or award dinner',
    holiday_party: 'Holiday party', client_event: 'Client or networking event', team_social: 'Team social',
    reception_only: 'Reception only — one day', ceremony_reception: 'Ceremony and reception, same day', multi_day: 'Multi-day celebration'
  }],
  avNeeds: ['Presentation Needs', {
    none: 'None — social event only', screen: 'Screen for slides',
    screen_mic: 'Screen and microphone', full: 'Screen, microphone and speakers'
  }],
  underTwentyOne: ['Guests Under 21', {
    all_21: 'No — all guests are 21 or over', some_under: 'Yes — some guests under 21',
    mostly_under: 'Yes — mostly under 21'
  }],
  showerType: ['Shower Type', {
    baby: 'Baby shower', bridal: 'Bridal shower', sip_and_see: 'Sip and see', gender_reveal: 'Gender reveal'
  }],
  barArrangement: ['Bar Arrangement', {
    open_bar: 'Open bar', beer_wine: 'Beer and wine only', cash_bar: 'Cash bar', alcohol_free: 'Alcohol-free reception'
  }]
};

function detailList(details) {
  const list = [];
  if (details.companyName) list.push(['Company', details.companyName]);
  for (const [field, [label, names]] of Object.entries(DETAIL_LABELS)) {
    if (details[field]) list.push([label, names[details[field]]]);
  }
  return list;
}

const UTM_KEYS =['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function pickOption(field, value) {
  const clean = cleanText(value, 40);
  return DETAIL_OPTIONS[field].includes(clean) ? clean : '';
}

/** Drops local dev URLs so they never reach the lead record. */
function publicUrl(url) {
  const value = cleanText(url, 300);
  return /^https?:\/\/(localhost|127\.0\.0\.1|\[::1\])(:|\/|$)/i.test(value) ? '' : value;
}

post('/event-inquiries', async ({ body, ip, request }) => {
  if (isHoneypotTripped(body)) return { ok: true, referenceId: null }; // silent no-op for bots

  const landingPage = cleanText(body?.landingPage, 60);
  const page = LANDING_PAGES[landingPage];
  if (!page) throw badRequest('Unknown event page.');

  const name = cleanText(body?.name, 120);
  const phone = cleanText(body?.phone, 40);
  const email = cleanEmail(body?.email);
  const preferredDate = cleanText(body?.preferredDate, 10);
  const guestCount = Number(body?.guestCount);
  const companyName = cleanText(body?.companyName, 160);

  if (!name || !phone || !email || !preferredDate) {
    throw badRequest('Name, phone, email and preferred date are required.');
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw badRequest('Enter a valid email address.');

  const parsedDate = new Date(`${preferredDate}T00:00:00.000Z`);
  if (!/^\d{4}-\d{2}-\d{2}$/.test(preferredDate) || Number.isNaN(parsedDate.getTime()) || parsedDate.toISOString().slice(0, 10) !== preferredDate) {
    throw badRequest('Enter a valid event date.');
  }
  const today = new Date().toISOString().slice(0, 10);
  if (preferredDate < today) throw badRequest('Choose an event date in the future.');

  if (!Number.isInteger(guestCount) || guestCount < 1 || guestCount > 1000) {
    throw badRequest('Guest count must be a whole number between 1 and 1000.');
  }
  if (landingPage === 'corporate-events') {
    if (!companyName) throw badRequest('Company or organization is required.');
    if (!cleanBool(body?.consent)) throw badRequest('Please agree to be contacted about this inquiry.');
  }

  const doc = {
    name,
    phone,
    email,
    eventType: page.eventType,
    useCase: page.useCase,
    landingPage,
    preferredDate,
    guestCount,
    message: cleanText(body?.message, 2000),
    details: {
      companyName,
      eventFormat: pickOption('eventFormat', body?.eventFormat),
      avNeeds: pickOption('avNeeds', body?.avNeeds),
      underTwentyOne: pickOption('underTwentyOne', body?.underTwentyOne),
      showerType: pickOption('showerType', body?.showerType),
      barArrangement: pickOption('barArrangement', body?.barArrangement)
    },
    consent: cleanBool(body?.consent),
    utm: Object.fromEntries(UTM_KEYS.map((key) => [key, cleanText(body?.utm?.[key], 120)])),
    referrer: publicUrl(body?.referrer),
    pageUrl: publicUrl(body?.pageUrl || request?.headers?.referer)
  };

  const idempotencyKey = { name, email, phone, preferredDate, landingPage };
  const cached = getIdempotentResponse('event-inquiries', ip, idempotencyKey);
  if (cached) return cached;

  // Counted only once a submission is valid and new, so typos and client
  // retries never use up a visitor's allowance. Looser outside production so
  // local testing is not locked out.
  enforceRateLimit('event-inquiries', ip, { max: process.env.NODE_ENV === 'production' ? 5 : 50 });

  const target = await col('eventInquiry');
  const now = new Date();
  const { insertedId } = await target.insertOne({ ...doc, status: 'NEW', createdAt: now });
  const referenceId = buildReferenceId('EVT', insertedId);
  await target.updateOne({ _id: insertedId }, { $set: { referenceId } });
  await logActivity({ user: null, ip }, 'CREATE', 'EVENT_INQUIRY', name);

  // A mail failure is logged in emailLogs but never fails a saved inquiry.
  const mail = { ...doc, referenceId, submittedAt: now, detailList: detailList(doc.details) };
  await Promise.allSettled([notifyEventInquiry(mail), notifyEventInquiryCustomer(mail)]);

  const response = { ok: true, referenceId };
  rememberIdempotentResponse('event-inquiries', ip, idempotencyKey, response);
  return response;
});
