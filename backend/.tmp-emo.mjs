import { MongoClient } from 'mongodb';
import fs from 'fs';
const env = Object.fromEntries(fs.readFileSync('.env','utf8').split(/\r?\n/).filter(l=>l.includes('=')&&!l.startsWith('#')).map(l=>[l.slice(0,l.indexOf('=')).trim(), l.slice(l.indexOf('=')+1).trim().replace(/^["']|["']$/g,'')]));
const c = new MongoClient(env.MONGODB_URI); await c.connect();
const col = c.db(env.MONGODB_DB).collection('content');
const re = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}\u{2B50}\u{2B06}\u{2194}-\u{21FF}][\u{FE0F}\u{200D}\u{1F3FB}-\u{1F3FF}]*/gu;
for (const slug of ['anniversary-parties', 'car-shows-and-bike-nights', 'comedy-shows']) {
  const p = await col.findOne({ slug, status: 'DRAFT' });
  const h = p.customHtml; const seen = {};
  for (const m of h.matchAll(re)) { const ctx = h.slice(Math.max(0, m.index - 90), m.index + 6).replace(/\s+/g, ' '); (seen[m[0]] ||= []).push(ctx.slice(-96)); }
  console.log('==', slug);
  for (const [e, ctxs] of Object.entries(seen)) console.log(JSON.stringify(e), [...e].map(ch => ch.codePointAt(0).toString(16)).join(' '), ctxs.length, '|', ctxs[0]);
  const jsE = [...new Set((p.customJs.match(re) || []))]; if (jsE.length) console.log('  in JS:', jsE);
}
await c.close();
