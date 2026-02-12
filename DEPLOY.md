# Deploying KapdaFactory to Vercel

## Prerequisites

1. **Vercel Account**: You already have this.
2. **GitHub Repo**: your current Next.js repository (connected to Vercel).

## Step 1: Create Vercel Project

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard).
2. Click **"Add New..."** -> **"Project"**.
3. Import your KapdaFactory Next.js repository.
4. **Framework Preset**: Select **Next.js**.
5. **Root Directory**: Leave as `./` (default).

## Step 2: Database Setup (Postgres)

Vercel works best with a cloud database. Vercel provides one for free.

1. In your new project dashboard, go to the **Storage** tab.
2. Click **"Create Database"** -> Select **Postgres**.
3. Give it a name (e.g., `kapdafactory-db`) and region (choose one close to you, e.g., Mumbai `bom1`).
4. Once created, click **"Connect Project"** and select your project.
5. This will automatically add the `POSTGRES_URL` (and others) to your Environment Variables.
    * *Note: Next.js Prisma requires `DATABASE_URL`. Vercel creates `POSTGRES_PRISMA_URL`. You may need to alias this in Step 4.*

## Step 3: File Storage Setup (Vercel Blob)

Since Vercel is serverless, you cannot save files to the local disk. We set up the app to use **Vercel Blob** automatically.

1. In the **Storage** tab, click **"Create Database"** -> Select **Vercel Blob**.
2. Give it a name (e.g., `kapdafactory-images`).
3. Click **"Connect Project"**.
4. This adds `BLOB_READ_WRITE_TOKEN` to your Environment Variables.

## Step 4: Environment Variables

Go to **Settings** -> **Environment Variables** and ensure these are set:

| Variable | Value | Description |
| :--- | :--- | :--- |
| `DATABASE_URL` | *Copy value from POSTGRES_PRISMA_URL* | Connection string for Prisma |
| `BLOB_READ_WRITE_TOKEN` | *Auto-added by Vercel Blob* | Token for file uploads |
| `NEXT_PUBLIC_API_URL` | `/api` | **Correct usage**: Relative path |
| `JWT_SECRET` | *Generate a random string* | Security for login sessions |

> **Important**: You must manually add `DATABASE_URL` and set its value to be the same as the `POSTGRES_PRISMA_URL` that Vercel generated.

## Step 5: Final Deploy

1. Vercel will trigger a build.
2. **Database Migration**: The build might fail correctly if the DB is empty. You need to run migrations.
    * Go to **Settings** -> **Build & Development Settings**.
    * **Build Command**: `npx prisma migrate deploy && next build`
    * **Install Command**: `npm install`
    * **Output Directory**: `.next`
3. Redeploy.

## Step 6: Initial User Seeding

After deploy, the database will be empty. You need minimal data to log in.

1. Go to **Vercel Storage** -> **Postgres** -> **Query** tab.
2. Run this SQL to create an admin user (password: `password`):

    ```sql
    INSERT INTO "users" ("name", "email", "password", "role", "updated_at")
    VALUES ('Admin', 'admin@example.com', '$2y$10$92IXUNpkjO0rOQ5byMi.Ye4oKoEa3Ro9llC/.og/at2.uheWG/igi', 'admin', NOW());
    ```

---

# Maintenance & Future Updates

## How to Edit Code

1. **Edit Locally**: Make your changes in VS Code on your laptop.
2. **Test**: Run `npm run dev` to verify everything works locally.
3. **Push to GitHub**:

    ```bash
    git add .
    git commit -m "Description of changes"
    git push origin master
    ```

4. **Auto-Deploy**: Vercel detects the push and automatically deploys the new version within minutes.

## How to Change Database Schema

If you modify `prisma/schema.prisma` (e.g., add a new field):

1. **Local Update**:

    ```bash
    npx prisma db push
    ```

    This updates your local database.

2. **Production Update**:
    * Ideally, use `npx prisma db push` pointing to the prod URL manually (like we did with `migrate-and-seed.mjs`).
    * OR, better yet, just run the command from your local machine:

        ```bash
        # (Assuming you have .env.production.local)
        npx dotenv -e .env.production.local -- npx prisma db push
        ```

## Security Important Note

> [!WARNING]
> **Action Required**: If you received a GitGuardian alert, it means a secret key (like `JWT_SECRET`) was accidentally committed to GitHub.
>
> 1. **Rotate Secrets**: Go to your Vercel Project Settings -> Environment Variables. Generate a NEW `JWT_SECRET` and save it.
> 2. **Invalidate Old Secrets**: Ensure the old secret is no longer used.
> 3. **Check `.env`**: Never commit `.env` files. We have verified your `.gitignore` is correct, but please double-check before pushing.
