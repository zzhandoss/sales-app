import { Context, MiddlewareHandler } from 'hono';
import { AppError } from '@shared/errors';

export const roleGuard = (allowedRoles: string[]): MiddlewareHandler => {
  return async (c: Context, next) => {
    const roleFromContext = (c.get as unknown as (key: string) => unknown)('role') as string | undefined;
    const roleFromHeader = c.req.header('x-user-role');

    if (roleFromContext && roleFromHeader && roleFromContext !== roleFromHeader) {
      throw new AppError('ROLE_MISMATCH', 'Role in token and header mismatch', 403);
    }

    const role = roleFromContext ?? roleFromHeader;
    if (!role || !allowedRoles.includes(role)) {
      throw new AppError('ACCESS_DENIED', 'Role is not allowed', 403);
    }

    c.set('role', role);
    await next();
  };
};
