@echo off
set PHP_PATH=C:\xampp\php\php.exe

echo ==========================================
echo KapdaFactory Local Installer
echo ==========================================

if not exist "%PHP_PATH%" (
    echo [ERROR] Could not find PHP at %PHP_PATH%
    echo Please make sure XAMPP is installed at C:\xampp
    echo Or edit this file (install.bat) and set PHP_PATH to your php.exe location.
    pause
    exit /b
)

echo [OK] Found PHP at %PHP_PATH%

cd kapda-backend

if not exist "composer.phar" (
    echo [INFO] Downloading Composer...
    "%PHP_PATH%" -r "copy('https://getcomposer.org/installer', 'composer-setup.php');"
    "%PHP_PATH%" composer-setup.php
    "%PHP_PATH%" -r "unlink('composer-setup.php');"
)

echo [INFO] Installing Backend Dependencies...
"%PHP_PATH%" composer.phar install --no-dev --optimize-autoloader

echo [INFO] Configuring Database...
copy .env.example.local .env
"%PHP_PATH%" artisan key:generate

if not exist "database\database.sqlite" (
    echo [INFO] Creating SQLite database file...
    type nul > database\database.sqlite
)

echo [INFO] Running Migrations...
"%PHP_PATH%" artisan migrate --seed --force
"%PHP_PATH%" artisan storage:link

echo ==========================================
echo [SUCCESS] Backend Installed!
echo ==========================================
cd ..
pause
