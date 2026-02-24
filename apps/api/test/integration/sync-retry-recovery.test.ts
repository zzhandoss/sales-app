import { afterEach, describe, expect, it } from 'vitest';
import { ErpAdapter, PushOrderPayload } from '@integration/erp-1c';
import { registerErpAdapter, resetErpAdapters } from '../../src/adapters/erp/registry';
import { SyncRetryWorker } from '../../src/adapters/sync/retry-worker';
import { PushOrderToErpUseCase } from '../../src/usecases/sync/push-order-to-erp.usecase';
import { InMemoryOrderRepo, InMemorySyncRecordRepo } from '../helpers/in-memory-repos';

class FlakyAdapter implements ErpAdapter {
  provider = '1c';
  private shouldFail = true;

  setHealthy(): void {
    this.shouldFail = false;
  }

  async pushOrder(payload: PushOrderPayload): Promise<{ externalOrderId: string; retriable: boolean }> {
    return {
      externalOrderId: `ext-${payload.internalOrderId}`,
      retriable: this.shouldFail,
    };
  }

  async fetchOrderStatus(externalOrderId: string) {
    return {
      externalOrderId,
      statusCode: 'SYNCED',
      statusLabel: 'Synced',
      occurredAt: new Date().toISOString(),
    };
  }

  async pullCatalogChanges() {
    return { cursor: 'cursor', items: [] };
  }

  async health() {
    return { healthy: !this.shouldFail, message: this.shouldFail ? 'outage' : 'ok' };
  }
}

describe('sync retry recovery integration', () => {
  afterEach(() => {
    resetErpAdapters();
  });

  it('marks failed first, then sends successfully after adapter recovery', async () => {
    const orderRepo = new InMemoryOrderRepo();
    const syncRecordRepo = new InMemorySyncRecordRepo();
    const adapter = new FlakyAdapter();
    registerErpAdapter(adapter);

    await orderRepo.create({
      orderId: 'ord-1',
      tenantId: 'tenant-1',
      clientUserId: 'client-1',
      createdByUserId: 'client-1',
      createdByRole: 'CLIENT',
      state: 'SYNC_PENDING',
      totalAmount: 30,
      currency: 'USD',
      idempotencyKey: 'idem-00000001',
    });

    await syncRecordRepo.add({
      syncRecordId: 'sync-1',
      orderId: 'ord-1',
      tenantId: 'tenant-1',
      provider: '1c',
      direction: 'OUTBOUND_ORDER',
      payload: {
        tenantExternalId: 'tenant-1',
        internalOrderId: 'ord-1',
        clientExternalId: 'client-1',
        submittedAt: new Date().toISOString(),
        currency: 'USD',
        lines: [],
      },
      status: 'PENDING',
    });

    const pushUseCase = new PushOrderToErpUseCase(orderRepo, syncRecordRepo);
    const worker = new SyncRetryWorker(syncRecordRepo, pushUseCase);

    const firstRunCount = await worker.run();
    expect(firstRunCount).toBe(1);
    const afterFailure = await syncRecordRepo.findPendingForRetry(new Date(Date.now() + 120_000).toISOString());
    expect(afterFailure[0]?.status).toBe('FAILED');

    adapter.setHealthy();
    const secondRunCount = await worker.run(new Date(Date.now() + 120_000).toISOString());
    expect(secondRunCount).toBe(1);

    const order = await orderRepo.findById('ord-1', 'tenant-1');
    expect(order?.state).toBe('SYNCED');
    expect(order?.externalOrderId).toBe('ext-ord-1');
  });
});
