import CmsPageView from '@/components/site-page/CmsPageView';
import { notFound, permanentRedirect } from 'next/navigation';
import { cmsFetch } from '@/lib/cms';
import { getCanonicalOrigin } from '@/lib/site-url';

export async function generateMetadata({ params }) {
  const { slug } = await params;
  const siteOrigin = getCanonicalOrigin();
  const page = await cmsFetch(`/pages/${encodeURIComponent(slug)}`);

  if (!page) {
    // If slug is a blog post, permanently redirect to /blog/:slug
    const post = await cmsFetch(`/posts/${encodeURIComponent(slug)}`);
    if (post) {
      permanentRedirect(`/blog/${encodeURIComponent(slug)}`);
    }
    return { title: 'Not Found' };
  }

  const title = page.seoTitle || page.title || 'Preva Kitchen';
  const description = page.seoDescription || page.excerpt || String(page.content || '').replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim().slice(0, 160);
  const ogImage = page.ogImage || page.featuredImage || '/asset/home-reference/preva-restaurant-hero.png';
  const canonical = page.canonicalUrl || `${siteOrigin}/${encodeURIComponent(page.slug)}`;

  return {
    title,
    description,
    alternates: {
      canonical
    },
    openGraph: {
      title: page.ogTitle || title,
      description: page.ogDescription || description,
      url: canonical,
      siteName: 'Preva Kitchen',
      locale: 'en_US',
      images: [{ url: ogImage.startsWith('http') ? ogImage : `${siteOrigin}${ogImage}` }]
    },
    twitter: {
      card: 'summary_large_image',
      title: page.ogTitle || title,
      description: page.ogDescription || description,
      images: [ogImage.startsWith('http') ? ogImage : `${siteOrigin}${ogImage}`]
    },
    robots: {
      index: !page.noIndex,
      follow: !page.noIndex
    }
  };
}

export default async function DynamicPage({ params }) {
  const { slug } = await params;
  const page = await cmsFetch(`/pages/${encodeURIComponent(slug)}`);

  if (!page) {
    // Blog posts must NEVER render at the root level (creates duplicate URLs).
    // Permanently 301 redirect to /blog/:slug so Google and users only ever see the real blog URL.
    const post = await cmsFetch(`/posts/${encodeURIComponent(slug)}`);
    if (post) {
      permanentRedirect(`/blog/${encodeURIComponent(slug)}`);
    }
    notFound();
  }

  const siteOrigin = getCanonicalOrigin();
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: page.seoTitle || page.title,
    headline: page.seoTitle || page.title,
    description: page.seoDescription || page.excerpt || '',
    url: `${siteOrigin}/${encodeURIComponent(page.slug)}`,
    image: page.ogImage || page.featuredImage || `${siteOrigin}/asset/home-reference/preva-restaurant-hero.png`,
    publisher: {
      '@type': 'Organization',
      name: 'Preva Kitchen',
      url: siteOrigin,
      logo: { '@type': 'ImageObject', url: `${siteOrigin}/asset/preva-logo.svg` }
    }
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData).replace(/</g, '\\u003c') }}
      />
      <CmsPageView page={page} />
    </>
  );
}
