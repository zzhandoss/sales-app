import { AppError } from '@shared/errors';
import { OrderStatusEventRepo } from '../../modules/orders/repos/order-status-event.repo';
import { OrderRepo } from '../../modules/orders/repos/order.repo';

export class ConfirmFulfillmentUseCase {
  constructor(
    private readonly orderRepo: OrderRepo,
    private readonly orderStatusRepo: OrderStatusEventRepo,
  ) {}

  async confirm(
    orderId: string,
    tenantId: string,
    userId: string,
    role: string,
  ): Promise<{ orderId: string; state: 'FULFILLED' }> {
    if (role !== 'CLIENT') {
      throw new AppError('ONLY_CLIENT_CAN_CONFIRM', 'Only client can confirm fulfillment', 403);
    }

    const order = await this.orderRepo.findById(orderId, tenantId);
    if (!order) {
      throw new AppError('ORDER_NOT_FOUND', 'Order not found', 404);
    }

    if (order.clientUserId !== userId) {
      throw new AppError('CLIENT_MISMATCH', 'Only order client can confirm fulfillment', 403);
    }

    await this.orderRepo.updateState(orderId, tenantId, 'FULFILLED');
    await this.orderStatusRepo.save({
      orderId,
      tenantId,
      internalState: 'FULFILLED',
      source: 'USER',
      occurredAt: new Date().toISOString(),
    });

    return { orderId, state: 'FULFILLED' };
  }
}
