-- Run in Neon SQL Editor if Render preDeploy db push did not run.
-- Safe to run multiple times (IF NOT EXISTS).

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "line_user_id" TEXT;
ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "guest_count" INTEGER NOT NULL DEFAULT 1;
