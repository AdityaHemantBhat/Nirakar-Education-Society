-- CreateEnum
CREATE TYPE "LibraryStatus" AS ENUM ('DRAFT', 'PROCESSING', 'PUBLISHED', 'ARCHIVED');

-- CreateEnum
CREATE TYPE "LibraryStandard" AS ENUM ('V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII');

-- CreateEnum
CREATE TYPE "LibraryCategory" AS ENUM ('TEXTBOOK', 'WORKBOOK', 'REFERENCE', 'QUESTION_PAPER', 'PRACTICE_PAPER', 'NOTEBOOK', 'OTHER');

-- CreateTable
CREATE TABLE "library_volumes" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "description" TEXT,
    "author" TEXT,
    "publisher" TEXT,
    "academic_year" TEXT,
    "standard" "LibraryStandard" NOT NULL,
    "category" "LibraryCategory" NOT NULL DEFAULT 'TEXTBOOK',
    "subject" TEXT,
    "institution_code" "InstitutionCode",
    "language" TEXT NOT NULL DEFAULT 'English',
    "status" "LibraryStatus" NOT NULL DEFAULT 'PROCESSING',
    "is_published" BOOLEAN NOT NULL DEFAULT false,
    "page_count" INTEGER NOT NULL DEFAULT 0,
    "word_count" INTEGER NOT NULL DEFAULT 0,
    "reading_minutes" INTEGER NOT NULL DEFAULT 5,
    "file_size_bytes" INTEGER NOT NULL DEFAULT 0,
    "original_name" TEXT,
    "pdf_path" TEXT,
    "cover_url" TEXT,
    "keywords" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "excerpt" TEXT,
    "view_count" INTEGER NOT NULL DEFAULT 0,
    "published_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "library_volumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "library_volume_pages" (
    "id" TEXT NOT NULL,
    "volume_id" TEXT NOT NULL,
    "page_no" INTEGER NOT NULL,
    "text" TEXT NOT NULL DEFAULT '',
    "image_variants" JSONB NOT NULL,
    "blurhash" TEXT NOT NULL DEFAULT 'L6PZfSi_.AyE_3t7t7R**0o#DgR4',
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "library_volume_pages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "library_volumes_slug_key" ON "library_volumes"("slug");

-- CreateIndex
CREATE INDEX "library_volumes_status_is_published_idx" ON "library_volumes"("status", "is_published");

-- CreateIndex
CREATE INDEX "library_volumes_standard_idx" ON "library_volumes"("standard");

-- CreateIndex
CREATE INDEX "library_volumes_category_idx" ON "library_volumes"("category");

-- CreateIndex
CREATE INDEX "library_volumes_subject_idx" ON "library_volumes"("subject");

-- CreateIndex
CREATE INDEX "library_volumes_institution_code_idx" ON "library_volumes"("institution_code");

-- CreateIndex
CREATE INDEX "library_volumes_published_at_idx" ON "library_volumes"("published_at");

-- CreateIndex
CREATE INDEX "library_volumes_title_idx" ON "library_volumes"("title");

-- CreateIndex
CREATE UNIQUE INDEX "library_volume_pages_volume_id_page_no_key" ON "library_volume_pages"("volume_id", "page_no");

-- CreateIndex
CREATE INDEX "library_volume_pages_volume_id_idx" ON "library_volume_pages"("volume_id");

-- AddForeignKey
ALTER TABLE "library_volume_pages" ADD CONSTRAINT "library_volume_pages_volume_id_fkey" FOREIGN KEY ("volume_id") REFERENCES "library_volumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;
