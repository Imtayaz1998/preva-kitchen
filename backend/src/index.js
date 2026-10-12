/**
 * Registering the route table. Importing a routes module has the side effect
 * of adding its handlers to the router, so this file is the single place that
 * decides which modules exist.
 */
import './routes/public.js';
import './routes/shop.js';
import './routes/admin.js';
import './routes/events.js';

export { dispatch, listRoutes } from './router.js';
