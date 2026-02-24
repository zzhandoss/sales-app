import { randomUUID } from 'node:crypto';
import { PushOrderPayload } from '@integration/erp-1c';
import { AppError } from '@shared/errors';
import { CreateOrderInput, OrderEntity } from '../../modules/orders/entities/order.entity';
import { OrderStatusEventRepo } from '../../modules/orders/repos/order-status-event.repo';
import { OrderRepo } from '../../modules/orders/repos/order.repo';
import { OrderAuditLogService } from '../../modules/orders/services/order-audit-log.service';
import { SyncRecordRepo } from '../../modules/sync/repos/sync-record.repo';

export interface CreatedOrder {
  orderId: string;
  tenantId: string;
  state: 'SYNC_PENDING';
  totalAmount: number;
  currency: string;
  clientUserId: string;
  createdByRole: string;
}

export class CreateOrderUseCase {
  constructor(
    private readonly orderRepo: OrderRepo,
    private readonly orderStatusEventRepo: OrderStatusEventRepo,
    private readonly syncRecordRepo: SyncRecordRepo,
    private readonly auditLogService: OrderAuditLogService,
  ) {}

  async execute(input: CreateOrderInput): Promise<CreatedOrder> {
    OrderEntity.validateCreateInput(input);

    const existing = await this.orderRepo.findByTenantAndIdempotency(input.tenantId, input.idempotencyKey);
    if (existing) {
      return {
        orderId: existing.orderId,
        tenantId: existing.tenantId,
        state: 'SYNC_PENDING',
        totalAmount: existing.totalAmount,
        currency: existing.currency,
        clientUserId: existing.clientUserId,
        createdByRole: existing.createdByRole,
      };
    }

    const isAssisted = input.createdByRole === 'SALES_AGENT' || input.createdByRole === 'IN_STORE_MANAGER';
    if (isAssisted && !input.clientUserId) {
      throw new AppError('TARGET_CLIENT_REQUIRED', 'Assisted order must include target client', 400);
    }

    const totalAmount = input.lines.reduce((acc, line) => acc + line.qty * line.unitPrice, 0);
    const orderId = randomUUID();
    const occurredAt = new Date().toISOString();

    const created = await this.orderRepo.create({
      orderId,
      tenantId: input.tenantId,
      clientUserId: input.clientUserId,
      createdByUserId: input.createdByUserId,
      createdByRole: input.createdByRole,
      state: 'SYNC_PENDING',
      totalAmount,
      currency: 'USD',
      idempotencyKey: input.idempotencyKey,
    });

    await this.orderStatusEventRepo.save({
      orderId,
      tenantId: input.tenantId,
      internalState: 'SYNC_PENDING',
      source: 'PLATFORM',
      occurredAt,
    });

    const outboundPayload: PushOrderPayload = {
      tenantExternalId: input.tenantId,
      internalOrderId: orderId,
      clientExternalId: input.clientUserId,
      submittedAt: occurredAt,
      currency: 'USD',
      lines: input.lines.map((line) => ({
        productExternalId: line.productId,
        qty: line.qty,
        unitPrice: line.unitPrice,
      })),
    };

    await this.syncRecordRepo.add({
      syncRecordId: randomUUID(),
      orderId,
      tenantId: input.tenantId,
      provider: '1c',
      direction: 'OUTBOUND_ORDER',
      payload: outboundPayload as unknown as Record<string, unknown>,
      status: 'PENDING',
    });

    this.auditLogService.log({
      orderId,
      tenantId: input.tenantId,
      action: 'ORDER_CREATED',
      actorUserId: input.createdByUserId,
      metadata: {
        createdByRole: input.createdByRole,
        clientUserId: input.clientUserId,
        isAssisted,
      },
    });

    return {
      orderId: created.orderId,
      tenantId: created.tenantId,
      state: 'SYNC_PENDING',
      totalAmount: created.totalAmount,
      currency: created.currency,
      clientUserId: created.clientUserId,
      createdByRole: created.createdByRole,
    };
  }
}
