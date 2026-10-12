"use client";

import { useId, useState } from 'react';
import { Plus } from 'lucide-react';
import s from './EventLanding.module.css';

/** One-open-at-a-time accordion in the PageKit FaqItem look; the first question starts open. */
export default function EventFaq({ items }) {
  const [open, setOpen] = useState(0);
  const baseId = useId();

  return (
    <div className={s.faqList}>
      {items.map(([question, answer], index) => {
        const isOpen = open === index;
        const answerId = `${baseId}-a${index}`;
        return (
          <div key={question} className={`${s.faqItem} ${isOpen ? s.faqOpen : ''}`}>
            <button
              type="button"
              className={s.faqQ}
              aria-expanded={isOpen}
              aria-controls={answerId}
              onClick={() => setOpen(isOpen ? -1 : index)}
            >
              <span>{question}</span>
              <span className={s.faqIcon} aria-hidden="true"><Plus size={20} /></span>
            </button>
            <div className={s.faqA} id={answerId} role="region">
              {answer}
            </div>
          </div>
        );
      })}
    </div>
  );
}
