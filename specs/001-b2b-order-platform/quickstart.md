# Quickstart: B2B Order Management SaaS Platform

## 1. Prerequisites

- Node.js 22 LTS
- pnpm 9+
- Docker (PostgreSQL + Redis for local runtime)
- Telegram Bot token for development workspace
- Test tenant credentials and 1C sandbox endpoint

## 2. Install and Bootstrap

```bash
pnpm install
pnpm nx --version
```

## 3. Configure Environment

Create env files per app:

- `apps/api/.env`
- `apps/telegram-bot/.env`
- `apps/miniapp/.env`

Minimum variables:

- `DATABASE_URL`
- `REDIS_URL`
- `TELEGRAM_BOT_TOKEN`
- `ERP_PROVIDER=1c`
- `ERP_BASE_URL`
- `ERP_API_KEY`

## 4. Start Local Dependencies

```bash
docker compose up -d postgres redis
```

## 5. Run Applications

```bash
pnpm nx run api:serve
pnpm nx run telegram-bot:serve
pnpm nx run miniapp:dev
```

## 6. Validation Gates (Constitution Required)

```bash
pnpm nx run-many -t lint --all
pnpm nx run-many -t test --all
pnpm nx run-many -t build --all
pnpm nx run api:slo:sync-latency
```

## 7. Critical Smoke Scenario

1. Open MiniApp in Telegram under a tenant-bound client account.
2. Add catalog items and submit order.
3. Verify duplicate submit retry does not create second order.
4. Simulate ERP delay and confirm order remains traceable in `SYNC_PENDING`.
5. Push unknown ERP status and verify order shows `Needs review`.
6. Confirm fulfillment from client account.
7. Cancel submitted order and create a replacement order.
8. Submit order trust feedback score and verify storage.
