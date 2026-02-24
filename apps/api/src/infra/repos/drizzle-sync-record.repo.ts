import { and, asc, eq, inArray, lte, or, sql } from 'drizzle-orm';
import { DB } from '../../db/client';
import { syncRecordTable } from '../../db/schema';
import {
  CreateSyncRecordInput,
  SyncRecord,
  SyncRecordRepo,
} from '../../modules/sync/repos/sync-record.repo';

const toSyncRecord = (row: typeof syncRecordTable.$inferSelect): SyncRecord => {
  return {
    syncRecordId: row.syncRecordId,
    orderId: row.orderId,
    tenantId: row.tenantId,
    provider: row.provider,
    direction: row.direction,
    status: row.status,
    attemptCount: row.attemptCount,
    payload: row.payload,
    lastErrorCode: row.lastErrorCode ?? undefined,
    nextRetryAt: row.nextRetryAt?.toISOString(),
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
};

export class DrizzleSyncRecordRepo implements SyncRecordRepo {
  constructor(private readonly db: DB) {}

  async add(input: CreateSyncRecordInput): Promise<SyncRecord> {
    const inserted = await this.db
      .insert(syncRecordTable)
      .values({
        syncRecordId: input.syncRecordId,
        orderId: input.orderId,
        tenantId: input.tenantId,
        provider: input.provider,
        direction: input.direction,
        status: input.status ?? 'PENDING',
        attemptCount: input.attemptCount ?? 0,
        payload: input.payload,
        lastErrorCode: input.lastErrorCode,
        nextRetryAt: input.nextRetryAt ? new Date(input.nextRetryAt) : null,
      })
      .returning();

    const [row] = inserted;
    return toSyncRecord(row);
  }

  async findPendingForRetry(now: string): Promise<SyncRecord[]> {
    const rows = await this.db
      .select()
      .from(syncRecordTable)
      .where(
        and(
          inArray(syncRecordTable.status, ['PENDING', 'FAILED']),
          or(
            sql`${syncRecordTable.nextRetryAt} IS NULL`,
            lte(syncRecordTable.nextRetryAt, new Date(now)),
          ),
        ),
      )
      .orderBy(asc(syncRecordTable.createdAt));

    return rows.map(toSyncRecord);
  }

  async findNeedsOperator(tenantId: string): Promise<SyncRecord[]> {
    const rows = await this.db
      .select()
      .from(syncRecordTable)
      .where(
        and(
          eq(syncRecordTable.tenantId, tenantId),
          eq(syncRecordTable.status, 'NEEDS_OPERATOR'),
        ),
      )
      .orderBy(asc(syncRecordTable.updatedAt));

    return rows.map(toSyncRecord);
  }

  async requeue(syncRecordId: string): Promise<void> {
    await this.db
      .update(syncRecordTable)
      .set({
        status: 'FAILED',
        nextRetryAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(syncRecordTable.syncRecordId, syncRecordId));
  }

  async markSent(syncRecordId: string): Promise<void> {
    await this.db
      .update(syncRecordTable)
      .set({
        status: 'SENT',
        attemptCount: sql`${syncRecordTable.attemptCount} + 1`,
        lastErrorCode: null,
        nextRetryAt: null,
        updatedAt: new Date(),
      })
      .where(eq(syncRecordTable.syncRecordId, syncRecordId));
  }

  async markFailed(syncRecordId: string, errorCode: string, nextRetryAt: string): Promise<void> {
    await this.db
      .update(syncRecordTable)
      .set({
        status: 'FAILED',
        attemptCount: sql`${syncRecordTable.attemptCount} + 1`,
        lastErrorCode: errorCode,
        nextRetryAt: new Date(nextRetryAt),
        updatedAt: new Date(),
      })
      .where(eq(syncRecordTable.syncRecordId, syncRecordId));
  }

  async markNeedsOperator(syncRecordId: string, errorCode: string): Promise<void> {
    await this.db
      .update(syncRecordTable)
      .set({
        status: 'NEEDS_OPERATOR',
        attemptCount: sql`${syncRecordTable.attemptCount} + 1`,
        lastErrorCode: errorCode,
        nextRetryAt: null,
        updatedAt: new Date(),
      })
      .where(eq(syncRecordTable.syncRecordId, syncRecordId));
  }
}
