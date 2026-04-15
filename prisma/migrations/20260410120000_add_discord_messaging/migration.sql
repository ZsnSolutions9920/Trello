-- AlterTable: Add Discord fields to users
ALTER TABLE "users" ADD COLUMN "discordId" TEXT;
ALTER TABLE "users" ADD COLUMN "discordConnectedAt" TIMESTAMP(3);

-- CreateIndex: Unique constraint on discordId
CREATE UNIQUE INDEX "users_discordId_key" ON "users"("discordId");

-- CreateTable: contact_messages
CREATE TABLE "contact_messages" (
    "id" TEXT NOT NULL,
    "boardId" TEXT NOT NULL,
    "senderName" TEXT NOT NULL,
    "senderEmail" TEXT,
    "content" TEXT NOT NULL,
    "senderIp" TEXT,
    "deliveryStatus" TEXT NOT NULL DEFAULT 'pending',
    "deliveryError" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "contact_messages_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "contact_messages_boardId_idx" ON "contact_messages"("boardId");

-- AddForeignKey
ALTER TABLE "contact_messages" ADD CONSTRAINT "contact_messages_boardId_fkey" FOREIGN KEY ("boardId") REFERENCES "boards"("id") ON DELETE CASCADE ON UPDATE CASCADE;
