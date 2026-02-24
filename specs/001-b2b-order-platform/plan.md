# Implementation Plan: B2B Order Management SaaS Platform

**Branch**: `001-b2b-order-platform` | **Date**: 2026-02-24 | **Spec**: `C:\Users\User\Desktop\saler1c\salesApp\specs\001-b2b-order-platform\spec.md`  
**Input**: Feature specification from `C:\Users\User\Desktop\saler1c\salesApp\specs\001-b2b-order-platform\spec.md` and user stack constraints (`Nx`, `Hono`, `TanStack Start`, `telegraf`, Telegram Bot + MiniApp).

## Summary

Build a multi-tenant B2B ordering platform in an Nx monorepo with three runtime surfaces:
`Hono` backend API, `telegraf` Telegram Bot, and `TanStack Start` Telegram MiniApp.
Design prioritizes explicit contracts, traceable synchronization with external ERP (primarily 1C),
and composition-friendly extension points for future providers and channels.

## Technical Context

**Language/Version**: TypeScript 5.6, Node.js 22 LTS  
**Primary Dependencies**: Nx, Hono, TanStack Start, telegraf, Zod, Drizzle ORM, drizzle-kit, PostgreSQL driver, Redis client, Pino  
**Storage**: PostgreSQL (operational data), Redis (idempotency + retry queue state), external ERP/1C as source of truth  
**Testing**: Vitest (unit + integration), Playwright (MiniApp critical flow), contract tests for API and ERP adapter boundaries  
**Target Platform**: Linux containers for API/Bot, Telegram mobile and desktop clients for MiniApp  
**Project Type**: Nx monorepo with backend service, bot service, web miniapp, and shared domain/contracts packages  
**Performance Goals**: Order submit p95 < 2s during normal ERP availability; 99.5% accepted orders synchronized to source system within 5 minutes  
**Constraints**: Multi-tenant isolation, immutable submitted orders, idempotent create flow, no silent data loss, structured logs only (no production console logging), no cyclic dependencies  
**Scale/Scope**: Thousands of users, several thousand orders/day, onboarding new tenant and first order in < 1 business day

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

Constitution source used for gates: `C:\Users\User\Desktop\saler1c\salesApp\.specify\memory\constitution.md`.

- Gate 1 - Nx monorepo boundaries and no cycles: **PASS**
- Gate 2 - Composition over inheritance and contracts first: **PASS**
- Gate 3 - Tests mandatory (unit + integration), no test weakening: **PASS**
- Gate 4 - Build + test + lint as completion gate: **PASS**
- Gate 5 - Multi-tenant architecture and strict domain boundaries: **PASS**
- Gate 6 - Structured errors/logs and observability readiness: **PASS**
- Gate 7 - Skills applied (`clean-abc`, `picker-pattern`, `mr-propper`): **PASS**

Post-Phase-1 re-check result: **PASS** (artifacts align with the same gates).

## Project Structure

### Documentation (this feature)

```text
specs/001-b2b-order-platform/
|-- plan.md
|-- research.md
|-- data-model.md
|-- quickstart.md
|-- contracts/
|   |-- http-api.openapi.yaml
|   |-- telegram-bot-contract.md
|   `-- erp-sync-contract.md
`-- tasks.md
```

### Source Code (repository root)

```text
apps/
|-- api/
|   |-- src/
|   |   |-- modules/
|   |   |   |-- catalog/
|   |   |   |   |-- entities/
|   |   |   |   |-- repos/
|   |   |   |   |-- services/
|   |   |   |   `-- query-ports/
|   |   |   |-- orders/
|   |   |   |   |-- entities/
|   |   |   |   |-- repos/
|   |   |   |   |-- services/
|   |   |   |   |-- flows/
|   |   |   |   `-- query-ports/
|   |   |   |-- identity/
|   |   |   |-- tenant/
|   |   |   `-- sync/
|   |   |-- usecases/
|   |   |-- adapters/
|   |   `-- routes/
|   `-- test/
|-- telegram-bot/
|   |-- src/
|   |   |-- commands/
|   |   |-- handlers/
|   |   |-- adapters/
|   |   `-- orchestration/
|   `-- test/
`-- miniapp/
    |-- src/
    |   |-- routes/
    |   |-- features/
    |   |-- shared/
    |   `-- adapters/
    `-- test/

packages/
|-- contracts/
|-- shared/
|   |-- errors/
|   |-- logging/
|   `-- config/
|-- testing/
`-- integration/
    |-- erp-1c/
    `-- telegram/
```

**Structure Decision**: Option aligned with Nx monorepo + explicit bounded contexts.
Backend business logic follows `clean-abc`: services and repos remain BC-local; cross-BC writes via
usecases; cross-BC reads via query ports. Provider and channel variability uses composition
patterns (`Adapter + Registry`) to allow adding new ERP connectors and interaction channels without
rewriting existing logic.

## Complexity Tracking

No constitution violations identified at planning stage.
