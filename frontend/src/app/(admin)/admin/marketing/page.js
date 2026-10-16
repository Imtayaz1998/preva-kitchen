'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import {
  ArrowRight, BarChart3, BellRing, CircleCheckBig, Clock3, Download, ExternalLink, FileSpreadsheet, Globe, Inbox,
  Megaphone, RefreshCw, Repeat, Search, TrendingDown, TrendingUp, UsersRound, X
} from 'lucide-react';
import Shell from '@/components/admin/Shell';
import { EmptyState, LoadingSkeleton, PageHeader, StatsCard } from '@/components/admin/AdminUI';
import { api } from '@/lib/admin-api';
import { exportContactsCsv, exportContactsXlsx } from '@/lib/marketing-export';
import { LEAD_STAGES, StagePill, stageClass, toDateInput } from '@/components/admin/LeadStages';
import '@/styles/admin-leads.css';
import '@/styles/admin-marketing.css';

const DAY = 24 * 60 * 60 * 1000;
const PAGE_SIZE = 25;
const RANGES = [['7', 'Last 7 days'], ['30', 'Last 30 days'], ['90', 'Last 90 days'], ['365', 'Last 12 months'], ['all', 'All time']];

const pagePath = (url) => {
  try { return new URL(url).pathname || '/'; } catch { return url || ''; }
};

const leadLink = (lead) => `/admin/leads?lead=${lead.type}:${lead.id}`;

const initials = (name, email) => (name || email || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

// One person = one contact: matched by email first, then by phone digits.
const contactKey = (lead) => {
  const email = String(lead.email || '').trim().toLowerCase();
  if (email) return `e:${email}`;
  const phone = String(lead.phone || '').replace(/\D/g, '');
  return phone ? `p:${phone}` : `id:${lead.type}:${lead.id}`;
};

function buildContacts(leads) {
  const map = new Map();
  for (const lead of leads) {
    const key = contactKey(lead);
    let contact = map.get(key);
    if (!contact) {
      contact = { key, name: '', email: '', phone: '', types: new Set(), typeLabels: new Set(), count: 0, firstAt: null, lastAt: null, lastPage: '', utmSource: '', utmCampaign: '', interests: [], latest: lead };
      map.set(key, contact);
    }
    contact.count += 1;
    contact.name ||= lead.name;
    contact.email ||= lead.email;
    contact.phone ||= lead.phone;
    contact.types.add(lead.type);
    contact.typeLabels.add(lead.typeLabel);
    const at = lead.createdAt ? new Date(lead.createdAt) : null;
    if (at && (!contact.lastAt || at > contact.lastAt)) {
      contact.lastAt = at;
      contact.latest = lead;
      if (lead.pageUrl) contact.lastPage = lead.pageUrl;
      if (lead.subject) contact.interests.unshift(lead.subject);
    } else if (lead.subject) contact.interests.push(lead.subject);
    if (at && (!contact.firstAt || at < contact.firstAt)) contact.firstAt = at;
    contact.lastPage ||= lead.pageUrl || '';
    const utm = lead.details?.utm || {};
    contact.utmSource ||= utm.utm_source || '';
    contact.utmCampaign ||= utm.utm_campaign || '';
  }
  return [...map.values()]
    .map((contact) => ({ ...contact, types: [...contact.types], typeLabels: [...contact.typeLabels] }))
    .sort((a, b) => (b.lastAt || 0) - (a.lastAt || 0));
}

// Daily bars for short ranges, weekly up to a year, monthly beyond.
function buildSeries(leads, start, end) {
  const span = (end - start) / DAY;
  const unit = span <= 62 ? 'day' : span <= 400 ? 'week' : 'month';
  const floor = (value) => {
    const date = new Date(value);
    date.setHours(0, 0, 0, 0);
    if (unit === 'week') date.setDate(date.getDate() - date.getDay());
    if (unit === 'month') date.setDate(1);
    return date;
  };
  const next = (date) => {
    const copy = new Date(date);
    if (unit === 'day') copy.setDate(copy.getDate() + 1);
    else if (unit === 'week') copy.setDate(copy.getDate() + 7);
    else copy.setMonth(copy.getMonth() + 1);
    return copy;
  };
  const buckets = [];
  for (let date = floor(start); date <= end; date = next(date)) buckets.push({ at: date, count: 0 });
  const index = new Map(buckets.map((bucket, position) => [bucket.at.getTime(), position]));
  for (const lead of leads) {
    if (!lead.createdAt) continue;
    const position = index.get(floor(lead.createdAt).getTime());
    if (position !== undefined) buckets[position].count += 1;
  }
  return { unit, buckets };
}

const tally = (items, pick, limit = 8) => Object.entries(items.reduce((counts, item) => {
  const label = pick(item);
  if (label) counts[label] = (counts[label] || 0) + 1;
  return counts;
}, {})).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count).slice(0, limit);

