import { Hono } from 'hono';
import { buildWebShell } from '../web/app-shell';

export const createWebRoutes = (): Hono => {
  const webRoutes = new Hono();

  webRoutes.get('/', (c) => {
    return c.redirect('/web');
  });

  webRoutes.get('/web', (c) => {
    return c.html(buildWebShell());
  });

  return webRoutes;
};
