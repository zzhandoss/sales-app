import { PushOrderPayload } from '@integration/erp-1c';
import { resolveErpAdapter } from '../../adapters/erp/registry';
import { OrderRepo } from '../../modules/orders/repos/order.repo';
import { SyncRecord } from '../../modules/sync/repos/sync-record.repo';
import { SyncRecordRepo } from '../../modules/sync/repos/sync-record.repo';

export class PushOrderToErpUseCase {
  constructor(
    private readonly orderRepo: OrderRepo,
    private readonly syncRecordRepo: SyncRecordRepo,
  ) {}

  async execute(syncRecord: SyncRecord): Promise<{ externalOrderId: string }> {
    const payload = syncRecord.payload as unknown as PushOrderPayload;
    const adapter = resolveErpAdapter(syncRecord.provider);
    const result = await adapter.pushOrder(payload);

    if (result.retriable) {
      const nextRetryAt = new Date(Date.now() + 60_000).toISOString();
      await this.syncRecordRepo.markFailed(syncRecord.syncRecordId, 'RETRYABLE_PUSH_FAILURE', nextRetryAt);
      return { externalOrderId: result.externalOrderId };
    }

    await this.orderRepo.attachExternalOrderId(syncRecord.orderId, syncRecord.tenantId, result.externalOrderId);
    await this.orderRepo.updateState(syncRecord.orderId, syncRecord.tenantId, 'SYNCED');
    await this.syncRecordRepo.markSent(syncRecord.syncRecordId);

    return { externalOrderId: result.externalOrderId };
  }
}
