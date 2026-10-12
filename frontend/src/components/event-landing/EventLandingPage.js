"use client";

import Image from 'next/image';
import Link from 'next/link';
import {
  ArrowRight, Baby, Briefcase, Cake, CalendarCheck, CalendarDays, Check, CircleHelp, Coffee,
  DoorClosed, ListChecks, MapPin, MapPinned, Paintbrush, PartyPopper, Phone, Presentation,
  Heart, Sofa, Sparkles, Sun, Users, UtensilsCrossed, Wine
} from 'lucide-react';
import { SectionHeading, PrimaryButton, SecondaryButton, Card, Eyebrow } from '@/components/site-page/PageKit';
import EventFaq from './EventFaq';
import EventInquiryForm from './EventInquiryForm';
import { EVENT_CONTACT, RELATED_CARDS } from '@/data/eventLandingPages';
import s from './EventLanding.module.css';

/** Icons for the four highlight cards under each hero, in data order. */
const HIGHLIGHT_ICONS = {
  'corporate-events': [Presentation, UtensilsCrossed, PartyPopper, CalendarDays],
  'birthday-parties': [Sofa, DoorClosed, UtensilsCrossed, Users],
  'baby-showers': [Sun, DoorClosed, Coffee, Paintbrush],
  weddings: [PartyPopper, UtensilsCrossed, Sun, Wine]
};

const RELATED_ICONS = {
  'corporate-events': Briefcase,
  'birthday-parties': Cake,
  'baby-showers': Baby,
  weddings: Heart
};

const FEATURED_CARD = {
  height: '100%',
  border: '1px solid rgba(197, 160, 89, 0.65)',
  boxShadow: '0 20px 60px rgba(197, 160, 89, 0.12), 0 16px 40px rgba(0, 0, 0, 0.4)'
};

/** "Main words |Accent words" -> [main, accent] for the gold italic accent. */
function splitTitle(title) {
  const [main, accent] = String(title).split('|');
  return [main.trim(), accent ? accent.trim() : ''];
}

function Heading({ eyebrow, icon, title, description }) {
  const [main, accent] = splitTitle(title);
  return <SectionHeading eyebrow={eyebrow} eyebrowIcon={icon} title={main} titleAccent={accent} description={description} />;
}

