-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "autoMatchingAt" TIMESTAMP(3),
ADD COLUMN     "autoMatchingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateIndex
CREATE INDEX "Event_autoMatchingCompleted_idx" ON "Event"("autoMatchingCompleted");
