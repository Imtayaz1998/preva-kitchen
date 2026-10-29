import { col } from './db.js';

export async function hiddenMenuCategoryNames() {
  const categories = await col('menuCategories');
  const rows = await categories.find({ isVisible: false }).toArray();
  return new Set(rows.map((category) => category.name).filter(Boolean));
}

export function isMenuItemPubliclyVisible(item, hiddenCategories = new Set()) {
  return item?.isVisible !== false && !hiddenCategories.has(item?.category);
}
