import { Context, MiddlewareHandler } from 'hono';
import { AppError } from '@shared/errors';
import { AccessTokenService } from '../../modules/identity/services/access-token.service';

interface AuthContextDependencies {
  accessTokenService: AccessTokenService;
}

const parseBearerToken = (headerValue?: string): string | undefined => {
  if (!headerValue) {
    return undefined;
  }
  if (!headerValue.startsWith('Bearer ')) {
    throw new AppError('INVALID_AUTH_HEADER', 'Authorization header must use Bearer token', 401);
  }
  const token = headerValue.slice('Bearer '.length).trim();
  if (!token) {
    throw new AppError('EMPTY_ACCESS_TOKEN', 'Access token is empty', 401);
  }
  return token;
};

export const resolveAuthContext = ({
  accessTokenService,
}: AuthContextDependencies): MiddlewareHandler => {
  return async (c: Context, next) => {
    const token = parseBearerToken(c.req.header('authorization'));
    if (token) {
      const payload = accessTokenService.verifyToken(token);
      c.set('userId', payload.sub);
      c.set('tenantId', payload.tenantId);
      c.set('role', payload.role);
    }
    await next();
  };
};

export const requireAuthenticatedUser: MiddlewareHandler = async (c: Context, next) => {
  const userId = (c.get as unknown as (key: string) => unknown)('userId') as string | undefined;
  if (!userId) {
    throw new AppError('AUTH_REQUIRED', 'Authentication is required', 401);
  }
  await next();
};
