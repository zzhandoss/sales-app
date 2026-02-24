import { createLogger } from '@shared/logging';

export interface OrderAuditEvent {
  orderId: string;
  tenantId: string;
  action: 'ORDER_CREATED' | 'ORDER_REVALIDATED';
  actorUserId: string;
  metadata?: Record<string, unknown>;
}

const logger = createLogger({ scope: 'order-audit' });

export class OrderAuditLogService {
  log(event: OrderAuditEvent): void {
    logger.info(event, 'Order audit event');
  }
}
