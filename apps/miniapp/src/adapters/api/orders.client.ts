export type Role = 'CLIENT' | 'SALES_AGENT' | 'IN_STORE_MANAGER' | 'ADMIN';

export interface SessionUser {
  userId: string;
  tenantId: string;
  role: Role;
  status: string;
  displayName: string;
}

export interface LoginResponse {
  accessToken: string;
  expiresAt: string;
  user: SessionUser;
}

export interface CatalogResponse {
  items: Array<{
    productId: string;
    name: string;
    price: number;
    currency: string;
    availableQty: number;
  }>;
}

export interface CreateOrderResponse {
  orderId: string;
  state: string;
  totalAmount: number;
  currency: string;
}

const toError = async (response: Response): Promise<Error> => {
  const body = await response.json().catch(() => ({ message: `HTTP ${response.status}` }));
  return new Error(body.message ?? `HTTP ${response.status}`);
};

export class ApiClient {
  constructor(private readonly baseHeaders: Record<string, string>) {}

  async login(tenantId: string, userId: string, password: string): Promise<LoginResponse> {
    const response = await fetch('/api/v1/auth/login', {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify({ tenantId, userId, password }),
    });
    if (!response.ok) {
      throw await toError(response);
    }
    return (await response.json()) as LoginResponse;
  }

  async listDemoUsers(tenantId: string): Promise<{ users: SessionUser[] }> {
    const response = await fetch(`/api/v1/auth/demo-users?tenantId=${encodeURIComponent(tenantId)}`);
    if (!response.ok) {
      throw await toError(response);
    }
    return (await response.json()) as { users: SessionUser[] };
  }

  async listCatalog(tenantId: string, token: string): Promise<CatalogResponse> {
    const response = await fetch('/api/v1/catalog/items', {
      headers: this.authHeaders(tenantId, token),
    });
    if (!response.ok) {
      throw await toError(response);
    }
    return (await response.json()) as CatalogResponse;
  }

  async listOrders(tenantId: string, token: string): Promise<unknown> {
    const response = await fetch('/api/v1/orders', {
      headers: this.authHeaders(tenantId, token),
    });
    if (!response.ok) {
      throw await toError(response);
    }
    return response.json() as Promise<unknown>;
  }

  async createSelfOrder(input: {
    tenantId: string;
    token: string;
    clientUserId: string;
    productId: string;
    qty: number;
    unitPrice: number;
  }): Promise<CreateOrderResponse> {
    const response = await fetch('/api/v1/orders', {
      method: 'POST',
      headers: {
        ...this.authHeaders(input.tenantId, input.token),
        'content-type': 'application/json',
        'Idempotency-Key': `miniapp-self-${Date.now()}`,
      },
      body: JSON.stringify({
        clientUserId: input.clientUserId,
        lines: [{ productId: input.productId, qty: input.qty, unitPrice: input.unitPrice }],
      }),
    });
    if (!response.ok) {
      throw await toError(response);
    }
    return (await response.json()) as CreateOrderResponse;
  }

  async createAssistedOrder(input: {
    tenantId: string;
    token: string;
    clientUserId: string;
    productId: string;
    qty: number;
    unitPrice: number;
  }): Promise<CreateOrderResponse> {
    const response = await fetch('/api/v1/orders/assisted', {
      method: 'POST',
      headers: {
        ...this.authHeaders(input.tenantId, input.token),
        'content-type': 'application/json',
        'Idempotency-Key': `miniapp-assisted-${Date.now()}`,
        'x-target-client-id': input.clientUserId,
      },
      body: JSON.stringify({
        clientUserId: input.clientUserId,
        lines: [{ productId: input.productId, qty: input.qty, unitPrice: input.unitPrice }],
      }),
    });
    if (!response.ok) {
      throw await toError(response);
    }
    return (await response.json()) as CreateOrderResponse;
  }

  async getOrderStatus(tenantId: string, token: string, orderId: string): Promise<unknown> {
    const response = await fetch(`/api/v1/orders/${orderId}`, {
      headers: this.authHeaders(tenantId, token),
    });
    if (!response.ok) {
      throw await toError(response);
    }
    return response.json() as Promise<unknown>;
  }

  async confirmFulfillment(tenantId: string, token: string, orderId: string): Promise<unknown> {
    const response = await fetch(`/api/v1/orders/${orderId}/confirm-fulfillment`, {
      method: 'POST',
      headers: this.authHeaders(tenantId, token),
    });
    if (!response.ok) {
      throw await toError(response);
    }
    return response.json() as Promise<unknown>;
  }

  async cancelOrder(tenantId: string, token: string, orderId: string): Promise<unknown> {
    const response = await fetch(`/api/v1/orders/${orderId}/cancel`, {
      method: 'POST',
      headers: this.authHeaders(tenantId, token),
    });
    if (!response.ok) {
      throw await toError(response);
    }
    return response.json() as Promise<unknown>;
  }

  async listAdminUsers(tenantId: string, token: string): Promise<unknown> {
    const response = await fetch('/api/v1/admin/users/access', {
      headers: this.authHeaders(tenantId, token),
    });
    if (!response.ok) {
      throw await toError(response);
    }
    return response.json() as Promise<unknown>;
  }

  async listDeadLetters(tenantId: string, token: string): Promise<unknown> {
    const response = await fetch('/api/v1/admin/sync/dead-letter', {
      headers: this.authHeaders(tenantId, token),
    });
    if (!response.ok) {
      throw await toError(response);
    }
    return response.json() as Promise<unknown>;
  }

  async retryDeadLetter(tenantId: string, token: string, syncRecordId: string): Promise<unknown> {
    const response = await fetch(`/api/v1/admin/sync/dead-letter/${syncRecordId}/retry`, {
      method: 'POST',
      headers: this.authHeaders(tenantId, token),
    });
    if (!response.ok) {
      throw await toError(response);
    }
    return response.json() as Promise<unknown>;
  }

  async updateAdminAccess(input: {
    tenantId: string;
    token: string;
    userId: string;
    role: Role;
    status: 'ACTIVE' | 'DISABLED';
  }): Promise<unknown> {
    const response = await fetch(`/api/v1/admin/users/access/${input.userId}`, {
      method: 'PATCH',
      headers: {
        ...this.authHeaders(input.tenantId, input.token),
        'content-type': 'application/json',
      },
      body: JSON.stringify({ role: input.role, status: input.status }),
    });
    if (!response.ok) {
      throw await toError(response);
    }
    return response.json() as Promise<unknown>;
  }

  private authHeaders(tenantId: string, token: string): Record<string, string> {
    return {
      ...this.baseHeaders,
      authorization: `Bearer ${token}`,
      'x-tenant-id': tenantId,
    };
  }
}

export const createApiClient = (): ApiClient => new ApiClient({});
