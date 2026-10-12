"use client";

import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import { CalendarDays } from 'lucide-react';
import s from './CalendarDatePicker.module.css';

const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const DOW = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const POP_WIDTH = 300;
const GAP = 8;

function ymd(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

function displayDate(key) {
  const [y, m, d] = key.split('-');
  return `${m}/${d}/${y}`;
}

/**
 * Read-only date field that opens a month calendar. `value` / `onChange` use
 * YYYY-MM-DD, the same format a native date input submits. Past days are
 * disabled; nothing here checks real availability.
 *
 * The calendar is portalled to <body> with fixed positioning so a parent card
 * with overflow:hidden can never clip it. It opens below the field, or above
 * when there is no room below, and follows the field on scroll/resize.
 */
export default function CalendarDatePicker({
  id, value, onChange, invalid, inputClassName, invalidClassName, inputStyle,
  ariaLabel = 'Choose a date', hint, align = 'right'
}) {
  const [open, setOpen] = useState(false);
  const [view, setView] = useState(null);
  const [pos, setPos] = useState(null);
  const wrapRef = useRef(null);
  const inputRef = useRef(null);
  const popRef = useRef(null);

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const minMonth = today.getFullYear() * 12 + today.getMonth();
  const maxMonth = minMonth + 23;

  const place = useCallback(() => {
    const field = inputRef.current?.getBoundingClientRect();
    if (!field) return;
    const width = Math.min(POP_WIDTH, window.innerWidth - 32);
    const height = popRef.current?.offsetHeight || 360;
    const below = field.bottom + GAP;
    const top = below + height > window.innerHeight && field.top - GAP - height > 0 ? field.top - GAP - height : below;
    let left = align === 'left' ? field.left : field.right - width;
    left = Math.max(16, Math.min(left, window.innerWidth - width - 16));
    setPos({ top, left, width });
  }, [align]);

  useLayoutEffect(() => {
    if (!open) return undefined;
    place();
    const frame = requestAnimationFrame(place); // re-place once the real height is known
    window.addEventListener('scroll', place, true);
    window.addEventListener('resize', place);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', place, true);
      window.removeEventListener('resize', place);
    };
  }, [open, place, view]);

  useEffect(() => {
    if (!open) return undefined;
    const onDocClick = (e) => {
      if (wrapRef.current?.contains(e.target) || popRef.current?.contains(e.target)) return;
      setOpen(false);
    };
    const onKey = (e) => { if (e.key === 'Escape') { setOpen(false); inputRef.current?.focus(); } };
    document.addEventListener('mousedown', onDocClick);
    document.addEventListener('keydown', onKey);
    return () => {
      document.removeEventListener('mousedown', onDocClick);
      document.removeEventListener('keydown', onKey);
    };
  }, [open]);

  function openPicker() {
    if (value) {
      const [y, m] = value.split('-').map(Number);
      setView({ y, m: m - 1 });
    } else if (!view) {
      setView({ y: today.getFullYear(), m: today.getMonth() });
    }
    setOpen(true);
  }

  function shift(delta) {
    setView((cur) => {
      const idx = cur.y * 12 + cur.m + delta;
      return { y: Math.floor(idx / 12), m: idx % 12 };
    });
  }

  function pick(key) {
    onChange(key);
    setOpen(false);
    inputRef.current?.focus();
  }

  const cells = [];
  if (view) {
    const first = new Date(view.y, view.m, 1).getDay();
    const days = new Date(view.y, view.m + 1, 0).getDate();
    for (let i = 0; i < first; i++) cells.push(<div key={`e${i}`} className={`${s.day} ${s.empty}`} />);
    for (let d = 1; d <= days; d++) {
      const date = new Date(view.y, view.m, d);
      const key = ymd(date);
      const past = date < today;
      const label = `${MONTHS[view.m]} ${d}, ${view.y}`;
      cells.push(
        <button
          key={key}
          type="button"
          className={`${s.day} ${past ? s.past : ''} ${key === value ? s.selected : ''}`}
          disabled={past}
          aria-label={past ? `${label}, in the past` : label}
          aria-current={key === value ? 'date' : undefined}
          onClick={() => pick(key)}
        >
          {d}
        </button>
      );
    }
  }
  const current = view ? view.y * 12 + view.m : minMonth;

  return (
    <div ref={wrapRef} className={s.wrap}>
      <div className={s.field}>
        <input
          ref={inputRef}
          id={id}
          type="text"
          readOnly
          required
          autoComplete="off"
          placeholder="MM/DD/YYYY"
          value={value ? displayDate(value) : ''}
          aria-label={ariaLabel}
          aria-haspopup="dialog"
          aria-expanded={open}
          style={inputStyle}
          className={[inputClassName, invalid ? invalidClassName : ''].filter(Boolean).join(' ') || undefined}
          onClick={() => (open ? setOpen(false) : openPicker())}
          onKeyDown={(e) => {
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown') { e.preventDefault(); openPicker(); }
          }}
        />
        <span className={s.icon} aria-hidden="true"><CalendarDays size={18} /></span>
      </div>
      {open && view ? createPortal(
        <div
          ref={popRef}
          className={s.pop}
          role="dialog"
          aria-label={ariaLabel}
          style={pos ? { top: pos.top, left: pos.left, width: pos.width } : { visibility: 'hidden' }}
        >
          <div className={s.nav}>
            <button type="button" aria-label="Previous month" disabled={current <= minMonth} onClick={() => shift(-1)}>‹</button>
            <span className={s.month}>{MONTHS[view.m]} {view.y}</span>
            <button type="button" aria-label="Next month" disabled={current >= maxMonth} onClick={() => shift(1)}>›</button>
          </div>
          <div className={s.grid}>
            {DOW.map((d) => <div key={d} className={s.dow} aria-hidden="true">{d}</div>)}
            {cells}
          </div>
          {hint ? <p className={s.hint}>{hint}</p> : null}
        </div>,
        document.body
      ) : null}
    </div>
  );
}
