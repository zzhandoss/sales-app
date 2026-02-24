import { Hono } from 'hono';
import { IdentityDirectoryService } from '../modules/identity/services/identity-directory.service';
import { requireAuthenticatedUser } from './middleware/auth-context';
import { LoginUseCase } from '../usecases/identity/login.usecase';

interface AuthRoutesDependencies {
  loginUseCase: LoginUseCase;
  identityDirectoryService: IdentityDirectoryService;
}

export const createAuthRoutes = ({
  loginUseCase,
  identityDirectoryService,
}: AuthRoutesDependencies): Hono => {
  const authRoutes = new Hono();

  authRoutes.post('/api/v1/auth/login', async (c) => {
    const body = await c.req.json();
    const result = loginUseCase.execute({
      tenantId: String(body.tenantId ?? ''),
      userId: String(body.userId ?? ''),
      password: String(body.password ?? ''),
    });
    return c.json(result);
  });

  authRoutes.get('/api/v1/auth/demo-users', (c) => {
    const tenantId = c.req.query('tenantId') ?? 'tenant-demo';
    const users = identityDirectoryService.listUsers(tenantId);
    return c.json({ users });
  });

  authRoutes.get('/api/v1/auth/me', requireAuthenticatedUser, (c) => {
    const userId = (c.get as unknown as (key: string) => unknown)('userId') as string;
    const tenantId = (c.get as unknown as (key: string) => unknown)('tenantId') as string;
    const user = identityDirectoryService.getUser(tenantId, userId);
    return c.json({ user: user ?? null });
  });

  return authRoutes;
};
