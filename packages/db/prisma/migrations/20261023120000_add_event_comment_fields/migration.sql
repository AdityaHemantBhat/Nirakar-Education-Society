ALTER TABLE "comments"
  ADD COLUMN "email" TEXT,
  ADD COLUMN "place" TEXT;

CREATE INDEX "comments_target_type_target_id_status_created_at_idx"
  ON "comments"("target_type", "target_id", "status", "created_at");
