import { and, eq } from 'drizzle-orm';
import { DB } from '../../db/client';
import { tenantCompanyTable, userAccountTable } from '../../db/schema';
import {
  CreateIdentityUserInput,
  IdentityUserAuthRecord,
  IdentityUserRepo,
} from '../../modules/identity/repos/identity-user.repo';
import { IdentityPublicUser, IdentityRole, IdentityStatus } from '../../modules/identity/entities/identity-user.entity';

const toPublicUser = (row: typeof userAccountTable.$inferSelect): IdentityPublicUser => {
  return {
    userId: row.userId,
    tenantId: row.tenantId,
    role: row.role,
    status: row.status as IdentityStatus,
    displayName: row.displayName,
  };
};

const toAuthRecord = (row: typeof userAccountTable.$inferSelect): IdentityUserAuthRecord => {
  return {
    ...toPublicUser(row),
    passwordHash: row.passwordHash,
  };
};

export class DrizzleIdentityUserRepo implements IdentityUserRepo {
  constructor(private readonly db: DB) {}

  async ensureTenant(tenantId: string): Promise<void> {
    await this.db
      .insert(tenantCompanyTable)
      .values({
        tenantId,
        name: 'Demo Tenant',
        status: 'ACTIVE',
        erpProvider: '1c',
      })
      .onConflictDoNothing();
  }

  async ensureUsers(seed: CreateIdentityUserInput[]): Promise<void> {
    if (!seed.length) {
      return;
    }

    await this.db
      .insert(userAccountTable)
      .values(
        seed.map((user) => ({
          userId: user.userId,
          tenantId: user.tenantId,
          role: user.role,
          telegramUserId: user.userId,
          displayName: user.displayName,
          passwordHash: user.passwordHash,
          status: user.status,
        })),
      )
      .onConflictDoNothing();
  }

  async findByUserId(tenantId: string, userId: string): Promise<IdentityUserAuthRecord | undefined> {
    const row = await this.db.query.userAccountTable.findFirst({
      where: (table, { and, eq }) => and(eq(table.tenantId, tenantId), eq(table.userId, userId)),
    });
    return row ? toAuthRecord(row) : undefined;
  }

  async listByTenant(tenantId: string): Promise<IdentityPublicUser[]> {
    const rows = await this.db
      .select()
      .from(userAccountTable)
      .where(eq(userAccountTable.tenantId, tenantId));

    return rows.map(toPublicUser);
  }

  async updateAccess(
    tenantId: string,
    userId: string,
    role: IdentityRole,
    status: IdentityStatus,
  ): Promise<IdentityPublicUser | undefined> {
    const updated = await this.db
      .update(userAccountTable)
      .set({
        role,
        status,
        updatedAt: new Date(),
      })
      .where(and(eq(userAccountTable.tenantId, tenantId), eq(userAccountTable.userId, userId)))
      .returning();

    const [row] = updated;
    return row ? toPublicUser(row) : undefined;
  }
}
