import test from 'node:test';
import assert from 'node:assert/strict';
import { isMenuItemPubliclyVisible } from '../src/lib/menu-visibility.js';
import { dispatch } from '../src/router.js';
import '../src/routes/admin.js';

test('menu visibility defaults legacy records to visible', () => {
  assert.equal(isMenuItemPubliclyVisible({ category: 'Wings' }), true);
  assert.equal(isMenuItemPubliclyVisible({ category: 'Wings', isVisible: true }), true);
});

test('item and parent category visibility are independent requirements', () => {
  const hiddenCategories = new Set(['Wings']);
  assert.equal(isMenuItemPubliclyVisible({ category: 'Wings' }, hiddenCategories), false);
  assert.equal(isMenuItemPubliclyVisible({ category: 'Sides' }, hiddenCategories), true);
  assert.equal(isMenuItemPubliclyVisible({ category: 'Sides', isVisible: false }, hiddenCategories), false);
});

test('visibility updates require an admin and a boolean status', async () => {
  const unauthenticated = await dispatch({
    method: 'PATCH',
    path: '/admin/menu-visibility',
    body: { type: 'category', name: 'Wings', isVisible: false }
  });
  assert.equal(unauthenticated.status, 401);

  const editor = await dispatch({
    method: 'PATCH',
    path: '/admin/menu-visibility',
    body: { type: 'category', name: 'Wings', isVisible: false },
    user: { role: 'EDITOR' }
  });
  assert.equal(editor.status, 403);

  const invalid = await dispatch({
    method: 'PATCH',
    path: '/admin/menu-visibility',
    body: { type: 'category', name: 'Wings', isVisible: 'false' },
    user: { role: 'ADMIN' }
  });
  assert.equal(invalid.status, 400);
});

test('menu category deletion is restricted to administrators', async () => {
  const editor = await dispatch({
    method: 'DELETE',
    path: '/admin/menu-categories/by-name/Wings',
    user: { role: 'EDITOR' }
  });
  assert.equal(editor.status, 403);
});
