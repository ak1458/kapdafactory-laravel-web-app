# KapdaFactory Local Dev Bundle

This bundle is pre-configured to run on your Windows machine using XAMPP.

## Prerequisites
1.  **XAMPP** installed at `C:\xampp` (specifically `C:\xampp\php\php.exe`).
2.  **Node.js** installed.

## How to Run
1.  Double-click **`START_LOCAL.bat`**.

That's it!

## What happens automatically?
-   **First Run**: It will detect missing dependencies, download Composer, install backend libraries, create a local database, and run migrations.
-   **Every Run**: It starts the Backend (Laravel) and Frontend (React) servers and opens your browser.

## Login Details
-   **Email**: `admin@kapda.com`
-   **Password**: `StrongPass123`

## Troubleshooting
-   If the window closes immediately, try running `install.bat` manually to see errors.
-   Ensure XAMPP is at `C:\xampp`. If not, edit `install.bat` and `run_backend.bat` with your PHP path.
