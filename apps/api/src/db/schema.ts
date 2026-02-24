import {
  integer,
  numeric,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core';

export const userRoleEnum = pgEnum('user_role', [
  'CLIENT',
  'SALES_AGENT',
  'IN_STORE_MANAGER',
  'ADMIN',
]);

export const orderStateEnum = pgEnum('order_state', [
  'DRAFT',
  'SUBMITTED',
  'SYNC_PENDING',
  'SYNCED',
  'IN_PROGRESS',
  'READY_FOR_PICKUP',
  'FULFILLED',
  'CANCELED',
  'NEEDS_REVIEW',
]);

export const syncDirectionEnum = pgEnum('sync_direction', [
  'OUTBOUND_ORDER',
  'INBOUND_STATUS',
]);

export const syncStatusEnum = pgEnum('sync_status', [
  'PENDING',
  'SENT',
  'FAILED',
  'NEEDS_OPERATOR',
]);

export const tenantCompanyTable = pgTable('tenant_company', {
  tenantId: text('tenant_id').primaryKey(),
  name: text('name').notNull(),
  status: text('status').notNull(),
  erpProvider: text('erp_provider').notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

export const userAccountTable = pgTable(
  'user_account',
  {
    userId: text('user_id').primaryKey(),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenantCompanyTable.tenantId),
    role: userRoleEnum('role').notNull(),
    telegramUserId: text('telegram_user_id').notNull(),
    status: text('status').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantTelegramUniq: unique('user_account_tenant_telegram_uidx').on(
      table.tenantId,
      table.telegramUserId,
    ),
  }),
);

export const ordersTable = pgTable(
  'orders',
  {
    orderId: text('order_id').primaryKey(),
    tenantId: text('tenant_id')
      .notNull()
      .references(() => tenantCompanyTable.tenantId),
    clientUserId: text('client_user_id').notNull(),
    createdByUserId: text('created_by_user_id').notNull(),
    createdByRole: userRoleEnum('created_by_role').notNull(),
    state: orderStateEnum('state').notNull(),
    totalAmount: numeric('total_amount').notNull(),
    currency: text('currency').notNull(),
    idempotencyKey: text('idempotency_key').notNull(),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
    updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => ({
    tenantIdempotencyUniq: unique('orders_tenant_idempotency_uidx').on(
      table.tenantId,
      table.idempotencyKey,
    ),
  }),
);

export const syncRecordTable = pgTable('sync_record', {
  syncRecordId: text('sync_record_id').primaryKey(),
  orderId: text('order_id')
    .notNull()
    .references(() => ordersTable.orderId),
  tenantId: text('tenant_id')
    .notNull()
    .references(() => tenantCompanyTable.tenantId),
  provider: text('provider').notNull(),
  direction: syncDirectionEnum('direction').notNull(),
  status: syncStatusEnum('status').notNull(),
  attemptCount: integer('attempt_count').notNull().default(0),
  lastErrorCode: text('last_error_code'),
  nextRetryAt: timestamp('next_retry_at', { withTimezone: true }),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
});

