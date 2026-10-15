import 'server-only';

/**
 * Saves a public form submission to the backend so it appears in the admin
 * (Leads / Inbox), alongside the email the Next.js route sends.
 *
 * The backend trusts `x-internal-forward` to skip its own rate limit and
 * email, and records `x-visitor-ip` as the submitter instead of this server.
 * A rejected save is logged loudly — the visitor has already been told the
 * form went through, so this is the only trace of a lost lead.
 */
export async function saveToBackend(path, payload, request, tag) {
  const backendUrl = process.env.BACKEND_URL;
  if (!backendUrl) {
    console.error(`[${tag}] BACKEND_URL is not set — submission was emailed but NOT saved to the admin.`);
    return;
  }

  const visitorIp = (request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || '').split(',')[0].trim();
  try {
    const response = await fetch(`${backendUrl.replace(/\/$/, '')}/api${path}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-internal-forward': 'true',
        ...(visitorIp ? { 'x-visitor-ip': visitorIp } : {})
      },
      // Forms that don't send their own page URL fall back to the page the
      // browser was on (the Referer), so every lead shows where it came from.
      body: JSON.stringify({ ...payload, pageUrl: payload.pageUrl || request.headers.get('referer') || '', skipEmail: true }),
      signal: AbortSignal.timeout(15000)
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => '');
      console.error(`[${tag}] Backend refused to save the submission (${response.status}): ${detail.slice(0, 300)}`);
    }
  } catch (error) {
    console.error(`[${tag}] Could not reach the backend to save the submission:`, error.message);
  }
}
