# Hostinger Deployment Guide for KapdaFactory

This guide walks you through deploying your **React Frontend** and **Laravel Backend** to Hostinger Shared Hosting.

## Prerequisites

* A Hostinger Hosting Plan (Shared or Cloud).
* Access to Hostinger's **hPanel**.
* **FileZilla** or Hostinger's **File Manager** (for uploading files).
* **SSH Access** (Optional, but recommended for easier backend setup. This guide assumes using File Manager/SSH where appropriate).

---

## Part 1: Database Setup

1. Log in to your Hostinger **hPanel**.
2. Go to **Databases** -> **Management**.
3. Create a **New MySQL Database**:
    * **MySQL Database Name**: `u123456789_kapda` (Hostinger adds a prefix)
    * **MySQL Username**: `u123456789_kapda_user`
    * **Password**: *Create a strong password and save it.*
4. Click **Create**.
5. Note down the **Database Name**, **Username**, and **Password**.

---

## Part 2: Backend Deployment (Laravel)

### 1. Prepare Local Files

Before uploading, it is easier to zip your backend locally.

1. Navigate to `local-bundle/kapda-backend`.
2. Run `composer install --optimize-autoloader --no-dev` (if you have PHP/Composer locally). If not, you can upload `vendor` folder if it exists, OR run this on the server via SSH (see below).
3. **Important**: Delete the `storage/logs/*.log` files to start fresh.
4. Zip the contents of `kapda-backend` (not the folder itself, but the files inside) into `backend.zip`.

### 2. Upload to Hostinger

1. Open **File Manager** in hPanel (or use FTP).
2. Go to `domains -> yourdomain.com`.
3. Create a new folder called `api` (e.g., `public_html/api`) OR preferably a folder outside public_html for security, like `domains/yourdomain.com/backend`.
    * *Recommendation*: Let's put the backend code **outside** `public_html` for security. Create a folder `backend_core` at the same level as `public_html`.
4. Upload `backend.zip` to `backend_core`.
5. Extract `backend.zip`.

### 3. Configure Public Folder (The API Endpoint)

Since we want the API to be accessible at `yourdomain.com/api` (or `api.yourdomain.com`), we need to link the public files.

**Option A: Subdomain (Recommended - e.g., api.yourdomain.com)**

1. In hPanel, go to **Subdomains**. Create `api`.
2. The folder will be `domains/yourdomain.com/public_html/api` (or similar).
3. Copy the contents of your `backend_core/public` folder to this new `api` folder.
4. Edit the `index.php` in that `api` folder.
    * Find: `require __DIR__.'/../vendor/autoload.php';`
    * Change to: `require __DIR__.'/../../backend_core/vendor/autoload.php';` (Adjust path as needed to point to your `backend_core` folder).
    * Do the same for `bootstrap/app.php`.

**Option B: Subfolder (e.g., yourdomain.com/api)**

1. Create `api` folder inside `public_html`.
2. Copy contents of `backend_core/public` to `public_html/api`.
3. Edit `public_html/api/index.php` to point to the correct paths in `backend_core`, similar to above.

### 4. Configure Environment

1. In `backend_core`, rename `.env.example` to `.env`.
2. Edit `.env`:

    ```ini
    APP_NAME=KapdaFactory
    APP_ENV=production
    APP_DEBUG=false
    APP_URL=https://api.yourdomain.com (or https://yourdomain.com/api)

    DB_CONNECTION=mysql
    DB_HOST=localhost
    DB_PORT=3306
    DB_DATABASE=u123456789_kapda (Your Created DB Name)
    DB_USERNAME=u123456789_kapda_user (Your Created DB User)
    DB_PASSWORD=YourPassword
    ```

3. Save the file.

### 5. Run Migrations

If you have SSH access (Terminal in hPanel):

1. `cd domains/yourdomain.com/backend_core`
2. `php artisan migrate --force`
3. `php artisan storage:link`
4. `php artisan config:cache`
5. `php artisan route:cache`

*If no SSH*: You can try creating a temporary route in `web.php` to run these commands via `Artisan::call('migrate')`, but SSH is much safer.

### Method 2: Easy Web-Based Setup (No SSH)

If you are uncomfortable with SSH, file permissions, or running commands, follow this "Web Installer" approach:

1. **Prepare the Snippet**:
    * Find the file `local-bundle/kapda-backend/routes/web-deploy-snippet.php` in your project.
    * Copy its content.
2. **Edit `web.php` on Server**:
    * In Hostinger File Manager, go to `backend_core/routes/web.php`.
    * Paste the snippet at the **very bottom** of the file.
    * Save.
3. **Run the Installer**:
    * Visit `https://api.yourdomain.com/deploy-setup` (or `yourdomain.com/api/deploy-setup` depending on how you set up Part 2, Step 3).
    * You should see a page running "Migrating Database...", "Linking Storage...", etc.
    * Wait for the green **SUCCESS** message.
4. **Cleanup (CRITICAL)**:
    * Go back to `backend_core/routes/web.php`.
    * **Delete** the snippet you executed. Leaving this open is a security risk!
5. **Enjoy**: Your backend is now set up provided your `.env` database credentials were correct.

---

## Part 3: Frontend Deployment (React)

### 1. Build the App

1. On your **local machine**, navigate to `local-bundle/frontend`.
2. Create/Edit `.env.production` (use the example provided):

    ```ini
    VITE_API_URL=https://api.yourdomain.com (The URL you set up in Part 2)
    ```

3. Run the build command:

    ```bash
    npm run build
    ```

    This creates a `dist` folder.

### 2. Upload to Hostinger

1. Go to `domains -> yourdomain.com -> public_html` in File Manager.
2. **Delete** the default `default.php` or `index.php` if present (be careful not to delete your `api` folder if you put it inside `public_html`).
3. Upload the **contents** of the `dist` folder to `public_html`.
    * You should see `index.html`, `assets/`, etc., directly in `public_html`.

### 3. Verify .htaccess

We created a `.htaccess` file in your `frontend/public` folder. This should have been included in your build and verified it exists in `public_html`. It ensures that if a user goes to `yourdomain.com/login`, it doesn't give a 404 error but loads React.

**Content of .htaccess:**

```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteCond %{REQUEST_FILENAME} !-l
  RewriteRule . /index.html [L]
</IfModule>
```

---

## Part 4: Final Checks

1. Visit `yourdomain.com`. Your React app should load.
2. Try logging in or fetching data. Inspect Network tab in browser (F12) to ensure requests are going to `api.yourdomain.com` (or your chosen API URL).
3. If you get **CORS errors**:
    * Go to your backend `config/cors.php` (or verify `backend_core/.env`).
    * Ensure `production` environment allows requests from `yourdomain.com`.
    * You might need to clear backend cache: `php artisan config:clear`.
