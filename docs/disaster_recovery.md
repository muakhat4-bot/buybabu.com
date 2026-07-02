# Disaster Recovery & Restoration Guide

This document describes the step-by-step instructions to restore the Villex monorepo and its backend data/storage layer from a backup following a disaster (e.g. server crash, data loss, database corruption).

---

## 🛠️ Step 1: Restore Environment Configurations

1. Locate your latest backup folder under `scripts/backups/backup-YYYYMMDD-HHMMSS/config/`.
2. Copy the `.env` backup files back to their respective folders in the monorepo root:
   - `root.env` -> `/.env`
   - `admin-portal.env` -> `/apps/admin-portal/.env`
   - `api-server.env` -> `/apps/api-server/.env`
   - `customer-marketplace.env` -> `/apps/customer-marketplace/.env`
   - `vendor-portal.env` -> `/apps/vendor-portal/.env`
3. Verify that the credentials (`DATABASE_URL`, `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`) are populated correctly.

---

## 💾 Step 2: Restore PostgreSQL Database

### Option A: Restoring using Prisma schema push (For schema rebuilds)
If you only need to re-generate empty tables, indices, and relationships:
1. Navigate to `apps/api-server`:
   ```bash
   cd apps/api-server
   ```
2. Run Prisma sync to generate all tables, index lookups, constraints, and cascade rules directly on Supabase/PostgreSQL:
   ```bash
   npx prisma db push
   ```
3. Run the database seeder to populate mock and initial data:
   ```bash
   npx prisma db seed
   ```

### Option B: Restoring using pg_dump SQL file (For data restore)
If you have a SQL backup dump (`database_backup.sql`):
1. Re-initialize empty tables using Step A.1-A.2.
2. Restore database content using the standard `psql` command (substituting connection variables):
   ```bash
   psql "postgresql://postgres:password@db-host:5432/db-name" -f database_backup.sql
   ```

---

## ☁️ Step 3: Restore Storage Buckets & Files

1. Login to your **Supabase Console** and ensure the project storage buckets are active.
2. Our upload endpoint automatically provisions missing buckets, but you can also re-create them manually or run SQL rules to secure them.
3. If you have a local backup of your files, sync them using the Supabase CLI:
   ```bash
   supabase storage push product-images ./storage-backup/product-images
   supabase storage push product-gallery ./storage-backup/product-gallery
   supabase storage push vendor-logos ./storage-backup/vendor-logos
   supabase storage push vendor-banners ./storage-backup/vendor-banners
   supabase storage push customer-avatars ./storage-backup/customer-avatars
   ```

---

## ⚡ Step 4: Verification & Startup

1. Install dependencies in the root:
   ```bash
   npm install
   ```
2. Rebuild packages:
   ```bash
   npx turbo run build
   ```
3. Restart development servers:
   ```bash
   npm run dev
   ```
