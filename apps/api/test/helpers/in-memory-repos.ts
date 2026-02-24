import {
  OrderRepo,
  OrderRecord,
  CreateOrderRecordInput,
} from '../../src/modules/orders/repos/order.repo';
import {
  OrderStatusEventRepo,
  OrderStatusEventRecord,
  SaveOrderStatusEventInput,
} from '../../src/modules/orders/repos/order-status-event.repo';
import {
  CreateSyncRecordInput,
  SyncRecord,
  SyncRecordRepo,
} from '../../src/modules/sync/repos/sync-record.repo';

export class InMemoryOrderRepo implements OrderRepo {
  private readonly records = new Map<string, OrderRecord>();

  async findByTenantAndIdempotency(
    tenantId: string,
    idempotencyKey: string,
  ): Promise<OrderRecord | undefined> {
    return [...this.records.values()].find(
      (record) => record.tenantId === tenantId && record.idempotencyKey === idempotencyKey,
    );
  }

  async findById(orderId: string, tenantId: string): Promise<OrderRecord | undefined> {
    const record = this.records.get(orderId);
    if (!record || record.tenantId !== tenantId) {
      return undefined;
    }
    return record;
  }

  async listForActor(
    tenantId: string,
    actorUserId: string,
    role: OrderRecord['createdByRole'],
  ): Promise<OrderRecord[]> {
    return [...this.records.values()].filter((record) => {
      if (record.tenantId !== tenantId) {
        return false;
      }
      if (role === 'ADMIN') {
        return true;
      }
      if (role === 'CLIENT') {
        return record.clientUserId === actorUserId;
      }
      return record.createdByUserId === actorUserId;
    });
  }

  async create(input: CreateOrderRecordInput): Promise<OrderRecord> {
    const now = new Date().toISOString();
    const record: OrderRecord = {
      ...input,
      createdAt: now,
      updatedAt: now,
    };
    this.records.set(record.orderId, record);
    return record;
  }

  async updateState(orderId: string, tenantId: string, state: OrderRecord['state']): Promise<OrderRecord> {
    const existing = await this.findById(orderId, tenantId);
    if (!existing) {
      throw new Error('Order not found');
    }
    const updated: OrderRecord = { ...existing, state, updatedAt: new Date().toISOString() };
    this.records.set(orderId, updated);
    return updated;
  }

  async attachExternalOrderId(orderId: string, tenantId: string, externalOrderId: string): Promise<void> {
    const existing = await this.findById(orderId, tenantId);
    if (!existing) {
      return;
    }
    this.records.set(orderId, {
      ...existing,
      externalOrderId,
      updatedAt: new Date().toISOString(),
    });
  }
}

export class InMemoryOrderStatusEventRepo implements OrderStatusEventRepo {
  private readonly records: OrderStatusEventRecord[] = [];

  async save(event: SaveOrderStatusEventInput): Promise<OrderStatusEventRecord> {
    const stored: OrderStatusEventRecord = {
      ...event,
      eventId: `evt-${this.records.length + 1}`,
    };
    this.records.push(stored);
    return stored;
  }

  async listByOrder(orderId: string, tenantId: string): Promise<OrderStatusEventRecord[]> {
    return this.records.filter((record) => record.orderId === orderId && record.tenantId === tenantId);
  }
}

export class InMemorySyncRecordRepo implements SyncRecordRepo {
  private readonly records = new Map<string, SyncRecord>();

  async add(input: CreateSyncRecordInput): Promise<SyncRecord> {
    const now = new Date().toISOString();
    const record: SyncRecord = {
      syncRecordId: input.syncRecordId,
      orderId: input.orderId,
      tenantId: input.tenantId,
      provider: input.provider,
      direction: input.direction,
      status: input.status ?? 'PENDING',
      attemptCount: input.attemptCount ?? 0,
      payload: input.payload,
      lastErrorCode: input.lastErrorCode,
      nextRetryAt: input.nextRetryAt,
      createdAt: now,
      updatedAt: now,
    };
    this.records.set(record.syncRecordId, record);
    return record;
  }

  async findPendingForRetry(now: string): Promise<SyncRecord[]> {
    const nowDate = new Date(now);
    return [...this.records.values()].filter((record) => {
      if (record.status !== 'PENDING' && record.status !== 'FAILED') {
        return false;
      }
      if (!record.nextRetryAt) {
        return true;
      }
      return new Date(record.nextRetryAt) <= nowDate;
    });
  }

  async findNeedsOperator(tenantId: string): Promise<SyncRecord[]> {
    return [...this.records.values()].filter(
      (record) => record.tenantId === tenantId && record.status === 'NEEDS_OPERATOR',
    );
  }

  async requeue(syncRecordId: string): Promise<void> {
    const existing = this.records.get(syncRecordId);
    if (!existing) {
      return;
    }
    this.records.set(syncRecordId, {
      ...existing,
      status: 'FAILED',
      nextRetryAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    });
  }

  async markSent(syncRecordId: string): Promise<void> {
    const existing = this.records.get(syncRecordId);
    if (!existing) {
      return;
    }
    this.records.set(syncRecordId, {
      ...existing,
      status: 'SENT',
      attemptCount: existing.attemptCount + 1,
      lastErrorCode: undefined,
      nextRetryAt: undefined,
      updatedAt: new Date().toISOString(),
    });
  }

  async markFailed(syncRecordId: string, errorCode: string, nextRetryAt: string): Promise<void> {
    const existing = this.records.get(syncRecordId);
    if (!existing) {
      return;
    }
    this.records.set(syncRecordId, {
      ...existing,
      status: 'FAILED',
      attemptCount: existing.attemptCount + 1,
      lastErrorCode: errorCode,
      nextRetryAt,
      updatedAt: new Date().toISOString(),
    });
  }

  async markNeedsOperator(syncRecordId: string, errorCode: string): Promise<void> {
    const existing = this.records.get(syncRecordId);
    if (!existing) {
      return;
    }
    this.records.set(syncRecordId, {
      ...existing,
      status: 'NEEDS_OPERATOR',
      attemptCount: existing.attemptCount + 1,
      lastErrorCode: errorCode,
      nextRetryAt: undefined,
      updatedAt: new Date().toISOString(),
    });
  }
}
