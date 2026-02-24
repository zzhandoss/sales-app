import { AppError } from '@shared/errors';
import { OrderStatusEventRepo } from '../../modules/orders/repos/order-status-event.repo';
import { OrderRepo, UserRole } from '../../modules/orders/repos/order.repo';

export class CancelOrderUseCase {
  constructor(
    private readonly orderRepo: OrderRepo,
    private readonly orderStatusEventRepo: OrderStatusEventRepo,
  ) {}

  async execute(
    orderId: string,
    tenantId: string,
    requestedByRole: UserRole,
  ): Promise<{ orderId: string; state: 'CANCELED' }> {
    const order = await this.orderRepo.findById(orderId, tenantId);
    if (!order) {
      throw new AppError('ORDER_NOT_FOUND', 'Order not found', 404);
    }

    if (order.state === 'DRAFT') {
      throw new AppError('ORDER_NOT_SUBMITTED', 'Only submitted orders can be canceled', 409);
    }

    if (order.state === 'FULFILLED' || order.state === 'CANCELED') {
      throw new AppError('ORDER_CANCEL_NOT_ALLOWED', 'Order in terminal state cannot be canceled', 409);
    }

    await this.orderRepo.updateState(orderId, tenantId, 'CANCELED');
    await this.orderStatusEventRepo.save({
      orderId,
      tenantId,
      internalState: 'CANCELED',
      source: requestedByRole === 'CLIENT' ? 'USER' : 'PLATFORM',
      occurredAt: new Date().toISOString(),
    });

    return { orderId, state: 'CANCELED' };
  }
}
