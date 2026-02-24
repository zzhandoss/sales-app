# ERP Sync Contract (1C Primary)

## Purpose

Define explicit adapter boundary between platform domain and external ERP systems.
ERP remains source of truth for products, prices, availability, and canonical status semantics.

## Adapter Interface

Required adapter capabilities:

1. `pushOrder(orderPayload) -> PushResult`
2. `fetchOrderStatus(externalOrderId) -> ExternalStatusSnapshot`
3. `pullCatalogChanges(sinceCursor) -> CatalogDeltaBatch`
4. `health() -> ProviderHealth`

## Outbound Order Payload Contract

Required fields:

- `tenantExternalId`
- `internalOrderId`
- `clientExternalId`
- `submittedAt`
- `currency`
- `lines[]`:
  - `productExternalId`
  - `qty`
  - `unitPrice`

Rules:

- Payload includes immutable submitted values after revalidation.
- Adapter returns stable `externalOrderId` on success.
- Timeout/temporary failure must be reported as retriable, not dropped.

## Inbound Status Contract

Required fields:

- `externalOrderId`
- `statusCode`
- `statusLabel`
- `occurredAt`

Rules:

- Unknown `statusCode` is preserved and mapped to internal `NEEDS_REVIEW`.
- Status ingestion is idempotent by `(externalOrderId, statusCode, occurredAt)`.

## Error Contract

Provider error must include:

- `code` (machine-readable)
- `message` (operator-readable)
- `retriable` (boolean)

If `retriable=true`, sync workflow schedules retry.
If `retriable=false`, sync record moves to `NEEDS_OPERATOR`.

## Versioning

- Contract version: `v1`.
- Any breaking change requires new versioned adapter contract and migration note.
