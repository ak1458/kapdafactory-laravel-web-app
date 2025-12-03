# KapdaFactory Admin App Deployment Guide

This guide provides a tight, no-nonsense execution checklist for deploying the KapdaFactory Admin App on Hostinger shared hosting.

## Quick Checklist (Do these in order)

1.  [ ] **Prepare `.env`** (DB + APP_KEY).
2.  [ ] **Install composer deps** (on server via SSH or locally then upload vendor).
3.  [ ] **Run migrations + seed admin**.
4.  [ ] **Link Storage**: `php artisan storage:link` (or manual link).
5.  [ ] **Backend Public**: Copy `kapda-backend/public` → `public_html/api` and adjust `index.php`.
6.  [ ] **Frontend Build**: Build React and upload `dist` to `public_html/admin`.
7.  [ ] **Config**: Set permissions, PHP upload limits, enable HTTPS.
8.  [ ] **Verify**: Smoke test API + image upload + CSV export.

---

## 1. .env — Exact Minimal Example

Create `.env` in the backend root (`kapda-backend/.env`) and set:

```ini
APP_NAME=KapdaFactory
APP_ENV=production
APP_KEY=base64:GENERATE_WITH_KEY_CMD
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

*Generate APP_KEY after uploading if you can run artisan: `php artisan key:generate`. If not, generate locally and paste.*

---

## 2. Composer Install — Two Options

### A. If Hostinger gives SSH + Composer
SSH in and run:

```bash
cd /home/youruser/kapda-backend
composer install --no-dev --optimize-autoloader
php artisan key:generate
php artisan migrate --force
php artisan storage:link
```

### B. If no Composer on server (Shared Hosting)

1.  **Locally**:
    -   Ensure you have a full Laravel skeleton. If you only have the `app`, `database`, `routes` folders from this repo, first create a new Laravel project:
        ```bash
        composer create-project laravel/laravel temp-app
        cp -r kapda-backend/app/* temp-app/app/
        cp -r kapda-backend/database/* temp-app/database/
        cp -r kapda-backend/routes/* temp-app/routes/
        # Copy any other custom files
        mv temp-app kapda-backend-full
        ```
    -   Then run:
        ```bash
        cd kapda-backend-full
        composer install --no-dev --optimize-autoloader
        php artisan key:generate --ansi
        ```
2.  **Upload**: Zip the entire `kapda-backend-full` folder (including `vendor`) and upload via SFTP. Extract outside `public_html`.

---

## 3. Database Migration & Seeding Admin

**Option A: Artisan (SSH)**
```bash
cd /path/to/kapda-backend
php artisan migrate --force
php artisan db:seed --class=AdminUserSeeder
```

**Option B: Manual (phpMyAdmin)**
If you cannot run artisan, import the tables manually or run this SQL to create the admin user (after creating tables):

```sql
INSERT INTO users (name, email, password, role, created_at, updated_at)
VALUES ('Admin', 'admin@kapda.com', '$2y$10$XXXXXXXXXXXXXXXXXXXXXXXXXXXX', 'admin', NOW(), NOW());
```
*(Use `password_hash('StrongPass123', PASSWORD_BCRYPT)` to generate the hash).*

---

## 4. Storage Link

Target: `kapda-backend/storage/app/public` → `public_html/api/storage`

**SSH**:
```bash
ln -s /home/youruser/kapda-backend/storage/app/public /home/youruser/public_html/api/storage
```

**No SSH**:
Create a PHP script `link.php` in `public_html/api`:
```php
<?php
symlink('/home/youruser/kapda-backend/storage/app/public', '/home/youruser/public_html/api/storage');
echo "Linked";
?>
```
Run it once via browser, then delete it.

---

## 5. Adjust `public_html/api/index.php`

Copy contents of `kapda-backend/public` to `public_html/api`.
Edit `public_html/api/index.php`:

```php
require __DIR__.'/../../kapda-backend/vendor/autoload.php';
$app = require_once __DIR__.'/../../kapda-backend/bootstrap/app.php';
```
*(Adjust paths to point to where you uploaded `kapda-backend`)*.

---

## 6. PHP Settings (Hostinger Panel)

Set these in `php.ini` or `.user.ini`:

```ini
upload_max_filesize = 8M
post_max_size = 10M
memory_limit = 256M
max_execution_time = 120
```

---

## 7. React Build & Deploy

1.  **Build Locally**:
    ```bash
    cd frontend
    npm ci
    npm run build
    ```
2.  **Upload**:
    -   Upload `frontend/dist` contents to `public_html/admin`.
    -   Ensure `public_html/admin/.htaccess` exists (for routing).

**Frontend .htaccess**:
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /admin/
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /admin/index.html [L]
</IfModule>
```

---

## 8. Permissions

Set writable permissions (775) for:
-   `kapda-backend/storage`
-   `kapda-backend/bootstrap/cache`

---

## 9. Testing

**Login**:
```bash
curl -X POST https://your-domain.com/api/login \
 -H "Content-Type: application/json" \
 -d '{"email":"admin@kapda.com","password":"StrongPass123"}'
```

**Common Fixes**:
-   **500 Error**: Check `storage/logs/laravel.log`. Usually path issues in `index.php`.
-   **404 on API**: Check `public_html/api/.htaccess` (standard Laravel one).
-   **Images 404**: Check symlink `public_html/api/storage`.
