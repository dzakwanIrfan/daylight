-- CreateTable
CREATE TABLE "ArchetypeDetail" (
    "id" TEXT NOT NULL,
    "archetype" "PersonalityArchetype" NOT NULL,
    "symbol" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "traits" TEXT[],
    "description" TEXT NOT NULL,
    "imageKey" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "ArchetypeDetail_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "ArchetypeDetail_archetype_key" ON "ArchetypeDetail"("archetype");

-- CreateIndex
CREATE INDEX "ArchetypeDetail_archetype_idx" ON "ArchetypeDetail"("archetype");
