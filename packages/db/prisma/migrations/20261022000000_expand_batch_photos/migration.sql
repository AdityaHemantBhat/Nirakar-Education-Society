-- CreateEnum
CREATE TYPE "BatchStream" AS ENUM ('SSC', 'HSSC_SCIENCE', 'HSSC_COMMERCE', 'HSSC_ARTS', 'SPECIAL');

-- AlterTable
ALTER TABLE "batch_photos" ADD COLUMN     "stream" "BatchStream" NOT NULL DEFAULT 'SSC',
ADD COLUMN     "batch_session" TEXT,
ADD COLUMN     "class_level" TEXT,
ADD COLUMN     "division" TEXT,
ADD COLUMN     "file_size_bytes" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "image_format" TEXT NOT NULL DEFAULT 'webp',
ADD COLUMN     "updated_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP;

-- CreateIndex
CREATE INDEX "batch_photos_stream_idx" ON "batch_photos"("stream");