function TimeChart({ series }) {
  const [hover, setHover] = useState(null);
  const { buckets, unit } = series;
  const max = Math.max(1, ...buckets.map((bucket) => bucket.count));
  const label = (date) => (unit === 'month'
    ? date.toLocaleDateString(undefined, { month: 'short', year: '2-digit' })
    : date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' }));
  const every = Math.ceil(buckets.length / 7);
  const active = hover !== null ? buckets[hover] : null;

  return <div className="mk-time">
    <div className="mk-time-plot" onMouseLeave={() => setHover(null)}>
      <span className="mk-grid" style={{ bottom: '100%' }}><em>{max}</em></span>
      <span className="mk-grid" style={{ bottom: '50%' }}><em>{max >= 2 ? Math.round(max / 2) : ''}</em></span>
      <span className="mk-grid is-base" style={{ bottom: 0 }}><em>0</em></span>
      <div className="mk-cols">
        {buckets.map((bucket, position) => (
          <button type="button" key={bucket.at.getTime()} className={`mk-col ${hover === position ? 'is-hover' : ''}`}
            onMouseEnter={() => setHover(position)} onFocus={() => setHover(position)} onBlur={() => setHover(null)}
            aria-label={`${unit === 'day' ? '' : `${unit} of `}${label(bucket.at)}: ${bucket.count} leads`}>
            <i style={{ height: bucket.count ? `max(3px, ${(bucket.count / max) * 100}%)` : 0 }} />
          </button>
        ))}
      </div>
      {active && <div className="mk-tip" style={{ left: `${((hover + 0.5) / buckets.length) * 100}%` }}>
        <small>{unit === 'week' ? 'Week of ' : ''}{label(active.at)}</small>
        <strong>{active.count} lead{active.count === 1 ? '' : 's'}</strong>
      </div>}
    </div>
    <div className="mk-time-axis">
      {buckets.map((bucket, position) => <span key={bucket.at.getTime()}>{position % every === 0 ? label(bucket.at) : ''}</span>)}
    </div>
  </div>;
}

function RankBars({ rows, empty }) {
  if (!rows.length) return <p className="mk-empty">{empty}</p>;
  const max = Math.max(1, ...rows.map((row) => row.count));
  return <ul className="mk-rank">
    {rows.map((row) => (
      <li key={row.label} title={`${row.label}: ${row.count}`}>
        <div className="mk-rank-head"><span>{row.label}</span><b>{row.count}</b></div>
        <div className="mk-rank-track"><i style={{ width: `${(row.count / max) * 100}%` }} /></div>
      </li>
    ))}
  </ul>;
}

export default function MarketingDashboardPage() {
  const [leads, setLeads] = useState([]);
  const [types, setTypes] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [range, setRange] = useState('30');
  const [typeFilter, setTypeFilter] = useState('all');
  const [includeCareer, setIncludeCareer] = useState(false);
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(() => new Set());
  const [exporting, setExporting] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await api('/admin/leads');
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || 'Could not load leads.');
      setLeads(body.leads || []);
      setTypes(body.types || {});
    } catch (loadError) { setError(loadError.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [range, typeFilter, includeCareer, search]);

  // Career applicants are job seekers, not customers, so they stay out unless asked for.
  const pool = useMemo(() => leads.filter((lead) => (includeCareer || lead.type !== 'career') && (typeFilter === 'all' || lead.type === typeFilter)), [leads, includeCareer, typeFilter]);

  const window_ = useMemo(() => {
    const end = new Date();
    if (range !== 'all') return { start: new Date(end.getTime() - Number(range) * DAY), end, days: Number(range) };
    const dates = pool.map((lead) => new Date(lead.createdAt || 0).getTime()).filter(Boolean);
    return { start: new Date(dates.length ? Math.min(...dates) : end.getTime() - 30 * DAY), end, days: null };
  }, [range, pool]);

  const inRange = useMemo(() => pool.filter((lead) => lead.createdAt && new Date(lead.createdAt) >= window_.start), [pool, window_]);
  const previousCount = useMemo(() => {
    if (!window_.days) return null;
    const prevStart = new Date(window_.start.getTime() - window_.days * DAY);
    return pool.filter((lead) => lead.createdAt && new Date(lead.createdAt) >= prevStart && new Date(lead.createdAt) < window_.start).length;
  }, [pool, window_]);

  const contacts = useMemo(() => buildContacts(inRange), [inRange]);
  const series = useMemo(() => buildSeries(inRange, window_.start, window_.end), [inRange, window_]);
  const byType = useMemo(() => tally(inRange, (lead) => lead.typeLabel), [inRange]);
  const byPage = useMemo(() => tally(inRange, (lead) => (lead.pageUrl ? pagePath(lead.pageUrl) : '')), [inRange]);
  const bySource = useMemo(() => tally(inRange, (lead) => lead.details?.utm?.utm_source || ''), [inRange]);

  // Pipeline: customer leads only (career CVs have no stage).
  const pipeline = useMemo(() => {
    const staged = inRange.filter((lead) => lead.stage);
    const counts = Object.fromEntries(Object.keys(LEAD_STAGES).map((stage) => [stage, 0]));
    staged.forEach((lead) => { counts[lead.stage] = (counts[lead.stage] || 0) + 1; });
    const closed = counts.CONVERTED + counts.REJECTED;
    return {
      total: staged.length,
      counts,
      conversion: staged.length ? Math.round((counts.CONVERTED / staged.length) * 100) : 0,
      winRate: closed ? Math.round((counts.CONVERTED / closed) * 100) : null
    };
  }, [inRange]);

  // Action list ignores the date range: an old lead due today still needs a call.
  const todo = useMemo(() => {
    const today = toDateInput(new Date());
    const followUps = pool
      .filter((lead) => lead.stage === 'FOLLOW_UP' && lead.followUpAt)
      .map((lead) => ({ lead, day: toDateInput(lead.followUpAt) }))
      .sort((a, b) => a.day.localeCompare(b.day));
    const stalePending = pool.filter((lead) => lead.stage === 'PENDING' && lead.createdAt && Date.now() - new Date(lead.createdAt).getTime() > DAY);
    return {
      overdue: followUps.filter((item) => item.day < today),
      today: followUps.filter((item) => item.day === today),
      upcoming: followUps.filter((item) => item.day > today).slice(0, 5),
      stalePending
    };
  }, [pool]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) return contacts;
    return contacts.filter((contact) => [contact.name, contact.email, contact.phone, contact.typeLabels.join(' '), contact.interests.join(' '), contact.lastPage, contact.utmSource, contact.utmCampaign].join(' ').toLowerCase().includes(term));
  }, [contacts, search]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageRows = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => ({
    contacts: contacts.length,
    withEmail: contacts.filter((contact) => contact.email).length,
    withPhone: contacts.filter((contact) => contact.phone).length,
    repeat: contacts.filter((contact) => contact.count > 1).length
  }), [contacts]);
  const change = previousCount ? Math.round(((inRange.length - previousCount) / previousCount) * 100) : null;

  // Selection survives filtering; only selected contacts still on screen are exported.
  const selectedVisible = visible.filter((contact) => selected.has(contact.key));
  const allChecked = visible.length > 0 && selectedVisible.length === visible.length;
  const toggle = (key) => setSelected((current) => {
    const nextSet = new Set(current);
    if (nextSet.has(key)) nextSet.delete(key); else nextSet.add(key);
    return nextSet;
  });
  const toggleAll = () => setSelected((current) => {
    const nextSet = new Set(current);
    visible.forEach((contact) => (allChecked ? nextSet.delete(contact.key) : nextSet.add(contact.key)));
    return nextSet;
  });

  const filterLabel = () => {
    const parts = [RANGES.find(([value]) => value === range)?.[1], typeFilter === 'all' ? 'All forms' : types[typeFilter] || typeFilter];
    parts.push(includeCareer ? 'Career applicants included' : 'Career applicants excluded');
    if (search) parts.push(`Search: “${search}”`);
    return parts.join('  ·  ');
  };

  const runExport = async (format, list, scope) => {
    setExporting(`${format}-${scope}`);
    try {
      const fileName = `preva-leads-${scope}-${new Date().toISOString().slice(0, 10)}.${format}`;
      if (format === 'csv') exportContactsCsv({ contacts: list, fileName });
      else await exportContactsXlsx({ contacts: list, fileName, filterLabel: `${filterLabel()}${scope === 'selected' ? '  ·  Selected only' : ''}` });
    } catch (exportError) {
      setError(`Could not create the file: ${exportError.message}`);
    } finally {
      setExporting('');
    }
  };

  const typeEntries = Object.entries(types).filter(([type]) => includeCareer || type !== 'career');

  return <Shell>
    <PageHeader
      eyebrow="Inbox"
      title="Lead Dashboard"
      description="Every website enquiry in one place — how many came in, who to call next, and a clean contact list to export."
      icon={Megaphone}
      actions={<>
        <select className="input mk-range" value={range} onChange={(event) => setRange(event.target.value)} aria-label="Date range">
          {RANGES.map(([value, text]) => <option key={value} value={value}>{text}</option>)}
        </select>
        <button className="btn" type="button" onClick={load}><RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh</button>
      </>}
    />
    {error && <div className="error leads-error"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss"><X size={14} /></button></div>}

    <div className="mk-filters">
      <div className="leads-chips" role="tablist" aria-label="Form type">
        <button type="button" role="tab" aria-selected={typeFilter === 'all'} className={`leads-chip ${typeFilter === 'all' ? 'is-active' : ''}`} onClick={() => setTypeFilter('all')}>All forms</button>
        {typeEntries.map(([type, text]) => (
          <button type="button" role="tab" key={type} aria-selected={typeFilter === type} className={`leads-chip leads-type-${type} ${typeFilter === type ? 'is-active' : ''}`} onClick={() => setTypeFilter(type)}>{text}</button>
        ))}
      </div>
      <label className="mk-toggle">
        <input type="checkbox" checked={includeCareer} onChange={(event) => { setIncludeCareer(event.target.checked); if (!event.target.checked && typeFilter === 'career') setTypeFilter('all'); }} />
        <span>Include career applicants</span>
      </label>
    </div>

    {loading ? <LoadingSkeleton rows={5} cards /> : <>
      <section className="panel mk-flow" aria-label="How a lead moves">
        <header>
          <div>
            <h3>How a lead moves</h3>
            <small>Website form → our team works it → result. Click any step to open those leads.</small>
          </div>
          <div className="mk-flow-rate">
            <strong>{pipeline.conversion}%</strong>
            <small>converted{pipeline.winRate !== null ? ` · ${pipeline.winRate}% of closed leads won` : ''}</small>
          </div>
        </header>
        <ol className="mk-flow-steps">
          <li className="mk-flow-step stage-source">
            <Link href="/admin/leads">
              <span className="mk-flow-num">1</span>
              <span className="mk-flow-icon"><Inbox size={16} /></span>
              <b>{pipeline.total}</b>
              <strong>Form filled</strong>
              <small>Customer fills a form on the website — it lands here as Pending</small>
            </Link>
          </li>
          {['PENDING', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED'].map((stage, index) => {
            const meta = LEAD_STAGES[stage];
            const Icon = meta.icon;
            return <li key={stage} className={`mk-flow-step ${stageClass(stage)}`}>
              <ArrowRight className="mk-flow-arrow" size={16} aria-hidden="true" />
              <Link href={`/admin/leads?stage=${stage}`}>
                <span className="mk-flow-num">{index + 2}</span>
                <span className="mk-flow-icon"><Icon size={16} /></span>
                <b>{pipeline.counts[stage]}</b>
                <strong>{meta.label}</strong>
                <small>{meta.hint}</small>
              </Link>
            </li>;
          })}
          <li className={`mk-flow-step mk-flow-side ${stageClass('REJECTED')}`}>
            <Link href="/admin/leads?stage=REJECTED">
              <span className="mk-flow-icon"><X size={16} /></span>
              <b>{pipeline.counts.REJECTED}</b>
              <strong>Rejected</strong>
              <small>{LEAD_STAGES.REJECTED.hint}</small>
            </Link>
          </li>
        </ol>
      </section>

      <div className="mk-stats">
        <StatsCard label="Leads" value={inRange.length}
          helper={change === null ? (window_.days ? 'No leads in previous period' : 'All time') : `${change >= 0 ? '+' : ''}${change}% vs previous ${window_.days} days`}
          icon={change !== null && change < 0 ? TrendingDown : TrendingUp} tone={change !== null && change < 0 ? 'warning' : 'default'} />
        <StatsCard label="Waiting for first call" value={todo.stalePending.length} helper="Pending over 24 hours (any date)" icon={Clock3} tone={todo.stalePending.length ? 'warning' : 'default'} href="/admin/leads?stage=PENDING" />
        <StatsCard label="Converted" value={pipeline.counts.CONVERTED} helper={`${pipeline.conversion}% of leads in this period`} icon={CircleCheckBig} />
        <StatsCard label="Unique contacts" value={stats.contacts} helper={`${stats.withEmail} with email · ${stats.withPhone} with phone`} icon={UsersRound} />
        <StatsCard label="Repeat contacts" value={stats.repeat} helper="Filled more than one form" icon={Repeat} />
      </div>

      <div className="mk-charts">
        <section className="panel mk-card mk-card--wide">
          <header><h3><BarChart3 size={16} /> Leads over time</h3><small>{series.unit === 'day' ? 'Per day' : series.unit === 'week' ? 'Per week' : 'Per month'}</small></header>
          {inRange.length ? <TimeChart series={series} /> : <p className="mk-empty">No leads in this period.</p>}
        </section>
        <section className="panel mk-card mk-todo">
          <header><h3><BellRing size={16} /> Follow-ups</h3><small>Who to call</small></header>
          {!todo.overdue.length && !todo.today.length && !todo.upcoming.length
            ? <p className="mk-empty">No follow-ups planned. Open a lead and set a follow-up date.</p>
            : <ul className="mk-todo-list">
              {[['Overdue', todo.overdue, 'is-late'], ['Today', todo.today, 'is-today'], ['Coming up', todo.upcoming, '']].filter(([, items]) => items.length).map(([title, items, tone]) => (
                <li key={title}>
                  <span className={`mk-todo-title ${tone}`}>{title} · {items.length}</span>
                  {items.map(({ lead, day }) => (
                    <Link key={`${lead.type}-${lead.id}`} href={leadLink(lead)} className="mk-todo-item">
                      <span><b>{lead.name || lead.email || 'Unnamed'}</b><small>{lead.subject || lead.typeLabel}</small></span>
                      <em>{new Date(`${day}T00:00:00`).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}</em>
                    </Link>
                  ))}
                </li>
              ))}
            </ul>}
        </section>
        <section className="panel mk-card">
          <header><h3>By form</h3><small>Leads</small></header>
          <RankBars rows={byType} empty="No leads in this period." />
        </section>
        <section className="panel mk-card">
          <header><h3><Globe size={16} /> Top pages</h3><small>Where the form was filled</small></header>
          <RankBars rows={byPage} empty="No page recorded for these leads." />
        </section>
        <section className="panel mk-card">
          <header><h3><Megaphone size={16} /> Ad sources</h3><small>From UTM links</small></header>
          <RankBars rows={bySource} empty="No UTM-tagged leads yet. Add ?utm_source=… to ad links to see them here." />
        </section>
      </div>

      <div className="panel leads-panel">
        <div className="mk-list-head">
          <div>
            <h3>Contact list</h3>
            <small>{visible.length} contact{visible.length === 1 ? '' : 's'} · newest activity first</small>
          </div>
          <div className="ats-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, phone, page, campaign…" /></div>
          <div className="mk-export">
            <button className="btn btn-secondary" type="button" disabled={!visible.length || Boolean(exporting)} onClick={() => runExport('csv', visible, 'all')}><Download size={15} /> CSV</button>
            <button className="btn" type="button" disabled={!visible.length || Boolean(exporting)} onClick={() => runExport('xlsx', visible, 'all')}><FileSpreadsheet size={15} /> {exporting === 'xlsx-all' ? 'Preparing…' : `Export all (${visible.length})`}</button>
          </div>
        </div>

        {selectedVisible.length > 0 && <div className="mk-bulk" role="status">
          <strong>{selectedVisible.length} selected</strong>
          <button className="btn btn-secondary" type="button" disabled={Boolean(exporting)} onClick={() => runExport('csv', selectedVisible, 'selected')}><Download size={14} /> CSV</button>
          <button className="btn" type="button" disabled={Boolean(exporting)} onClick={() => runExport('xlsx', selectedVisible, 'selected')}><FileSpreadsheet size={14} /> {exporting === 'xlsx-selected' ? 'Preparing…' : 'Export selected'}</button>
          <button className="btn btn-secondary" type="button" onClick={() => setSelected(new Set())}><X size={14} /> Clear</button>
        </div>}

        {!visible.length ? (
          <EmptyState icon={UsersRound} title={contacts.length ? 'No contacts match this search' : 'No contacts in this period'} description={contacts.length ? 'Try another search.' : 'Pick a longer date range or another form.'} />
        ) : <>
          <div className="leads-table-wrap">
            <table className="table leads-table mk-table">
              <thead><tr>
                <th className="mk-check"><input type="checkbox" checked={allChecked} onChange={toggleAll} aria-label={allChecked ? 'Unselect all contacts' : `Select all ${visible.length} contacts`} /></th>
                <th>Contact</th><th>Stage</th><th>Interested in</th><th>Latest enquiry</th><th>Leads</th><th>Last seen</th><th>Source</th>
              </tr></thead>
              <tbody>
                {pageRows.map((contact) => (
                  <tr key={contact.key} className={selected.has(contact.key) ? 'is-selected' : ''} onClick={() => toggle(contact.key)}>
                    <td className="mk-check" onClick={(event) => event.stopPropagation()}><input type="checkbox" checked={selected.has(contact.key)} onChange={() => toggle(contact.key)} aria-label={`Select ${contact.name || contact.email}`} /></td>
                    <td>
                      <div className="leads-person">
                        <span className={`leads-avatar leads-type-${contact.types[0]}`}>{initials(contact.name, contact.email)}</span>
                        <div>
                          <Link className="mk-open" href={leadLink(contact.latest)} onClick={(event) => event.stopPropagation()} title="Open the latest lead">{contact.name || contact.email || 'Unnamed'} <ExternalLink size={11} /></Link>
                          <small>{[contact.email, contact.phone].filter(Boolean).join(' · ') || '—'}</small>
                        </div>
                      </div>
                    </td>
                    <td><StagePill stage={contact.latest.stage} /></td>
                    <td><div className="mk-pills">{contact.types.map((type, position) => <span key={type} className={`leads-type leads-type-${type}`}>{contact.typeLabels[position]}</span>)}</div></td>
                    <td><div className="leads-summary">{contact.interests[0] || '—'}</div></td>
                    <td><b className="mk-count">{contact.count}</b></td>
                    <td><span title={contact.lastAt ? contact.lastAt.toLocaleString() : ''}>{contact.lastAt ? contact.lastAt.toLocaleDateString() : '—'}</span></td>
                    <td>
                      {contact.utmSource && <small className="leads-source">{contact.utmSource}{contact.utmCampaign ? ` · ${contact.utmCampaign}` : ''}</small>}
                      <small className="leads-page-url is-plain">{contact.lastPage ? pagePath(contact.lastPage) : 'Page not recorded'}</small>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          {pageCount > 1 && <div className="leads-pagination">
            <span>Showing {(page - 1) * PAGE_SIZE + 1}–{Math.min(page * PAGE_SIZE, visible.length)} of {visible.length}</span>
            <div>
              <button className="btn btn-secondary" type="button" disabled={page === 1} onClick={() => setPage(page - 1)}>Previous</button>
              <span>Page {page} / {pageCount}</span>
              <button className="btn btn-secondary" type="button" disabled={page === pageCount} onClick={() => setPage(page + 1)}>Next</button>
            </div>
          </div>}
        </>}
      </div>
    </>}
  </Shell>;
}
