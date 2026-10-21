import Link from 'next/link';
import PageBuilder from '@/components/PageBuilder';
import CodeFrame from './CodeFrame';
import { getCanonicalOrigin } from '@/lib/site-url';

/**
 * Renders an admin-built CMS page (public route and preview share this).
 *
 * pageTemplate (chosen in the admin editor):
 *   default   – title banner + content in the standard reading column
 *   fullwidth – title banner + content edge-to-edge, no forced colours
 *   landing   – custom code: the page's own HTML + CSS + JS, run exactly as
 *               written in a sandboxed frame (header and
 *               footer still come from the site layout)
 *
 * page.customCss is the page's own stylesheet, written in the editor.
 */
export default function CmsPageView({ page }) {
  const template = ['fullwidth', 'landing'].includes(page.pageTemplate) ? page.pageTemplate : 'default';
  const hasSections = Array.isArray(page.sections) && page.sections.length > 0;
  const html = page.content || '';
  // Custom-code pages keep their exact HTML in customHtml; content is the sanitised copy.
  const codeHtml = typeof page.customHtml === 'string' ? page.customHtml : html;

  return (
    <main id="primary" className={`site-main single-post-luxury dynamic-page-custom cms-page cms-template-${template} cms-page-${page.slug || ''}`}>
      {/* The site header is fixed, so a bannerless page needs room under it. Emitted
          before customCss so a page can override it. */}
      {template === 'landing' ? <style>{'.cms-template-landing{padding-top:clamp(84px,10vw,120px)}'}</style> : null}
      {page.customCss && template !== 'landing' ? <style dangerouslySetInnerHTML={{ __html: page.customCss }} /> : null}

      {template !== 'landing' && (
        <section className="blog-hero" style={{ position: 'relative' }}>
          {page.featuredImage ? (
            <img src={page.featuredImage} className="blog-hero-image" alt={page.featuredImageAlt || page.title || ''} />
          ) : null}
          <div className="overlay" style={{ background: 'rgba(0,0,0,0.6)', position: 'absolute', inset: 0 }}></div>

          <div className="container relative-z2" style={{ display: 'flex', flexDirection: 'column', justifyContent: 'center', height: '100%' }}>
            <div className="blog-breadcrumbs">
              <Link href="/">HOME</Link>
              <span className="sep">/</span>
              <span>{(page.title || '').toUpperCase()}</span>
            </div>
            <h1 className="blog-title-large" style={{ color: '#fff', fontSize: '3rem', margin: '20px 0', fontWeight: 'bold' }}>
              {page.title}
            </h1>
          </div>
        </section>
      )}

      {template === 'default' ? (
        hasSections ? (
          <PageBuilder sections={page.sections} fallbackContent={html} />
        ) : (
          <div className="container blog-content-layout no-sidebar" style={{ paddingBlock: '60px' }}>
            <div className="blog-main-content" style={{ maxWidth: '900px', margin: '0 auto' }}>
              <article className="post-content-inner">
                <div className="luxury-divider" style={{ width: '60px', height: '2px', background: '#c5a059', margin: '20px auto 40px' }}></div>
                <div className="post-main-content" style={{ color: '#ccc', fontSize: '1.1rem', lineHeight: '1.8' }} dangerouslySetInnerHTML={{ __html: html }} />
              </article>
            </div>
          </div>
        )
      ) : template === 'landing' ? (
        <>
          {/* Custom code: runs like the standalone HTML file, isolated from the site's CSS and session. */}
          {codeHtml.trim() || page.customCss || page.customJs ? (
            <CodeFrame html={codeHtml} css={page.customCss || ''} js={page.customJs || ''} matchSite={page.matchSiteStyle !== false} title={page.title || 'Page'} initialOrigin={getCanonicalOrigin()} />
          ) : null}
          {hasSections ? <PageBuilder sections={page.sections} /> : null}
        </>
      ) : (
        <>
          {/* Full width: the editor HTML is rendered as-is so its own CSS is in control. */}
          {html.trim() ? <div className="cms-page-html" dangerouslySetInnerHTML={{ __html: html }} /> : null}
          {hasSections ? <PageBuilder sections={page.sections} /> : null}
        </>
      )}
    </main>
  );
}
