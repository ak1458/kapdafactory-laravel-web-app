# Final Deployment Checklist

## 1. Environment Variables (.env)
Set these on your Hostinger server in `kapda-backend/.env`:

```ini
APP_NAME=KapdaFactory
APP_ENV=production
APP_KEY=base64:GENERATE_THIS_LOCALLY_OR_ON_SERVER
APP_DEBUG=false
APP_URL=https://your-domain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=kapda_db
DB_USERNAME=kapda_user
DB_PASSWORD=strong_db_password

FILESYSTEM_DISK=public
```

## 2. Backend Setup (Source Upload)
Since `composer` was not run locally, you MUST run it on the server or use a local machine with Composer to generate the `vendor` folder before uploading.

1.  **Upload**: Upload `backend-deploy.zip` and extract to `kapda-backend` (outside `public_html`).
2.  **Vendor**: Run `composer install --no-dev --optimize-autoloader` inside `kapda-backend`.
3.  **Migrations**: `php artisan migrate --seed --force`.
4.  **Storage**: `php artisan storage:link`.
5.  **Permissions**:
    ```bash
    chmod -R 775 storage bootstrap/cache
    ```

## 3. Frontend Setup
1.  **Upload**: Upload `frontend-deploy.zip` contents to `public_html/admin`.
2.  **Verify**: Check that `public_html/admin/index.html` loads.

## 4. Public API Setup
1.  **Copy**: Copy `kapda-backend/public` contents to `public_html/api`.
2.  **Edit index.php**:
    In `public_html/api/index.php`, change paths:
    ```php
    require __DIR__.'/../../kapda-backend/vendor/autoload.php';
    $app = require_once __DIR__.'/../../kapda-backend/bootstrap/app.php';
    ```

## 5. Hostinger PHP Settings
In `.user.ini` or PHP Configuration:
- `upload_max_filesize = 8M`
- `post_max_size = 10M`
- `memory_limit = 256M`

## 6. Verification (Curl)
**Login**:
```bash
curl -X POST https://your-domain.com/api/login \
 -H "Content-Type: application/json" \
 -d '{"email":"admin@kapda.com","password":"StrongPass123"}'
```
