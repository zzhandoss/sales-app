import { asc, and, eq } from 'drizzle-orm';
import { randomUUID } from 'node:crypto';
import { DB } from '../../db/client';
import { orderStatusEventTable } from '../../db/schema';
import {
  OrderStatusEventRecord,
  OrderStatusEventRepo,
  SaveOrderStatusEventInput,
} from '../../modules/orders/repos/order-status-event.repo';

const toOrderStatusEventRecord = (
  row: typeof orderStatusEventTable.$inferSelect,
): OrderStatusEventRecord => {
  return {
    eventId: row.eventId,
    orderId: row.orderId,
    tenantId: row.tenantId,
    internalState: row.internalState,
    externalRawStatus: row.externalRawStatus ?? undefined,
    source: row.source,
    occurredAt: row.occurredAt.toISOString(),
  };
};

export class DrizzleOrderStatusEventRepo implements OrderStatusEventRepo {
  constructor(private readonly db: DB) {}

  async save(event: SaveOrderStatusEventInput): Promise<OrderStatusEventRecord> {
    const inserted = await this.db
      .insert(orderStatusEventTable)
      .values({
        eventId: randomUUID(),
        orderId: event.orderId,
        tenantId: event.tenantId,
        internalState: event.internalState,
        externalRawStatus: event.externalRawStatus,
        source: event.source,
        occurredAt: new Date(event.occurredAt),
      })
      .returning();

    const [row] = inserted;
    return toOrderStatusEventRecord(row);
  }

  async listByOrder(orderId: string, tenantId: string): Promise<OrderStatusEventRecord[]> {
    const rows = await this.db
      .select()
      .from(orderStatusEventTable)
      .where(and(eq(orderStatusEventTable.orderId, orderId), eq(orderStatusEventTable.tenantId, tenantId)))
      .orderBy(asc(orderStatusEventTable.occurredAt));

    return rows.map(toOrderStatusEventRecord);
  }
}
