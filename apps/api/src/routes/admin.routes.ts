import { Hono } from 'hono';
import { IdentityRole, IdentityStatus } from '../modules/identity/entities/identity-user.entity';
import { IdentityDirectoryService } from '../modules/identity/services/identity-directory.service';
import { AdminAccessService } from '../modules/identity/services/admin-access.service';
import { requireAuthenticatedUser } from './middleware/auth-context';
import { resolvePermissionGuard } from './middleware/permission-guard';
import { tenantScopeMiddleware } from './middleware/tenant-scope';
import { ListDeadLetterUseCase } from '../usecases/sync/list-dead-letter.usecase';
import { RetryDeadLetterUseCase } from '../usecases/sync/retry-dead-letter.usecase';

interface AdminRoutesDependencies {
  identityDirectoryService: IdentityDirectoryService;
  adminAccessService: AdminAccessService;
  listDeadLetterUseCase: ListDeadLetterUseCase;
  retryDeadLetterUseCase: RetryDeadLetterUseCase;
  permissionGuard: ReturnType<typeof resolvePermissionGuard>;
}

export const createAdminRoutes = ({
  identityDirectoryService,
  adminAccessService,
  listDeadLetterUseCase,
  retryDeadLetterUseCase,
  permissionGuard,
}: AdminRoutesDependencies): Hono => {
  const adminRoutes = new Hono();

  adminRoutes.use('*', requireAuthenticatedUser);
  adminRoutes.use('*', tenantScopeMiddleware);

  adminRoutes.get('/api/v1/admin/users/access', permissionGuard('ADMIN_USER_READ'), async (c) => {
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    return c.json({ users: await identityDirectoryService.listUsers(tenantId) });
  });

  adminRoutes.patch('/api/v1/admin/users/access/:userId', permissionGuard('ADMIN_USER_WRITE'), async (c) => {
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    const userId = c.req.param('userId');
    const body = await c.req.json();

    const updated = await identityDirectoryService.updateAccess(
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

  adminRoutes.get('/api/v1/admin/subscription/visibility', permissionGuard('ADMIN_SUBSCRIPTION_READ'), (c) => {
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    return c.json({ visible: true, tenantId, mode: 'all_roles_visible' });
  });

  adminRoutes.get('/api/v1/admin/sync/dead-letter', permissionGuard('ADMIN_SYNC_DEADLETTER_READ'), async (c) => {
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    const records = await listDeadLetterUseCase.execute(tenantId);
    return c.json({ records });
  });

  adminRoutes.post(
    '/api/v1/admin/sync/dead-letter/:syncRecordId/retry',
    permissionGuard('ADMIN_SYNC_DEADLETTER_RETRY'),
    async (c) => {
      const syncRecordId = c.req.param('syncRecordId');
      await retryDeadLetterUseCase.execute(syncRecordId);
      return c.json({ accepted: true, syncRecordId });
    },
  );

  return adminRoutes;
};
