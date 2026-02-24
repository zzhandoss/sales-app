-- Initial schema for b2b-order-platform foundation
CREATE TYPE user_role AS ENUM ('CLIENT', 'SALES_AGENT', 'IN_STORE_MANAGER', 'ADMIN');
CREATE TYPE order_state AS ENUM ('DRAFT', 'SUBMITTED', 'SYNC_PENDING', 'SYNCED', 'IN_PROGRESS', 'READY_FOR_PICKUP', 'FULFILLED', 'CANCELED', 'NEEDS_REVIEW');
CREATE TYPE sync_direction AS ENUM ('OUTBOUND_ORDER', 'INBOUND_STATUS');
CREATE TYPE sync_status AS ENUM ('PENDING', 'SENT', 'FAILED', 'NEEDS_OPERATOR');
CREATE TYPE status_event_source AS ENUM ('PLATFORM', 'ERP', 'USER');

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
  external_order_id TEXT,
  total_amount NUMERIC NOT NULL,
  currency TEXT NOT NULL,
  idempotency_key TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  UNIQUE (tenant_id, idempotency_key)
);

CREATE TABLE sync_record (
  sync_record_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(order_id),
  tenant_id TEXT NOT NULL REFERENCES tenant_company(tenant_id),
  provider TEXT NOT NULL,
  direction sync_direction NOT NULL,
  status sync_status NOT NULL,
  attempt_count INTEGER NOT NULL DEFAULT 0,
  payload JSONB NOT NULL,
  last_error_code TEXT,
  next_retry_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

CREATE TABLE order_status_event (
  event_id TEXT PRIMARY KEY,
  order_id TEXT NOT NULL REFERENCES orders(order_id),
  tenant_id TEXT NOT NULL REFERENCES tenant_company(tenant_id),
  internal_state order_state NOT NULL,
  external_raw_status TEXT,
  source status_event_source NOT NULL,
  occurred_at TIMESTAMPTZ NOT NULL
);
