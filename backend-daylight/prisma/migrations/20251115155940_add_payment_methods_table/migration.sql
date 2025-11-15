/*
  Warnings:

  - Added the required column `paymentMethodCode` to the `Transaction` table without a default value. This is not possible if the table is not empty.

*/
-- CreateEnum
CREATE TYPE "PaymentChannelType" AS ENUM ('DIRECT', 'REDIRECT');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "paymentMethodCode" TEXT NOT NULL;

-- DropEnum
DROP TYPE "PaymentMethod";

-- CreateTable
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "group" TEXT NOT NULL,
    "type" "PaymentChannelType" NOT NULL,
    "feeMerchantFlat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feeMerchantPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feeCustomerFlat" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "feeCustomerPercent" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "minimumFee" DOUBLE PRECISION,
    "maximumFee" DOUBLE PRECISION,
    "minimumAmount" DOUBLE PRECISION NOT NULL,
    "maximumAmount" DOUBLE PRECISION NOT NULL,
    "iconUrl" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "sortOrder" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "PaymentMethod_code_key" ON "PaymentMethod"("code");

-- CreateIndex
CREATE INDEX "PaymentMethod_code_idx" ON "PaymentMethod"("code");

-- CreateIndex
CREATE INDEX "PaymentMethod_group_idx" ON "PaymentMethod"("group");

-- CreateIndex
CREATE INDEX "PaymentMethod_isActive_idx" ON "PaymentMethod"("isActive");

-- CreateIndex
CREATE INDEX "PaymentMethod_sortOrder_idx" ON "PaymentMethod"("sortOrder");
