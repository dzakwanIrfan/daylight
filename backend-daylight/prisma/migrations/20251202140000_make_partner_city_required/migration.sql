-- After migration script has assigned cityId to all partners
-- Now make cityId required (NOT NULL)

-- First, verify no partners have null cityId
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM "Partner" WHERE "cityId" IS NULL) THEN
    RAISE EXCEPTION 'Cannot make cityId NOT NULL: Some partners still have null cityId. Run migrate-partner-cities-fix.ts first!';
  END IF;
END $$;

-- Make cityId NOT NULL
ALTER TABLE "Partner" ALTER COLUMN "cityId" SET NOT NULL;
