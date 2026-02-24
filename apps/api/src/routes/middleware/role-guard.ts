import { Context, MiddlewareHandler } from 'hono';
import { AppError } from '@shared/errors';

export const roleGuard = (allowedRoles: string[]): MiddlewareHandler => {
  return async (c: Context, next) => {
    const role = c.req.header('x-user-role');
    if (!role || !allowedRoles.includes(role)) {
      throw new AppError('ACCESS_DENIED', 'Role is not allowed', 403);
    }
    c.set('role', role);
    await next();
  };
};
