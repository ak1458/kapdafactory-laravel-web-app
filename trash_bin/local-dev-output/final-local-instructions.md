# Local Development & Deployment Guide

## 1. Prerequisites (Sanity Checks)
Run these first. If any fail, see the Installation section.
```bash
php -v
composer -V
node -v
npm -v
```

## 2. Quick Start (Linux / macOS / WSL)
**Backend**:
```bash
# 1. Create DB
mysql -u root -p -e "CREATE DATABASE kapda_local CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;"

# 2. Setup Backend
cd local-dev/kapda-backend
cp .env.example .env           # Edit DB credentials if needed
composer install --no-dev --optimize-autoloader
php artisan key:generate --ansi
php artisan migrate --seed --force
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000 &
```

**Frontend**:
```bash
cd local-dev/frontend
# Ensure vite.config.ts proxies /api to http://127.0.0.1:8000
npm ci
npm run dev
```

## 3. Windows (Native)
- **Recommended**: Use WSL (Ubuntu) and follow the Linux steps above.
- **Native**: Use Laragon/XAMPP. Open PowerShell, navigate to folders, and run the same `composer` and `php artisan` commands.

## 4. "No Composer" Workaround
If you cannot install Composer on your machine:
1.  Find a machine that *does* have Composer (CI runner, friend's laptop).
2.  Run:
    ```bash
    cd kapda-backend
    composer install --no-dev --optimize-autoloader
    php artisan key:generate
    zip -r backend-deploy-with-vendor.zip . -x ".git/*" "node_modules/*"
    ```
3.  Upload `backend-deploy-with-vendor.zip` to Hostinger.

## 5. Smoke Tests (Curl)
**Login**:
```bash
curl -s -X POST http://127.0.0.1:8000/api/login \
 -H "Content-Type: application/json" \
 -d '{"email":"admin@kapda.com","password":"StrongPass123"}'
```

**Create Order**:
```bash
TOKEN="paste_token_here"
curl -s -X POST http://127.0.0.1:8000/api/orders \
 -H "Authorization: Bearer $TOKEN" \
 -H "Content-Type: application/json" \
 -d '{"token":"TK-LOCAL-001","measurements":{"chest":"40"},"delivery_date":"2025-12-05"}'
```

## 6. Common Fixes
*   **composer not found**: Install it or use the "No Composer" workaround.
*   **DB migration error**: Check `.env` credentials. Ensure DB exists.
*   **storage:link fails**: On Windows, you might need to run as Admin or copy `storage/app/public` to `public/storage`.
*   **500 Error**: Check `storage/logs/laravel.log`.
*   **Permission denied**: `chmod -R 775 storage bootstrap/cache`.
