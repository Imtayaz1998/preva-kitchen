import sanitizeHtml from 'sanitize-html';

/* ══════════════════════════════════════════════════════════════════════════
   Every value that arrives from a browser passes through here before it goes
   anywhere near the database or a template.
   ══════════════════════════════════════════════════════════════════════════ */

export const cleanText = (value, max = 500) => String(value ?? '').trim().slice(0, max);

export const cleanEmail = (value) => cleanText(value, 254).toLowerCase();

export const cleanBool = (value, fallback = false) => {
  if (value === true || value === 'true' || value === 1 || value === '1') return true;
  if (value === false || value === 'false' || value === 0 || value === '0') return false;
  return fallback;
};

export const cleanInt = (value, fallback = 0) => {
  const n = Number(value);
  return Number.isFinite(n) ? Math.trunc(n) : fallback;
};

/** Only http(s) links and telephone numbers may be stored as ordering URLs. */
export const cleanOrderUrl = (value) => {
  const url = cleanText(value, 2000);
  return /^(https?:\/\/|tel:\+?[0-9]{7,15}$)/i.test(url) ? url : '';
};

export const normalizeOrderAvailability = (value) => {
  const availability = cleanText(value, 20).toUpperCase();
  return ['PICKUP', 'DELIVERY', 'BOTH'].includes(availability) ? availability : 'BOTH';
};

/**
 * Rich text written in the admin is rendered with dangerouslySetInnerHTML on
 * the public site, so it is sanitised on the way in rather than on the way out.
 * Sanitising on write means a stored payload can never be rendered raw by a
 * template that forgets to escape it.
 */
export const publicHtml = (value) =>
  sanitizeHtml(value || '', {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'h1', 'h2', 'table', 'caption', 'thead', 'tbody', 'tr', 'th', 'td',
      'video', 'source', 'iframe', 'figure', 'figcaption',
      // The FAQ accordion the editor inserts is built from <details>/<summary>
      // (see RichTextEditor.js insertFaq) — without these, sanitize-html's
      // default allowlist silently drops both tags on save, unwrapping their
      // content into plain text and leaving the accordion with no questions,
      // no numbering and no expand/collapse (only the surrounding
      // .preva-faq-answer <div> — already an allowed tag — survives).
      'details', 'summary'
    ]),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'id', 'style'],
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'alt', 'title', 'width', 'height', 'loading'],
      video: ['src', 'controls', 'poster', 'width', 'height'],
      source: ['src', 'type'],
      iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen', 'loading'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan', 'scope'],
      // `open` keeps a per-item expanded state possible; `name` is what makes
      // a set of <details> behave as a single-open-at-a-time group natively.
      details: ['open', 'name']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedStyles: {
      '*': {
        'text-align': [/^(left|right|center|justify)$/]
      }
    },
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'player.vimeo.com'],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, ...(attribs.target === '_blank' ? { rel: 'noopener noreferrer' } : {}) }
      })
    }
  });

/**
 * Website pages are built by admins/editors pasting designed HTML, so they get
 * a wider allowlist than blog posts: <style> blocks, any inline CSS, layout
 * and SVG tags, data-/aria- attributes. Scripts, event handlers (on*) and
 * javascript: URLs are still removed — sanitize-html drops anything not
 * listed here.
 */
