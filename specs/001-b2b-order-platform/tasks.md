# Tasks: B2B Order Management SaaS Platform

**Input**: Design documents from `C:\Users\User\Desktop\saler1c\salesApp\specs\001-b2b-order-platform\`  
**Prerequisites**: `plan.md` (required), `spec.md` (required), `research.md`, `data-model.md`, `contracts/`, `quickstart.md`

**Tests**: Included and mandatory per project constitution and feature requirements (unit + integration + contract + critical e2e).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependency on unfinished task)
- **[Story]**: Present only for user-story phases (`[US1]`, `[US2]`, ...)
- Every task includes an explicit file path.

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Initialize monorepo structure and baseline tooling.

- [X] T001 Initialize Nx workspace configuration in `nx.json`
- [X] T002 Initialize workspace package management in `package.json`
- [X] T003 [P] Configure workspace package discovery in `pnpm-workspace.yaml`
- [X] T004 [P] Configure TypeScript base settings and path aliases in `tsconfig.base.json`
- [X] T005 [P] Add API app project targets in `apps/api/project.json`
- [X] T006 [P] Add Telegram Bot app project targets in `apps/telegram-bot/project.json`
- [X] T007 [P] Add MiniApp project targets in `apps/miniapp/project.json`
- [X] T008 [P] Add shared contracts package target config in `packages/contracts/project.json`
- [X] T009 Add local dependency stack for PostgreSQL and Redis in `docker-compose.yml`
- [X] T010 Add workspace env template variables in `.env.example`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core building blocks required before any user story implementation.

**CRITICAL**: Complete this phase before starting user stories.

- [X] T011 Create structured domain error base classes in `packages/shared/errors/src/app-error.ts`
- [X] T012 [P] Create structured logger factory in `packages/shared/logging/src/logger.ts`
- [X] T013 [P] Create runtime config parser/validator in `packages/shared/config/src/env.ts`
- [X] T014 Define base database schema for tenant/identity/catalog/orders/sync in `apps/api/src/db/schema.ts`
- [X] T015 Create initial SQL migration for baseline schema in `apps/api/drizzle/migrations/0001_init.sql`
- [X] T016 Create tenant scope middleware for Hono routes in `apps/api/src/routes/middleware/tenant-scope.ts`
- [X] T017 [P] Create role authorization middleware in `apps/api/src/routes/middleware/role-guard.ts`
- [X] T018 Create API security middleware for limits and headers in `apps/api/src/routes/middleware/security.ts`
- [X] T019 Create `orders` bounded context module entrypoint in `apps/api/src/modules/orders/index.ts`
- [X] T020 [P] Create `catalog` bounded context module entrypoint in `apps/api/src/modules/catalog/index.ts`
- [X] T021 [P] Create `sync` bounded context module entrypoint in `apps/api/src/modules/sync/index.ts`
- [X] T022 Define ERP adapter contract interface in `packages/integration/erp-1c/src/erp-adapter.ts`
- [X] T023 Implement ERP adapter registry composition hook in `apps/api/src/adapters/erp/registry.ts`
- [X] T024 Bootstrap Hono server and route registration in `apps/api/src/main.ts`
- [X] T025 [P] Add foundational tenant isolation integration test in `apps/api/test/integration/tenant-isolation.test.ts`
- [X] T026 [P] Add ERP adapter registry unit test in `apps/api/test/unit/erp-registry.test.ts`

**Checkpoint**: Foundation ready for story implementation.

---

## Phase 3: User Story 1 - Client Self-Service Ordering (Priority: P1) MVP

**Goal**: Clients browse catalog, create order independently, and receive immediate traceable order state.

**Independent Test**: Client account can browse catalog, submit order with idempotency, and see created order state without staff actions.

### Tests for User Story 1

- [X] T027 [P] [US1] Add contract test for catalog listing endpoint in `apps/api/test/contract/catalog-list.contract.test.ts`
- [X] T028 [P] [US1] Add contract test for order creation with idempotency in `apps/api/test/contract/order-create.contract.test.ts`
- [X] T029 [P] [US1] Add MiniApp critical e2e self-order flow test in `apps/miniapp/test/e2e/client-self-order.spec.ts`

### Implementation for User Story 1

- [X] T030 [P] [US1] Implement catalog read query port in `apps/api/src/modules/catalog/query-ports/catalog-read.port.ts`
- [X] T031 [P] [US1] Implement catalog application service in `apps/api/src/modules/catalog/services/catalog.service.ts`
- [X] T032 [P] [US1] Implement order entity invariants (revalidation/idempotency prerequisites) in `apps/api/src/modules/orders/entities/order.entity.ts`
- [X] T033 [US1] Implement create-order usecase (revalidate price/availability + idempotent submit) in `apps/api/src/usecases/orders/create-order.usecase.ts`
- [X] T034 [US1] Implement catalog and order create routes in `apps/api/src/routes/order.routes.ts`
- [X] T035 [P] [US1] Implement MiniApp catalog and checkout UI in `apps/miniapp/src/features/catalog/catalog-page.tsx`
- [X] T036 [US1] Implement MiniApp API adapter for create-order conflict handling in `apps/miniapp/src/adapters/api/orders.client.ts`
- [X] T037 [US1] Add order creation audit logging service in `apps/api/src/modules/orders/services/order-audit-log.service.ts`

**Checkpoint**: US1 is independently functional and MVP-demo ready.

---

## Phase 4: User Story 2 - Assisted Order Creation by Staff (Priority: P1)

**Goal**: Sales agents and in-store managers create orders for clients with the same business constraints.

**Independent Test**: Staff role creates assisted order for a client; client later sees the order and status unchanged from self-service semantics.

### Tests for User Story 2

- [X] T038 [P] [US2] Add contract test for assisted order creation role constraints in `apps/api/test/contract/order-assisted-create.contract.test.ts`
- [X] T039 [P] [US2] Add Telegram assisted-order integration test in `apps/telegram-bot/test/integration/assisted-order-flow.test.ts`

### Implementation for User Story 2

- [X] T040 [P] [US2] Implement Telegram `/order` command for staff-assisted flow in `apps/telegram-bot/src/commands/order.command.ts`
- [X] T041 [P] [US2] Implement assisted order orchestration (client selection + draft state) in `apps/telegram-bot/src/orchestration/assisted-order.flow.ts`
- [X] T042 [US2] Extend create-order usecase to persist role and target-client context in `apps/api/src/usecases/orders/create-order.usecase.ts`
- [X] T043 [US2] Implement assisted-order access policy middleware in `apps/api/src/routes/middleware/order-access.ts`
- [X] T044 [US2] Extend order route contract parity for assisted mode in `apps/api/src/routes/order.routes.ts`
- [X] T045 [US2] Implement MiniApp assisted-order screen for staff roles in `apps/miniapp/src/features/orders/assisted-order-page.tsx`

**Checkpoint**: US2 can be verified independently from US3/US4.

---

## Phase 5: User Story 3 - Transparent Order Lifecycle and Confirmation (Priority: P2)

**Goal**: Users see understandable status timeline and clients can confirm fulfillment.

**Independent Test**: Simulated ERP status updates appear in timeline; eligible client confirms fulfillment and confirmation is stored.

### Tests for User Story 3

- [X] T046 [P] [US3] Add contract test for order status timeline endpoint in `apps/api/test/contract/order-status.contract.test.ts`
- [X] T047 [P] [US3] Add contract test for fulfillment confirmation endpoint in `apps/api/test/contract/order-confirmation.contract.test.ts`
- [X] T048 [P] [US3] Add integration test for status propagation and confirmation in `apps/api/test/integration/order-lifecycle.test.ts`

### Implementation for User Story 3

- [X] T049 [P] [US3] Implement order status event repository in `apps/api/src/modules/orders/repos/order-status-event.repo.ts`
- [X] T050 [P] [US3] Implement lifecycle query port for timeline projections in `apps/api/src/modules/orders/query-ports/order-lifecycle.port.ts`
- [X] T051 [US3] Implement order lifecycle read + confirm fulfillment usecases in `apps/api/src/usecases/orders/confirm-fulfillment.usecase.ts`
- [X] T052 [US3] Implement order status and confirmation routes in `apps/api/src/routes/order-status.routes.ts`
- [X] T053 [P] [US3] Implement MiniApp status timeline and confirm fulfillment UI in `apps/miniapp/src/features/orders/order-status-page.tsx`
- [X] T054 [P] [US3] Implement Telegram `/status` and `/confirm` handlers in `apps/telegram-bot/src/handlers/order-status.handler.ts`

**Checkpoint**: US3 lifecycle visibility and confirmation are independently testable.

---

## Phase 6: User Story 4 - Resilient Synchronization During External Failures (Priority: P3)

**Goal**: External outages do not lose orders; retries recover synchronization and unknown statuses surface as `Needs review`.

**Independent Test**: During simulated ERP outage, accepted orders remain traceable; after recovery they sync or become explicit operator-action items.

### Tests for User Story 4

- [X] T055 [P] [US4] Add integration test for outage retry recovery in `apps/api/test/integration/sync-retry-recovery.test.ts`
- [X] T056 [P] [US4] Add contract test for unknown status to `Needs review` mapping in `apps/api/test/contract/order-status-needs-review.contract.test.ts`
- [X] T057 [P] [US4] Add unit test for sync idempotency deduplication in `apps/api/test/unit/sync-idempotency.test.ts`

### Implementation for User Story 4

- [X] T058 [P] [US4] Implement sync record repository in `apps/api/src/modules/sync/repos/sync-record.repo.ts`
- [X] T059 [P] [US4] Implement 1C adapter using ERP contract interface in `packages/integration/erp-1c/src/one-c.adapter.ts`
- [X] T060 [US4] Implement outbound order sync usecase with retry scheduling in `apps/api/src/usecases/sync/push-order-to-erp.usecase.ts`
- [X] T061 [US4] Implement inbound ERP status ingestion usecase with unknown status preservation in `apps/api/src/usecases/sync/ingest-external-status.usecase.ts`
- [X] T062 [US4] Implement sync retry worker and queue processor in `apps/api/src/adapters/sync/retry-worker.ts`
- [X] T063 [US4] Implement MiniApp `Needs review` state presentation in `apps/miniapp/src/features/orders/needs-review-banner.tsx`
- [X] T064 [US4] Implement Telegram sync delay/operator escalation handler in `apps/telegram-bot/src/handlers/sync-alert.handler.ts`

**Checkpoint**: US4 resilience behavior is independently verifiable under failure simulation.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Complete cross-story hardening and release readiness.

- [X] T065 [P] Export finalized contract artifacts in `packages/contracts/src/index.ts`
- [X] T066 [P] Implement correlation-id propagation utility in `packages/shared/logging/src/correlation-id.ts`
- [X] T067 Document architecture decisions and extension hooks in `docs/architecture/b2b-order-platform.md`
- [X] T068 Align lint commands for all projects in `package.json`
- [X] T069 Align test target mapping and defaults in `nx.json`
- [X] T070 Configure build target for API app in `apps/api/project.json`
- [X] T071 Validate and update quickstart smoke steps in `specs/001-b2b-order-platform/quickstart.md`
- [X] T072 Configure build target for Telegram Bot app in `apps/telegram-bot/project.json`
- [X] T073 Configure build target for MiniApp in `apps/miniapp/project.json`
- [X] T074 [P] Add contract test for admin access management endpoints in `apps/api/test/contract/admin-access.contract.test.ts`
- [X] T075 [P] Add integration test for subscription visibility controls in `apps/api/test/integration/subscription-visibility.test.ts`
- [X] T076 Implement admin access management service in `apps/api/src/modules/identity/services/admin-access.service.ts`
- [X] T077 Implement admin access and subscription visibility routes in `apps/api/src/routes/admin.routes.ts`
- [X] T078 [P] Implement subscription visibility query port in `apps/api/src/modules/tenant/query-ports/subscription-visibility.port.ts`
- [X] T079 [P] Add contract test for submitted-order cancel endpoint in `apps/api/test/contract/order-cancel.contract.test.ts`
- [X] T080 [P] Add integration test for cancel-and-recreate workflow in `apps/api/test/integration/order-cancel-recreate.test.ts`
- [X] T081 Implement cancel-order usecase enforcing immutable submitted orders in `apps/api/src/usecases/orders/cancel-order.usecase.ts`
- [X] T082 Implement cancel order route in `apps/api/src/routes/order-cancel.routes.ts`
- [X] T083 [P] Implement MiniApp cancel-and-recreate order action in `apps/miniapp/src/features/orders/cancel-recreate-action.tsx`
- [X] T084 [P] Implement Telegram cancel-order handler in `apps/telegram-bot/src/handlers/order-cancel.handler.ts`
- [X] T085 [P] Add performance baseline test for order submit latency in `apps/api/test/performance/order-submit.k6.js`
- [X] T086 Add SLO verification task target for sync latency in `apps/api/project.json`
- [X] T087 [P] Add security abuse-case integration tests in `apps/api/test/integration/security-abuse-cases.test.ts`
- [X] T088 [P] Implement PII redaction utility for structured logs in `packages/shared/logging/src/pii-redaction.ts`
- [X] T089 Document security and privacy controls in `docs/security/b2b-order-platform.md`
- [X] T090 [P] Add self-service adoption telemetry counters in `apps/api/src/modules/orders/services/adoption-metrics.service.ts`
- [X] T091 [P] Add order-status trust feedback capture endpoint in `apps/api/src/routes/order-feedback.routes.ts`
- [X] T092 [P] Add tenant onboarding lead-time metric tracker in `apps/api/src/modules/tenant/services/onboarding-metrics.service.ts`

---

## Dependencies & Execution Order

### Phase Dependencies

- Phase 1 -> required before Phase 2.
- Phase 2 -> blocks all user story phases.
- Phase 3 (US1) -> recommended MVP-first start after Phase 2.
- Phase 4 (US2) -> can start after Phase 2; coordinate shared edits with US1 (`create-order.usecase.ts`, `order.routes.ts`).
- Phase 5 (US3) -> can start after Phase 2; depends on lifecycle data from foundational modules.
- Phase 6 (US4) -> can start after Phase 2; integrates with US1/US3 order states.
- Phase 7 -> run after selected story phases are complete.

### User Story Completion Graph

- US1 (MVP) -> optional early release point.
- US2, US3, US4 -> can proceed after foundational phase, with integration checkpoints against US1 contracts.

### Within Each User Story

- Tests first (contract/integration/e2e) and confirm they fail.
- Entities/ports before services/usecases.
- Usecases before routes/handlers/UI adapters.
- Story checkpoint validation before moving to next priority.

## Parallel Execution Examples

### User Story 1

```bash
# Parallel contract + e2e tests
T027, T028, T029

# Parallel domain building blocks
T030, T031, T032
```

### User Story 2

```bash
# Parallel bot flow + policy setup
T040, T041, T043
```

### User Story 3

```bash
# Parallel timeline storage and read projection
T049, T050

# Parallel channel UI handlers
T053, T054
```

### User Story 4

```bash
# Parallel resilience tests
T055, T056, T057

# Parallel integration adapter and sync repository
T058, T059
```

## Implementation Strategy

### MVP First (US1)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (US1).
3. Validate independent test criteria for US1.
4. Demo/release MVP slice.

### Incremental Delivery

1. Add US2 assisted ordering.
2. Add US3 lifecycle visibility and fulfillment confirmation.
3. Add US4 outage resilience and recovery.
4. Run Phase 7 cross-cutting hardening and full quality gates (`lint`, `test`, `build`).
