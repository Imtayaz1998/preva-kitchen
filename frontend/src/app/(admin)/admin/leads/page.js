'use client';

import { useEffect, useMemo, useState } from 'react';
import {
  BriefcaseBusiness, CalendarDays, CalendarRange, CheckCheck, Copy, Download, ExternalLink, Eye, FileText,
  Inbox, Magnet, Mail, Phone, RefreshCw, Search, Sparkles, Trash2, X
} from 'lucide-react';
import Shell from '@/components/admin/Shell';
import { EmptyState, LoadingSkeleton, PageHeader, StatsCard, StatusBadge } from '@/components/admin/AdminUI';
import { useConfirm } from '@/components/admin/ConfirmDialog';
import { api } from '@/lib/admin-api';
import { exportLeadsXlsx } from '@/lib/leads-export';
import '@/styles/admin-leads.css';

const PAGE_SIZE = 25;
const DAY = 24 * 60 * 60 * 1000;

// Field names as stored by the forms → readable labels for the preview and CSV.
const FIELD_LABELS = {
  guests: 'Guests', date: 'Date', time: 'Time', occasion: 'Occasion', eventType: 'Event type', useCase: 'Use case',
  landingPage: 'Landing page', preferredDate: 'Preferred date', guestCount: 'Guest count', consent: 'Consent',
  referrer: 'Referrer', role: 'Role', availability: 'Availability', startDate: 'Start date', responseDueAt: 'Respond by',
  firstContactAt: 'First contacted', eventDate: 'Event date', nextActionAt: 'Next follow-up', referenceId: 'Reference'
};

const humanize = (key) => FIELD_LABELS[key] || key
  .replace(/^details\./, '')
  .replace(/^utm\.utm_/, 'UTM ')
  .replace(/\./g, ' › ')
  .replace(/([a-z])([A-Z])/g, '$1 $2')
  .replace(/^./, (letter) => letter.toUpperCase());

// Nested objects (utm, details{…}) become dotted keys so every value gets
// its own row in the preview and its own column in the CSV.
function flatten(value, prefix = '', out = {}) {
  for (const [key, inner] of Object.entries(value || {})) {
    const path = prefix ? `${prefix}.${key}` : key;
    if (inner && typeof inner === 'object' && !Array.isArray(inner)) flatten(inner, path, out);
    else if (inner !== null && inner !== undefined && inner !== '') out[path] = Array.isArray(inner) ? inner.join(', ') : inner;
  }
  return out;
}

const formatValue = (value) => {
  if (typeof value === 'boolean') return value ? 'Yes' : 'No';
  if (typeof value === 'string' && /^\d{4}-\d{2}-\d{2}T/.test(value)) return new Date(value).toLocaleString();
  return String(value);
};

const formatSize = (bytes) => (!bytes ? '' : bytes > 1024 * 1024 ? `${(bytes / 1024 / 1024).toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`);

const relativeTime = (value) => {
  if (!value) return '';
  const diff = Date.now() - new Date(value).getTime();
  if (diff < 60 * 1000) return 'just now';
  if (diff < 60 * 60 * 1000) return `${Math.floor(diff / 60000)} min ago`;
  if (diff < DAY) return `${Math.floor(diff / 3600000)} h ago`;
  if (diff < 7 * DAY) return `${Math.floor(diff / DAY)} d ago`;
  return new Date(value).toLocaleDateString();
};

// "https://prevakitchen.com/birthday-parties?utm_source=x" → "/birthday-parties?utm_source=x"
const pagePath = (url) => {
  try {
    const parsed = new URL(url);
    return `${parsed.pathname}${parsed.search}` || '/';
  } catch {
    return url;
  }
};

const initials = (name, email) => (name || email || '?').split(/[\s@.]+/).filter(Boolean).slice(0, 2).map((part) => part[0]).join('').toUpperCase();