export const pageHtml = (value) =>
  sanitizeHtml(String(value ?? '').slice(0, 2_000_000), {
    allowedTags: sanitizeHtml.defaults.allowedTags.concat([
      'img', 'h1', 'h2', 'table', 'caption', 'thead', 'tbody', 'tfoot', 'tr', 'th', 'td',
      'video', 'audio', 'source', 'picture', 'iframe', 'figure', 'figcaption',
      'details', 'summary', 'style', 'link', 'button', 'label',
      'form', 'input', 'select', 'option', 'optgroup', 'textarea', 'fieldset', 'legend',
      'svg', 'g', 'path', 'circle', 'ellipse', 'rect', 'line', 'polyline', 'polygon',
      'defs', 'lineargradient', 'radialgradient', 'stop', 'text', 'tspan'
    ]),
    allowVulnerableTags: true, // only for <style>; <script> is not in the list
    // A whole pasted HTML file: drop <title>/<noscript> text instead of
    // leaving it as a stray line at the top of the page.
    nonTextTags: ['script', 'style', 'textarea', 'option', 'noscript', 'title'],
    exclusiveFilter: (frame) => frame.tag === 'link' && !/^stylesheet$/i.test(frame.attribs.rel || ''),
    allowedAttributes: {
      ...sanitizeHtml.defaults.allowedAttributes,
      '*': ['class', 'id', 'style', 'title', 'role', 'data-*', 'aria-*', 'lang', 'dir'],
      a: ['href', 'name', 'target', 'rel'],
      img: ['src', 'srcset', 'sizes', 'alt', 'title', 'width', 'height', 'loading', 'decoding'],
      source: ['src', 'srcset', 'type', 'media', 'sizes'],
      video: ['src', 'controls', 'poster', 'width', 'height', 'autoplay', 'muted', 'loop', 'playsinline'],
      audio: ['src', 'controls', 'loop'],
      iframe: ['src', 'title', 'width', 'height', 'allow', 'allowfullscreen', 'loading', 'referrerpolicy'],
      td: ['colspan', 'rowspan'],
      th: ['colspan', 'rowspan', 'scope'],
      details: ['open', 'name'],
      button: ['type'],
      // Only stylesheets (e.g. Google Fonts); other <link> rels are dropped below.
      link: ['rel', 'href'],
      // Forms keep their look but not an action — they can't post anywhere.
      form: ['method', 'novalidate'],
      input: ['type', 'name', 'placeholder', 'value', 'required', 'min', 'max', 'step', 'checked', 'disabled', 'autocomplete', 'maxlength', 'pattern'],
      select: ['name', 'required', 'multiple', 'disabled'],
      option: ['value', 'selected', 'disabled'],
      textarea: ['name', 'rows', 'cols', 'placeholder', 'required', 'maxlength'],
      label: ['for'],
      svg: ['viewbox', 'width', 'height', 'fill', 'stroke', 'stroke-width', 'xmlns', 'preserveaspectratio'],
      path: ['d', 'fill', 'stroke', 'stroke-width', 'stroke-linecap', 'stroke-linejoin', 'fill-rule', 'clip-rule', 'transform'],
      circle: ['cx', 'cy', 'r', 'fill', 'stroke', 'stroke-width'],
      ellipse: ['cx', 'cy', 'rx', 'ry', 'fill', 'stroke'],
      rect: ['x', 'y', 'width', 'height', 'rx', 'ry', 'fill', 'stroke'],
      line: ['x1', 'y1', 'x2', 'y2', 'stroke', 'stroke-width'],
      polyline: ['points', 'fill', 'stroke', 'stroke-width'],
      polygon: ['points', 'fill', 'stroke', 'stroke-width'],
      g: ['fill', 'stroke', 'transform'],
      lineargradient: ['x1', 'y1', 'x2', 'y2', 'gradientunits'],
      radialgradient: ['cx', 'cy', 'r', 'fx', 'fy', 'gradientunits'],
      stop: ['offset', 'stop-color', 'stop-opacity'],
      text: ['x', 'y', 'fill', 'font-size', 'text-anchor'],
      tspan: ['x', 'y', 'dx', 'dy']
    },
    allowedSchemes: ['http', 'https', 'mailto', 'tel'],
    allowedIframeHostnames: ['www.youtube.com', 'youtube.com', 'www.youtube-nocookie.com', 'player.vimeo.com', 'www.google.com', 'maps.google.com'],
    transformTags: {
      a: (tagName, attribs) => ({
        tagName,
        attribs: { ...attribs, ...(attribs.target === '_blank' ? { rel: 'noopener noreferrer' } : {}) }
      })
    }
  });

/** Page-level custom CSS, injected inside a <style> tag on the public page —
 *  so it must not be able to close that tag. */
export const cleanCss = (value) =>
  String(value ?? '').replace(/<\/?\s*(style|script|template)/gi, '').slice(0, 300_000);

/* ══════════════════════════════════════════════════════════════════════════
   Money
   ─────────────────────────────────────────────────────────────────────────
   Every amount in the shop is an integer number of cents. 0.1 + 0.2 is
   0.30000000000000004 in JavaScript; on one order that is invisible, across a
   few thousand it becomes a reconciliation problem that takes a day to trace.
   ══════════════════════════════════════════════════════════════════════════ */

export function formatMoney(cents) {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format((cents || 0) / 100);
}

/** Parse "12.99", "$12.99" or 12.99 into 1299. */
export function parseMoney(input) {
  if (typeof input === 'number') return Math.round(input * 100);
  const cleaned = String(input ?? '').replace(/[^0-9.-]/g, '');
  const value = Number.parseFloat(cleaned);
  return Number.isFinite(value) ? Math.round(value * 100) : 0;
}

/** Tax is rounded once at the order level, not per line — per-line rounding
 *  drifts a cent or two on larger orders and stops matching Stripe. */
export function taxOn(subtotalCents, rate) {
  return Math.round(subtotalCents * (rate || 0));
}
