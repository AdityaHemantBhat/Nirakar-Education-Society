CREATE TABLE "admission_popups" (
  "id" TEXT NOT NULL PRIMARY KEY DEFAULT 'default',
  "title" TEXT,
  "body" TEXT,
  "media_url" TEXT,
  "media_type" TEXT,
  "visible" BOOLEAN NOT NULL DEFAULT true,
  "cta_text" TEXT,
  "cta_url" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL
);
