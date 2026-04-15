CREATE TABLE "attendances" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" TEXT NOT NULL,
    "signInAt" TIMESTAMP(3) NOT NULL,
    "signOutAt" TIMESTAMP(3),
    "signInNote" TEXT,
    "signOutNote" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "attendances_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "attendances_userId_idx" ON "attendances"("userId");
CREATE INDEX "attendances_date_idx" ON "attendances"("date");
CREATE UNIQUE INDEX "attendances_userId_date_key" ON "attendances"("userId", "date");

ALTER TABLE "attendances" ADD CONSTRAINT "attendances_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
