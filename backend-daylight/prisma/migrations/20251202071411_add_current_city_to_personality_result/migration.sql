-- AlterTable
ALTER TABLE "PersonalityResult" ADD COLUMN     "currentCityId" TEXT;

-- CreateIndex
CREATE INDEX "PersonalityResult_currentCityId_idx" ON "PersonalityResult"("currentCityId");

-- AddForeignKey
ALTER TABLE "PersonalityResult" ADD CONSTRAINT "PersonalityResult_currentCityId_fkey" FOREIGN KEY ("currentCityId") REFERENCES "City"("id") ON DELETE SET NULL ON UPDATE CASCADE;
