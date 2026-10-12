"use client";

import { useState } from 'react';
import Swal from 'sweetalert2';
import { Send } from 'lucide-react';
import { FormCard, PrimaryButton, inputStyle, textareaStyle, labelStyle } from '@/components/site-page/PageKit';
import CalendarDatePicker from '@/components/forms/CalendarDatePicker';
import s from './EventLanding.module.css';

/*
 * "Check Availability" inquiry form for the event landing pages. Posts to the
 * backend's /api/event-inquiries route (its own collection), never to the
 * reservation, contact or VIP endpoints. The date picker is only a picker:
 * there is no live availability source yet, so every future date is
 * selectable and the events team confirms availability by reply.
 */

const UTM_KEYS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];
const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;
const FALLBACK_ERROR = 'We could not send your inquiry right now. Please call (313) 286-3586.';
const selectStyle = { ...inputStyle, cursor: 'pointer' };

function readUtm() {
  const params = new URLSearchParams(window.location.search);
  const utm = {};
  for (const key of UTM_KEYS) {
    let value = params.get(key) || '';
    try {
      if (value) sessionStorage.setItem(`preva_${key}`, value);
      else value = sessionStorage.getItem(`preva_${key}`) || '';
    } catch {
      // Storage can be blocked (private mode); attribution then uses the URL only.
    }
    utm[key] = value;
  }
  return utm;
}

/**
 * POST the inquiry, retrying once when the server could not be reached or did
 * not answer with JSON (e.g. the API restarting). A real answer — success or
 * a validation message — is returned as-is and never retried. The retry is
 * safe: the API returns the first result for an identical submission made
 * within 20 seconds instead of saving or emailing it twice.
 */
async function postInquiry(payload, attempt = 1) {
  try {
    const res = await fetch('/api/event-inquiries', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const data = await res.json();
    return res.ok ? data : { ok: false, message: data.message };
  } catch {
    if (attempt >= 2) return { ok: false, message: FALLBACK_ERROR };
    await new Promise((resolve) => setTimeout(resolve, 1500));
    return postInquiry(payload, attempt + 1);
  }
}

function Field({ id, label, full, children }) {
  return (
    <div className={`${s.field} ${full ? s.full : ''}`}>
      <label htmlFor={id} style={labelStyle}>{label}</label>
      {children}
    </div>
  );
}

// Same SweetAlert look as the reservation form's confirmation (BookingSection).
const SWAL_BASE = {
  background: '#1a0d10',
  color: '#f6f2ec',
  confirmButtonColor: '#d5a44f',
  iconColor: '#d5a44f',
  customClass: {
    popup: 'swal-preva-popup',
    title: 'swal-preva-title',
    htmlContainer: 'swal-preva-body',
    confirmButton: 'swal-preva-btn'
  }
};

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' })[c]);
}

function successHtml({ eventType, date, guests, phone, referenceId }) {
  const dateFormatted = new Date(`${date}T12:00:00`).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
  const row = (label, value) => `<tr><td style="color:#d5a44f; font-weight:700; padding:5px 12px 5px 0; width:118px; white-space:nowrap;">${label}</td><td>${escapeHtml(value)}</td></tr>`;
  return `
    <div style="text-align:left; line-height:1.7; font-size:0.95rem; color:#e8ddd6; font-family: var(--font-roboto), Arial, sans-serif;">
      <p style="margin:0 0 12px;">Your ${escapeHtml(eventType)} inquiry has reached the PREVA events team!</p>
      <table style="width:100%; border-collapse:collapse;">
        ${row('🎉 Event', eventType)}
        ${row('📅 Date', dateFormatted)}
        ${row('👥 Guests', `${guests} ${Number(guests) === 1 ? 'Guest' : 'Guests'}`)}
        ${row('📞 Phone', phone)}
        ${referenceId ? row('🔖 Reference', referenceId) : ''}
      </table>
      <p style="margin:14px 0 0; font-size:0.84rem; color:#b0a8a2;">A copy is on its way to your email. The events team will come back with availability and options.</p>
    </div>`;
}

