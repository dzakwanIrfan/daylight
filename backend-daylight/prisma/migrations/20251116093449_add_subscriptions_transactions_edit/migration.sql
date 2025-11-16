-- AlterTable
ALTER TABLE "Transaction" ALTER COLUMN "eventId" DROP NOT NULL;

-- CreateIndex
CREATE INDEX "Transaction_transactionType_idx" ON "Transaction"("transactionType");
