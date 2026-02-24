import { afterEach, describe, expect, it } from 'vitest';
import { ErpAdapter, PushOrderPayload } from '@integration/erp-1c';
import { registerErpAdapter, resetErpAdapters } from '../../src/adapters/erp/registry';
import { PushOrderToErpUseCase } from '../../src/usecases/sync/push-order-to-erp.usecase';
import { InMemoryOrderRepo, InMemorySyncRecordRepo } from '../helpers/in-memory-repos';

class AlwaysFailAdapter implements ErpAdapter {
  provider = '1c';

  async pushOrder(payload: PushOrderPayload) {
    return {
      externalOrderId: `ext-${payload.internalOrderId}`,
      retriable: true,
    };
  }

  async fetchOrderStatus(externalOrderId: string) {
    return {
      externalOrderId,
      statusCode: 'IN_PROGRESS',
      statusLabel: 'In progress',
      occurredAt: new Date().toISOString(),
    };
  }

  async pullCatalogChanges() {
    return { cursor: 'c', items: [] };
  }

  async health() {
    return { healthy: true, message: 'ok' };
  }
}

describe('PushOrderToErpUseCase dead-letter threshold', () => {
  afterEach(() => {
    resetErpAdapters();
  });

  it('marks sync as needs-operator when retries exceed threshold', async () => {
    const orderRepo = new InMemoryOrderRepo();
    const syncRepo = new InMemorySyncRecordRepo();
    registerErpAdapter(new AlwaysFailAdapter());

    await orderRepo.create({
      orderId: 'ord-1',
      tenantId: 'tenant-demo',
      clientUserId: 'client-1',
      createdByUserId: 'client-1',
      createdByRole: 'CLIENT',
      state: 'SYNC_PENDING',
      totalAmount: 10,
      currency: 'USD',
      idempotencyKey: 'idem-sync-1',
    });

    const sync = await syncRepo.add({
      syncRecordId: 'sync-1',
      orderId: 'ord-1',
      tenantId: 'tenant-demo',
      provider: '1c',
      direction: 'OUTBOUND_ORDER',
      payload: {
        tenantExternalId: 'tenant-demo',
        internalOrderId: 'ord-1',
        clientExternalId: 'client-1',
        submittedAt: new Date().toISOString(),
        currency: 'USD',
        lines: [],
      },
      status: 'FAILED',
      attemptCount: 2,
    });

    const useCase = new PushOrderToErpUseCase(orderRepo, syncRepo, 3);
    await useCase.execute(sync);

    const deadLetters = await syncRepo.findNeedsOperator('tenant-demo');
    expect(deadLetters).toHaveLength(1);
    expect(deadLetters[0]?.syncRecordId).toBe('sync-1');
  });
});
