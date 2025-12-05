/*
  Warnings:

  - You are about to drop the column `autoRenew` on the `UserSubscription` table. All the data in the column will be lost.

*/
-- AlterEnum
ALTER TYPE "PaymentMethodType" ADD VALUE 'SUBSCRIPTION';

-- AlterTable
ALTER TABLE "UserSubscription" DROP COLUMN "autoRenew";

-- AlterTable
ALTER TABLE "transactions" ADD COLUMN     "transactionType" "TransactionType" NOT NULL DEFAULT 'EVENT';
