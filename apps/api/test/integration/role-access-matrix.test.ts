import { describe, expect, it } from 'vitest';
import { Hono } from 'hono';
import { isAppError } from '@shared/errors';
import { AccessTokenService } from '../../src/modules/identity/services/access-token.service';
import { resolveAuthContext } from '../../src/routes/middleware/auth-context';
import { roleGuard } from '../../src/routes/middleware/role-guard';
import { tenantScopeMiddleware } from '../../src/routes/middleware/tenant-scope';

const buildApp = (accessTokenService: AccessTokenService) => {
  const app = new Hono();
  app.onError((err, c) => {
    if (isAppError(err)) {
      return c.json({ code: err.code }, err.status as 400);
    }
    return c.json({ code: 'INTERNAL' }, 500);
  });
  app.use('/secure/*', resolveAuthContext({ accessTokenService }));
  app.use('/secure/*', tenantScopeMiddleware);
  app.get('/secure/client', roleGuard(['CLIENT']), (c) => c.json({ ok: true }));
  app.get('/secure/admin', roleGuard(['ADMIN']), (c) => c.json({ ok: true }));
  return app;
};

describe('role access matrix', () => {
  it('allows client on client endpoint and blocks admin endpoint', async () => {
    const tokenService = new AccessTokenService('matrix-secret', 3600);
    const token = tokenService.issueToken({
      userId: 'client-1',
      tenantId: 'tenant-demo',
      role: 'CLIENT',
    });
    const app = buildApp(tokenService);

    const clientResponse = await app.request('/secure/client', {
      headers: {
        authorization: `Bearer ${token.accessToken}`,
      },
    });
    expect(clientResponse.status).toBe(200);

    const adminResponse = await app.request('/secure/admin', {
      headers: {
        authorization: `Bearer ${token.accessToken}`,
      },
    });
    expect(adminResponse.status).toBe(403);
  });

  it('allows admin on admin endpoint', async () => {
    const tokenService = new AccessTokenService('matrix-secret', 3600);
    const token = tokenService.issueToken({
      userId: 'admin-1',
      tenantId: 'tenant-demo',
      role: 'ADMIN',
    });
    const app = buildApp(tokenService);

    const response = await app.request('/secure/admin', {
      headers: {
        authorization: `Bearer ${token.accessToken}`,
      },
    });
    expect(response.status).toBe(200);
  });
});
