-- CreateEnum
CREATE TYPE "MatchingStatus" AS ENUM ('PENDING', 'MATCHED', 'CONFIRMED', 'CANCELLED');

-- CreateTable
CREATE TABLE "MatchingGroup" (
    "id" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "groupNumber" INTEGER NOT NULL,
    "status" "MatchingStatus" NOT NULL DEFAULT 'PENDING',
    "averageMatchScore" DOUBLE PRECISION NOT NULL,
    "groupSize" INTEGER NOT NULL,
    "tableNumber" TEXT,
    "venueName" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchingGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "MatchingMember" (
    "id" TEXT NOT NULL,
    "groupId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "transactionId" TEXT NOT NULL,
    "matchScores" JSONB NOT NULL,
    "personalitySnapshot" JSONB NOT NULL,
    "isConfirmed" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "MatchingMember_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "MatchingGroup_eventId_idx" ON "MatchingGroup"("eventId");

-- CreateIndex
CREATE INDEX "MatchingGroup_status_idx" ON "MatchingGroup"("status");

-- CreateIndex
CREATE UNIQUE INDEX "MatchingGroup_eventId_groupNumber_key" ON "MatchingGroup"("eventId", "groupNumber");

-- CreateIndex
CREATE UNIQUE INDEX "MatchingMember_transactionId_key" ON "MatchingMember"("transactionId");

-- CreateIndex
CREATE INDEX "MatchingMember_groupId_idx" ON "MatchingMember"("groupId");

-- CreateIndex
CREATE INDEX "MatchingMember_userId_idx" ON "MatchingMember"("userId");

-- CreateIndex
CREATE INDEX "MatchingMember_transactionId_idx" ON "MatchingMember"("transactionId");

-- AddForeignKey
ALTER TABLE "MatchingGroup" ADD CONSTRAINT "MatchingGroup_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchingMember" ADD CONSTRAINT "MatchingMember_groupId_fkey" FOREIGN KEY ("groupId") REFERENCES "MatchingGroup"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchingMember" ADD CONSTRAINT "MatchingMember_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "MatchingMember" ADD CONSTRAINT "MatchingMember_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;
