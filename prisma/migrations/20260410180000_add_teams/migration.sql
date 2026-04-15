-- CreateTable: teams
CREATE TABLE "teams" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "inviteCode" TEXT NOT NULL,
    "adminId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "teams_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "teams_inviteCode_key" ON "teams"("inviteCode");

-- AlterTable: users — add role and teamId
ALTER TABLE "users" ADD COLUMN "role" TEXT NOT NULL DEFAULT 'employee';
ALTER TABLE "users" ADD COLUMN "teamId" TEXT;

CREATE INDEX "users_teamId_idx" ON "users"("teamId");

ALTER TABLE "users" ADD CONSTRAINT "users_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AlterTable: boards — add teamId
ALTER TABLE "boards" ADD COLUMN "teamId" TEXT;

CREATE INDEX "boards_teamId_idx" ON "boards"("teamId");

ALTER TABLE "boards" ADD CONSTRAINT "boards_teamId_fkey" FOREIGN KEY ("teamId") REFERENCES "teams"("id") ON DELETE SET NULL ON UPDATE CASCADE;
