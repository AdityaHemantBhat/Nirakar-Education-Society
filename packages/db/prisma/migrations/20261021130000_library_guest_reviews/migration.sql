-- Reviews may be left by a guest as well as by a signed-in reader, and a
-- volume records how far its background parser has got.

ALTER TABLE "library_volume_reviews"
  ALTER COLUMN "user_id" DROP NOT NULL;

ALTER TABLE "library_volume_reviews"
  ADD COLUMN "guest_key" TEXT,
  ADD COLUMN "guest_name" TEXT;

-- One review per guest device per volume. The index on (volume_id, user_id)
-- already exists and still holds, because PostgreSQL treats the nulls of a
-- guest review as distinct from one another.
CREATE UNIQUE INDEX "library_volume_reviews_volume_id_guest_key_key"
  ON "library_volume_reviews"("volume_id", "guest_key");

ALTER TABLE "library_volumes"
  ADD COLUMN "processing_progress" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "processing_step" TEXT,
  ADD COLUMN "processing_error" TEXT;
