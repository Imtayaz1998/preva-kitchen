"use client";

import { useState } from 'react';
import s from './GuestPicker.module.css';

const PRESETS = ['2', '3', '6', '8'];

/**
 * Party size as quick-pick chips plus a "Custom" chip that reveals a number
 * field. `value` is a string, like the select it replaces.
 */
export default function GuestPicker({ value, onChange, min = 1, max = 20, inputClassName }) {
  const [custom, setCustom] = useState(!PRESETS.includes(String(value)));

  return (
    <div>
      <div className={s.chips} role="group" aria-label="Number of guests">
        {PRESETS.map((n) => (
          <button
            key={n}
            type="button"
            className={`${s.chip} ${!custom && String(value) === n ? s.active : ''}`}
            aria-pressed={!custom && String(value) === n}
            onClick={() => { setCustom(false); onChange(n); }}
          >
            {n}
          </button>
        ))}
        <button
          type="button"
          className={`${s.chip} ${s.custom} ${custom ? s.active : ''}`}
          aria-pressed={custom}
          onClick={() => { setCustom(true); onChange(''); }}
        >
          Custom
        </button>
      </div>
      {custom ? (
        <input
          className={`${inputClassName || ''} ${s.customInput}`}
          type="number"
          inputMode="numeric"
          min={min}
          max={max}
          step="1"
          placeholder={`Number of guests (${min}–${max})`}
          aria-label="Number of guests"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          autoFocus
        />
      ) : null}
    </div>
  );
}