export default function EventInquiryForm({ slug, useCase, eventType, form }) {
  const extra = form.extraSelect;
  const typeSelect = form.eventTypeSelect;
  const emptyValues = {
    name: '', companyName: '', email: '', phone: '', guestCount: '', preferredDate: '',
    eventFormat: '', [extra?.name || 'extra']: extra?.options?.[0]?.[0] ?? '',
    message: '', consent: false, hp_field: ''
  };
  const [values, setValues] = useState(emptyValues);
  const [invalid, setInvalid] = useState({});
  const [error, setError] = useState('');
  const [sending, setSending] = useState(false);

  const set = (field) => (e) => {
    const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
    setValues((v) => ({ ...v, [field]: value }));
    if (invalid[field]) setInvalid((i) => ({ ...i, [field]: false }));
  };

  function validate() {
    const bad = {};
    if (!values.name.trim()) bad.name = true;
    if (form.company && !values.companyName.trim()) bad.companyName = true;
    if (!EMAIL_RE.test(values.email.trim())) bad.email = true;
    if (!values.phone.trim()) bad.phone = true;
    const guests = Number(values.guestCount);
    if (!Number.isInteger(guests) || guests < 1 || guests > 1000) bad.guestCount = true;
    if (!values.preferredDate) bad.preferredDate = true;
    if (form.consent && !values.consent) bad.consent = true;
    return bad;
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError('');
    const bad = validate();
    setInvalid(bad);
    const firstBad = Object.keys(bad)[0];
    if (firstBad) {
      setError(bad.guestCount && Object.keys(bad).length === 1
        ? 'Enter a guest count between 1 and 1000.'
        : 'Please complete the highlighted fields.');
      document.getElementById(`evt-${firstBad === 'preferredDate' ? 'date' : firstBad}`)?.focus();
      return;
    }

    setSending(true);
    const payload = {
      landingPage: slug,
      useCase,
      eventType,
      name: values.name.trim(),
      companyName: values.companyName.trim(),
      email: values.email.trim(),
      phone: values.phone.trim(),
      guestCount: Number(values.guestCount),
      preferredDate: values.preferredDate,
      eventFormat: values.eventFormat,
      ...(extra ? { [extra.name]: values[extra.name] } : {}),
      message: values.message.trim(),
      consent: values.consent,
      hp_field: values.hp_field,
      pageUrl: window.location.href,
      referrer: document.referrer || '',
      utm: readUtm()
    };

    try {
      const data = await postInquiry(payload);
      if (!data.ok) throw new Error(data.message || FALLBACK_ERROR);

      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push({ event: 'event_inquiry_submit', use_case: useCase, landing_page: slug, lead_id: data.referenceId || '' });

      // Clear the form first so it is ready for another inquiry behind the popup.
      setValues(emptyValues);
      setInvalid({});
      setSending(false);
      await Swal.fire({
        ...SWAL_BASE,
        icon: 'success',
        title: `Thank you, ${payload.name}! 🎉`,
        html: successHtml({ eventType, date: payload.preferredDate, guests: payload.guestCount, phone: payload.phone, referenceId: data.referenceId }),
        confirmButtonText: 'Done ✓',
        width: '460px'
      });
    } catch (err) {
      setError(err.message || FALLBACK_ERROR);
    } finally {
      setSending(false);
    }
  }

  const cls = (field) => (invalid[field] ? s.invalid : undefined);

  return (
    <FormCard eyebrow="Event Inquiry" title="Check Availability" description="Share your date and guest count — the events team replies with availability and options.">
      {error ? <div className={s.frmError} role="alert" aria-live="assertive">{error}</div> : null}
      <form noValidate onSubmit={onSubmit}>
        <input
          type="text" name="hp_field" tabIndex={-1} autoComplete="off" aria-hidden="true"
          className={s.trap} value={values.hp_field} onChange={set('hp_field')}
        />
        <input type="hidden" name="landingPage" value={slug} />
        <input type="hidden" name="useCase" value={useCase} />

        <div className={s.frmRow}>
          <Field id="evt-name" label={form.nameLabel}>
            <input id="evt-name" type="text" autoComplete="name" placeholder={form.namePlaceholder} required value={values.name} onChange={set('name')} style={inputStyle} className={cls('name')} />
          </Field>
          {form.company ? (
            <Field id="evt-companyName" label="Company or Organization *">
              <input id="evt-companyName" type="text" autoComplete="organization" placeholder="Company name" required value={values.companyName} onChange={set('companyName')} style={inputStyle} className={cls('companyName')} />
            </Field>
          ) : null}
          <Field id="evt-email" label={form.emailLabel}>
            <input id="evt-email" type="email" autoComplete="email" placeholder={form.emailPlaceholder} required value={values.email} onChange={set('email')} style={inputStyle} className={cls('email')} />
          </Field>
          <Field id="evt-phone" label={form.phoneLabel}>
            <input id="evt-phone" type="tel" autoComplete="tel" placeholder={form.phonePlaceholder} required value={values.phone} onChange={set('phone')} style={inputStyle} className={cls('phone')} />
          </Field>
          <Field id="evt-guestCount" label={form.guestLabel}>
            <input id="evt-guestCount" type="number" min="1" max="1000" step="1" inputMode="numeric" placeholder={form.guestPlaceholder} required value={values.guestCount} onChange={set('guestCount')} style={inputStyle} className={cls('guestCount')} />
          </Field>
          <Field id="evt-date" label="Preferred Date *">
            <CalendarDatePicker
              id="evt-date"
              ariaLabel="Choose an event date"
              hint="Availability is confirmed by the events team after you send the inquiry."
              inputStyle={inputStyle}
              invalidClassName={s.invalid}
              value={values.preferredDate}
              invalid={invalid.preferredDate}
              onChange={(key) => {
                setValues((v) => ({ ...v, preferredDate: key }));
                setInvalid((i) => ({ ...i, preferredDate: false }));
              }}
            />
          </Field>
          {typeSelect ? (
            <Field id="evt-eventFormat" label={typeSelect.label}>
              <select id="evt-eventFormat" value={values.eventFormat} onChange={set('eventFormat')} style={selectStyle}>
                {typeSelect.options.map(([v, label]) => <option key={label} value={v}>{label}</option>)}
              </select>
            </Field>
          ) : (
            <Field id="evt-type" label="Event Type">
              <input id="evt-type" type="text" value={form.eventTypeDisplay} readOnly style={{ ...inputStyle, color: '#c5a059', fontWeight: 700 }} />
            </Field>
          )}
          {extra ? (
            <Field id={`evt-${extra.name}`} label={extra.label} full={!extra.half}>
              <select id={`evt-${extra.name}`} value={values[extra.name]} onChange={set(extra.name)} style={selectStyle}>
                {extra.options.map(([v, label]) => <option key={label} value={v}>{label}</option>)}
              </select>
            </Field>
          ) : null}
          <Field id="evt-message" label={form.messageLabel} full>
            <textarea id="evt-message" placeholder={form.messagePlaceholder} value={values.message} onChange={set('message')} maxLength={2000} style={textareaStyle} />
          </Field>
        </div>

        {form.consent ? (
          <label className={s.consent} htmlFor="evt-consent">
            <input id="evt-consent" type="checkbox" required checked={values.consent} onChange={set('consent')} className={invalid.consent ? s.consentInvalid : undefined} />
            <span>I agree that PREVA may contact me by phone or email about this inquiry.</span>
          </label>
        ) : null}

        <PrimaryButton type="submit" disabled={sending} icon={Send} style={{ width: '100%' }}>
          {sending ? 'Sending...' : form.submitLabel.replace(/\s*→$/, '')}
        </PrimaryButton>
        <p className={s.frmNote}>{form.note}</p>
      </form>
    </FormCard>
  );
}
