import { Hono } from 'hono';
import { roleGuard } from './middleware/role-guard';
import { tenantScopeMiddleware } from './middleware/tenant-scope';

export const adminRoutes = new Hono();

adminRoutes.use('*', tenantScopeMiddleware);
adminRoutes.use('*', roleGuard(['ADMIN']));

adminRoutes.get('/api/v1/admin/users/access', (c) => {
  return c.json({ users: [] });
});

adminRoutes.get('/api/v1/admin/subscription/visibility', (c) => {
  const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
  return c.json({ visible: true, tenantId });
});
