-- Neon SQL Editor: select branch "main" (top-left) before running.
-- Safe to run multiple times.

ALTER TABLE "bookings" ADD COLUMN IF NOT EXISTS "line_user_id" TEXT;

-- LINE admin chat (Phase 1)
DO $$ BEGIN
  CREATE TYPE "LineMessageDirection" AS ENUM ('INBOUND', 'OUTBOUND');
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS "line_conversations" (
  "id" TEXT NOT NULL,
  "line_user_id" TEXT NOT NULL,
  "display_name" TEXT,
  "last_message_at" TIMESTAMP(3) NOT NULL,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "line_conversations_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "line_conversations_line_user_id_key"
  ON "line_conversations"("line_user_id");

CREATE INDEX IF NOT EXISTS "line_conversations_last_message_at_idx"
  ON "line_conversations"("last_message_at" DESC);

CREATE TABLE IF NOT EXISTS "line_messages" (
  "id" TEXT NOT NULL,
  "conversation_id" TEXT NOT NULL,
  "direction" "LineMessageDirection" NOT NULL,
  "text" TEXT NOT NULL,
  "line_message_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "line_messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX IF NOT EXISTS "line_messages_line_message_id_key"
  ON "line_messages"("line_message_id");

CREATE INDEX IF NOT EXISTS "line_messages_conversation_id_created_at_idx"
  ON "line_messages"("conversation_id", "created_at");

DO $$ BEGIN
  ALTER TABLE "line_messages"
    ADD CONSTRAINT "line_messages_conversation_id_fkey"
    FOREIGN KEY ("conversation_id") REFERENCES "line_conversations"("id")
    ON DELETE CASCADE ON UPDATE CASCADE;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

-- Verify (should include line_conversations + line_messages):
-- SELECT table_name FROM information_schema.tables
-- WHERE table_schema = 'public' AND table_name LIKE 'line_%'
-- ORDER BY table_name;
