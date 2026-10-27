ALTER TABLE "privacy_requests"
  ADD COLUMN "reference" TEXT,
  ADD COLUMN "assigned_to_user_id" TEXT,
  ADD COLUMN "identity_status" TEXT NOT NULL DEFAULT 'UNVERIFIED',
  ADD COLUMN "resolution" TEXT;

UPDATE "privacy_requests" SET "reference" = 'PR-' || upper(substr(md5("id"), 1, 12)) WHERE "reference" IS NULL;
ALTER TABLE "privacy_requests" ALTER COLUMN "reference" SET NOT NULL;
CREATE UNIQUE INDEX "privacy_requests_reference_key" ON "privacy_requests"("reference");
CREATE INDEX "privacy_requests_assigned_to_user_id_status_idx" ON "privacy_requests"("assigned_to_user_id", "status");

CREATE TABLE "privacy_request_events" (
  "id" TEXT NOT NULL,
  "request_id" TEXT NOT NULL,
  "actor_user_id" TEXT,
  "kind" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "is_internal" BOOLEAN NOT NULL DEFAULT true,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "privacy_request_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "privacy_request_events_request_id_fkey" FOREIGN KEY ("request_id") REFERENCES "privacy_requests"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "privacy_request_events_request_id_created_at_idx" ON "privacy_request_events"("request_id", "created_at");

CREATE TABLE "grievance_cases" (
  "id" TEXT NOT NULL,
  "reference" TEXT NOT NULL,
  "tracking_token_hash" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "category" TEXT NOT NULL,
  "subject" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'RECEIVED',
  "restricted" BOOLEAN NOT NULL DEFAULT false,
  "assigned_to_user_id" TEXT,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "grievance_cases_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX "grievance_cases_reference_key" ON "grievance_cases"("reference");
CREATE UNIQUE INDEX "grievance_cases_tracking_token_hash_key" ON "grievance_cases"("tracking_token_hash");
CREATE INDEX "grievance_cases_status_created_at_idx" ON "grievance_cases"("status", "created_at");
CREATE INDEX "grievance_cases_assigned_to_user_id_status_idx" ON "grievance_cases"("assigned_to_user_id", "status");

CREATE TABLE "grievance_events" (
  "id" TEXT NOT NULL,
  "case_id" TEXT NOT NULL,
  "actor_user_id" TEXT,
  "kind" TEXT NOT NULL,
  "message" TEXT NOT NULL,
  "is_internal" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "grievance_events_pkey" PRIMARY KEY ("id"),
  CONSTRAINT "grievance_events_case_id_fkey" FOREIGN KEY ("case_id") REFERENCES "grievance_cases"("id") ON DELETE CASCADE ON UPDATE CASCADE
);
CREATE INDEX "grievance_events_case_id_created_at_idx" ON "grievance_events"("case_id", "created_at");
