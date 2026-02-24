import { describe, expect, it } from 'vitest';
import { AppError } from '@shared/errors';
import { AccessTokenService } from '../../src/modules/identity/services/access-token.service';

describe('access token service', () => {
  it('issues and verifies token payload', () => {
    const service = new AccessTokenService('test-secret', 3600);
    const issued = service.issueToken({
      userId: 'client-1',
      tenantId: 'tenant-demo',
      role: 'CLIENT',
    });

    const payload = service.verifyToken(issued.accessToken);
    expect(payload.sub).toBe('client-1');
    expect(payload.tenantId).toBe('tenant-demo');
    expect(payload.role).toBe('CLIENT');
  });

  it('rejects tampered token', () => {
    const service = new AccessTokenService('test-secret', 3600);
    const issued = service.issueToken({
      userId: 'client-1',
      tenantId: 'tenant-demo',
      role: 'CLIENT',
    });

    const tampered = `${issued.accessToken.slice(0, -1)}x`;
    expect(() => service.verifyToken(tampered)).toThrowError(AppError);
  });
});
