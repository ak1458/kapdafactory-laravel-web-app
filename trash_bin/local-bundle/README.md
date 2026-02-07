# KapdaFactory Admin App - Local Bundle

This is a self-contained, zero-configuration local development bundle for the KapdaFactory Admin Web App.

## 🚀 Quick Start

1.  **Double-click** `START_LOCAL.bat` in this folder.
2.  Wait for the windows to open.
3.  The app will launch in your browser at `http://localhost:5173`.

**That's it!** No installation required.

---

## 📱 Features

*   **Create Orders**: Capture measurements, delivery dates, and photos.
*   **Track Status**: Manage orders from Pending → Ready → Delivered.
*   **Search & Filter**: Quickly find orders by token, bill number, or date.
*   **Mobile First**: Designed to work fast on your phone.

## 🛠️ Technical Details

This bundle includes everything needed to run the app on Windows:

*   **Backend**: Laravel 10 (PHP) running on port `8000`.
*   **Frontend**: React (Vite) running on port `5173`.
*   **Database**: SQLite (`database/database.sqlite`).
*   **Runtime**: Portable PHP 8.2 included in `php-runtime`.

## 📂 Folder Structure

*   `kapda-backend/`: The Laravel API code.
*   `frontend/`: The React frontend code.
*   `php-runtime/`: The portable PHP environment.
*   `START_LOCAL.bat`: The launcher script.

## ⚠️ Troubleshooting

*   **"Error loading orders"**: ensure the backend window (black terminal) is running. If the error persists, click the **"Retry"** button on the page.
*   **Images not showing**: Ensure the `storage` link is created. The start script handles this, but you can manually run `php artisan storage:link` inside `kapda-backend` if needed.
*   **Port conflicts**: If ports 8000 or 5173 are taken, the app might fail. Close other dev servers.

## 🔒 Security Note

This local bundle has **authentication disabled** for ease of use.
*   **Admin User**: Hardcoded as ID 1.
*   **Login**: Bypassed.
*   **Network**: Only accessible on your local machine (localhost).

**DO NOT DEPLOY THIS BUNDLE TO THE PUBLIC INTERNET WITHOUT RE-ENABLING AUTHENTICATION.**

---

*Built for KapdaFactory Internal Use - 2025*
