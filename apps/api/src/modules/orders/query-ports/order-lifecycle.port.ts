import { OrderStatusEventRecord } from '../repos/order-status-event.repo';

export interface OrderLifecyclePort {
  listTimeline(orderId: string, tenantId: string): Promise<OrderStatusEventRecord[]>;
}
