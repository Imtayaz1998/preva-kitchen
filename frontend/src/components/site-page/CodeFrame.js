'use client';

import { useEffect, useMemo, useRef, useState } from 'react';

/**
 * Runs an admin-built page (HTML + CSS + JS) exactly as a standalone file
 * would, inside a sandboxed iframe:
 *   - the site's global CSS can't restyle it, and its CSS can't leak out;
 *   - its JavaScript runs, but in an opaque origin (no allow-same-origin), so
 *     it can't read the site's cookies, storage or admin session.
 * The frame grows to its content's height, links open in the main window and
 * #anchor links scroll the main window to the right spot.
 */

// Injected before the page's own JS. Reports height and handles #links.
const BRIDGE = `
(function () {
  function send(msg) { parent.postMessage(Object.assign({ cmsCodeFrame: true }, msg), '*'); }
  function report() { send({ height: Math.ceil(document.documentElement.scrollHeight) }); }
  new ResizeObserver(report).observe(document.documentElement);
  window.addEventListener('load', report);
  document.addEventListener('click', function (e) {
    var a = e.target.closest && e.target.closest('a[href^="#"]');
    if (!a) return;
    var id = decodeURIComponent(a.getAttribute('href').slice(1));
    var el = id && document.getElementById(id);
    e.preventDefault();
    if (el) send({ scrollTo: el.getBoundingClientRect().top + window.scrollY });
  }, true);
  // The frame has an opaque origin, so its fetch() to the site API would be
  // blocked by CORS. Requests to the public form endpoints are relayed through
  // the parent page instead (path-allowlisted, sent without cookies).
  var pending = {}, seq = 0, nativeFetch = window.fetch.bind(window);
  window.addEventListener('message', function (e) {
    var d = e.data;
    if (e.source !== parent || !d || !d.cmsCodeFrameReply || !pending[d.id]) return;
    var p = pending[d.id]; delete pending[d.id];
    if (d.error) p.reject(new TypeError(d.error));
    else p.resolve(new Response(d.body, { status: d.status, headers: { 'Content-Type': d.contentType || 'application/json' } }));
  });
  window.fetch = function (input, init) {
    init = init || {};
    var url;
    try { url = new URL(typeof input === 'string' ? input : input.url, document.baseURI); } catch (err) { return nativeFetch(input, init); }
    if (__FORM_PATHS__.indexOf(url.pathname.replace(/\\/$/, '')) === -1) return nativeFetch(input, init);
    var id = ++seq;
    return new Promise(function (resolve, reject) {
      pending[id] = { resolve: resolve, reject: reject };
      send({ relay: { id: id, path: url.pathname, method: init.method || 'GET', body: typeof init.body === 'string' ? init.body : null } });
    });
  };
  report();
})();`;

// Public, unauthenticated form endpoints a custom page may post to.
export const FORM_PATHS = ['/api/event-inquiries', '/api/contact', '/api/subscribe', '/api/reservations', '/api/vip-requests', '/api/guest-list'];

// "Match website" layer (on by default): the site's font, heading/paragraph
// sizes (as on /weddings — EventLanding.module.css, PageKit) and the header's
// container width, so content lines up with the logo and the header buttons.
// Loaded after the page's CSS and !important so it wins over the design's
// own sizes; colours and layout stay the design's.
const SITE_STYLE = `
@import url('https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,400;0,500;0,600;0,700;1,500;1,600&display=swap');
html body, body h1, body h2, body h3, body h4, body h5, body h6, body p, body a, body li, body label,
body button, body input, body select, body textarea, body summary, body figcaption, body blockquote {
  font-family: Roboto, Arial, sans-serif !important;
}
body h1 { font-size: clamp(2.4rem, 4vw, 3.6rem) !important; line-height: 1.1 !important; font-weight: 600 !important; letter-spacing: -0.02em !important; }
body h2 { font-size: clamp(2rem, 3.4vw, 2.9rem) !important; line-height: 1.14 !important; }
body h3 { font-size: 1.1rem !important; line-height: 1.3 !important; }
body p { font-size: 1rem !important; line-height: 1.75 !important; }
body .eyebrow { font-size: 0.78rem !important; letter-spacing: 0.18em !important; }
body .wrap, body .container, body .wrapper, body .inner, body .content-wrap {
  width: 100% !important; max-width: 1240px !important; margin-inline: auto !important; padding-inline: 32px !important; box-sizing: border-box !important;
}
@media (max-width: 767px) {
  body h1 { font-size: clamp(2rem, 9vw, 2.5rem) !important; }
  body h2 { font-size: clamp(1.6rem, 7vw, 2.1rem) !important; }
  body .wrap, body .container, body .wrapper, body .inner, body .content-wrap { padding-inline: 18px !important; }
}`;

