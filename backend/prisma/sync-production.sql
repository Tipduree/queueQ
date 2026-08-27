-- Neon SQL Editor: select branch "main" (top-left) before running.
-- Safe to run multiple times.

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "line_user_id" TEXT;

-- Verify (should return line_user_id):
-- SELECT column_name FROM information_schema.columns
-- WHERE table_schema = 'public' AND table_name = 'bookings'
-- ORDER BY column_name;
