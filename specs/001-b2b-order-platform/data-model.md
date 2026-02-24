# Data Model: B2B Order Management SaaS Platform

## Bounded Context Ownership

- `tenant`: Tenant identity, subscription, tenant-level configuration.
- `identity`: User account, role, Telegram identity binding.
- `catalog`: Product snapshots visible to tenant users.
- `orders`: Order aggregate, order status timeline, fulfillment confirmation.
- `sync`: ERP synchronization records, retry state, status mapping.

## Entities

### TenantCompany

- Fields:
  - `tenantId` (string, immutable, unique)
  - `name` (string)
  - `status` (`ACTIVE | SUSPENDED`)
  - `erpProvider` (string)
  - `createdAt`, `updatedAt` (timestamp)
- Rules:
  - Tenant isolation is strict across all reads and writes.

### UserAccount

- Fields:
  - `userId` (string, unique)
  - `tenantId` (string, foreign key to TenantCompany)
  - `role` (`CLIENT | SALES_AGENT | IN_STORE_MANAGER | ADMIN`)
  - `telegramUserId` (string, unique within tenant)
  - `status` (`ACTIVE | DISABLED`)
  - `createdAt`, `updatedAt` (timestamp)
- Rules:
  - Single-tenant account only (one `tenantId` per user account).
  - Access outside own tenant is forbidden.

### CatalogItemSnapshot

- Fields:
  - `snapshotId` (string, unique)
  - `tenantId` (string)
  - `externalProductId` (string)
  - `name` (string)
  - `price` (decimal)
  - `currency` (string)
  - `availableQty` (decimal)
  - `snapshotAt` (timestamp)
- Rules:
  - Snapshot is read-model data; source of truth remains ERP.

### Order

- Fields:
  - `orderId` (string, unique)
  - `tenantId` (string)
  - `clientUserId` (string)
  - `createdByUserId` (string)
  - `createdByRole` (enum role)
  - `state` (`DRAFT | SUBMITTED | SYNC_PENDING | SYNCED | IN_PROGRESS | READY_FOR_PICKUP | FULFILLED | CANCELED | NEEDS_REVIEW`)
  - `totalAmount` (decimal)
  - `currency` (string)
  - `idempotencyKey` (string)
  - `createdAt`, `updatedAt` (timestamp)
- Rules:
  - `idempotencyKey` is unique per tenant request scope.
  - Submitted orders are immutable; changes are only through cancel + recreate.
  - Price/availability must be revalidated at submit time.

### OrderLine

- Fields:
  - `orderLineId` (string)
  - `orderId` (string, foreign key)
  - `externalProductId` (string)
  - `qty` (decimal)
  - `unitPrice` (decimal)
  - `lineAmount` (decimal)
- Rules:
  - At least one line is required for order submission.
  - `lineAmount = qty * unitPrice` must be consistent.

### OrderStatusEvent

- Fields:
  - `eventId` (string, unique)
  - `orderId` (string)
  - `tenantId` (string)
  - `internalState` (order state enum)
  - `externalRawStatus` (string, nullable)
  - `source` (`PLATFORM | ERP | USER`)
  - `actorUserId` (string, nullable)
  - `occurredAt` (timestamp)
- Rules:
  - Full status timeline is append-only and auditable.
  - Unknown ERP statuses map to `NEEDS_REVIEW` while preserving `externalRawStatus`.

### SyncRecord

- Fields:
  - `syncRecordId` (string, unique)
  - `tenantId` (string)
  - `orderId` (string)
  - `direction` (`OUTBOUND_ORDER | INBOUND_STATUS`)
  - `provider` (string)
  - `attemptCount` (integer)
  - `status` (`PENDING | SENT | FAILED | NEEDS_OPERATOR`)
  - `lastErrorCode` (string, nullable)
  - `lastErrorMessage` (string, nullable)
  - `nextRetryAt` (timestamp, nullable)
  - `createdAt`, `updatedAt` (timestamp)
- Rules:
  - Failed sync attempts remain visible and recoverable.
  - No sync record may be hard-deleted from audit history.

### FulfillmentConfirmation

- Fields:
  - `confirmationId` (string, unique)
  - `orderId` (string, unique)
  - `tenantId` (string)
  - `confirmedByUserId` (string)
  - `confirmedAt` (timestamp)
- Rules:
  - Only client role can confirm fulfillment.
  - One confirmation per order.

## Relationships

- TenantCompany 1..* UserAccount
- TenantCompany 1..* CatalogItemSnapshot
- TenantCompany 1..* Order
- Order 1..* OrderLine
- Order 1..* OrderStatusEvent
- Order 1..* SyncRecord
- Order 0..1 FulfillmentConfirmation

## Order Lifecycle and Transitions

- `DRAFT -> SUBMITTED`: client/agent/manager confirms order after revalidation.
- `SUBMITTED -> SYNC_PENDING`: order accepted while ERP sync is pending.
- `SYNC_PENDING -> SYNCED`: outbound ERP creation succeeds.
- `SYNCED -> IN_PROGRESS | READY_FOR_PICKUP | FULFILLED | CANCELED`: ERP-driven states.
- `* -> NEEDS_REVIEW`: ERP status unmapped or contract inconsistency detected.
- `FALLBACK`: submitted orders cannot be edited; change intent becomes `CANCELED + new Order`.

## Validation and Invariants

- Every read/write must include tenant scope and reject cross-tenant access.
- Order submission requires idempotency key.
- Duplicate idempotency key returns existing order.
- Unknown external status is never dropped.
- Sync failures must surface structured error details for operator action.
