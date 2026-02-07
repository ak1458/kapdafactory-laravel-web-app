# KapdaFactory - Hostinger Deployment Guide

## Prerequisites

- Hostinger shared hosting account with PHP 8.1+
- Domain name configured
- SSH/FTP access
- MySQL database created in Hostinger

## Step 1: Prepare Backend (Laravel)

### 1.1 Update Environment Configuration

Edit `kapda-backend/.env`:

```env
APP_NAME=KapdaFactory
APP_ENV=production
APP_DEBUG=false
APP_URL=https://yourdomain.com

DB_CONNECTION=mysql
DB_HOST=localhost
DB_PORT=3306
DB_DATABASE=your_database_name
DB_USERNAME=your_database_user
DB_PASSWORD=your_database_password

SESSION_DRIVER=file
QUEUE_CONNECTION=sync
```

### 1.2 Optimize Laravel

Run these commands locally before uploading:

```bash
cd kapda-backend
php artisan config:cache
php artisan route:cache
php artisan view:cache
```

## Step 2: Prepare Frontend (React)

### 2.1 Update API URL

Edit `frontend/src/lib/api.js`:

```javascript
const api = axios.create({
    baseURL: 'https://yourdomain.com/api',  // Update with your domain
    headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json'
    }
});
```

### 2.2 Build Production Frontend

```bash
cd frontend
npm run build
```

This creates a `dist` folder with optimized files.

## Step 3: Upload Files to Hostinger

### 3.1 Backend Structure

Upload to your hosting root (e.g., `public_html/api`):

```
public_html/
├── api/                    # Laravel backend
│   ├── app/
│   ├── bootstrap/
│   ├── config/
│   ├── database/
│   ├── public/            # This becomes the web root for API
│   ├── resources/
│   ├── routes/
│   ├── storage/           # Make writable (chmod 775)
│   ├── vendor/
│   ├── .env
│   └── artisan
```

### 3.2 Frontend Structure

Upload `dist` contents to `public_html`:

```
public_html/
├── index.html
├── assets/
│   ├── index-*.js
│   └── index-*.css
└── logo.png
```

## Step 4: Configure Hostinger

### 4.1 Set Document Root

In Hostinger control panel:

- For main domain: Point to `public_html`
- For API subdomain (api.yourdomain.com): Point to `public_html/api/public`

### 4.2 Create Subdomain for API

Option 1: Use subdomain (Recommended)

- Create subdomain: `api.yourdomain.com`
- Point to: `public_html/api/public`

Option 2: Use path

- Main site: `yourdomain.com` → `public_html`
- API: `yourdomain.com/api` → `public_html/api/public`

### 4.3 Set Permissions

```bash
chmod -R 755 public_html/api
chmod -R 775 public_html/api/storage
chmod -R 775 public_html/api/bootstrap/cache
```

## Step 5: Database Setup

### 5.1 Import Database

In Hostinger phpMyAdmin:

1. Create database
2. Run migrations:

```bash
cd public_html/api
php artisan migrate --force
```

### 5.2 Create Admin User

```bash
php artisan db:seed --class=AdminUserSeeder
```

Default credentials:

- Email: <admin@kapda.com>
- Password: StrongPass123

## Step 6: Configure .htaccess

### 6.1 Main .htaccess (public_html)

```apache
<IfModule mod_rewrite.c>
    RewriteEngine On
    
    # Redirect API requests to api subdirectory
    RewriteRule ^api/(.*)$ api/public/$1 [L]
    
    # Handle React Router
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.html [L]
</IfModule>
```

### 6.2 API .htaccess (public_html/api/public)

Already created - handles Laravel routing.

## Step 7: Update Frontend API URL

After deployment, update `frontend/src/lib/api.js`:

```javascript
baseURL: 'https://api.yourdomain.com/api'
// OR
baseURL: 'https://yourdomain.com/api/api'
```

Then rebuild and re-upload frontend.

## Step 8: Test Deployment

1. Visit `https://yourdomain.com` - Should show login page
2. Visit `https://api.yourdomain.com/api/orders` - Should return JSON
3. Login with admin credentials
4. Create a test order
5. Upload a photo
6. Test all features

## Troubleshooting

### Issue: 500 Internal Server Error

- Check `.env` file exists and is configured
- Check storage permissions (775)
- Check PHP version (8.1+)
- Enable error display temporarily in `.env`: `APP_DEBUG=true`

### Issue: API requests fail

- Verify API URL in `frontend/src/lib/api.js`
- Check CORS settings in `kapda-backend/config/cors.php`
- Verify .htaccess is working

### Issue: Images not uploading

- Check `storage/app/uploads` exists and is writable
- Verify PHP `upload_max_filesize` and `post_max_size` are at least 10M
- Check `public/storage` symlink: `php artisan storage:link`

### Issue: White screen

- Check browser console for errors
- Verify all assets loaded correctly
- Check API URL configuration

## Security Checklist

- [ ] Set `APP_DEBUG=false` in production
- [ ] Use strong `APP_KEY` (run `php artisan key:generate`)
- [ ] Set proper file permissions (755 for files, 775 for storage)
- [ ] Change default admin password
- [ ] Enable HTTPS (SSL certificate)
- [ ] Configure CORS properly
- [ ] Keep Laravel and dependencies updated

## Performance Optimization

1. **Enable OPcache** in Hostinger PHP settings
2. **Use CDN** for static assets (optional)
3. **Enable Gzip compression** in .htaccess
4. **Cache Laravel config**: `php artisan config:cache`
5. **Optimize images** before uploading

## Backup Strategy

1. **Database**: Use Hostinger's automated backups or phpMyAdmin export
2. **Files**: Backup `storage/app/uploads` regularly
3. **Code**: Keep Git repository updated

## Support

For issues:

1. Check Hostinger documentation
2. Review Laravel logs: `storage/logs/laravel.log`
3. Check browser console for frontend errors
4. Verify API responses in Network tab

---

**Deployment Checklist:**

- [ ] Update `.env` with production settings
- [ ] Build frontend (`npm run build`)
- [ ] Upload backend to `public_html/api`
- [ ] Upload frontend `dist` to `public_html`
- [ ] Set file permissions
- [ ] Run migrations
- [ ] Create admin user
- [ ] Test all features
- [ ] Enable SSL
- [ ] Change default passwords
