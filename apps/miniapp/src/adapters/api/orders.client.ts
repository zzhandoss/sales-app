export interface CreateOrderRequestBody {
  clientUserId: string;
  createdByUserId?: string;
  lines: Array<{
    productId: string;
    qty: number;
    unitPrice: number;
  }>;
}

export interface CreateOrderResponse {
  orderId: string;
  state: string;
  totalAmount: number;
  currency: string;
}

export const createOrder = async (
  request: CreateOrderRequestBody,
  idempotencyKey: string,
): Promise<CreateOrderResponse> => {
  const response = await fetch('/api/v1/orders', {
    method: 'POST',
    headers: {
      'content-type': 'application/json',
      'Idempotency-Key': idempotencyKey,
    },
    body: JSON.stringify(request),
  });

  if (response.status === 409) {
    throw new Error('Revalidation required before order submission');
  }

  if (!response.ok) {
    throw new Error(`Order creation failed with status ${response.status}`);
  }

  return response.json() as Promise<CreateOrderResponse>;
};
