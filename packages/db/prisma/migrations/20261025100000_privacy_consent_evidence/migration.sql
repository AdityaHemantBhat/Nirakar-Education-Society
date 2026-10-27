CREATE TABLE "privacy_consent_records" (
  "id" TEXT NOT NULL,
  "subject_key" TEXT NOT NULL,
  "purpose" TEXT NOT NULL,
  "notice_version" TEXT NOT NULL,
  "action" TEXT NOT NULL,
  "channel" TEXT NOT NULL,
  "guardian_verified" BOOLEAN NOT NULL DEFAULT false,
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "privacy_consent_records_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "privacy_consent_records_subject_key_purpose_created_at_idx"
  ON "privacy_consent_records"("subject_key", "purpose", "created_at");

CREATE TABLE "privacy_requests" (
  "id" TEXT NOT NULL,
  "name" TEXT NOT NULL,
  "email" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "details" TEXT NOT NULL,
  "status" TEXT NOT NULL DEFAULT 'RECEIVED',
  "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updated_at" TIMESTAMP(3) NOT NULL,
  CONSTRAINT "privacy_requests_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "privacy_requests_status_created_at_idx" ON "privacy_requests"("status", "created_at");
CREATE INDEX "privacy_requests_email_created_at_idx" ON "privacy_requests"("email", "created_at");