export default function LeadsPage() {
  const confirmAction = useConfirm();
  const [leads, setLeads] = useState([]);
  const [types, setTypes] = useState({});
  const [statusOptions, setStatusOptions] = useState({ inbox: ['NEW', 'READ', 'CONFIRMED', 'ARCHIVED'], career: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [typeFilter, setTypeFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('');
  const [search, setSearch] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [page, setPage] = useState(1);
  const [selected, setSelected] = useState(null);
  const [cv, setCv] = useState(null);
  const [copied, setCopied] = useState('');

  const load = async () => {
    setLoading(true); setError('');
    try {
      const response = await api('/admin/leads');
      const body = await response.json().catch(() => null);
      if (!response.ok) throw new Error(body?.message || 'Could not load leads.');
      setLeads(body.leads || []);
      setTypes(body.types || {});
      if (body.statuses) setStatusOptions(body.statuses);
      const params = new URLSearchParams(window.location.search);
      if (params.get('type')) setTypeFilter(params.get('type'));
    } catch (loadError) { setError(loadError.message); } finally { setLoading(false); }
  };
  useEffect(() => { load(); }, []);
  useEffect(() => { setPage(1); }, [typeFilter, statusFilter, search, from, to]);

  const typeCounts = useMemo(() => leads.reduce((counts, lead) => ({ ...counts, [lead.type]: (counts[lead.type] || 0) + 1 }), {}), [leads]);

  const visible = useMemo(() => {
    const term = search.trim().toLowerCase();
    const start = from ? new Date(`${from}T00:00:00`) : null;
    const end = to ? new Date(`${to}T23:59:59`) : null;
    return leads.filter((lead) => {
      if (typeFilter !== 'all' && lead.type !== typeFilter) return false;
      if (statusFilter && lead.status !== statusFilter) return false;
      const created = lead.createdAt ? new Date(lead.createdAt) : null;
      if (start && (!created || created < start)) return false;
      if (end && (!created || created > end)) return false;
      if (!term) return true;
      const haystack = [lead.name, lead.email, lead.phone, lead.subject, lead.message, lead.source, lead.pageUrl, lead.typeLabel, ...Object.values(flatten(lead.details))].join(' ').toLowerCase();
      return haystack.includes(term);
    });
  }, [leads, typeFilter, statusFilter, search, from, to]);

  const pageCount = Math.max(1, Math.ceil(visible.length / PAGE_SIZE));
  const pageRows = visible.slice((page - 1) * PAGE_SIZE, page * PAGE_SIZE);

  const stats = useMemo(() => {
    const now = Date.now();
    const startOfToday = new Date(); startOfToday.setHours(0, 0, 0, 0);
    return {
      total: leads.length,
      fresh: leads.filter((lead) => lead.status === 'NEW').length,
      today: leads.filter((lead) => lead.createdAt && new Date(lead.createdAt) >= startOfToday).length,
      week: leads.filter((lead) => lead.createdAt && now - new Date(lead.createdAt).getTime() < 7 * DAY).length,
      cvs: leads.filter((lead) => lead.resume).length
    };
  }, [leads]);

  const allStatuses = useMemo(() => [...new Set(leads.map((lead) => lead.status))].sort(), [leads]);
  const statusesFor = (lead) => {
    const list = lead.type === 'career' ? statusOptions.career : statusOptions.inbox;
    return list.includes(lead.status) ? list : [lead.status, ...list];
  };

  const patchLead = (lead, changes) => {
    setLeads((current) => current.map((item) => (item.id === lead.id && item.type === lead.type ? { ...item, ...changes } : item)));
    setSelected((current) => (current?.id === lead.id && current.type === lead.type ? { ...current, ...changes } : current));
  };

  const updateStatus = async (lead, status) => {
    if (status === lead.status) return;
    const previous = lead.status;
    patchLead(lead, { status });
    const response = await api(`/admin/leads/${lead.type}/${lead.id}/status`, { method: 'PUT', body: JSON.stringify({ status }) });
    if (!response.ok) {
      patchLead(lead, { status: previous });
      const body = await response.json().catch(() => null);
      setError(body?.message || 'Could not update the status.');
    }
  };

  const openLead = (lead) => {
    setSelected(lead);
    setCv(null);
    // Opening a brand-new website enquiry counts as reading it.
    if (lead.status === 'NEW' && lead.type !== 'career' && lead.type !== 'newsletter') updateStatus(lead, 'READ');
  };

  const closeLead = () => { if (cv?.url) URL.revokeObjectURL(cv.url); setCv(null); setSelected(null); };

  const deleteLead = async (lead) => {
    if (!await confirmAction({ title: 'Delete this lead?', description: `${lead.name || lead.email || 'This submission'} will be permanently deleted and cannot be recovered.`, confirmLabel: 'Delete lead', tone: 'danger' })) return;
    const response = await api(`/admin/leads/${lead.type}/${lead.id}`, { method: 'DELETE' });
    if (!response.ok) { const body = await response.json().catch(() => null); setError(body?.message || 'Could not delete the lead.'); return; }
    setLeads((current) => current.filter((item) => !(item.id === lead.id && item.type === lead.type)));
    if (selected?.id === lead.id) closeLead();
  };

  const fetchResume = async (lead) => {
    const response = await api(`/admin/career-applications/${lead.id}/resume`);
    if (!response.ok) throw new Error('Could not load the CV.');
    return response.blob();
  };

  const downloadResume = async (lead) => {
    try {
      const blob = await fetchResume(lead);
      const url = URL.createObjectURL(blob), link = document.createElement('a');
      link.href = url; link.download = lead.resume?.name || 'resume'; link.click();
      setTimeout(() => URL.revokeObjectURL(url), 1000);
    } catch (downloadError) { setError(downloadError.message); }
  };

  const previewResume = async (lead) => {
    setCv({ loading: true });
    try {
      const blob = await fetchResume(lead);
      const name = lead.resume?.name || 'resume';
      const isPdf = blob.type === 'application/pdf' || lead.resume?.mimeType === 'application/pdf' || /\.pdf$/i.test(name);
      setCv({ url: URL.createObjectURL(isPdf ? new Blob([blob], { type: 'application/pdf' }) : blob), isPdf });
    } catch (previewError) { setCv({ error: previewError.message }); }
  };

  const copy = async (value, key) => {
    try { await navigator.clipboard.writeText(value); setCopied(key); setTimeout(() => setCopied(''), 1500); } catch { /* clipboard blocked */ }
  };

  const [exporting, setExporting] = useState(false);
  const exportExcel = async () => {
    setExporting(true);
    try {
      const parts = [typeFilter === 'all' ? 'All lead types' : types[typeFilter] || typeFilter];
      if (statusFilter) parts.push(`Status: ${statusFilter}`);
      if (from || to) parts.push(`Dates: ${from || '…'} to ${to || '…'}`);
      if (search) parts.push(`Search: “${search}”`);
      await exportLeadsXlsx({
        leads: visible, flatten,
        filterLabel: parts.join('  ·  '),
        fileName: `preva-leads-${typeFilter === 'all' ? 'all' : typeFilter}-${new Date().toISOString().slice(0, 10)}.xlsx`
      });
    } catch (exportError) {
      setError(`Could not create the Excel file: ${exportError.message}`);
    } finally {
      setExporting(false);
    }
  };

  const clearFilters = () => { setTypeFilter('all'); setStatusFilter(''); setSearch(''); setFrom(''); setTo(''); };
  const filtersActive = typeFilter !== 'all' || statusFilter || search || from || to;
  const details = selected ? Object.entries(flatten(selected.details)) : [];

  return <Shell>
    <PageHeader
      eyebrow="Inbox"
      title="Leads"
      description="Every form filled on the website — contact, reservations, events, careers, newsletter — in one place."
      icon={Magnet}
      actions={<>
        <button className="btn btn-secondary" type="button" onClick={exportExcel} disabled={!visible.length || exporting} title="Download the leads shown below as a formatted Excel sheet"><Download size={15} /> {exporting ? 'Preparing…' : `Download${filtersActive ? ` (${visible.length})` : ''}`}</button>
        <button className="btn" type="button" onClick={load}><RefreshCw size={15} className={loading ? 'spin' : ''} /> Refresh</button>
      </>}
    />
    {error && <div className="error leads-error"><span>{error}</span><button type="button" onClick={() => setError('')} aria-label="Dismiss"><X size={14} /></button></div>}

    <div className="leads-stats">
      <StatsCard label="Total leads" value={stats.total} helper="All time, every form" icon={Inbox} />
      <StatsCard label="New" value={stats.fresh} helper="Not handled yet" icon={Sparkles} tone="warning" />
      <StatsCard label="Today" value={stats.today} helper="Received since midnight" icon={CalendarDays} />
      <StatsCard label="Last 7 days" value={stats.week} helper="Rolling week" icon={CalendarRange} />
      <StatsCard label="CVs received" value={stats.cvs} helper="Career applications" icon={BriefcaseBusiness} />
    </div>

    <div className="panel leads-panel">
      <div className="leads-chips" role="tablist" aria-label="Lead type">
        <button type="button" role="tab" aria-selected={typeFilter === 'all'} className={`leads-chip ${typeFilter === 'all' ? 'is-active' : ''}`} onClick={() => setTypeFilter('all')}>All <b>{leads.length}</b></button>
        {Object.entries(types).map(([type, label]) => (
          <button type="button" role="tab" key={type} aria-selected={typeFilter === type} className={`leads-chip leads-type-${type} ${typeFilter === type ? 'is-active' : ''}`} onClick={() => setTypeFilter(type)}>
            {label} <b>{typeCounts[type] || 0}</b>
          </button>
        ))}
      </div>

      <div className="leads-toolbar">
        <div className="ats-search"><Search size={15} /><input value={search} onChange={(event) => setSearch(event.target.value)} placeholder="Search name, email, phone, message, page…" /></div>
        <select className="input" value={statusFilter} onChange={(event) => setStatusFilter(event.target.value)} aria-label="Status">
          <option value="">All statuses</option>
          {allStatuses.map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
        </select>
        <label className="leads-date"><span>From</span><input className="input" type="date" value={from} max={to || undefined} onChange={(event) => setFrom(event.target.value)} /></label>
        <label className="leads-date"><span>To</span><input className="input" type="date" value={to} min={from || undefined} onChange={(event) => setTo(event.target.value)} /></label>
        {filtersActive ? <button className="btn btn-secondary" type="button" onClick={clearFilters}><X size={14} /> Clear</button> : <span />}
        <span className="ats-result-count">{visible.length} lead{visible.length === 1 ? '' : 's'}</span>
      </div>

      {loading ? <LoadingSkeleton rows={8} /> : !visible.length ? (
        <EmptyState icon={Magnet} title={leads.length ? 'No leads match these filters' : 'No leads yet'} description={leads.length ? 'Try clearing the filters or searching for something else.' : 'Form submissions from the website will appear here automatically.'} action={filtersActive ? <button className="btn btn-secondary" type="button" onClick={clearFilters}>Clear filters</button> : null} />
      ) : <>
        <div className="leads-table-wrap">
          <table className="table leads-table">
            <thead><tr><th>Lead</th><th>Type</th><th>Interest / summary</th><th>Form / page URL</th><th>Received</th><th>Status</th><th aria-label="Actions" /></tr></thead>
            <tbody>
              {pageRows.map((lead) => (
                <tr key={`${lead.type}-${lead.id}`} className={lead.status === 'NEW' ? 'is-new' : ''} onClick={() => openLead(lead)}>
                  <td>
                    <div className="leads-person">
                      <span className={`leads-avatar leads-type-${lead.type}`}>{initials(lead.name, lead.email)}</span>
                      <div><strong>{lead.name || lead.email || 'Unnamed'}</strong><small>{[lead.email, lead.phone].filter(Boolean).join(' · ') || '—'}</small></div>
                    </div>
                  </td>
                  <td><span className={`leads-type leads-type-${lead.type}`}>{lead.typeLabel}</span></td>
                  <td><div className="leads-summary">{lead.subject || '—'}</div>{lead.message && <small className="leads-snippet">{lead.message}</small>}</td>
                  <td onClick={(event) => event.stopPropagation()}>
                    <small className="leads-source">{lead.source}</small>
                    {lead.pageUrl
                      ? <a className="leads-page-url" href={lead.pageUrl} target="_blank" rel="noreferrer" title={lead.pageUrl}>{pagePath(lead.pageUrl)} <ExternalLink size={11} /></a>
                      : <small className="leads-page-url is-empty">Page not recorded</small>}
                  </td>
                  <td><span title={lead.createdAt ? new Date(lead.createdAt).toLocaleString() : ''}>{relativeTime(lead.createdAt)}</span></td>
                  <td onClick={(event) => event.stopPropagation()}>
                    {lead.type === 'newsletter' ? <StatusBadge status={lead.status} /> : (
                      <select className="input leads-status-select" value={lead.status} onChange={(event) => updateStatus(lead, event.target.value)} aria-label={`Status of ${lead.name || lead.email}`}>
                        {statusesFor(lead).map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
                      </select>
                    )}
                  </td>
                  <td onClick={(event) => event.stopPropagation()}>
                    <div className="leads-row-actions">
                      <button type="button" className="icon-button" title="Preview" onClick={() => openLead(lead)}><Eye size={15} /></button>
                      {lead.resume && <button type="button" className="icon-button" title="Download CV" onClick={() => downloadResume(lead)}><FileText size={15} /></button>}
                    </div>
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

    {selected && <div className="modal-overlay leads-drawer-overlay" onClick={closeLead}>
      <aside className="leads-drawer" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-label={`Lead: ${selected.name || selected.email}`}>
        <div className="leads-drawer-head">
          <span className={`leads-avatar leads-avatar--lg leads-type-${selected.type}`}>{initials(selected.name, selected.email)}</span>
          <div className="leads-drawer-title">
            <span className={`leads-type leads-type-${selected.type}`}>{selected.typeLabel}</span>
            <h2>{selected.name || selected.email || 'Unnamed lead'}</h2>
            <p>Received {selected.createdAt ? new Date(selected.createdAt).toLocaleString() : '—'}</p>
          </div>
          <button type="button" className="icon-button" onClick={closeLead} aria-label="Close"><X size={18} /></button>
        </div>

        <div className="leads-drawer-actions">
          {selected.email && <a className="btn btn-secondary" href={`mailto:${selected.email}`}><Mail size={14} /> Email</a>}
          {selected.phone && <a className="btn btn-secondary" href={`tel:${selected.phone}`}><Phone size={14} /> Call</a>}
          {selected.type === 'newsletter' ? <StatusBadge status={selected.status} /> : (
            <select className="input leads-status-select" value={selected.status} onChange={(event) => updateStatus(selected, event.target.value)} aria-label="Status">
              {statusesFor(selected).map((status) => <option key={status} value={status}>{status.replaceAll('_', ' ')}</option>)}
            </select>
          )}
          {selected.type !== 'career' && selected.type !== 'newsletter' && selected.status !== 'CONFIRMED' && <button type="button" className="btn" onClick={() => updateStatus(selected, 'CONFIRMED')}><CheckCheck size={14} /> Mark handled</button>}
        </div>

        <div className="leads-drawer-body">
          <section className="leads-section">
            <h3>Contact</h3>
            <dl className="leads-fields">
              <div><dt>Name</dt><dd>{selected.name || '—'}</dd></div>
              <div><dt>Email</dt><dd>{selected.email ? <button type="button" className="leads-copy" onClick={() => copy(selected.email, 'email')}>{selected.email} <Copy size={12} />{copied === 'email' && <em>Copied</em>}</button> : '—'}</dd></div>
              <div><dt>Phone</dt><dd>{selected.phone ? <button type="button" className="leads-copy" onClick={() => copy(selected.phone, 'phone')}>{selected.phone} <Copy size={12} />{copied === 'phone' && <em>Copied</em>}</button> : '—'}</dd></div>
              <div><dt>Status</dt><dd><StatusBadge status={selected.status} /></dd></div>
            </dl>
          </section>

          <section className="leads-section">
            <h3>Enquiry</h3>
            <dl className="leads-fields">
              <div className="is-wide"><dt>Interest / summary</dt><dd>{selected.subject || '—'}</dd></div>
              {selected.message && <div className="is-wide"><dt>Message</dt><dd className="leads-message">{selected.message}</dd></div>}
              <div><dt>Form</dt><dd>{selected.source}</dd></div>
              <div><dt>Page</dt><dd>{selected.pageUrl ? <a href={selected.pageUrl} target="_blank" rel="noreferrer" className="leads-link">{selected.pageUrl} <ExternalLink size={12} /></a> : 'Not recorded'}</dd></div>
            </dl>
          </section>

          {selected.resume && <section className="leads-section">
            <h3>CV / resume</h3>
            <div className="leads-cv">
              <FileText size={22} />
              <div><strong>{selected.resume.name}</strong><small>{[selected.resume.mimeType, formatSize(selected.resume.size)].filter(Boolean).join(' · ')}</small></div>
              <button type="button" className="btn btn-secondary" onClick={() => previewResume(selected)}><Eye size={14} /> Preview</button>
              <button type="button" className="btn" onClick={() => downloadResume(selected)}><Download size={14} /> Download</button>
            </div>
            {cv && (cv.loading ? <LoadingSkeleton rows={4} /> : cv.error ? <div className="error">{cv.error}</div> : cv.isPdf
              ? <iframe className="leads-cv-frame" title={`CV of ${selected.name}`} src={cv.url} />
              : <EmptyState icon={FileText} title="Preview not available for this file type" description="Word files (.doc / .docx) can't be shown in the browser. Use Download to open it." />)}
            <a className="leads-link" href={`/admin/career-applications?candidate=${selected.id}`}>Open full hiring record <ExternalLink size={12} /></a>
          </section>}

          {details.length > 0 && <section className="leads-section">
            <h3>All submitted details</h3>
            <dl className="leads-fields">
              {details.map(([key, value]) => <div key={key} className={String(value).length > 60 ? 'is-wide' : ''}><dt>{humanize(key)}</dt><dd>{formatValue(value)}</dd></div>)}
            </dl>
          </section>}
        </div>

        <div className="leads-drawer-foot">
          <small>ID {selected.id}</small>
          <button type="button" className="btn btn-danger" onClick={() => deleteLead(selected)}><Trash2 size={14} /> Delete</button>
        </div>
      </aside>
    </div>}
  </Shell>;
}
