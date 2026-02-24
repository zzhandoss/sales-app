import { Context, MiddlewareHandler } from 'hono';
import { AppError } from '@shared/errors';

export const tenantScopeMiddleware: MiddlewareHandler = async (c: Context, next) => {
  const tenantId = c.req.header('x-tenant-id');
  if (!tenantId) {
    throw new AppError('TENANT_REQUIRED', 'Missing tenant scope', 400);
  }
  c.set('tenantId', tenantId);
  await next();
};
