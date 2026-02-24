import { afterEach, describe, expect, it, vi } from 'vitest';
import { createApiClient } from '../../src/adapters/api/orders.client';

const installFetchMock = (handler: (input: RequestInfo | URL, init?: RequestInit) => Response | Promise<Response>) => {
  const mock = vi.fn(handler);
  vi.stubGlobal('fetch', mock);
  return mock;
};

describe('miniapp role workspace flows', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it('executes client flow through login, create order and confirm', async () => {
    const fetchMock = installFetchMock((input, init) => {
      const url = String(input);
      if (url.endsWith('/api/v1/auth/login')) {
        return Response.json({
          accessToken: 'token-client',
          expiresAt: new Date().toISOString(),
          user: {
            userId: 'client-1',
            tenantId: 'tenant-demo',
            role: 'CLIENT',
            status: 'ACTIVE',
            displayName: 'Client One',
          },
        });
      }
      if (url.endsWith('/api/v1/orders') && init?.method === 'POST') {
        return Response.json({ orderId: 'ord-1', state: 'SYNC_PENDING', totalAmount: 10, currency: 'USD' });
      }
      if (url.endsWith('/api/v1/orders/ord-1/confirm-fulfillment')) {
        return Response.json({ orderId: 'ord-1', state: 'FULFILLED' });
      }
      return Response.json({ ok: true });
    });

    const api = createApiClient();
    const session = await api.login('tenant-demo', 'client-1', 'demo12345');
    const created = await api.createSelfOrder({
      tenantId: session.user.tenantId,
      token: session.accessToken,
      clientUserId: session.user.userId,
      productId: 'sku-100',
      qty: 1,
      unitPrice: 10,
    });
    const confirmed = await api.confirmFulfillment(session.user.tenantId, session.accessToken, created.orderId);

    expect(created.orderId).toBe('ord-1');
    expect(confirmed).toEqual({ orderId: 'ord-1', state: 'FULFILLED' });
    expect(fetchMock).toHaveBeenCalledTimes(3);
  });

  it('executes assisted flow for sales agent', async () => {
    installFetchMock((input, init) => {
      const url = String(input);
      if (url.endsWith('/api/v1/orders/assisted') && init?.method === 'POST') {
        return Response.json({ orderId: 'ord-assisted', state: 'SYNC_PENDING', totalAmount: 42, currency: 'USD' });
      }
      return Response.json({ ok: true });
    });

    const api = createApiClient();
    const created = await api.createAssistedOrder({
      tenantId: 'tenant-demo',
      token: 'token-agent',
      clientUserId: 'client-1',
      productId: 'sku-200',
      qty: 1,
      unitPrice: 42,
    });

    expect(created.orderId).toBe('ord-assisted');
  });

  it('executes admin dead-letter flow list + retry', async () => {
    const fetchMock = installFetchMock((input, init) => {
      const url = String(input);
      if (url.endsWith('/api/v1/admin/sync/dead-letter') && !init?.method) {
        return Response.json({ records: [{ syncRecordId: 'sync-1' }] });
      }
      if (url.endsWith('/api/v1/admin/sync/dead-letter/sync-1/retry') && init?.method === 'POST') {
        return Response.json({ accepted: true, syncRecordId: 'sync-1' });
      }
      return Response.json({ ok: true });
    });

    const api = createApiClient();
    const listed = await api.listDeadLetters('tenant-demo', 'token-admin');
    const retried = await api.retryDeadLetter('tenant-demo', 'token-admin', 'sync-1');

    expect(listed).toEqual({ records: [{ syncRecordId: 'sync-1' }] });
    expect(retried).toEqual({ accepted: true, syncRecordId: 'sync-1' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });
});
