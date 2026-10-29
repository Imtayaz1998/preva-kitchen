import { col, serialize, asObjectId } from '../lib/db.js';
import { cleanText, formatMoney } from '../lib/sanitize.js';
import { shopSettings, itemPriceCents } from '../lib/pricing.js';
import { hiddenMenuCategoryNames, isMenuItemPubliclyVisible } from '../lib/menu-visibility.js';
import { get, notFound } from '../router.js';
import { getKitchenOperatingStatus } from '../lib/operatingHours.js';


get('/shop/kitchen-status', async () => {
  return getKitchenOperatingStatus();
});

/* ══════════════════════════════════════════════════════════════════════════
   Catalogue
   ─────────────────────────────────────────────────────────────────────────
   The shop sells the same menuItems the kitchen already manages in the admin.
   An item becomes buyable by ticking "orderable" — there is no second product
   table to keep in step with the menu.
   ══════════════════════════════════════════════════════════════════════════ */

function toProduct(item) {
  const out = serialize(item);
  return {
    id: out.id,
    slug: out.slug || out.id,
    name: out.name,
    seoTitle: out.seoTitle || '',
    seoDescription: out.seoDescription || '',
    focusKeyword: out.focusKeyword || '',
    description: out.description || '',
    aboutTitle: out.aboutTitle || '',
    aboutContent: out.aboutContent || '',
    priceCents: itemPriceCents(item),
    price: formatMoney(itemPriceCents(item)),
    image: out.image || '',
    category: out.category || 'Others',
    available: out.available !== false,
    featured: Boolean(out.featured),
    badge: out.badge || '',
    uberEatsUrl: out.uberEatsUrl || '',
    doorDashUrl: out.doorDashUrl || '',
    grubhubUrl: out.grubhubUrl || '',
    tags: out.tags || [],
    allergens: out.allergens || [],
    pairings: out.pairings || [],
    faqs: out.faqs || [],
    servings: out.servings || '',
    calories: out.calories || null,
    ...(item.trackInventory ? { stockRemaining: Number.isFinite(item.stockCount) ? item.stockCount : 0 } : {}),
    optionGroups: (out.optionGroups || []).map((group) => ({
      id: group.id,
      label: group.label,
      type: group.type === 'check' ? 'check' : 'radio',
      required: Boolean(group.required),
      maxPick: Number(group.maxPick) || 0,
      options: (group.options || [])
        .filter((option) => option.available !== false)
        .map((option) => ({
          id: option.id,
          label: option.label,
          priceCents: Number(option.priceCents) || 0
        }))
    }))
  };
}

get('/shop/settings', async () => shopSettings());

get('/shop/products', async ({ query }) => {
  const menuItems = await col('menuItems');
  const filter = { orderable: true, isVisible: { $ne: false } };
  if (query.category) filter.category = cleanText(query.category, 80);
  if (query.featured === 'true') filter.featured = true;

  const rows = await menuItems.find(filter).sort({ category: 1, sortOrder: 1, name: 1 }).toArray();
  const hiddenCategories = await hiddenMenuCategoryNames();
  return rows.filter((item) => isMenuItemPubliclyVisible(item, hiddenCategories)).map(toProduct);
});

get('/shop/categories', async () => {
  const menuItems = await col('menuItems');
  const rows = await menuItems.aggregate([
    { $match: { orderable: true, available: { $ne: false }, isVisible: { $ne: false } } },
    { $group: { _id: '$category', count: { $sum: 1 }, image: { $first: '$image' } } },
    { $sort: { _id: 1 } }
  ]).toArray();
  // Categories added in the admin carry their own image and order; a category
  // only shows on the menu once it has at least one dish.
  const managed = await (await col('menuCategories')).find().sort({ sortOrder: 1, name: 1 }).toArray();
  const byName = new Map(managed.map((category) => [category.name, category]));
  const hiddenCategories = await hiddenMenuCategoryNames();
  return rows.filter((row) => !hiddenCategories.has(String(row._id || 'Others'))).map((row) => {
    const name = typeof row._id === 'object' ? String(row._id || 'Others') : (row._id || 'Others');
    const category = byName.get(name);
    return {
      name,
      count: Number(row.count) || 1,
      image: String(row.image || ''),
      ...(category ? { categoryImage: category.image || '', sortOrder: Number(category.sortOrder) || 0, managed: true } : {})
    };
  }).sort((a, b) => (
    (Number(a.sortOrder) || 0) - (Number(b.sortOrder) || 0) ||
    a.name.localeCompare(b.name)
  ));
});

get('/shop/products/:slug', async ({ params }) => {
  const menuItems = await col('menuItems');
  const byId = asObjectId(params.slug);
  const row = await menuItems.findOne(byId ? { _id: byId } : { slug: params.slug });
  const hiddenCategories = await hiddenMenuCategoryNames();
  if (!row || row.orderable === false || !isMenuItemPubliclyVisible(row, hiddenCategories)) {
    throw notFound('That item is not on the menu.');
  }

  const relatedRows = await menuItems
    .find({ orderable: true, isVisible: { $ne: false }, category: row.category, _id: { $ne: row._id } })
    .sort({ sortOrder: 1 })
    .limit(4)
    .toArray();
  const related = relatedRows.filter((item) => isMenuItemPubliclyVisible(item, hiddenCategories));

  // A dish alone in its category (a new one, or Dessert) still gets a
  // "More from the Menu" row, from live menu data rather than the frontend's
  // static fallback list. Dishes with category siblings keep "More <Category>".
  if (related.length === 0) {
    const fill = await menuItems
    .find({ orderable: true, available: { $ne: false }, isVisible: { $ne: false }, category: { $ne: row.category } })
      .sort({ featured: -1, sortOrder: 1 })
      .limit(3)
      .toArray();
    related.push(...fill.filter((item) => isMenuItemPubliclyVisible(item, hiddenCategories)));
  }

  return { product: toProduct(row), related: related.map(toProduct) };
});
