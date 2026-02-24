import { randomUUID } from 'node:crypto';
import { PersistedOrderState } from '../../modules/orders/repos/order-status-event.repo';
import { OrderRepo } from '../../modules/orders/repos/order.repo';
import { OrderStatusEventRepo } from '../../modules/orders/repos/order-status-event.repo';
import { SyncRecordRepo } from '../../modules/sync/repos/sync-record.repo';

const knownStatusMap: Record<string, PersistedOrderState> = {
  SYNCED: 'SYNCED',
  IN_PROGRESS: 'IN_PROGRESS',
  READY: 'READY_FOR_PICKUP',
  FULFILLED: 'FULFILLED',
  CANCELED: 'CANCELED',
};

export class IngestExternalStatusUseCase {
  constructor(
    private readonly orderRepo: OrderRepo,
    private readonly orderStatusEventRepo: OrderStatusEventRepo,
    private readonly syncRecordRepo: SyncRecordRepo,
  ) {}

  async execute(
    orderId: string,
    tenantId: string,
    rawStatus: string,
  ): Promise<{ internalState: PersistedOrderState; rawStatus: string }> {
    const internalState = knownStatusMap[rawStatus] ?? 'NEEDS_REVIEW';
    const occurredAt = new Date().toISOString();

    const order = await this.orderRepo.findById(orderId, tenantId);
    if (order) {
      await this.orderRepo.updateState(orderId, tenantId, internalState);
    }

    await this.orderStatusEventRepo.save({
      orderId,
      tenantId,
      internalState,
      externalRawStatus: rawStatus,
      source: 'ERP',
      occurredAt,
    });

    await this.syncRecordRepo.add({
      syncRecordId: randomUUID(),
      orderId,
      tenantId,
      provider: '1c',
      direction: 'INBOUND_STATUS',
      payload: { orderId, rawStatus, occurredAt },
      status: internalState === 'NEEDS_REVIEW' ? 'NEEDS_OPERATOR' : 'SENT',
      lastErrorCode: internalState === 'NEEDS_REVIEW' ? 'UNKNOWN_EXTERNAL_STATUS' : undefined,
    });

    return { internalState, rawStatus };
  }
}
