CREATE TYPE "FacultyMessageIdentityType" AS ENUM ('VISITOR', 'FACULTY');

CREATE TABLE "faculty_message_moderation" (
    "id" TEXT NOT NULL,
    "identity_type" "FacultyMessageIdentityType" NOT NULL,
    "identity_hash" TEXT NOT NULL,
    "strikes" INTEGER NOT NULL DEFAULT 0,
    "last_violation_at" TIMESTAMP(3),
    "cooldown_until" TIMESTAMP(3),
    "blocked_until" TIMESTAMP(3),
    "manual_blocked_at" TIMESTAMP(3),
    "manual_blocked_by" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculty_message_moderation_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "faculty_message_moderation_identity_type_identity_hash_key"
ON "faculty_message_moderation"("identity_type", "identity_hash");

CREATE INDEX "faculty_message_moderation_blocked_until_idx"
ON "faculty_message_moderation"("blocked_until");
