import { AppError } from '@shared/errors';
import { OrderStatusEventRepo } from '../../modules/orders/repos/order-status-event.repo';

const confirmations = new Map<string, { confirmedAt: string; confirmedByUserId: string }>();

export class ConfirmFulfillmentUseCase {
  constructor(private readonly orderStatusRepo: OrderStatusEventRepo) {}

  confirm(orderId: string, userId: string, role: string): { orderId: string; state: string } {
    if (role !== 'CLIENT') {
      throw new AppError('ONLY_CLIENT_CAN_CONFIRM', 'Only client can confirm fulfillment', 403);
    }
    confirmations.set(orderId, { confirmedAt: new Date().toISOString(), confirmedByUserId: userId });
    this.orderStatusRepo.save({
      orderId,
      tenantId: 'unknown',
      internalState: 'FULFILLED',
      source: 'USER',
      occurredAt: new Date().toISOString(),
    });
    return { orderId, state: 'FULFILLED' };
  }
}
