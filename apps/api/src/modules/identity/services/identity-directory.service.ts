import { AppError } from '@shared/errors';
import {
  IdentityPublicUser,
  IdentityRole,
  IdentityStatus,
  IdentityUser,
  toPublicIdentityUser,
} from '../entities/identity-user.entity';

const demoUsers: IdentityUser[] = [
  {
    userId: 'client-1',
    tenantId: 'tenant-demo',
    role: 'CLIENT',
    status: 'ACTIVE',
    displayName: 'Client One',
    password: 'demo12345',
  },
  {
    userId: 'agent-1',
    tenantId: 'tenant-demo',
    role: 'SALES_AGENT',
    status: 'ACTIVE',
    displayName: 'Sales Agent One',
    password: 'demo12345',
  },
  {
    userId: 'manager-1',
    tenantId: 'tenant-demo',
    role: 'IN_STORE_MANAGER',
    status: 'ACTIVE',
    displayName: 'Store Manager One',
    password: 'demo12345',
  },
  {
    userId: 'admin-1',
    tenantId: 'tenant-demo',
    role: 'ADMIN',
    status: 'ACTIVE',
    displayName: 'Admin One',
    password: 'demo12345',
  },
];

export class IdentityDirectoryService {
  private readonly usersByTenant = new Map<string, Map<string, IdentityUser>>();

  constructor(seedUsers: IdentityUser[] = demoUsers) {
    for (const user of seedUsers) {
      const tenantUsers = this.usersByTenant.get(user.tenantId) ?? new Map<string, IdentityUser>();
      tenantUsers.set(user.userId, { ...user });
      this.usersByTenant.set(user.tenantId, tenantUsers);
    }
  }

  authenticate(tenantId: string, userId: string, password: string): IdentityPublicUser {
    const user = this.usersByTenant.get(tenantId)?.get(userId);
    if (!user || user.password !== password) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid credentials', 401);
    }
    if (user.status !== 'ACTIVE') {
      throw new AppError('ACCOUNT_DISABLED', 'Account is disabled', 403);
    }
    return toPublicIdentityUser(user);
  }

  getUser(tenantId: string, userId: string): IdentityPublicUser | undefined {
    const user = this.usersByTenant.get(tenantId)?.get(userId);
    return user ? toPublicIdentityUser(user) : undefined;
  }

  listUsers(tenantId: string): IdentityPublicUser[] {
    const users = this.usersByTenant.get(tenantId);
    if (!users) {
      return [];
    }
    return [...users.values()].map(toPublicIdentityUser);
  }

  updateAccess(tenantId: string, userId: string, role: IdentityRole, status: IdentityStatus): IdentityPublicUser {
    const users = this.usersByTenant.get(tenantId);
    const user = users?.get(userId);
    if (!users || !user) {
      throw new AppError('USER_NOT_FOUND', 'User is not found in tenant', 404);
    }
    const updated: IdentityUser = {
      ...user,
      role,
      status,
    };
    users.set(userId, updated);
    return toPublicIdentityUser(updated);
  }
}
