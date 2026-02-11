# KapdaFactory Setup & Deployment

## Prerequisites

- Node.js 20+
- PostgreSQL 16+

## Setup

1. Copy `.env` file and set your database URL and secrets:

   ```env
   DATABASE_URL="postgresql://user:password@localhost:5432/kapdafactory"
   AUTH_SECRET="your-secret-key"
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Setup Database:

   ```bash
   npx prisma generate
   npx prisma db push
   ```

4. (Optional) Seed Initial Data:

   ```bash
   npm run prisma:seed
   ```

## Running

- **Development**: `npm run dev`
- **Production**:

  ```bash
  npm run build
  npm start
  ```
