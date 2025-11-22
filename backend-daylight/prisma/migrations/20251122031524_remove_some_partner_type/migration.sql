/*
  Warnings:

  - The values [RESTAURANT,ART_GALLERY,CAFE,VENUE,SHOP] on the enum `PartnerType` will be removed. If these variants are still used in the database, this will fail.

*/
-- AlterEnum
BEGIN;
CREATE TYPE "PartnerType_new" AS ENUM ('BRAND', 'COMMUNITY');
ALTER TABLE "Partner" ALTER COLUMN "type" TYPE "PartnerType_new" USING ("type"::text::"PartnerType_new");
ALTER TYPE "PartnerType" RENAME TO "PartnerType_old";
ALTER TYPE "PartnerType_new" RENAME TO "PartnerType";
DROP TYPE "public"."PartnerType_old";
COMMIT;
