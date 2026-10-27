CREATE TABLE "magazine_issue_reviews" (
    "id" TEXT NOT NULL,
    "issue_id" TEXT NOT NULL,
    "user_id" TEXT,
    "guest_key" TEXT,
    "guest_name" TEXT,
    "rating" INTEGER NOT NULL,
    "comment" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "magazine_issue_reviews_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "magazine_issue_reviews_issue_id_user_id_key" ON "magazine_issue_reviews"("issue_id", "user_id");
CREATE UNIQUE INDEX "magazine_issue_reviews_issue_id_guest_key_key" ON "magazine_issue_reviews"("issue_id", "guest_key");
CREATE INDEX "magazine_issue_reviews_issue_id_idx" ON "magazine_issue_reviews"("issue_id");

ALTER TABLE "magazine_issue_reviews" ADD CONSTRAINT "magazine_issue_reviews_issue_id_fkey" FOREIGN KEY ("issue_id") REFERENCES "magazine_issues"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "magazine_issue_reviews" ADD CONSTRAINT "magazine_issue_reviews_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
