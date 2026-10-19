CREATE TYPE "FacultyMessageSender" AS ENUM ('VISITOR', 'ADMIN', 'FACULTY');

CREATE TABLE "faculty_conversations" (
    "id" TEXT NOT NULL,
    "faculty_profile_id" TEXT NOT NULL,
    "parent_name" TEXT NOT NULL,
    "student_name" TEXT,
    "class_grade" TEXT,
    "phone" TEXT,
    "email" TEXT,
    "visitor_token_hash" TEXT NOT NULL,
    "last_message_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "faculty_conversations_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "faculty_conversation_messages" (
    "id" TEXT NOT NULL,
    "conversation_id" TEXT NOT NULL,
    "sender" "FacultyMessageSender" NOT NULL,
    "body" TEXT NOT NULL,
    "read_at" TIMESTAMP(3),
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faculty_conversation_messages_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "faculty_conversations_visitor_token_hash_key" ON "faculty_conversations"("visitor_token_hash");
CREATE INDEX "faculty_conversations_faculty_profile_id_last_message_at_idx" ON "faculty_conversations"("faculty_profile_id", "last_message_at");
CREATE INDEX "faculty_conversation_messages_conversation_id_created_at_idx" ON "faculty_conversation_messages"("conversation_id", "created_at");
CREATE INDEX "faculty_conversation_messages_conversation_id_sender_read_at_idx" ON "faculty_conversation_messages"("conversation_id", "sender", "read_at");

ALTER TABLE "faculty_conversations" ADD CONSTRAINT "faculty_conversations_faculty_profile_id_fkey" FOREIGN KEY ("faculty_profile_id") REFERENCES "faculty_profiles"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "faculty_conversation_messages" ADD CONSTRAINT "faculty_conversation_messages_conversation_id_fkey" FOREIGN KEY ("conversation_id") REFERENCES "faculty_conversations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
