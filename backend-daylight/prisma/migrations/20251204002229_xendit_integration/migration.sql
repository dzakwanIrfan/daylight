-- Rename existing tables
ALTER TABLE "PaymentMethod" RENAME TO "legacy_payment_methods";
ALTER TABLE "Transaction" RENAME TO "legacy_transactions";

-- Rename Primary Keys
ALTER INDEX "PaymentMethod_pkey" RENAME TO "legacy_payment_methods_pkey";
ALTER INDEX "Transaction_pkey" RENAME TO "legacy_transactions_pkey";

-- Rename Indexes to match legacy model mapping
ALTER INDEX "PaymentMethod_code_key" RENAME TO "legacy_payment_methods_code_key";
ALTER INDEX "PaymentMethod_code_idx" RENAME TO "legacy_payment_methods_code_idx";
ALTER INDEX "PaymentMethod_group_idx" RENAME TO "legacy_payment_methods_group_idx";
ALTER INDEX "PaymentMethod_isActive_idx" RENAME TO "legacy_payment_methods_isActive_idx";
ALTER INDEX "PaymentMethod_sortOrder_idx" RENAME TO "legacy_payment_methods_sortOrder_idx";

ALTER INDEX "Transaction_tripayReference_key" RENAME TO "legacy_transactions_tripayReference_key";
ALTER INDEX "Transaction_merchantRef_key" RENAME TO "legacy_transactions_merchantRef_key";
ALTER INDEX "Transaction_userId_idx" RENAME TO "legacy_transactions_userId_idx";
ALTER INDEX "Transaction_eventId_idx" RENAME TO "legacy_transactions_eventId_idx";
ALTER INDEX "Transaction_tripayReference_idx" RENAME TO "legacy_transactions_tripayReference_idx";
ALTER INDEX "Transaction_merchantRef_idx" RENAME TO "legacy_transactions_merchantRef_idx";
ALTER INDEX "Transaction_paymentMethodCode_idx" RENAME TO "legacy_transactions_paymentMethodCode_idx";
ALTER INDEX "Transaction_paymentStatus_idx" RENAME TO "legacy_transactions_paymentStatus_idx";
ALTER INDEX "Transaction_createdAt_idx" RENAME TO "legacy_transactions_createdAt_idx";
ALTER INDEX "Transaction_transactionType_idx" RENAME TO "legacy_transactions_transactionType_idx";

-- Create Enums
CREATE TYPE "PaymentMethodType" AS ENUM ('BANK_TRANSFER', 'CARDS', 'EWALLET', 'ONLINE_BANKING', 'OVER_THE_COUNTER', 'PAYLATER', 'QR_CODE');
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED');

-- Create New Tables
CREATE TABLE "PaymentMethod" (
    "id" TEXT NOT NULL,
    "code" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "countryCode" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "minAmount" DECIMAL(19,4) NOT NULL,
    "maxAmount" DECIMAL(19,4) NOT NULL,
    "type" "PaymentMethodType" NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "adminFeeRate" DECIMAL(10,4) NOT NULL,
    "adminFeeFixed" DECIMAL(19,4) NOT NULL,
    "logoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentMethod_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT,
    "paymentMethodId" TEXT NOT NULL,
    "externalId" TEXT NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DECIMAL(19,4) NOT NULL,
    "totalFee" DECIMAL(19,4) NOT NULL,
    "finalAmount" DECIMAL(19,4) NOT NULL,
    "paymentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- Create Indexes for New Tables
CREATE UNIQUE INDEX "PaymentMethod_code_key" ON "PaymentMethod"("code");
CREATE INDEX "PaymentMethod_countryCode_idx" ON "PaymentMethod"("countryCode");
CREATE INDEX "PaymentMethod_isActive_idx" ON "PaymentMethod"("isActive");
CREATE INDEX "PaymentMethod_code_idx" ON "PaymentMethod"("code");

CREATE UNIQUE INDEX "Transaction_externalId_key" ON "Transaction"("externalId");
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");
CREATE INDEX "Transaction_externalId_idx" ON "Transaction"("externalId");
CREATE INDEX "Transaction_status_idx" ON "Transaction"("status");

-- Add Foreign Keys for New Tables
ALTER TABLE "PaymentMethod" ADD CONSTRAINT "PaymentMethod_countryCode_fkey" FOREIGN KEY ("countryCode") REFERENCES "Country"("code") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paymentMethodId_fkey" FOREIGN KEY ("paymentMethodId") REFERENCES "PaymentMethod"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- Update Relations in Other Tables
-- Add legacyTransactionId columns
ALTER TABLE "MatchingMember" ADD COLUMN "legacyTransactionId" TEXT;
ALTER TABLE "UserSubscription" ADD COLUMN "legacyTransactionId" TEXT;

-- Migrate data: Copy transactionId to legacyTransactionId
UPDATE "MatchingMember" SET "legacyTransactionId" = "transactionId";
UPDATE "UserSubscription" SET "legacyTransactionId" = "transactionId";

-- Drop old FK constraints (they point to legacy_transactions now because of table rename, but we want to clean up)
ALTER TABLE "MatchingMember" DROP CONSTRAINT "MatchingMember_transactionId_fkey";
ALTER TABLE "UserSubscription" DROP CONSTRAINT "UserSubscription_transactionId_fkey";

-- Clear transactionId (since it now refers to new Transaction table)
UPDATE "MatchingMember" SET "transactionId" = NULL;
UPDATE "UserSubscription" SET "transactionId" = NULL;

-- Make transactionId nullable (if not already, though it was required in some cases? No, it was unique. Let's check schema.)
-- In schema: transactionId String? @unique (UserSubscription), MatchingMember had transactionId String @unique (Required!)
-- Wait, MatchingMember had `transactionId String @unique`.
-- New schema: `transactionId String? @unique`.
-- So I need to alter column to drop not null.
ALTER TABLE "MatchingMember" ALTER COLUMN "transactionId" DROP NOT NULL;

-- Add Foreign Keys for Relations
ALTER TABLE "MatchingMember" ADD CONSTRAINT "MatchingMember_legacyTransactionId_fkey" FOREIGN KEY ("legacyTransactionId") REFERENCES "legacy_transactions"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "MatchingMember" ADD CONSTRAINT "MatchingMember_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_legacyTransactionId_fkey" FOREIGN KEY ("legacyTransactionId") REFERENCES "legacy_transactions"("id") ON DELETE SET NULL ON UPDATE CASCADE;
ALTER TABLE "UserSubscription" ADD CONSTRAINT "UserSubscription_transactionId_fkey" FOREIGN KEY ("transactionId") REFERENCES "Transaction"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- Add Unique Constraints
CREATE UNIQUE INDEX "MatchingMember_legacyTransactionId_key" ON "MatchingMember"("legacyTransactionId");
CREATE UNIQUE INDEX "UserSubscription_legacyTransactionId_key" ON "UserSubscription"("legacyTransactionId");
