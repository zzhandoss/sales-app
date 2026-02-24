import { and, eq } from 'drizzle-orm';
import { AppError } from '@shared/errors';
import { DB } from '../../db/client';
import { ordersTable } from '../../db/schema';
import {
  CreateOrderRecordInput,
  OrderRecord,
  OrderRepo,
} from '../../modules/orders/repos/order.repo';

const toOrderRecord = (row: typeof ordersTable.$inferSelect): OrderRecord => {
  return {
    orderId: row.orderId,
    tenantId: row.tenantId,
    clientUserId: row.clientUserId,
    createdByUserId: row.createdByUserId,
    createdByRole: row.createdByRole,
    state: row.state,
    externalOrderId: row.externalOrderId ?? undefined,
    totalAmount: Number(row.totalAmount),
    currency: row.currency,
    idempotencyKey: row.idempotencyKey,
    createdAt: row.createdAt.toISOString(),
    updatedAt: row.updatedAt.toISOString(),
  };
};

export class DrizzleOrderRepo implements OrderRepo {
  constructor(private readonly db: DB) {}

  async findByTenantAndIdempotency(
    tenantId: string,
    idempotencyKey: string,
  ): Promise<OrderRecord | undefined> {
    const row = await this.db.query.ordersTable.findFirst({
      where: (table, { and, eq }) =>
        and(eq(table.tenantId, tenantId), eq(table.idempotencyKey, idempotencyKey)),
    });
    return row ? toOrderRecord(row) : undefined;
  }

  async findById(orderId: string, tenantId: string): Promise<OrderRecord | undefined> {
    const row = await this.db.query.ordersTable.findFirst({
      where: (table, { and, eq }) => and(eq(table.orderId, orderId), eq(table.tenantId, tenantId)),
    });
    return row ? toOrderRecord(row) : undefined;
  }

  async create(input: CreateOrderRecordInput): Promise<OrderRecord> {
    const inserted = await this.db
      .insert(ordersTable)
      .values({
        orderId: input.orderId,
        tenantId: input.tenantId,
        clientUserId: input.clientUserId,
        createdByUserId: input.createdByUserId,
        createdByRole: input.createdByRole,
        state: input.state,
        totalAmount: String(input.totalAmount),
        currency: input.currency,
        idempotencyKey: input.idempotencyKey,
      })
      .returning();

    const [created] = inserted;
    if (!created) {
      throw new AppError('ORDER_CREATE_FAILED', 'Order creation returned no rows', 500);
    }

    return toOrderRecord(created);
  }

  async updateState(orderId: string, tenantId: string, state: OrderRecord['state']): Promise<OrderRecord> {
    const updated = await this.db
      .update(ordersTable)
      .set({ state, updatedAt: new Date() })
      .where(and(eq(ordersTable.orderId, orderId), eq(ordersTable.tenantId, tenantId)))
      .returning();

    const [row] = updated;
    if (!row) {
      throw new AppError('ORDER_NOT_FOUND', 'Order not found for state update', 404);
    }

    return toOrderRecord(row);
  }

  async attachExternalOrderId(orderId: string, tenantId: string, externalOrderId: string): Promise<void> {
    await this.db
      .update(ordersTable)
      .set({ externalOrderId, updatedAt: new Date() })
      .where(and(eq(ordersTable.orderId, orderId), eq(ordersTable.tenantId, tenantId)));
  }
}
