import { AppError } from '@shared/errors';

export interface OrderLineInput {
  productId: string;
  qty: number;
  unitPrice: number;
}

export interface CreateOrderInput {
  tenantId: string;
  clientUserId: string;
  createdByUserId: string;
  createdByRole: string;
  idempotencyKey: string;
  lines: OrderLineInput[];
}

export class OrderEntity {
  static validateCreateInput(input: CreateOrderInput): void {
    if (!input.idempotencyKey || input.idempotencyKey.length < 8) {
      throw new AppError('INVALID_IDEMPOTENCY_KEY', 'Idempotency key must be at least 8 chars', 400);
    }
    if (!input.lines.length) {
      throw new AppError('ORDER_LINES_REQUIRED', 'At least one order line is required', 400);
    }
    for (const line of input.lines) {
      if (line.qty <= 0) {
        throw new AppError('INVALID_ORDER_QTY', 'Order line qty must be positive', 400);
      }
      if (line.unitPrice < 0) {
        throw new AppError('INVALID_ORDER_PRICE', 'Order line price cannot be negative', 400);
      }
    }
  }
}
