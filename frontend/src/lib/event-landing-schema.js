import { pageMetadata } from '@/lib/seo';
import { BUSINESS_INFO, generateBreadcrumbSchema } from '@/lib/seo-schema';

const AREA_SERVED = [
  'Redford Township, MI', 'Livonia, MI', 'Detroit, MI', 'Dearborn Heights, MI',
  'Southfield, MI', 'Westland, MI', 'Farmington Hills, MI'
];

export function eventLandingMetadata(page) {
  return pageMetadata({
    title: page.seo.title,
    description: page.seo.description,
    path: `/${page.slug}`,
    image: page.seo.image,
    imageSize: null
  });
}

/** WebPage + EventVenue + BreadcrumbList + FAQPage, matching the reference pages' graph. */
export function eventLandingSchema(page, origin) {
  const url = `${origin}/${page.slug}`;
  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebPage',
        '@id': `${url}#webpage`,
        url,
        name: page.seo.title,
        description: page.seo.description,
        breadcrumb: { '@id': `${url}#breadcrumb` },
        about: { '@id': `${origin}/#event-venue` }
      },
      {
        '@type': 'EventVenue',
        '@id': `${origin}/#event-venue`,
        name: 'PREVA Club & Kitchen',
        url: origin,
        telephone: BUSINESS_INFO.telephone,
        address: BUSINESS_INFO.address,
        areaServed: AREA_SERVED.map((name) => ({ '@type': 'City', name }))
      },
      {
        ...generateBreadcrumbSchema([
          { name: 'Home', url: '/' },
          { name: page.breadcrumb, url: `/${page.slug}` }
        ], origin),
        '@id': `${url}#breadcrumb`
      },
      {
        '@type': 'FAQPage',
        '@id': `${url}#faq`,
        mainEntity: page.faq.items.map(([question, answer]) => ({
          '@type': 'Question',
          name: question,
          acceptedAnswer: { '@type': 'Answer', text: answer }
        }))
      }
    ]
  };
}
