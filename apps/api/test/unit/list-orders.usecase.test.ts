import { describe, expect, it } from 'vitest';
import { ListOrdersUseCase } from '../../src/usecases/orders/list-orders.usecase';
import { InMemoryOrderRepo } from '../helpers/in-memory-repos';

describe('ListOrdersUseCase', () => {
  it('returns tenant and role scoped orders', async () => {
    const repo = new InMemoryOrderRepo();
    const useCase = new ListOrdersUseCase(repo);

    await repo.create({
      orderId: 'o1',
      tenantId: 'tenant-demo',
      clientUserId: 'client-1',
      createdByUserId: 'client-1',
      createdByRole: 'CLIENT',
      state: 'SYNC_PENDING',
      totalAmount: 10,
      currency: 'USD',
      idempotencyKey: 'idem-1',
    });
    await repo.create({
      orderId: 'o2',
      tenantId: 'tenant-demo',
      clientUserId: 'client-2',
      createdByUserId: 'agent-1',
      createdByRole: 'SALES_AGENT',
      state: 'SYNC_PENDING',
      totalAmount: 20,
      currency: 'USD',
      idempotencyKey: 'idem-2',
    });
    await repo.create({
      orderId: 'o3',
      tenantId: 'tenant-other',
      clientUserId: 'client-1',
      createdByUserId: 'client-1',
      createdByRole: 'CLIENT',
      state: 'SYNC_PENDING',
      totalAmount: 20,
      currency: 'USD',
      idempotencyKey: 'idem-3',
    });

    const asClient = await useCase.execute({
      tenantId: 'tenant-demo',
      actorUserId: 'client-1',
      role: 'CLIENT',
    });
    expect(asClient.map((item) => item.orderId)).toEqual(['o1']);

    const asAdmin = await useCase.execute({
      tenantId: 'tenant-demo',
      actorUserId: 'admin-1',
      role: 'ADMIN',
    });
    expect(asAdmin.map((item) => item.orderId).sort()).toEqual(['o1', 'o2']);
  });
});
