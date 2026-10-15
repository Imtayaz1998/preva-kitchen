"use client";

import { useState } from 'react';
import { Calendar, Cake, Heart, Wine, Sparkles, MapPin, Clock, Phone, ChevronDown, Navigation } from 'lucide-react';
import BookingSection from '@/components/home/BookingSection';
import {
  PageShell,
  PageHero,
  Section,
  SectionHeading,
  Card,
  PrimaryButton,
  SecondaryButton,
  COLORS,
  fontFamily
} from '@/components/site-page/PageKit';

const HERO_TITLE_SIZE = 'clamp(1.9rem, 3.2vw, 2.75rem)';
const SECTION_TITLE_SIZE = 'clamp(1.55rem, 2.4vw, 2.1rem)';

const faqs = [
  {
    question: 'Do you take walk-ins?',
    answer: 'Yes — walk-ins are always welcome. Reserving ahead just guarantees your table is ready when your party arrives, which we recommend for Friday and Saturday evenings.'
  },
  {
    question: 'How far in advance should I book?',
    answer: 'For a party of 2-6, a day or two ahead is usually plenty. For groups of 8 or more, or for a holiday and special-occasion date, please reach out at least a week in advance.'
  },
  {
    question: 'Is there a deposit for large parties?',
    answer: 'Groups of 15+ or private dining bookings may require a deposit to hold the date. Our team will let you know when confirming your request by phone.'
  },
  {
    question: 'Can I request a specific table or seating area?',
    answer: 'Add it in the notes field and we will do our best to accommodate — just know seating is confirmed the day of based on availability.'
  },
  {
    question: 'What if I need to cancel or change my reservation?',
    answer: 'Call us at (313) 286-3586 as soon as you know your plans have changed, so we can free up the table for another guest.'
  }
];

const occasions = [
  {
    icon: Cake,
    title: 'Birthdays',
    text: "Let us know it's a birthday and we'll do what we can to make the evening feel special — mention any details in your reservation notes."
  },
  {
    icon: Heart,
    title: 'Anniversaries',
    text: "Celebrating a milestone? Request a quieter table when you book and we'll do our best to seat you accordingly."
  },
  {
    icon: Wine,
    title: 'Date Nights',
    text: 'Tuesday through Sunday evenings, 5-10pm — good food, a relaxed room, and a table ready when you are.'
  }
];

const iconBadge = {
  display: 'inline-grid',
  placeItems: 'center',
  width: '46px',
  height: '46px',
  marginBottom: '18px',
  borderRadius: '12px',
  color: COLORS.gold,
  background: 'rgba(197, 160, 89, 0.1)',
  border: '1px solid rgba(197, 160, 89, 0.3)'
};

