import { Context, MiddlewareHandler } from 'hono';
import { AppError } from '@shared/errors';
import { IdentityRole } from '../../modules/identity/entities/identity-user.entity';
import { AccessPolicyService, Permission } from '../../modules/identity/services/access-policy.service';

interface PermissionGuardDependencies {
  accessPolicyService: AccessPolicyService;
}

export const resolvePermissionGuard = ({
  accessPolicyService,
}: PermissionGuardDependencies) => {
  return (permission: Permission): MiddlewareHandler => {
    return async (c: Context, next) => {
      const role = (c.get as unknown as (key: string) => unknown)('role') as IdentityRole | undefined;
      if (!role) {
        throw new AppError('AUTH_REQUIRED', 'Authentication is required', 401);
      }
      accessPolicyService.assertPermission(role, permission);
      await next();
    };
  };
};
