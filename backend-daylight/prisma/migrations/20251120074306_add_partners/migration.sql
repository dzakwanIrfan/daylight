-- CreateEnum
CREATE TYPE "PartnerType" AS ENUM ('RESTAURANT', 'ART_GALLERY', 'CAFE', 'BRAND', 'COMMUNITY', 'VENUE', 'SHOP');

-- CreateEnum
CREATE TYPE "PartnerStatus" AS ENUM ('PENDING', 'ACTIVE', 'INACTIVE', 'REJECTED');

-- AlterTable
ALTER TABLE "Event" ADD COLUMN     "partnerId" TEXT;

-- CreateTable
CREATE TABLE "Partner" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "type" "PartnerType" NOT NULL,
    "description" TEXT,
    "shortDescription" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "phoneNumber" TEXT,
    "email" TEXT,
    "website" TEXT,
    "googleMapsUrl" TEXT,
    "latitude" DOUBLE PRECISION,
    "longitude" DOUBLE PRECISION,
    "logo" TEXT,
    "coverImage" TEXT,
    "gallery" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "PartnerStatus" NOT NULL DEFAULT 'PENDING',
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "isPreferred" BOOLEAN NOT NULL DEFAULT false,
    "isFeatured" BOOLEAN NOT NULL DEFAULT false,
    "operatingHours" JSONB,
    "instagram" TEXT,
    "facebook" TEXT,
    "twitter" TEXT,
    "tags" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "amenities" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "totalEvents" INTEGER NOT NULL DEFAULT 0,
    "viewCount" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Partner_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Partner_slug_key" ON "Partner"("slug");

-- CreateIndex
CREATE INDEX "Partner_slug_idx" ON "Partner"("slug");

-- CreateIndex
CREATE INDEX "Partner_type_idx" ON "Partner"("type");

-- CreateIndex
CREATE INDEX "Partner_city_idx" ON "Partner"("city");

-- CreateIndex
CREATE INDEX "Partner_status_idx" ON "Partner"("status");

-- CreateIndex
CREATE INDEX "Partner_isPreferred_idx" ON "Partner"("isPreferred");

-- CreateIndex
CREATE INDEX "Partner_isActive_idx" ON "Partner"("isActive");

-- AddForeignKey
ALTER TABLE "Event" ADD CONSTRAINT "Event_partnerId_fkey" FOREIGN KEY ("partnerId") REFERENCES "Partner"("id") ON DELETE SET NULL ON UPDATE CASCADE;
