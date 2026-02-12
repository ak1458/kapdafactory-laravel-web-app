# KapdaFactory Predeploy Audit - 2026-02-12

## Result
- Release gate status: **PASS**
- High severity regressions found: **None (P0/P1)**
- Residual risks: **P2 performance latency** documented below

## Implemented Changes
1. Added ESLint v9 flat config and quality gate scripts.
2. Restored deterministic image fallback behavior in `OrderImage`.
3. Fixed login password placeholder encoding defect.
4. Reintroduced date-like search matching in `/api/orders` search.
5. Added `/api/orders` opt-in perf diagnostics (`KF_API_PERF_LOG=1`) and reduced sequential DB work.
6. Added compatibility route `/orders/create` -> `/orders/new`.
7. Added DB deletion audit script and production full CRUD smoke script.
8. Added Prisma SQL correction plan document (`sql/prisma-model-corrections.sql`).

## CLI Validation
| Command | Result |
| --- | --- |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |
| `npx prisma validate` | PASS |
| `npx prisma generate` | PASS |
| `npm run check` | PASS (full chained gate) |

## Production Browser + API Smoke (Mutating With Cleanup)
- Run artifact: `reports/prod-smoke-2026-02-12T05-56-31-240Z.json`
- Screenshots:
  - `reports/artifacts/prod-login-2026-02-12T05-56-31-240Z.png`
  - `reports/artifacts/prod-dashboard-2026-02-12T05-56-31-240Z.png`
  - `reports/artifacts/prod-new-order-2026-02-12T05-56-31-240Z.png`
- Scope executed:
  1. Browser login
  2. Navigate to dashboard and new-order pages
  3. API create order with image
  4. API update order
  5. API add payment
  6. API mark delivered
  7. API delete order
  8. Verify deleted order returns `404`
  9. Verify no child rows remain in DB
- Outcome: **PASS**
- Key timings from run:
  - Create order: `8003 ms`
  - Get created order: `3613 ms`
  - Update order: `3865 ms`
  - Add payment: `5892 ms`
  - Mark delivered: `9921 ms`
  - Delete order: `4295 ms`

## Legacy Thumbnail Fallback Validation
- Run artifact: `reports/legacy-fallback-check-2026-02-12.json`
- Outcome: **PASS**
- Verified:
  - `getLegacyImagesForOrder(orderId, 1)` returns at least one image when legacy files exist.
  - Returned payload includes normalized `filename` and storage `url`.

## DB Deletion Audit (Orders #1 and #3)
- Run artifact: `reports/db-deletion-audit-2026-02-12.json`
- Verified:
  - Order IDs `1` and `3` are absent.
  - No child rows for audited IDs in `order_images`, `payments`, `order_logs`.
  - Global orphan counts are all `0`.

## Latency Sample (Production)
- Run artifact: `reports/latency-sample-2026-02-12.json`
- Snapshot:
  - `/api/health` end-to-end: ~`1238-1857 ms`
  - `db_latency_ms` reported by health: ~`964-1157 ms`
  - `/api/orders` list: `4069 ms`
  - `/api/orders/:id` detail: `3358 ms`

## Prisma Model Correction Plan
- SQL review file: `sql/prisma-model-corrections.sql`
- Status: **Prepared only, not applied in production**
- Notes:
  - Adds proposed `customer_name` search index strategy.
  - Documents that additional non-unique indexes for `token` and `bill_number` are redundant because unique indexes already exist.
  - Includes verification/orphan-check SQL.

## tsconfig + src/ Migration Recheck
- `tsconfig.json` path alias remains `@/* -> ./*` and resolves `@/src/*` imports correctly.
- Build output confirms app-router entries are generated from `src/app` and include both:
  - `/orders/new`
  - `/orders/create` (compat redirect route)

## Residual Risks and Follow-ups (P2)
1. Production API latency remains elevated despite route-level sequencing improvements.
2. Health endpoint indicates high DB latency baseline (~1s), suggesting infra/connection-level bottleneck outside route logic.
3. Recommended next production follow-up:
   - Enable `KF_API_PERF_LOG=1` temporarily in production to capture step timings in logs.
   - Review DB region proximity, connection pooling, and query plans for `orders` + payment aggregations.
