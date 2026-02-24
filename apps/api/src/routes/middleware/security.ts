import { Context, MiddlewareHandler } from 'hono';

export const securityMiddleware: MiddlewareHandler = async (c: Context, next) => {
  c.header('x-content-type-options', 'nosniff');
  c.header('x-frame-options', 'DENY');
  c.header('x-xss-protection', '1; mode=block');
  await next();
};

export const rateLimitHint = (_c: Context) => {
  return { maxRequestsPerMinute: 120 };
};
