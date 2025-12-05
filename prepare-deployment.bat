@echo off
echo ========================================
echo KapdaFactory - Deployment Preparation
echo ========================================
echo.

echo Step 1: Clearing Laravel caches...
cd kapda-backend
call C:\xampp\php\php.exe artisan config:clear
call C:\xampp\php\php.exe artisan route:clear
call C:\xampp\php\php.exe artisan view:clear
call C:\xampp\php\php.exe artisan cache:clear
echo Done!
echo.

echo Step 2: Optimizing Laravel...
call C:\xampp\php\php.exe artisan config:cache
call C:\xampp\php\php.exe artisan route:cache
call C:\xampp\php\php.exe artisan view:cache
echo Done!
echo.

echo Step 3: Creating storage link...
call C:\xampp\php\php.exe artisan storage:link
echo Done!
echo.

cd ..

echo ========================================
echo Backend is ready for deployment!
echo.
echo Next steps:
echo 1. Update .env file with production settings
echo 2. Build frontend: cd frontend ^&^& npm run build
echo 3. Upload files to Hostinger as per DEPLOYMENT_GUIDE.md
echo ========================================
pause
