/*
  Warnings:

  - Added the required column `minMatchScore` to the `MatchingGroup` table without a default value. This is not possible if the table is not empty.
  - Added the required column `thresholdUsed` to the `MatchingGroup` table without a default value. This is not possible if the table is not empty.

*/
-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "MatchingStatus" ADD VALUE 'PARTIALLY_MATCHED';
ALTER TYPE "MatchingStatus" ADD VALUE 'NO_MATCH';

-- AlterTable
ALTER TABLE "MatchingGroup" ADD COLUMN     "minMatchScore" DOUBLE PRECISION NOT NULL,
ADD COLUMN     "thresholdUsed" DOUBLE PRECISION NOT NULL;

-- CreateTable
CREATE TABLE "MatchingAttempt" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "attemptNumber" INTEGER NOT NULL,
    "status" "MatchingStatus" NOT NULL,
    "totalParticipants" INTEGER NOT NULL,
    "matchedCount" INTEGER NOT NULL,
    "unmatchedCount" INTEGER NOT NULL,
    "groupsFormed" INTEGER NOT NULL,
    "averageMatchScore" DOUBLE PRECISION,
    "highestThreshold" DOUBLE PRECISION NOT NULL,
    "lowestThreshold" DOUBLE PRECISION NOT NULL,
    "matchingResult" JSONB NOT NULL,
    "unmatchedUsers" JSONB NOT NULL,
    "executedBy" TEXT,
    "executionTime" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "MatchingAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchingAttempt_eventId_idx" ON "MatchingAttempt"("eventId");

-- CreateIndex
CREATE INDEX "MatchingAttempt_attemptNumber_idx" ON "MatchingAttempt"("attemptNumber");

-- CreateIndex
CREATE INDEX "MatchingAttempt_createdAt_idx" ON "MatchingAttempt"("createdAt");

-- AddForeignKey
ALTER TABLE "MatchingAttempt" ADD CONSTRAINT "MatchingAttempt_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
