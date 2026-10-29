import { describe, expect, it } from 'vitest';
import { sortMenuCategoryNames } from '../../src/lib/menu-categories.js';

describe('menu category ordering', () => {
  it('uses admin sort order and keeps built-in category order as the default', () => {
    expect(sortMenuCategoryNames(
      ['Dessert', 'Preva Wings', 'Custom', 'Quesadillas'],
      [{ name: 'Custom', sortOrder: 5 }, { name: 'Dessert', sortOrder: 0 }]
    )).toEqual(['Dessert', 'Preva Wings', 'Custom', 'Quesadillas']);
  });
});
