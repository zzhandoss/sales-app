import { resolveErpAdapter } from '../../adapters/erp/registry';
import { SyncRecordRepo } from '../../modules/sync/repos/sync-record.repo';

export class PushOrderToErpUseCase {
  constructor(private readonly syncRecordRepo: SyncRecordRepo) {}

  async execute(provider: string, orderPayload: Record<string, unknown>): Promise<{ externalOrderId: string }> {
    const adapter = resolveErpAdapter(provider);
    const result = await adapter.pushOrder(orderPayload as never);

    this.syncRecordRepo.add({
      syncRecordId: `sync-${Date.now()}`,
      orderId: String(orderPayload['internalOrderId'] ?? 'unknown'),
      tenantId: String(orderPayload['tenantExternalId'] ?? 'unknown'),
      provider,
      direction: 'OUTBOUND_ORDER',
      status: result.retriable ? 'FAILED' : 'SENT',
      attemptCount: 0,
      lastErrorCode: result.retriable ? 'RETRYABLE_PUSH_FAILURE' : undefined,
    });

    return { externalOrderId: result.externalOrderId };
  }
}
