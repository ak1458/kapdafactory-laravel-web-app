@echo off
set PHP_PATH=C:\xampp\php\php.exe

echo Starting Backend Server...
cd kapda-backend
"%PHP_PATH%" artisan serve --host=127.0.0.1 --port=8000
