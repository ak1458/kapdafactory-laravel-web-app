# KapdaFactory Setup & Deployment

## Prerequisites

- Node.js 20+
- PostgreSQL 16+

## Setup

1. Copy `.env` file and set your database URL and secrets:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/kapdafactory"
   AUTH_SECRET="your-secret-key"
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Setup Database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. (Optional) Seed Initial Data:

   ```bash
   npm run prisma:seed
   ```

## Running

- **Development (optimized for normal laptops/desktops)**: `npm run dev`
  - Uses webpack mode (lighter than Turbopack on high-core systems)
  - Auto-cleans stale `.next/dev/lock`
  - Uses capped Node heap by default (`--max-old-space-size=1536`)
  - Optional overrides:
    - `PORT=3001 npm run dev`
    - `HOST=0.0.0.0 npm run dev`
    - `KF_DEV_MAX_OLD_SPACE_MB=2048 npm run dev`
- **Development (Turbopack, heavier)**: `npm run dev:turbo`
- **Production**:

  ```bash
  npm run build
  npm start
  ```

## Quality Gates

- Full gate: `npm run check`
- Individual commands:
  - `npm run lint`
  - `npm run typecheck`
  - `npm run build`
  - `npx prisma validate`
  - `npx prisma generate`

## Production Audit Scripts

### DB deletion + orphan audit

```bash
npm run audit:db:deletions
```

- Optional env:
  - `KF_DB_URL` (override DB URL)
  - `KF_AUDIT_ORDER_IDS` (comma-separated IDs, default `1,3`)

### Full production smoke CRUD (guarded)

```bash
KF_E2E_BASE_URL="https://admin.kapdafactory.in" \
KF_E2E_EMAIL="admin@admin.com" \
KF_E2E_PASSWORD="admin" \
KF_E2E_ALLOW_PROD_MUTATION="true" \
npm run test:prod:smoke
```

- Required env:
  - `KF_E2E_BASE_URL`
  - `KF_E2E_EMAIL`
  - `KF_E2E_PASSWORD`
  - `KF_E2E_ALLOW_PROD_MUTATION=true`

## Legacy image fallback safety

Legacy filesystem fallback images are now **disabled by default** to prevent old photos
from being attached to new/current orders that have no DB image rows.

Enable only if needed for specific legacy records:

- `KF_ENABLE_LEGACY_IMAGE_FALLBACK=true`
- Required scope by IDs: `KF_LEGACY_IMAGE_FALLBACK_ORDER_IDS=1,2,3`
  or by max ID: `KF_LEGACY_IMAGE_FALLBACK_MAX_ORDER_ID=500`
- If enabled without one of the scope vars above, fallback stays off for safety.

## Auth performance toggle

By default API auth trusts signed JWT payload to avoid one DB lookup per request:

- `KF_AUTH_TRUST_TOKEN` (default: enabled)
- Set `KF_AUTH_TRUST_TOKEN=false` if you need strict per-request DB user existence checks.

## Admin setup endpoint safety

`/api/setup-admin` is disabled unless you explicitly enable it:

- Set `KF_SETUP_ADMIN_KEY` to enable endpoint access.
- Provide key via query (`?key=...`) or header (`x-setup-admin-key`).
- Production is blocked by default.
  - Override only if required: `KF_ALLOW_SETUP_ADMIN_IN_PROD=true`.
