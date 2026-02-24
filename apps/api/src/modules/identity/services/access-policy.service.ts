import { AppError } from '@shared/errors';
import { IdentityRole } from '../entities/identity-user.entity';

export type Permission =
  | 'AUTH_READ_SELF'
  | 'CATALOG_READ'
  | 'ORDER_CREATE_SELF'
  | 'ORDER_CREATE_ASSISTED'
  | 'ORDER_READ'
  | 'ORDER_CANCEL'
  | 'ORDER_CONFIRM_FULFILLMENT'
  | 'ORDER_FEEDBACK_WRITE'
  | 'ADMIN_USER_READ'
  | 'ADMIN_USER_WRITE'
  | 'ADMIN_SUBSCRIPTION_READ'
  | 'ADMIN_SYNC_DEADLETTER_READ'
  | 'ADMIN_SYNC_DEADLETTER_RETRY';

const permissionByRole: Record<IdentityRole, Set<Permission>> = {
  CLIENT: new Set([
    'AUTH_READ_SELF',
    'CATALOG_READ',
    'ORDER_CREATE_SELF',
    'ORDER_READ',
    'ORDER_CANCEL',
    'ORDER_CONFIRM_FULFILLMENT',
    'ORDER_FEEDBACK_WRITE',
  ]),
  SALES_AGENT: new Set([
    'CATALOG_READ',
    'ORDER_CREATE_ASSISTED',
    'ORDER_READ',
    'ORDER_CANCEL',
  ]),
  IN_STORE_MANAGER: new Set([
    'CATALOG_READ',
    'ORDER_CREATE_ASSISTED',
    'ORDER_READ',
    'ORDER_CANCEL',
  ]),
  ADMIN: new Set([
    'CATALOG_READ',
    'ORDER_READ',
    'ADMIN_USER_READ',
    'ADMIN_USER_WRITE',
    'ADMIN_SUBSCRIPTION_READ',
    'ADMIN_SYNC_DEADLETTER_READ',
    'ADMIN_SYNC_DEADLETTER_RETRY',
  ]),
};

export class AccessPolicyService {
  hasPermission(role: IdentityRole, permission: Permission): boolean {
    return permissionByRole[role]?.has(permission) ?? false;
  }

  assertPermission(role: IdentityRole, permission: Permission): void {
    if (!this.hasPermission(role, permission)) {
      throw new AppError(
        'ACCESS_DENIED',
        `Role ${role} is not allowed for permission ${permission}`,
        403,
      );
    }
  }
}
