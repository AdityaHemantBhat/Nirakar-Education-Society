CREATE TABLE "faculty_conversation_attachments" (
    "id" TEXT NOT NULL,
    "message_id" TEXT NOT NULL,
    "original_name" TEXT NOT NULL,
    "storage_name" TEXT NOT NULL,
    "mime_type" TEXT NOT NULL,
    "size" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "faculty_conversation_attachments_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "faculty_conversation_attachments_storage_name_key" ON "faculty_conversation_attachments"("storage_name");
CREATE INDEX "faculty_conversation_attachments_message_id_idx" ON "faculty_conversation_attachments"("message_id");

ALTER TABLE "faculty_conversation_attachments" ADD CONSTRAINT "faculty_conversation_attachments_message_id_fkey" FOREIGN KEY ("message_id") REFERENCES "faculty_conversation_messages"("id") ON DELETE CASCADE ON UPDATE CASCADE;
