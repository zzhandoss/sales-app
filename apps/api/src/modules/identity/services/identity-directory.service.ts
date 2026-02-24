import { AppError } from '@shared/errors';
import { IdentityPublicUser, IdentityRole, IdentityStatus } from '../entities/identity-user.entity';
import { CreateIdentityUserInput, IdentityUserRepo } from '../repos/identity-user.repo';
import { PasswordHashService } from './password-hash.service';

const demoSeed = (passwordHashService: PasswordHashService): CreateIdentityUserInput[] => [
  {
    userId: 'client-1',
    tenantId: 'tenant-demo',
    role: 'CLIENT',
    status: 'ACTIVE',
    displayName: 'Client One',
    passwordHash: passwordHashService.hash('demo12345'),
  },
  {
    userId: 'agent-1',
    tenantId: 'tenant-demo',
    role: 'SALES_AGENT',
    status: 'ACTIVE',
    displayName: 'Sales Agent One',
    passwordHash: passwordHashService.hash('demo12345'),
  },
  {
    userId: 'manager-1',
    tenantId: 'tenant-demo',
    role: 'IN_STORE_MANAGER',
    status: 'ACTIVE',
    displayName: 'Store Manager One',
    passwordHash: passwordHashService.hash('demo12345'),
  },
  {
    userId: 'admin-1',
    tenantId: 'tenant-demo',
    role: 'ADMIN',
    status: 'ACTIVE',
    displayName: 'Admin One',
    passwordHash: passwordHashService.hash('demo12345'),
  },
];

export class IdentityDirectoryService {
  private seeded = false;

  constructor(
    private readonly identityUserRepo: IdentityUserRepo,
    private readonly passwordHashService: PasswordHashService,
  ) {}

  private async ensureSeedData(tenantId: string): Promise<void> {
    if (this.seeded) {
      return;
    }
    await this.identityUserRepo.ensureTenant(tenantId);
    await this.identityUserRepo.ensureUsers(demoSeed(this.passwordHashService));
    this.seeded = true;
  }

  async authenticate(tenantId: string, userId: string, password: string): Promise<IdentityPublicUser> {
    await this.ensureSeedData(tenantId);
    const user = await this.identityUserRepo.findByUserId(tenantId, userId);
    if (!user || !this.passwordHashService.verify(password, user.passwordHash)) {
      throw new AppError('INVALID_CREDENTIALS', 'Invalid credentials', 401);
    }
    if (user.status !== 'ACTIVE') {
      throw new AppError('ACCOUNT_DISABLED', 'Account is disabled', 403);
    }
    return {
      userId: user.userId,
      tenantId: user.tenantId,
      role: user.role,
      status: user.status,
      displayName: user.displayName,
    };
  }

  async getUser(tenantId: string, userId: string): Promise<IdentityPublicUser | undefined> {
    await this.ensureSeedData(tenantId);
    const user = await this.identityUserRepo.findByUserId(tenantId, userId);
    if (!user) {
      return undefined;
    }
    return {
      userId: user.userId,
      tenantId: user.tenantId,
      role: user.role,
      status: user.status,
      displayName: user.displayName,
    };
  }

  async listUsers(tenantId: string): Promise<IdentityPublicUser[]> {
    await this.ensureSeedData(tenantId);
    return this.identityUserRepo.listByTenant(tenantId);
  }

  async updateAccess(
    tenantId: string,
    userId: string,
    role: IdentityRole,
    status: IdentityStatus,
  ): Promise<IdentityPublicUser> {
    await this.ensureSeedData(tenantId);
    const updated = await this.identityUserRepo.updateAccess(tenantId, userId, role, status);
    if (!updated) {
      throw new AppError('USER_NOT_FOUND', 'User is not found in tenant', 404);
    }
    return updated;
  }
}
