import { describe, expect, it } from 'vitest';
import { FALLBACK_CATEGORIES, FALLBACK_PRODUCTS } from '../../src/data/fallbackMenu.js';
import { menuCategoriesOrFallback, menuProductsOrFallback } from '../../src/lib/menu-data.js';

describe('menu data fallbacks', () => {
  it('uses the complete local fallback when the API returns an empty menu in development', () => {
    expect(menuProductsOrFallback([], false)).toHaveLength(FALLBACK_PRODUCTS.length);
    expect(menuCategoriesOrFallback([], false)).toEqual(FALLBACK_CATEGORIES);
  });

  it('keeps API data authoritative when it exists', () => {
    const products = [{ id: 'api-dish' }];
    const categories = [{ name: 'API category' }];
    expect(menuProductsOrFallback(products, false)).toBe(products);
    expect(menuCategoriesOrFallback(categories, false)).toBe(categories);
  });

  it('does not publish fallback menu data in production', () => {
    expect(menuProductsOrFallback([], true)).toEqual([]);
    expect(menuCategoriesOrFallback([], true)).toEqual([]);
  });
});
