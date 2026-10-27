ALTER TABLE "media" ADD COLUMN "uploaded_by_id" TEXT;
CREATE INDEX "media_uploaded_by_id_idx" ON "media"("uploaded_by_id");
ALTER TABLE "media" ADD CONSTRAINT "media_uploaded_by_id_fkey" FOREIGN KEY ("uploaded_by_id") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

CREATE TABLE "post_media" (
    "id" TEXT NOT NULL,
    "post_id" TEXT NOT NULL,
    "url" TEXT NOT NULL,
    "media_type" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "order" INTEGER NOT NULL DEFAULT 0,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "post_media_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "post_media_post_id_order_idx" ON "post_media"("post_id", "order");

ALTER TABLE "post_media" ADD CONSTRAINT "post_media_post_id_fkey" FOREIGN KEY ("post_id") REFERENCES "posts"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "posts" DROP COLUMN IF EXISTS "is_locked";
ALTER TABLE "access_settings" DROP COLUMN IF EXISTS "free_read_policy_posts";
ALTER TABLE "access_settings" DROP COLUMN IF EXISTS "free_read_count_posts";
ALTER TABLE "access_settings" DROP COLUMN IF EXISTS "pass_applies_to";
