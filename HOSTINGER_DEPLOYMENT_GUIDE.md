# KapdaFactory - Hostinger Deployment Guide

## Pre-Deployment Checklist

- [ ] Hostinger Premium/Business hosting active
- [ ] MySQL database created in Hostinger hPanel
- [ ] Domain/subdomain configured
- [ ] PHP 8.1+ enabled in hPanel

---

## Step 1: Create MySQL Database

1. Go to **Hostinger hPanel → Databases → MySQL Databases**
2. Create new database:
   - Database name: `kapdafactory`
   - Username: `kapdafactory_user`
   - Password: (generate strong password)
3. **Note down these credentials!**

---

## Step 2: Upload Files

1. Download/extract the `kapdafactory-deploy.zip`
2. Go to **hPanel → File Manager**
3. Navigate to `public_html` (or your subdomain folder)
4. Upload ALL files from the zip (excluding `.env.production`)

---

## Step 3: Configure Environment

1. Rename `.env.production` to `.env`
2. Edit `.env` and update:

```env
APP_URL=https://your-domain.com

DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

MAIL_USERNAME=your-email@your-domain.com
MAIL_PASSWORD=your-email-password
```

1. Generate APP_KEY (run in SSH or use online tool):

```bash
php artisan key:generate
```

---

## Step 4: Run Migrations

Via SSH (if available):

```bash
cd public_html
php artisan migrate --seed
```

OR use the web installer at: `https://your-domain.com/install-db`

---

## Step 5: Set Permissions

```bash
chmod -R 755 storage bootstrap/cache
chmod -R 777 storage/logs storage/framework
```

---

## Step 6: Configure .htaccess

The `.htaccess` in `public/` folder handles URL rewriting.
Make sure `mod_rewrite` is enabled (usually is on Hostinger).

---

## Login Credentials

- **Email:** <admin@admin.com>
- **Password:** admin

⚠️ **CHANGE THIS PASSWORD IMMEDIATELY AFTER FIRST LOGIN!**

---

## Troubleshooting

### 500 Internal Server Error

- Check `storage/logs/laravel.log`
- Ensure storage folder is writable

### Database Connection Error

- Verify DB credentials in `.env`
- Check if MySQL database exists

### Images Not Loading

- Run: `php artisan storage:link`
- Check `FILESYSTEM_DISK=public` in `.env`

---

## Email Setup (Optional)

For password reset emails, configure in `.env`:

```env
MAIL_HOST=smtp.hostinger.com
MAIL_PORT=465
MAIL_USERNAME=your-email@your-domain.com
MAIL_PASSWORD=your-email-password
MAIL_ENCRYPTION=ssl
```

---

## Support

For issues, check Laravel logs at: `storage/logs/laravel.log`
