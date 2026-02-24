import { PersistedOrderState } from './order-status-event.repo';

export type UserRole = 'CLIENT' | 'SALES_AGENT' | 'IN_STORE_MANAGER' | 'ADMIN';

export interface OrderRecord {
  orderId: string;
  tenantId: string;
  clientUserId: string;
  createdByUserId: string;
  createdByRole: UserRole;
  state: PersistedOrderState;
  externalOrderId?: string;
  totalAmount: number;
  currency: string;
  idempotencyKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateOrderRecordInput {
  orderId: string;
  tenantId: string;
  clientUserId: string;
  createdByUserId: string;
  createdByRole: UserRole;
  state: PersistedOrderState;
  totalAmount: number;
  currency: string;
  idempotencyKey: string;
}

export interface OrderRepo {
  findByTenantAndIdempotency(tenantId: string, idempotencyKey: string): Promise<OrderRecord | undefined>;
  findById(orderId: string, tenantId: string): Promise<OrderRecord | undefined>;
  listForActor(tenantId: string, actorUserId: string, role: UserRole): Promise<OrderRecord[]>;
  create(input: CreateOrderRecordInput): Promise<OrderRecord>;
  updateState(orderId: string, tenantId: string, state: PersistedOrderState): Promise<OrderRecord>;
  attachExternalOrderId(orderId: string, tenantId: string, externalOrderId: string): Promise<void>;
}
