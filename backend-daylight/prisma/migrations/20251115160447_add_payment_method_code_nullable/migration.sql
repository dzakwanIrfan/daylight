/*
  Warnings:

  - You are about to drop the column `quantity` on the `Transaction` table. All the data in the column will be lost.

*/
-- DropIndex
DROP INDEX "Transaction_expiredAt_idx";

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "quantity",
ALTER COLUMN "feeMerchant" SET DEFAULT 0,
ALTER COLUMN "feeCustomer" SET DEFAULT 0,
ALTER COLUMN "totalFee" SET DEFAULT 0,
ALTER COLUMN "checkoutUrl" DROP NOT NULL,
ALTER COLUMN "expiredAt" DROP NOT NULL,
ALTER COLUMN "paymentMethodCode" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Transaction_paymentMethodCode_idx" ON "Transaction"("paymentMethodCode");

-- CreateIndex
CREATE INDEX "Transaction_createdAt_idx" ON "Transaction"("createdAt");
