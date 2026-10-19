// Rank Math–style SEO analysis for posts and pages.
// One source of truth for the score shown in the content list, Quick Edit and
// the editor sidebar. Weights add up to 100 and follow Rank Math's test groups
// (Basic SEO, Additional, Title Readability, Content Readability), so a 100
// needs long, well-linked, well-structured content — not just a keyword in the title.

const SITE_HOST = /^(https?:)?\/\/(www\.)?prevakitchen\.com/i;

const POWER_WORDS = [
  'best', 'top', 'ultimate', 'essential', 'proven', 'easy', 'simple', 'quick', 'fresh', 'authentic',
  'premium', 'perfect', 'amazing', 'delicious', 'secret', 'exclusive', 'free', 'new', 'complete', 'guide',
  'must', 'favorite', 'famous', 'legendary', 'incredible', 'irresistible', 'crispy', 'juicy', 'tasty', 'award',
  'hand-crafted', 'handcrafted', 'chef', 'signature', 'luxury', 'affordable', 'hidden', 'local', 'try', 'love'
];
const SENTIMENT_WORDS = [
  'best', 'love', 'amazing', 'delicious', 'perfect', 'happy', 'favorite', 'incredible', 'great', 'fresh',
  'enjoy', 'tasty', 'irresistible', 'premium', 'awesome', 'wonderful', 'mouthwatering', 'satisfying', 'worst', 'avoid'
];

