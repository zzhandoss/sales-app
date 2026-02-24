import { Hono } from 'hono';
import { IdentityRole, IdentityStatus } from '../modules/identity/entities/identity-user.entity';
import { IdentityDirectoryService } from '../modules/identity/services/identity-directory.service';
import { AdminAccessService } from '../modules/identity/services/admin-access.service';
import { roleGuard } from './middleware/role-guard';
import { tenantScopeMiddleware } from './middleware/tenant-scope';

interface AdminRoutesDependencies {
  identityDirectoryService: IdentityDirectoryService;
  adminAccessService: AdminAccessService;
}

export const createAdminRoutes = ({
  identityDirectoryService,
  adminAccessService,
}: AdminRoutesDependencies): Hono => {
  const adminRoutes = new Hono();

  adminRoutes.use('*', tenantScopeMiddleware);
  adminRoutes.use('*', roleGuard(['ADMIN']));

  adminRoutes.get('/api/v1/admin/users/access', (c) => {
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    return c.json({ users: identityDirectoryService.listUsers(tenantId) });
  });

  adminRoutes.patch('/api/v1/admin/users/access/:userId', async (c) => {
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    const userId = c.req.param('userId');
    const body = await c.req.json();

    const updated = identityDirectoryService.updateAccess(
      tenantId,
      userId,
      body.role as IdentityRole,
      body.status as IdentityStatus,
    );
    adminAccessService.updateAccess({
      userId: updated.userId,
      role: updated.role,
      status: updated.status,
    });
    return c.json({ user: updated, changes: adminAccessService.listChanges() });
  });

  adminRoutes.get('/api/v1/admin/subscription/visibility', (c) => {
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    return c.json({ visible: true, tenantId, mode: 'all_roles_visible' });
  });

  return adminRoutes;
};
