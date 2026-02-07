# KapdaFactory - Quick Deployment Steps

## 🚀 Quick Start (Hostinger Shared Hosting)

### 1. Prepare Backend

```bash
# Run the preparation script
prepare-deployment.bat

# OR manually:
cd kapda-backend
php artisan config:cache
php artisan route:cache
php artisan storage:link
```

### 2. Configure Production Environment

```bash
# Copy and edit .env.production
cp .env.production .env

# Update these values:
- APP_URL=https://yourdomain.com
- DB_DATABASE=your_database_name
- DB_USERNAME=your_database_user
- DB_PASSWORD=your_database_password

# Generate new app key
php artisan key:generate
```

### 3. Build Frontend

```bash
cd frontend

# Update API URL in src/lib/api.js:
baseURL: 'https://api.yourdomain.com/api'

# Build
npm run build
```

### 4. Upload to Hostinger

**Backend:**

- Upload `kapda-backend` folder to `public_html/api`
- Set permissions: `chmod -R 775 storage bootstrap/cache`

**Frontend:**

- Upload `frontend/dist/*` contents to `public_html`

### 5. Setup Database

```bash
# SSH into Hostinger
cd public_html/api
php artisan migrate --force
php artisan db:seed --class=AdminUserSeeder
```

### 6. Test

- Visit: `https://yourdomain.com`
- Login: <admin@kapda.com> / StrongPass123
- Change password immediately!

## 📁 File Structure on Hostinger

```
public_html/
├── index.html              # Frontend
├── assets/                 # Frontend assets
├── logo.png               # Frontend logo
└── api/                   # Backend
    ├── public/            # Laravel public (API web root)
    ├── storage/           # Uploads & cache
    └── ...                # Other Laravel files
```

## 🔧 Important Settings

**Hostinger Control Panel:**

1. PHP Version: 8.1 or higher
2. Document Root: `public_html` (main domain)
3. API Subdomain: Point to `public_html/api/public`

**File Permissions:**

- Files: 644
- Directories: 755
- Storage: 775
- Bootstrap/cache: 775

## 🔐 Security

1. Set `APP_DEBUG=false` in production
2. Change admin password after first login
3. Enable SSL certificate (free in Hostinger)
4. Keep `.env` file secure (never commit to Git)

## 📝 Default Credentials

**Admin Login:**

- Email: `admin@kapda.com`
- Password: `StrongPass123`

**⚠️ CHANGE THESE IMMEDIATELY AFTER DEPLOYMENT!**

## 🐛 Troubleshooting

**500 Error:**

- Check `.env` file exists
- Verify database credentials
- Check storage permissions (775)

**API Not Working:**

- Verify API URL in frontend
- Check .htaccess in api/public
- Test: `https://api.yourdomain.com/api/orders`

**Images Not Uploading:**

- Run: `php artisan storage:link`
- Check storage permissions
- Verify PHP upload limits (10MB+)

## 📚 Full Documentation

See `DEPLOYMENT_GUIDE.md` for detailed instructions.

## ✅ Deployment Checklist

- [ ] Run `prepare-deployment.bat`
- [ ] Update `.env` with production settings
- [ ] Update API URL in frontend
- [ ] Build frontend (`npm run build`)
- [ ] Upload backend to Hostinger
- [ ] Upload frontend to Hostinger
- [ ] Set file permissions
- [ ] Run migrations
- [ ] Create admin user
- [ ] Test login
- [ ] Test order creation
- [ ] Test image upload
- [ ] Enable SSL
- [ ] Change admin password

---

**Need Help?** Check `DEPLOYMENT_GUIDE.md` for detailed troubleshooting.
