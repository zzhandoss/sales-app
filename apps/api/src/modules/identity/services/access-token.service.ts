import { createHmac } from 'node:crypto';
import { AppError } from '@shared/errors';
import { IdentityRole } from '../entities/identity-user.entity';

const encode = (value: string): string => Buffer.from(value, 'utf8').toString('base64url');
const decode = (value: string): string => Buffer.from(value, 'base64url').toString('utf8');

export interface AccessTokenPayload {
  sub: string;
  tenantId: string;
  role: IdentityRole;
  iat: number;
  exp: number;
}

export class AccessTokenService {
  constructor(
    private readonly secret: string,
    private readonly ttlSeconds: number = 60 * 60 * 8,
  ) {}

  issueToken(input: { userId: string; tenantId: string; role: IdentityRole }): {
    accessToken: string;
    expiresAt: string;
  } {
    const now = Math.floor(Date.now() / 1000);
    const payload: AccessTokenPayload = {
      sub: input.userId,
      tenantId: input.tenantId,
      role: input.role,
      iat: now,
      exp: now + this.ttlSeconds,
    };

    const headerPart = encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
    const payloadPart = encode(JSON.stringify(payload));
    const signature = this.sign(`${headerPart}.${payloadPart}`);

    return {
      accessToken: `${headerPart}.${payloadPart}.${signature}`,
      expiresAt: new Date(payload.exp * 1000).toISOString(),
    };
  }

  verifyToken(token: string): AccessTokenPayload {
    const parts = token.split('.');
    if (parts.length !== 3) {
      throw new AppError('INVALID_TOKEN', 'Token has invalid format', 401);
    }

    const [headerPart, payloadPart, signature] = parts;
    const expected = this.sign(`${headerPart}.${payloadPart}`);
    if (signature !== expected) {
      throw new AppError('INVALID_TOKEN_SIGNATURE', 'Token signature is invalid', 401);
    }

    const payload = JSON.parse(decode(payloadPart)) as AccessTokenPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      throw new AppError('TOKEN_EXPIRED', 'Token expired', 401);
    }
    return payload;
  }

  private sign(input: string): string {
    return createHmac('sha256', this.secret).update(input).digest('base64url');
  }
}