function Hero({ page }) {
  const { hero } = page;
  const icons = HIGHLIGHT_ICONS[page.slug] || [];
  return (
    <section className={s.hero}>
      <div className={s.container}>
        <nav aria-label="Breadcrumb" className={s.crumbs}>
          <Link href="/">Home</Link>
          <span className={s.crumbSep} aria-hidden="true">/</span>
          <span className={s.crumbNow} aria-current="page">{page.breadcrumb}</span>
        </nav>
        <div className={s.heroGrid}>
          <div>
            <Eyebrow icon={Sparkles}>{hero.eyebrow}</Eyebrow>
            <h1 className={s.heroTitle}>
              {hero.title} <span className={s.accent}>{hero.titleAccent}</span>
            </h1>
            <p className={s.heroSub}>{hero.sub}</p>
            <div className={s.ctas}>
              <PrimaryButton href="#lead" icon={CalendarCheck}>{hero.primaryCta.replace(/\s*→$/, '')}</PrimaryButton>
              <SecondaryButton href="#packages">{hero.secondaryCta}</SecondaryButton>
            </div>
          </div>
          <div className={s.heroVis}>
            <Image
              src={hero.image}
              alt={hero.imageAlt}
              fill
              priority
              sizes="(max-width: 980px) 100vw, 580px"
              className={hero.imageFit === 'contain' ? s.heroImgContain : s.heroImg}
            />
            <div className={s.heroBadge}>
              {hero.badge.map(([label, value]) => (
                <span key={label}>{label}: <strong>{value}</strong></span>
              ))}
            </div>
          </div>
        </div>
        <div className={s.highlights}>
          {page.specs.map(([value, label], index) => {
            const Icon = icons[index] || Sparkles;
            return (
              <div key={value} className={s.highlight}>
                <span className={s.highlightIcon} aria-hidden="true"><Icon size={18} /></span>
                <div>
                  <strong>{value}</strong>
                  <span>{label}</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}

function Lead({ page }) {
  const [main, accent] = splitTitle(page.lead.title);
  return (
    <section id="lead" className={`${s.section} ${s.lead}`}>
      <div className={`${s.container} ${s.leadGrid}`}>
        <div>
          <SectionHeading eyebrow="Check Your Date" eyebrowIcon={CalendarCheck} title={main} titleAccent={accent} description={page.lead.text} />
          <div className={s.contactList}>
            <div className={s.contactItem}><MapPin size={18} /><div><b>Address</b>{EVENT_CONTACT.address}</div></div>
            <div className={s.contactItem}><Phone size={18} /><div><b>Phone</b><a href={EVENT_CONTACT.phoneHref}>{EVENT_CONTACT.phoneDisplay}</a></div></div>
          </div>
          {/* Google Maps place embed: shows the Preva Kitchen card (name, address, rating). */}
          <div className={s.map}>
            <iframe
              title="Preva Kitchen, 13090 Inkster Rd, Redford Township, MI 48239, United States"
              src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2947.1084595026564!2d-83.31609022422528!3d42.38283593366289!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x8824b5a5abaeb857%3A0xe8aee03240edd26a!2sPreva%20Kitchen!5e0!3m2!1sen!2sin!4v1791797611851!5m2!1sen!2sin"
              loading="lazy"
              allowFullScreen
              referrerPolicy="strict-origin-when-cross-origin"
            />
          </div>
        </div>
        <EventInquiryForm slug={page.slug} useCase={page.useCase} eventType={page.eventType} form={page.form} />
      </div>
    </section>
  );
}

function Spaces({ spaces }) {
  return (
    <section className={s.section}>
      <div className={s.container}>
        <Heading eyebrow={spaces.eyebrow} icon={MapPinned} title={spaces.title} description={spaces.text} />
        <div className={s.grid3}>
          {spaces.items.map((item) => (
            <article key={item.title} className={s.space}>
              <div className={s.spaceImg}>
                <Image src={item.image} alt={item.alt} fill sizes="(max-width: 980px) 100vw, 400px" className={s.spaceImgEl} />
              </div>
              <div className={s.spaceBody}>
                <h3 className={s.cardTitle}>{item.title}</h3>
                <p className={s.cardText}>{item.text}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}

export default function EventLandingPage({ page }) {
  const [finalMain, finalAccent] = splitTitle(page.finalCta.title);

  return (
    <div className={s.root}>
      <Hero page={page} />
      <Lead page={page} />

      <section id="packages" className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.container}>
          <Heading eyebrow={page.packages.eyebrow} icon={PartyPopper} title={page.packages.title} description={page.packages.text} />
          <div className={s.grid3}>
            {page.packages.items.map((pkg) => (
              <Card key={pkg.title} style={pkg.featured ? FEATURED_CARD : { height: '100%' }}>
                {pkg.featured ? <span className={s.pkgTag}>Most Booked</span> : null}
                <h3 className={s.cardTitle}>{pkg.title}</h3>
                <p className={s.pkgSub}>{pkg.sub}</p>
                <ul className={s.pkgList}>
                  {pkg.points.map((point) => (
                    <li key={point}><Check size={16} aria-hidden="true" />{point}</li>
                  ))}
                </ul>
                {pkg.featured ? (
                  <PrimaryButton href="#lead" style={{ width: '100%' }}>{pkg.cta.replace(/\s*→$/, '')}</PrimaryButton>
                ) : (
                  <SecondaryButton href="#lead" style={{ width: '100%' }}>{pkg.cta.replace(/\s*→$/, '')}</SecondaryButton>
                )}
              </Card>
            ))}
          </div>
        </div>
      </section>

      <Spaces spaces={page.spaces} />

      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.container}>
          <Heading eyebrow={page.process.eyebrow} icon={ListChecks} title={page.process.title} />
          <div className={s.grid4}>
            {page.process.steps.map(([title, text], index) => (
              <Card key={title}>
                <span className={s.stepNum}>{index + 1}</span>
                <h3 className={s.cardTitle}>{title}</h3>
                <p className={s.cardText}>{text}</p>
              </Card>
            ))}
          </div>
        </div>
      </section>

      <section className={s.section}>
        <div className={s.container}>
          <Heading eyebrow={page.faq.eyebrow} icon={CircleHelp} title={page.faq.title} />
          <EventFaq items={page.faq.items} />
        </div>
      </section>

      <section className={`${s.section} ${s.sectionAlt}`}>
        <div className={s.container}>
          <SectionHeading eyebrow="Also at PREVA" eyebrowIcon={CalendarDays} title="You May Also" titleAccent="Be Planning" description={page.related.text} />
          <div className={s.grid2}>
            {page.related.items.map((key) => {
              const card = RELATED_CARDS[key];
              const Icon = RELATED_ICONS[key] || Sparkles;
              return (
                <Link key={key} href={card.href} className={s.related}>
                  <Card style={{ height: '100%' }}>
                    <Icon size={26} className={s.relatedIcon} aria-hidden="true" />
                    <h3 className={s.cardTitle}>{card.title}</h3>
                    <p className={s.cardText}>{card.text}</p>
                    <span className={s.relatedLink}>{card.link.replace(/\s*→$/, '')} <ArrowRight size={14} /></span>
                  </Card>
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <section className={s.final}>
        <div className={s.container}>
          <Eyebrow icon={Sparkles} style={{ justifyContent: 'center' }}>{page.finalCta.eyebrow}</Eyebrow>
          <h2 className={s.finalTitle}>
            {finalMain} <span className={s.accent}>{finalAccent}</span>
          </h2>
          <p className={s.finalText}>{page.finalCta.text}</p>
          <div className={s.ctas}>
            <PrimaryButton href="#lead" icon={CalendarCheck}>Request a Venue Tour</PrimaryButton>
            <SecondaryButton href={EVENT_CONTACT.phoneHref} icon={Phone}>Call {EVENT_CONTACT.phoneDisplay}</SecondaryButton>
          </div>
        </div>
      </section>
    </div>
  );
}
