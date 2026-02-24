export interface OrderStatusEventRecord {
  orderId: string;
  tenantId: string;
  internalState: string;
  externalRawStatus?: string;
  source: 'PLATFORM' | 'ERP' | 'USER';
  occurredAt: string;
}

const events: OrderStatusEventRecord[] = [];

export class OrderStatusEventRepo {
  save(event: OrderStatusEventRecord): void {
    events.push(event);
  }

  listByOrder(orderId: string): OrderStatusEventRecord[] {
    return events.filter((event) => event.orderId === orderId);
  }
}
