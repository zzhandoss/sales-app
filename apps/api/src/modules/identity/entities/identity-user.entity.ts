export type IdentityRole = 'CLIENT' | 'SALES_AGENT' | 'IN_STORE_MANAGER' | 'ADMIN';
export type IdentityStatus = 'ACTIVE' | 'DISABLED';

export interface IdentityUser {
  userId: string;
  tenantId: string;
  role: IdentityRole;
  status: IdentityStatus;
  displayName: string;
  passwordHash: string;
}

export interface IdentityPublicUser {
  userId: string;
  tenantId: string;
  role: IdentityRole;
  status: IdentityStatus;
  displayName: string;
}

export const toPublicIdentityUser = (user: IdentityUser): IdentityPublicUser => {
  return {
    userId: user.userId,
    tenantId: user.tenantId,
    role: user.role,
    status: user.status,
    displayName: user.displayName,
  };
};
