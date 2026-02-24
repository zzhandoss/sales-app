import { IdentityPublicUser, IdentityRole, IdentityStatus } from '../entities/identity-user.entity';

export interface CreateIdentityUserInput {
  userId: string;
  tenantId: string;
  role: IdentityRole;
  status: IdentityStatus;
  displayName: string;
  passwordHash: string;
}

export interface IdentityUserAuthRecord extends IdentityPublicUser {
  passwordHash: string;
}

export interface IdentityUserRepo {
  ensureTenant(tenantId: string): Promise<void>;
  ensureUsers(seed: CreateIdentityUserInput[]): Promise<void>;
  findByUserId(tenantId: string, userId: string): Promise<IdentityUserAuthRecord | undefined>;
  listByTenant(tenantId: string): Promise<IdentityPublicUser[]>;
  updateAccess(
    tenantId: string,
    userId: string,
    role: IdentityRole,
    status: IdentityStatus,
  ): Promise<IdentityPublicUser | undefined>;
}
