-- AlterTable
ALTER TABLE "MatchingGroup" ADD COLUMN     "hasManualChanges" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "lastModifiedAt" TIMESTAMP(3),
ADD COLUMN     "lastModifiedBy" TEXT;

-- AlterTable
ALTER TABLE "MatchingMember" ADD COLUMN     "assignedAt" TIMESTAMP(3),
ADD COLUMN     "assignedBy" TEXT,
ADD COLUMN     "assignmentNote" TEXT,
ADD COLUMN     "isManuallyAssigned" BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN     "previousGroupId" TEXT;

-- CreateIndex
CREATE INDEX "MatchingMember_isManuallyAssigned_idx" ON "MatchingMember"("isManuallyAssigned");
