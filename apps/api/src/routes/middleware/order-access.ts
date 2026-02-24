import { Context, MiddlewareHandler } from 'hono';
import { AppError } from '@shared/errors';

export const orderAccessPolicy: MiddlewareHandler = async (c: Context, next) => {
  const actorRole = c.req.header('x-user-role');
  const targetClient = c.req.header('x-target-client-id');
  if ((actorRole === 'SALES_AGENT' || actorRole === 'IN_STORE_MANAGER') && !targetClient) {
    throw new AppError('TARGET_CLIENT_REQUIRED', 'Assisted order requires target client id', 400);
  }
  await next();
};
