import { describe, expect, it } from 'vitest';
import { OrderAuditLogService } from '../../src/modules/orders/services/order-audit-log.service';
import { CreateOrderUseCase } from '../../src/usecases/orders/create-order.usecase';
import {
  InMemoryOrderRepo,
  InMemoryOrderStatusEventRepo,
  InMemorySyncRecordRepo,
} from '../helpers/in-memory-repos';

describe('create order idempotency', () => {
  it('returns same order for duplicate tenant + idempotency key', async () => {
    const orderRepo = new InMemoryOrderRepo();
    const statusEventRepo = new InMemoryOrderStatusEventRepo();
    const syncRecordRepo = new InMemorySyncRecordRepo();
    const auditLogService = new OrderAuditLogService();
    const useCase = new CreateOrderUseCase(orderRepo, statusEventRepo, syncRecordRepo, auditLogService);

    const input = {
      tenantId: 'tenant-1',
      clientUserId: 'client-1',
      createdByUserId: 'client-1',
      createdByRole: 'CLIENT' as const,
      idempotencyKey: 'idem-12345678',
      lines: [{ productId: 'p-1', qty: 2, unitPrice: 10 }],
    };

    const first = await useCase.execute(input);
    const second = await useCase.execute(input);

    expect(first.orderId).toBe(second.orderId);
    expect(first.totalAmount).toBe(20);

    const timeline = await statusEventRepo.listByOrder(first.orderId, 'tenant-1');
    expect(timeline).toHaveLength(1);

    const pending = await syncRecordRepo.findPendingForRetry(new Date().toISOString());
    expect(pending).toHaveLength(1);
  });
});
