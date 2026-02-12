# Predeploy Hotfix Audit - 2026-02-12

## Scope
- Image mismatch and missing image regressions
- Bill/token + amount required rules
- Endpoint performance checks
- DB deletion audit (orders `1`, `3`)

## Implemented Fixes
1. `src/lib/api.js`
- Fixed storage URL normalization so absolute URLs keep `https://` and are not rewritten to broken paths.
- Added support for `blob:` and `data:` candidates.

2. `src/server/legacy-images.ts`
- Legacy fallback is now safety-scoped: even when enabled, it requires explicit ID scope or max-ID scope.
- Prevents accidental attachment of old local files to current orders with no DB images.

3. `src/app/api/orders/route.ts`
- Enforced bill/token parity on create (`token` and `bill_number` must match when both provided).
- Persist both as same canonical order number.
- Duplicate errors unified as `Bill / Token number already exists.`

4. `src/app/api/orders/[id]/route.ts`
- GET optimized to fetch child relations in parallel after order existence check.
- PUT now keeps `token` and `bill_number` synchronized and requires positive `total_amount` when provided.

5. `src/ui-pages/EditOrder.jsx`
- Bill/token now required in edit form and synced in API payload.
- Total amount validated as required positive number.

6. `scripts/prod-smoke.mjs`
- Updated smoke payload to use same value for token and bill number.

## Verification Results
- `npm run lint` ?
- `npm run typecheck` ?
- `npm run build` ?
- `npm run check` ?

## Production Read-Only Findings
- DB deletion audit output: `reports/db-deletion-audit-2026-02-12.json`
  - Orders `1` and `3` missing ?
  - Global orphan counts all zero ?

- Image audit output: `reports/image-audit-2026-02-12.json`
  - Recent production orders had `db_image_count = 0`.
  - Two IDs had local legacy files under `public/storage/uploads/orders/<id>`, indicating fallback collision risk if legacy fallback is broadly enabled.

## Production Smoke (guarded, with cleanup)
- Output: `reports/prod-smoke-2026-02-12T06-40-27-648Z.json`
- Result: pass ?
- Created temp order, image upload, payment, delivered status, delete, 404 verification, and child-row cleanup all passed.

## Current Production Latency Snapshot
- Output: `reports/latency-sample-2026-02-12-current.json`
- `/api/health`: ~1.2s warm (first hit slower)
- `/api/orders`: ~4.2s
- `/api/orders/:id`: ~3.3s

## Residual Risk
- Major latency appears dominated by DB round-trip time in current production environment; code-level optimizations help but infra/DB path remains primary bottleneck.
