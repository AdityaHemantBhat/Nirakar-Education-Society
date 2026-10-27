-- CreateTable
CREATE TABLE "library_volume_reviews" (
    "id" TEXT NOT NULL,
    "volume_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_volume_reviews_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "library_volume_reviews_volume_id_user_id_key" ON "library_volume_reviews"("volume_id", "user_id");

-- CreateIndex
CREATE INDEX "library_volume_reviews_volume_id_idx" ON "library_volume_reviews"("volume_id");

-- AddForeignKey
ALTER TABLE "library_volume_reviews" ADD CONSTRAINT "library_volume_reviews_volume_id_fkey" FOREIGN KEY ("volume_id") REFERENCES "library_volumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "library_volume_reviews" ADD CONSTRAINT "library_volume_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
