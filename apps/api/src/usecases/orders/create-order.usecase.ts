import { AppError } from '@shared/errors';
import { OrderEntity, CreateOrderInput } from '../../modules/orders/entities/order.entity';
import { OrderAuditLogService } from '../../modules/orders/services/order-audit-log.service';

export interface CreatedOrder {
  orderId: string;
  tenantId: string;
  state: 'SYNC_PENDING';
  totalAmount: number;
  currency: string;
  clientUserId: string;
  createdByRole: string;
}

const orderByTenantAndKey = new Map<string, CreatedOrder>();

export class CreateOrderUseCase {
  constructor(private readonly auditLogService: OrderAuditLogService) {}

  async execute(input: CreateOrderInput): Promise<CreatedOrder> {
    OrderEntity.validateCreateInput(input);

    const key = `${input.tenantId}:${input.idempotencyKey}`;
    const existing = orderByTenantAndKey.get(key);
    if (existing) {
      return existing;
    }

    const isAssisted = input.createdByRole === 'SALES_AGENT' || input.createdByRole === 'IN_STORE_MANAGER';
    if (isAssisted && !input.clientUserId) {
      throw new AppError('TARGET_CLIENT_REQUIRED', 'Assisted order must include target client', 400);
    }

    const allRevalidated = input.lines.every((line) => line.qty > 0 && line.unitPrice >= 0);
    if (!allRevalidated) {
      throw new AppError('REVALIDATION_FAILED', 'Price or availability changed before submit', 409);
    }

    const totalAmount = input.lines.reduce((acc, line) => acc + line.qty * line.unitPrice, 0);
    const created: CreatedOrder = {
      orderId: `ord_${Date.now()}`,
      tenantId: input.tenantId,
      state: 'SYNC_PENDING',
      totalAmount,
      currency: 'USD',
      clientUserId: input.clientUserId,
      createdByRole: input.createdByRole,
    };

    orderByTenantAndKey.set(key, created);
    this.auditLogService.log({
      orderId: created.orderId,
      tenantId: input.tenantId,
      action: 'ORDER_CREATED',
      actorUserId: input.createdByUserId,
      metadata: {
        createdByRole: input.createdByRole,
        clientUserId: input.clientUserId,
        isAssisted,
      },
    });

    return created;
  }
}
