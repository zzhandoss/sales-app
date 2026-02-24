import { Hono } from 'hono';
import { IdentityDirectoryService } from '../modules/identity/services/identity-directory.service';
import { LoginUseCase } from '../usecases/identity/login.usecase';
import { requireAuthenticatedUser } from './middleware/auth-context';
import { resolvePermissionGuard } from './middleware/permission-guard';

interface AuthRoutesDependencies {
  loginUseCase: LoginUseCase;
  identityDirectoryService: IdentityDirectoryService;
  permissionGuard: ReturnType<typeof resolvePermissionGuard>;
}

export const createAuthRoutes = ({
  loginUseCase,
  identityDirectoryService,
  permissionGuard,
}: AuthRoutesDependencies): Hono => {
  const authRoutes = new Hono();

  authRoutes.post('/api/v1/auth/login', async (c) => {
    const body = await c.req.json();
    const result = await loginUseCase.execute({
      tenantId: String(body.tenantId ?? ''),
      userId: String(body.userId ?? ''),
      password: String(body.password ?? ''),
    });
    return c.json(result);
  });

  authRoutes.get('/api/v1/auth/demo-users', async (c) => {
    const tenantId = c.req.query('tenantId') ?? 'tenant-demo';
    const users = await identityDirectoryService.listUsers(tenantId);
    return c.json({ users });
  });

  authRoutes.get('/api/v1/auth/me', requireAuthenticatedUser, permissionGuard('AUTH_READ_SELF'), async (c) => {
    const userId = (c.get as unknown as (key: string) => unknown)('userId') as string;
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    const user = await identityDirectoryService.getUser(tenantId, userId);
    return c.json({ user: user ?? null });
  });

  return authRoutes;
};
