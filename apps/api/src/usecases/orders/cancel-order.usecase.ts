import { AppError } from '@shared/errors';

const canceledOrders = new Set<string>();

export class CancelOrderUseCase {
  execute(orderId: string, state: string): { orderId: string; state: 'CANCELED' } {
    if (state === 'DRAFT') {
      throw new AppError('ORDER_NOT_SUBMITTED', 'Only submitted orders can be canceled', 409);
    }
    canceledOrders.add(orderId);
    return { orderId, state: 'CANCELED' };
  }

  isCanceled(orderId: string): boolean {
    return canceledOrders.has(orderId);
  }
}
