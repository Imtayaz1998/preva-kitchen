import EventLandingPage from '@/components/event-landing/EventLandingPage';
import { EVENT_PAGES } from '@/data/eventLandingPages';
import { eventLandingMetadata, eventLandingSchema } from '@/lib/event-landing-schema';
import { getCanonicalOrigin } from '@/lib/site-url';

const page = EVENT_PAGES['corporate-events'];

export const metadata = eventLandingMetadata(page);

export default function CorporateEventsPage() {
  const jsonLd = eventLandingSchema(page, getCanonicalOrigin());

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd).replace(/</g, '\\u003c') }} />
      <EventLandingPage page={page} />
    </>
  );
}