const stripTags = (html) => String(html || '')
  .replace(/<(script|style)[^>]*>[\s\S]*?<\/\1>/gi, ' ')
  .replace(/<[^>]+>/g, ' ')
  .replace(/&nbsp;/g, ' ')
  // Decode the entities a keyword can contain ("steak & cheese", "chef's") so phrase matching still works.
  .replace(/&amp;/gi, '&')
  .replace(/&(#39|#x27|apos|rsquo|lsquo);/gi, "'")
  .replace(/&[a-z]+;/gi, ' ')
  .replace(/\s+/g, ' ')
  .trim();

const escapeRegex = (value) => value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Whole-phrase, case-insensitive match count.
function countPhrase(text, phrase) {
  if (!phrase) return 0;
  const pattern = new RegExp(`(^|[^a-z0-9])${escapeRegex(phrase)}(?=$|[^a-z0-9])`, 'gi');
  return (String(text).match(pattern) || []).length;
}

const hasWord = (text, words) => words.some((word) => countPhrase(text, word) > 0);

/**
 * @returns {{ score:number, keyword:string, wordCount:number, density:number,
 *   groups: Array<{ title:string, checks: Array<{ id, label, points, earned, pass, hint }> }> }}
 */
export function analyzeSeo(item = {}) {
  const keyword = String(item.focusKeyword || '').split(',')[0].trim().toLowerCase();
  const title = String(item.seoTitle || item.title || '').trim();
  const description = String(item.seoDescription || item.excerpt || '').trim();
  const slug = String(item.slug || '').trim().toLowerCase();
  const html = String(item.content || '');
  const text = stripTags(html);
  const lowerText = text.toLowerCase();
  const words = text ? text.split(/\s+/) : [];
  const wordCount = words.length;
  const keywordWords = keyword ? keyword.split(/\s+/).length : 0;
  const keywordHits = countPhrase(lowerText, keyword);
  const density = wordCount && keyword ? (keywordHits * keywordWords * 100) / wordCount : 0;

  const headings = (html.match(/<h[2-4][^>]*>[\s\S]*?<\/h[2-4]>/gi) || []).map(stripTags);
  const images = html.match(/<img\b[^>]*>/gi) || [];
  const imageAlts = images.map((tag) => (tag.match(/\balt=["']([^"']*)["']/i) || [])[1] || '');
  const hasVideo = /<(video|iframe)\b/i.test(html);
  const links = [...html.matchAll(/<a\b[^>]*href=["']([^"']+)["'][^>]*>/gi)].map((match) => match[1]);
  const internalLinks = links.filter((href) => href.startsWith('/') || SITE_HOST.test(href));
  const externalLinks = links.filter((href) => /^https?:\/\//i.test(href) && !SITE_HOST.test(href));
  const paragraphs = (html.match(/<p\b[^>]*>[\s\S]*?<\/p>/gi) || []).map(stripTags).filter(Boolean);
  const longParagraphs = paragraphs.filter((paragraph) => paragraph.split(/\s+/).length > 120).length;
  const openingText = words.slice(0, Math.max(50, Math.ceil(wordCount * 0.1))).join(' ').toLowerCase();
  const kwSlug = keyword.replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');
  const titleLower = title.toLowerCase();

  const lengthPoints = wordCount >= 2500 ? 10 : wordCount >= 2000 ? 8 : wordCount >= 1500 ? 6 : wordCount >= 1000 ? 4 : wordCount >= 600 ? 2 : 0;
  const densityPoints = density >= 1 && density <= 1.5 ? 6 : density >= 0.5 && density <= 2.5 ? 3 : 0;
  const descPoints = description.length >= 120 && description.length <= 160 ? 5 : description.length >= 50 && description.length <= 160 ? 2 : 0;
  const titlePoints = title.length >= 30 && title.length <= 60 ? 5 : title.length > 0 && title.length <= 70 ? 2 : 0;

  const need = (condition) => Boolean(keyword) && condition;
  const check = (id, label, points, earned, hint) => ({ id, label, points, earned: Math.max(0, Math.min(points, earned)), pass: earned >= points, hint });

  const groups = [
    {
      title: 'Basic SEO',
      checks: [
        check('keyword', 'Focus keyword is set', 4, keyword ? 4 : 0, 'Add a focus keyword — every other keyword test depends on it.'),
        check('kwTitle', 'Focus keyword in SEO title', 7, need(countPhrase(titleLower, keyword) > 0) ? 7 : 0, 'Use the exact focus keyword in the SEO title.'),
        check('kwDesc', 'Focus keyword in meta description', 5, need(countPhrase(description.toLowerCase(), keyword) > 0) ? 5 : 0, 'Mention the focus keyword in the meta description.'),
        check('kwUrl', 'Focus keyword in URL', 5, need(kwSlug && slug.includes(kwSlug)) ? 5 : 0, 'Put the focus keyword in the slug (e.g. /best-mac-and-cheese-redford).'),
        check('kwStart', 'Focus keyword in the first 10% of content', 5, need(countPhrase(openingText, keyword) > 0) ? 5 : 0, 'Use the focus keyword in the opening paragraph.'),
        check('kwContent', 'Focus keyword appears in content', 4, need(keywordHits > 0) ? 4 : 0, 'Use the focus keyword in the body text.'),
        check('length', `Content length: ${wordCount} words`, 10, lengthPoints, wordCount >= 2500 ? '' : `Rank Math gives full marks at 2,500+ words. Add ${2500 - wordCount} more words of useful detail.`)
      ]
    },
    {
      title: 'Additional',
      checks: [
        check('subheadings', 'Content uses subheadings (H2–H4)', 4, headings.length >= 2 ? 4 : headings.length ? 2 : 0, 'Break the content into sections with at least two H2/H3 headings.'),
        check('kwHeading', 'Focus keyword in a subheading', 5, need(headings.some((heading) => countPhrase(heading.toLowerCase(), keyword) > 0)) ? 5 : 0, 'Use the focus keyword in at least one H2 or H3.'),
        check('kwAlt', 'Focus keyword in image alt text', 4, need(imageAlts.some((alt) => countPhrase(alt.toLowerCase(), keyword) > 0)) ? 4 : 0, images.length ? 'Add the focus keyword to an image’s alt text.' : 'Add an image and use the focus keyword in its alt text.'),
        check('density', `Keyword density: ${density.toFixed(2)}% (${keywordHits}×)`, 6, keyword ? densityPoints : 0, density > 2.5 ? 'Keyword stuffing — use the keyword less often (aim for 1–1.5%).' : 'Aim for 1–1.5%: use the keyword a few more times naturally.'),
        check('urlLength', `URL length: ${slug.length} characters`, 3, slug && slug.length <= 75 ? 3 : 0, 'Keep the slug under 75 characters.'),
        check('internal', `Internal links: ${internalLinks.length}`, 5, internalLinks.length >= 2 ? 5 : internalLinks.length ? 3 : 0, 'Link to at least two other Preva pages (menu, reservations, related posts).'),
        check('external', `External links: ${externalLinks.length}`, 4, externalLinks.length ? 4 : 0, 'Link to one trusted outside source (e.g. a local guide or Google Maps).')
      ]
    },
    {
      title: 'Title Readability',
      checks: [
        check('kwTitleStart', 'Focus keyword near the start of the title', 3, need(titleLower.indexOf(keyword) > -1 && titleLower.indexOf(keyword) <= titleLower.length / 2) ? 3 : 0, 'Move the focus keyword into the first half of the SEO title.'),
        check('titleLength', `SEO title length: ${title.length} characters`, 5, titlePoints, 'Keep the SEO title between 30 and 60 characters.'),
        check('titleNumber', 'Title contains a number', 3, /\d/.test(title) ? 3 : 0, 'Titles with a number get more clicks (e.g. “5 Best…”, “2026”).'),
        check('powerWord', 'Title contains a power word', 3, hasWord(titleLower, POWER_WORDS) ? 3 : 0, 'Add a power word such as best, ultimate, authentic, fresh.'),
        check('sentiment', 'Title has a positive or negative sentiment', 3, hasWord(titleLower, SENTIMENT_WORDS) ? 3 : 0, 'Add an emotional word (delicious, love, perfect…).')
      ]
    },
    {
      title: 'Content Readability',
      checks: [
        check('descLength', `Meta description length: ${description.length} characters`, 5, descPoints, 'Write a 120–160 character meta description.'),
        check('paragraphs', 'Short paragraphs', 3, paragraphs.length && !longParagraphs ? 3 : 0, longParagraphs ? `${longParagraphs} paragraph(s) are over 120 words — split them.` : 'Write the content in paragraphs.'),
        check('media', 'Content has images or video', 4, images.length || hasVideo ? 4 : 0, 'Add at least one image or video to the content.')
      ]
    }
  ];

  const score = Math.round(groups.reduce((sum, group) => sum + group.checks.reduce((inner, item) => inner + item.earned, 0), 0));
  return { score: Math.min(100, score), keyword, wordCount, density, groups };
}

export const getSeoScore = (item) => analyzeSeo(item).score;

export const seoTone = (score) => (score >= 80 ? 'good' : score >= 50 ? 'ok' : 'bad');