// Only one answer is open at a time; opening another closes the previous one.
function FaqAccordion({ items }) {
  const [openIndex, setOpenIndex] = useState(0);
  return (
    <div style={{ display: 'grid', gap: '12px', maxWidth: '820px' }}>
      {items.map((faq, index) => {
        const open = openIndex === index;
        const panelId = `reservation-faq-${index}`;
        return (
          <div
            key={faq.question}
            style={{
              borderRadius: '14px',
              background: open ? 'linear-gradient(145deg, #171015 0%, #0f0a0e 100%)' : 'rgba(255, 255, 255, 0.02)',
              border: `1px solid ${open ? 'rgba(197, 160, 89, 0.45)' : 'rgba(255, 255, 255, 0.08)'}`,
              boxShadow: open ? '0 14px 34px rgba(0, 0, 0, 0.45)' : 'none',
              transition: 'border-color .25s, background .25s, box-shadow .25s'
            }}
          >
            <h3 style={{ margin: 0 }}>
              <button
                type="button"
                aria-expanded={open}
                aria-controls={panelId}
                onClick={() => setOpenIndex(open ? -1 : index)}
                style={{
                  display: 'flex',
                  width: '100%',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  gap: '16px',
                  padding: '18px 22px',
                  color: open ? '#fff' : COLORS.textMuted,
                  fontFamily,
                  fontSize: '1rem',
                  fontWeight: 600,
                  textAlign: 'left',
                  background: 'none',
                  border: 0,
                  cursor: 'pointer'
                }}
              >
                {faq.question}
                <span
                  aria-hidden="true"
                  style={{
                    display: 'grid',
                    flex: 'none',
                    placeItems: 'center',
                    width: '30px',
                    height: '30px',
                    borderRadius: '50%',
                    color: open ? '#120c08' : COLORS.gold,
                    background: open ? COLORS.gold : 'rgba(197, 160, 89, 0.1)',
                    transform: open ? 'rotate(180deg)' : 'none',
                    transition: 'transform .3s, background .25s, color .25s'
                  }}
                >
                  <ChevronDown size={16} />
                </span>
              </button>
            </h3>
            <div
              id={panelId}
              role="region"
              style={{ display: 'grid', gridTemplateRows: open ? '1fr' : '0fr', transition: 'grid-template-rows .3s ease' }}
            >
              <div style={{ overflow: 'hidden' }}>
                <p style={{ margin: 0, padding: '0 22px 20px', color: COLORS.textDim, fontSize: '0.92rem', lineHeight: 1.75 }}>{faq.answer}</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

function InfoRow({ icon: Icon, label, children }) {
  return (
    <div style={{ display: 'flex', gap: '14px', alignItems: 'flex-start' }}>
      <span style={{ ...iconBadge, width: '40px', height: '40px', marginBottom: 0, flex: 'none' }}><Icon size={17} /></span>
      <div>
        <div style={{ color: COLORS.gold, fontSize: '0.7rem', fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', marginBottom: '4px' }}>{label}</div>
        <div style={{ color: COLORS.textMuted, fontSize: '0.92rem', lineHeight: 1.65 }}>{children}</div>
      </div>
    </div>
  );
}

export default function ReservationsContent() {
  return (
    <PageShell>
      <PageHero
        eyebrow="Preva Kitchen · Redford, Michigan"
        eyebrowIcon={Sparkles}
        title="Book Your Table at"
        titleAccent="Preva Kitchen, Redford Township MI"
        titleSize={HERO_TITLE_SIZE}
        subtitle="Reserve a table for a birthday, a date night or a family dinner. We will email your request details and contact you if anything else is needed."
      >
        <div style={{ display: 'flex', gap: '14px', flexWrap: 'wrap', marginBottom: '28px' }}>
          <PrimaryButton href="#reserve-form" icon={Calendar}>Reserve a table</PrimaryButton>
          <SecondaryButton href="tel:+13132863586" icon={Phone}>Call (313) 286-3586</SecondaryButton>
        </div>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', flexWrap: 'wrap', color: COLORS.textMuted, fontSize: '0.84rem' }}>
          {[[Clock, 'Dine-In: Tue–Sun · 5pm–10pm'], [MapPin, '13090 Inkster Rd, Redford Township, MI 48239']].map(([Icon, text]) => (
            <span key={text} style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '8px 14px', borderRadius: '999px', background: 'rgba(255, 255, 255, 0.03)', border: '1px solid rgba(197, 160, 89, 0.22)' }}>
              <Icon size={15} color={COLORS.gold} /> {text}
            </span>
          ))}
        </div>
      </PageHero>

      {/* Same booking form as the home page */}
      <div id="reserve-form" className="pk-ref-home">
        <BookingSection />
      </div>

      {/* Birthdays / Date Nights */}
      <Section bg={COLORS.bgAlt}>
        <SectionHeading
          eyebrow="Celebrate with us"
          eyebrowIcon={Cake}
          title="Birthdays, Anniversaries"
          titleAccent="& Date Nights"
          titleSize={SECTION_TITLE_SIZE}
          description="Whether it's a milestone birthday, an anniversary dinner or a first date, tell us in the notes field and our team will help set the table right."
        />
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 260px), 1fr))', gap: '20px' }}>
          {occasions.map(({ icon: Icon, title, text }) => (
            <Card key={title} style={{ padding: '28px 26px' }}>
              <span style={iconBadge}><Icon size={20} /></span>
              <h3 style={{ fontFamily, fontSize: '1.05rem', color: '#fff', margin: '0 0 8px', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{title}</h3>
              <p style={{ color: COLORS.textDim, fontSize: '0.9rem', lineHeight: 1.7, margin: 0 }}>{text}</p>
            </Card>
          ))}
        </div>
      </Section>

      {/* Where to find us */}
      <Section bg={COLORS.bgDeep}>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(100%, 300px), 1fr))',
            gap: 'clamp(32px, 5vw, 64px)',
            alignItems: 'center'
          }}
        >
          <div>
            <SectionHeading eyebrow="Find us" eyebrowIcon={MapPin} title="Where to" titleAccent="Find Us" titleSize={SECTION_TITLE_SIZE} />
            <div style={{ display: 'grid', gap: '22px', marginBottom: '28px' }}>
              <InfoRow icon={MapPin} label="Address">
                <strong style={{ color: '#fff' }}>Preva Kitchen</strong><br />
                13090 Inkster Rd, Redford Township, MI 48239
              </InfoRow>
              <InfoRow icon={Clock} label="Hours">
                Dine-In: Tuesday – Sunday, 5:00 PM – 10:00 PM<br />
                <span style={{ color: COLORS.textFaint, fontSize: '0.84rem' }}>Monday: Closed for dine-in. Pickup &amp; delivery Monday – Friday, 11:00 AM – 3:30 PM.</span>
              </InfoRow>
              <InfoRow icon={Phone} label="Call us">
                <a href="tel:+13132863586" style={{ color: '#fff', textDecoration: 'none', fontWeight: 700 }}>(313) 286-3586</a>
              </InfoRow>
            </div>
            <SecondaryButton
              href="https://www.google.com/maps/dir/?api=1&destination=Preva+Kitchen,+13090+Inkster+Rd,+Redford+Township,+MI+48239"
              icon={Navigation}
            >
              Get directions
            </SecondaryButton>
          </div>
          <div
            style={{
              position: 'relative',
              width: '100%',
              minHeight: '380px',
              borderRadius: '18px',
              background: '#111',
              border: '1px solid rgba(213, 164, 79, 0.35)',
              boxShadow: '0 25px 70px rgba(0, 0, 0, 0.75)',
              overflow: 'hidden'
            }}
          >
            <iframe
              title="Preva Kitchen, 13090 Inkster Rd, Redford Township, MI 48239, United States"
              src="https://www.google.com/maps?q=Preva+Kitchen,+13090+Inkster+Rd,+Redford+Township,+MI+48239,+United+States&output=embed"
              loading="lazy"
              allowFullScreen
              referrerPolicy="no-referrer-when-downgrade"
              style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', minHeight: '380px', border: 0, display: 'block' }}
            />
          </div>
        </div>
      </Section>

      {/* FAQs */}
      <Section bg={COLORS.bgAlt} padding="80px 0 120px" borderBottom={false}>
        <SectionHeading eyebrow="Good to know" title="Reservation" titleAccent="FAQs" titleSize={SECTION_TITLE_SIZE} />
        <FaqAccordion items={faqs} />
      </Section>
    </PageShell>
  );
}
