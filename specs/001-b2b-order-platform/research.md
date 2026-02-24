# Research: B2B Order Management SaaS Platform

## Decision 1: Nx Monorepo With App + Package Boundaries

- Decision: Use Nx monorepo with three apps (`api`, `telegram-bot`, `miniapp`) and shared packages (`contracts`, `integration`, `shared`, `testing`).
- Rationale: This matches the constitution requirement for explicit module responsibility, keeps reusable logic isolated, and gives enforceable dependency boundaries.
- Alternatives considered:
  - Separate repositories per runtime: rejected due to higher coordination cost and harder shared contract evolution.
  - Single app-only repository: rejected due to weak modularity and poor scaling across teams.

## Decision 2: Backend Business Logic By Bounded Contexts (`clean-abc`)

- Decision: Model backend with BCs (`catalog`, `orders`, `tenant`, `identity`, `sync`) where services and repos are BC-local; cross-BC writes happen in usecases; cross-BC reads happen through query ports.
- Rationale: Aligns with `clean-abc` rules and constitution requirement that domain boundaries are strict and cross-domain access is contract-based.
- Alternatives considered:
  - Shared service layer across all domains: rejected due to coupling and weak ownership.
  - Direct repo access across contexts: rejected as explicit violation of BC boundaries.

## Decision 3: Integration Extensibility Pattern (`picker-pattern`)

- Decision: Use `Adapter + Registry` as the primary composition pattern for ERP providers and channel interfaces.
- Rationale: We expect more ERP providers and delivery channels over time; adding adapters should not require rewriting core order logic.
- Alternatives considered:
  - Conditionals by provider type inside domain services: rejected because branch complexity grows and violates open/closed intent.
  - Inheritance-heavy base connectors: rejected to keep composition-first model.

Detected category: C
Chosen pattern: Adapter (+ Factory/Registry)
Composition hook: Register new ERP or channel adapter in provider registry without changing order orchestration logic
Why minimal: Single variation point covers provider growth and keeps domain layer unchanged

## Decision 4: Reliable Delivery Model for External ERP

- Decision: Use idempotent order submission plus durable sync records with retry workflow.
- Rationale: Spec requires no silent data loss and resilience to temporary external failures; durable sync state and idempotency are mandatory for correctness.
- Alternatives considered:
  - Best-effort synchronous push only: rejected due to lost orders during outages.
  - Manual reconciliation only: rejected due to poor operational reliability and traceability.

## Decision 5: Telegram Identity and Access Boundary

- Decision: Authenticate MiniApp and Bot flows using Telegram user identity, then map to a single-tenant internal account and role.
- Rationale: Spec clarification fixed single-tenant accounts; Telegram identity must resolve to tenant-scoped access before any catalog/order action.
- Alternatives considered:
  - Multi-tenant account switching: rejected by clarification decision.
  - Anonymous guest flow: rejected due to traceability and B2B role requirements.

## Decision 6: Contracts-First Delivery

- Decision: Define API, bot, and ERP contracts before implementation tasks.
- Rationale: Constitution requires contracts first and explicit behavior; this also stabilizes integration and testing scope early.
- Alternatives considered:
  - Start with implementation and document later: rejected due to rework risk and contract drift.

## Decision 7: Quality Gates and Test Strategy

- Decision: Enforce unit + integration coverage per module and contract tests for external boundaries, with feature completion gate `lint + test + build`.
- Rationale: Directly follows constitution testing and CI gate policy.
- Alternatives considered:
  - Unit-only strategy: rejected, does not validate integration correctness.
  - Manual QA-only strategy: rejected for low repeatability.

## Decision 8: Observability Baseline

- Decision: Structured logs, correlation IDs, explicit sync failure states, and actionable error codes for operator workflows.
- Rationale: Spec and constitution require explainable failures and meaningful logs; this is needed to operate external sync safely.
- Alternatives considered:
  - Free-form logs and ad-hoc debugging: rejected due to low operability.
