# Telegram Bot Contract

## Scope

Defines user-facing bot interaction contract for tenant-scoped catalog and order workflows.
Bot is an interaction channel and does not bypass API/domain rules.

## Actor Preconditions

- User must be linked to exactly one tenant account.
- Role must be one of `CLIENT`, `SALES_AGENT`, `IN_STORE_MANAGER`, `ADMIN`.
- Unauthorized or cross-tenant access attempts return explicit denial message.

## Supported Commands

- `/start`
  - Expected result: initializes session and shows role-aware menu.
- `/catalog`
  - Expected result: opens paged catalog view with price and availability.
- `/order`
  - Expected result: starts order creation flow (client self-order or assisted mode by role).
- `/status <orderId>`
  - Expected result: shows order state timeline and current status label.
- `/confirm <orderId>`
  - Expected result: client confirms fulfillment when eligible.

## Callback Payload Contracts

- `catalog:page:{page}`
- `catalog:add:{productId}:{qty}`
- `order:submit:{draftOrderId}`
- `order:confirm-price-change:{draftOrderId}`
- `order:cancel:{orderId}`
- `order:confirm-fulfillment:{orderId}`

Rules:
- Payloads are validated before execution.
- Invalid payload format returns structured error response in chat.

## Message-Level Error Contract

- User errors:
  - `ORDER_NOT_FOUND`
  - `ACCESS_DENIED`
  - `ORDER_STATE_CONFLICT`
  - `REVALIDATION_REQUIRED`
- System errors:
  - `EXTERNAL_SYNC_DELAYED`
  - `STATUS_NEEDS_REVIEW`

Bot messages for system errors must be user-understandable and include clear next step.

## Idempotency and Retries

- Repeated callback submissions for the same submit action must be safe.
- Submit flow must include idempotency key generated per draft checkout session.
- Duplicate delivery from Telegram webhook must not create duplicate orders.
