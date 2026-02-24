import { Context, MiddlewareHandler } from 'hono';
import { AppError } from '@shared/errors';

export const tenantScopeMiddleware: MiddlewareHandler = async (c: Context, next) => {
  const tenantFromContext = (c.get as unknown as (key: string) => unknown)('tenantId') as
    | string
    | undefined;
  const tenantFromHeader = c.req.header('x-tenant-id');

  if (tenantFromContext && tenantFromHeader && tenantFromContext !== tenantFromHeader) {
    throw new AppError('TENANT_MISMATCH', 'Tenant in token and header mismatch', 403);
  }

  const tenantId = tenantFromContext ?? tenantFromHeader;
  if (!tenantId) {
    throw new AppError('TENANT_REQUIRED', 'Missing tenant scope', 400);
  }

  c.set('tenantId', tenantId);
  await next();
};
