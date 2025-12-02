/*
  Warnings:

  - Added the required column `cityId` to the `Partner` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Partner" ADD COLUMN     "cityId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "Partner_cityId_idx" ON "Partner"("cityId");

-- AddForeignKey
ALTER TABLE "Partner" ADD CONSTRAINT "Partner_cityId_fkey" FOREIGN KEY ("cityId") REFERENCES "City"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
