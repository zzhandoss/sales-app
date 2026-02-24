-- Initial schema for b2b-order-platform foundation
CREATE TYPE user_role AS ENUM ('CLIENT', 'SALES_AGENT', 'IN_STORE_MANAGER', 'ADMIN');
CREATE TYPE order_state AS ENUM ('DRAFT', 'SUBMITTED', 'SYNC_PENDING', 'SYNCED', 'IN_PROGRESS', 'READY_FOR_PICKUP', 'FULFILLED', 'CANCELED', 'NEEDS_REVIEW');
CREATE TYPE sync_direction AS ENUM ('OUTBOUND_ORDER', 'INBOUND_STATUS');
CREATE TYPE sync_status AS ENUM ('PENDING', 'SENT', 'FAILED', 'NEEDS_OPERATOR');

CREATE TABLE tenant_company (
  tenant_id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  status TEXT NOT NULL,
  erp_provider TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE user_account (
  user_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenant_company(tenant_id),
  role user_role NOT NULL,
  telegram_user_id TEXT NOT NULL,
  status TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, telegram_user_id)
);

CREATE TABLE orders (
  order_id TEXT PRIMARY KEY,
  tenant_id TEXT NOT NULL REFERENCES tenant_company(tenant_id),
  client_user_id TEXT NOT NULL,
  created_by_user_id TEXT NOT NULL,
  created_by_role user_role NOT NULL,
  state order_state NOT NULL,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, idempotency_key)
);
