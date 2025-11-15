-- CreateEnum
CREATE TYPE "PaymentStatus" AS ENUM ('PENDING', 'PAID', 'FAILED', 'EXPIRED', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PaymentMethod" AS ENUM ('MYBVA', 'BRIVA', 'BNIVA', 'BSIVA', 'MANDIRIVA', 'PERMATAVA', 'QRIS', 'ALFAMART', 'INDOMARET', 'OVO', 'DANA', 'SHOPEEPAY');

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "eventId" TEXT NOT NULL,
    "tripayReference" TEXT NOT NULL,
    "merchantRef" TEXT NOT NULL,
    "paymentMethod" TEXT NOT NULL,
    "paymentName" TEXT NOT NULL,
    "paymentStatus" "PaymentStatus" NOT NULL DEFAULT 'PENDING',
    "amount" DOUBLE PRECISION NOT NULL,
    "feeMerchant" DOUBLE PRECISION NOT NULL,
    "feeCustomer" DOUBLE PRECISION NOT NULL,
    "totalFee" DOUBLE PRECISION NOT NULL,
    "amountReceived" DOUBLE PRECISION NOT NULL,
    "payCode" TEXT,
    "payUrl" TEXT,
    "checkoutUrl" TEXT NOT NULL,
    "qrString" TEXT,
    "qrUrl" TEXT,
    "customerName" TEXT NOT NULL,
    "customerEmail" TEXT NOT NULL,
    "customerPhone" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 1,
    "paidAt" TIMESTAMP(3),
    "expiredAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "instructions" JSONB,
    "orderItems" JSONB NOT NULL,
    "callbackData" JSONB,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_tripayReference_key" ON "Transaction"("tripayReference");

-- CreateIndex
CREATE UNIQUE INDEX "Transaction_merchantRef_key" ON "Transaction"("merchantRef");

-- CreateIndex
CREATE INDEX "Transaction_userId_idx" ON "Transaction"("userId");

-- CreateIndex
CREATE INDEX "Transaction_eventId_idx" ON "Transaction"("eventId");

-- CreateIndex
CREATE INDEX "Transaction_tripayReference_idx" ON "Transaction"("tripayReference");

-- CreateIndex
CREATE INDEX "Transaction_merchantRef_idx" ON "Transaction"("merchantRef");

-- CreateIndex
CREATE INDEX "Transaction_paymentStatus_idx" ON "Transaction"("paymentStatus");

-- CreateIndex
CREATE INDEX "Transaction_expiredAt_idx" ON "Transaction"("expiredAt");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Event"("id") ON DELETE CASCADE ON UPDATE CASCADE;
