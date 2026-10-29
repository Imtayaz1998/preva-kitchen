import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '@/data/fallbackMenu';
import { withOfficialMenuAdditions } from '@/lib/menu-options';

export function menuProductsOrFallback(products, isProduction = process.env.NODE_ENV === 'production') {
  if (Array.isArray(products) && (products.length > 0 || isProduction)) return products;
  return isProduction ? [] : withOfficialMenuAdditions(FALLBACK_PRODUCTS);
}

export function menuCategoriesOrFallback(categories, isProduction = process.env.NODE_ENV === 'production') {
  if (Array.isArray(categories) && (categories.length > 0 || isProduction)) return categories;
  return isProduction ? [] : FALLBACK_CATEGORIES;
}