export function buildCodeDocument({ html = '', css = '', js = '', origin = '', matchSite = true }) {
  const base = origin ? `<base href="${origin.replace(/"/g, '')}/" target="_top">` : '<base target="_top">';
  const script = js.trim()
    ? (/<script[\s>]/i.test(js) ? js : `<script>${js.replace(/<\/script/gi, '<\\/script')}</script>`)
    : '';
  const bridge = BRIDGE.replace('__FORM_PATHS__', JSON.stringify(FORM_PATHS));
  // The bridge goes first so the page's own scripts (inline in the HTML too) see the relayed fetch.
  return `<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${base}<script>${bridge}</script>${css ? `<style>${css.replace(/<\/style/gi, '')}</style>` : ''}</head><body>${html}${matchSite ? `<style>${SITE_STYLE}</style>` : ''}${script}</body></html>`;
}

export default function CodeFrame({ html = '', css = '', js = '', matchSite = true, title = 'Page content', initialOrigin = '', minHeight = 400 }) {
  const frameRef = useRef(null);
  const [origin, setOrigin] = useState(initialOrigin);
  const [height, setHeight] = useState(minHeight);

  // Relative links and /api/media images must resolve against the site
  // actually being viewed (localhost, staging or live).
  useEffect(() => { setOrigin(window.location.origin); }, []);

  const srcDoc = useMemo(() => buildCodeDocument({ html, css, js, origin, matchSite }), [html, css, js, origin, matchSite]);

  useEffect(() => {
    const onMessage = (event) => {
      const frame = frameRef.current;
      if (!frame || event.source !== frame.contentWindow || !event.data?.cmsCodeFrame) return;
      if (typeof event.data.height === 'number' && event.data.height > 0) setHeight(Math.max(event.data.height, 50));
      const relay = event.data.relay;
      if (relay && typeof relay.path === 'string') {
        const reply = (data) => frame.contentWindow?.postMessage({ cmsCodeFrameReply: true, id: relay.id, ...data }, '*');
        const path = relay.path.replace(/\/$/, '');
        if (!FORM_PATHS.includes(path) || String(relay.method).toUpperCase() !== 'POST') {
          reply({ error: 'This request is not allowed from a custom page.' });
          return;
        }
        fetch(path, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: relay.body, credentials: 'omit' })
          .then(async (res) => reply({ status: res.status, body: await res.text(), contentType: res.headers.get('content-type') }))
          .catch(() => reply({ error: 'Network error' }));
      }
      if (typeof event.data.scrollTo === 'number') {
        const top = frame.getBoundingClientRect().top + window.scrollY + event.data.scrollTo - 90;
        window.scrollTo({ top, behavior: 'smooth' });
      }
    };
    window.addEventListener('message', onMessage);
    return () => window.removeEventListener('message', onMessage);
  }, []);

  return (
    <iframe
      ref={frameRef}
      title={title}
      srcDoc={srcDoc}
      sandbox="allow-scripts allow-forms allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation allow-modals"
      style={{ display: 'block', width: '100%', height: `${height}px`, border: 0, background: 'transparent' }}
    />
  );
}
