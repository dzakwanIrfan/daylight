-- AlterTable
ALTER TABLE "Partner" ALTER COLUMN "cityId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "SubscriptionPlanPrice" (
    "id" TEXT NOT NULL,
    "subscriptionPlanId" TEXT NOT NULL,
    "currency" TEXT NOT NULL,
    "amount" DOUBLE PRECISION NOT NULL,
    "countryCode" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "SubscriptionPlanPrice_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "SubscriptionPlanPrice_subscriptionPlanId_idx" ON "SubscriptionPlanPrice"("subscriptionPlanId");

-- CreateIndex
CREATE INDEX "SubscriptionPlanPrice_currency_idx" ON "SubscriptionPlanPrice"("currency");

-- CreateIndex
CREATE INDEX "SubscriptionPlanPrice_countryCode_idx" ON "SubscriptionPlanPrice"("countryCode");

-- CreateIndex
CREATE INDEX "SubscriptionPlanPrice_isActive_idx" ON "SubscriptionPlanPrice"("isActive");

-- CreateIndex
CREATE UNIQUE INDEX "SubscriptionPlanPrice_subscriptionPlanId_currency_countryCo_key" ON "SubscriptionPlanPrice"("subscriptionPlanId", "currency", "countryCode");

-- AddForeignKey
ALTER TABLE "SubscriptionPlanPrice" ADD CONSTRAINT "SubscriptionPlanPrice_subscriptionPlanId_fkey" FOREIGN KEY ("subscriptionPlanId") REFERENCES "SubscriptionPlan"("id") ON DELETE CASCADE ON UPDATE CASCADE;
