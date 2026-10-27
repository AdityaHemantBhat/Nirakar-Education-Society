-- A volume records how long its source document really was. A document
-- longer than the rendering ceiling is sampled rather than refused, so
-- the page count of the rendered book and the page count of the source
-- can differ — and the console needs to be able to say so.

ALTER TABLE "library_volumes"
  ADD COLUMN "source_page_count" INTEGER NOT NULL DEFAULT 0,
  ADD COLUMN "is_sampled" BOOLEAN NOT NULL DEFAULT false;
