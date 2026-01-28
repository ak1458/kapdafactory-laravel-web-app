# Hostinger Premium Shared Hosting - Test Environment Configuration

# Use this to simulate production constraints locally

## Hostinger Premium Specs (2024)

# ================================

# CPU: 1 core

# RAM: 2 GB total

# PHP Memory Limit: 1536 MB

# PHP Max Execution Time: 360 seconds

# PHP Max Upload: 1536 MB

# Storage: 20 GB SSD

# Bandwidth: Unmetered

# Max Websites: 100

## Test Commands

### 1. Test with Memory Limit (Windows PowerShell)

# Limit PHP memory to 512MB (conservative for shared hosting)

$env:PHP_MEMORY_LIMIT = "512M"

### 2. Run Laravel with Limited Workers

# Use only 1 worker to simulate shared hosting

php artisan serve --host=127.0.0.1 --port=8000

### 3. Database Connection Pool Test

# Shared hosting typically allows 100-150 concurrent connections

# But per-user limit is usually 25-50

## Apache/Nginx Simulation (.htaccess for Hostinger)

```
<IfModule mod_php.c>
    php_value memory_limit 512M
    php_value max_execution_time 120
    php_value max_input_time 120
    php_value post_max_size 64M
    php_value upload_max_filesize 64M
</IfModule>
```

## Recommended PHP Settings for Production

```ini
memory_limit = 512M
max_execution_time = 120
max_input_time = 120
post_max_size = 64M
upload_max_filesize = 64M
max_file_uploads = 20
opcache.enable = 1
opcache.memory_consumption = 128
opcache.max_accelerated_files = 4000
```

## Performance Test Checklist

- [ ] Page load time < 3 seconds
- [ ] API response time < 500ms
- [ ] Image uploads work within 64MB limit
- [ ] No memory exhaustion errors
- [ ] Database queries optimized (< 50 queries per page)
