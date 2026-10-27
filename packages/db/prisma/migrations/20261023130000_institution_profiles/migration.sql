ALTER TABLE "institutions"
ADD COLUMN "profile" JSONB NOT NULL DEFAULT '{}'::jsonb;
