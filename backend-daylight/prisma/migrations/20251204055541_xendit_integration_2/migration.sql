-- RenameForeignKey
ALTER TABLE "legacy_transactions" RENAME CONSTRAINT "Transaction_eventId_fkey" TO "legacy_transactions_eventId_fkey";

-- RenameForeignKey
ALTER TABLE "legacy_transactions" RENAME CONSTRAINT "Transaction_userId_fkey" TO "legacy_transactions_userId_fkey";
