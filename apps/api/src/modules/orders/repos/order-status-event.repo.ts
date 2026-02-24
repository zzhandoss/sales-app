export type OrderStatusEventSource = 'PLATFORM' | 'ERP' | 'USER';

export type PersistedOrderState =
  | 'DRAFT'
  | 'SUBMITTED'
  | 'SYNC_PENDING'
  | 'SYNCED'
  | 'IN_PROGRESS'
  | 'READY_FOR_PICKUP'
  | 'FULFILLED'
  | 'CANCELED'
  | 'NEEDS_REVIEW';

export interface OrderStatusEventRecord {
  eventId: string;
  orderId: string;
  tenantId: string;
  internalState: PersistedOrderState;
  externalRawStatus?: string;
  source: OrderStatusEventSource;
  occurredAt: string;
}

export interface SaveOrderStatusEventInput {
  orderId: string;
  tenantId: string;
  internalState: PersistedOrderState;
  externalRawStatus?: string;
  source: OrderStatusEventSource;
  occurredAt: string;
}

export interface OrderStatusEventRepo {
  save(event: SaveOrderStatusEventInput): Promise<OrderStatusEventRecord>;
  listByOrder(orderId: string, tenantId: string): Promise<OrderStatusEventRecord[]>;
}
