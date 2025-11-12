-- CreateEnum
CREATE TYPE "AuthProvider" AS ENUM ('LOCAL', 'GOOGLE');

-- CreateEnum
CREATE TYPE "RelationshipStatus" AS ENUM ('SINGLE', 'MARRIED', 'PREFER_NOT_SAY');

-- CreateEnum
CREATE TYPE "GenderMixComfort" AS ENUM ('TOTALLY_FINE', 'PREFER_SAME_GENDER', 'DEPENDS');

-- CreateEnum
CREATE TYPE "PersonalityArchetype" AS ENUM ('BRIGHT_MORNING', 'CALM_DAWN', 'BOLD_NOON', 'GOLDEN_HOUR', 'QUIET_DUSK', 'CLOUDY_DAY', 'SERENE_DRIZZLE', 'BLAZING_NOON', 'STARRY_NIGHT', 'PERFECT_DAY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT,
    "firstName" TEXT,
    "lastName" TEXT,
    "phoneNumber" TEXT,
    "profilePicture" TEXT,
    "provider" "AuthProvider" NOT NULL DEFAULT 'LOCAL',
    "googleId" TEXT,
    "isEmailVerified" BOOLEAN NOT NULL DEFAULT false,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "resetPasswordToken" TEXT,
    "resetPasswordExpires" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PersonalityResult" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "sessionId" TEXT,
    "energyRaw" DOUBLE PRECISION NOT NULL,
    "opennessRaw" DOUBLE PRECISION NOT NULL,
    "structureRaw" DOUBLE PRECISION NOT NULL,
    "affectRaw" DOUBLE PRECISION NOT NULL,
    "comfortRaw" DOUBLE PRECISION NOT NULL,
    "lifestyleRaw" DOUBLE PRECISION NOT NULL,
    "energyScore" DOUBLE PRECISION NOT NULL,
    "opennessScore" DOUBLE PRECISION NOT NULL,
    "structureScore" DOUBLE PRECISION NOT NULL,
    "affectScore" DOUBLE PRECISION NOT NULL,
    "comfortScore" DOUBLE PRECISION NOT NULL,
    "lifestyleScore" DOUBLE PRECISION NOT NULL,
    "profileScore" DOUBLE PRECISION NOT NULL,
    "archetype" "PersonalityArchetype" NOT NULL,
    "relationshipStatus" "RelationshipStatus",
    "intentOnDaylight" TEXT[],
    "genderMixComfort" "GenderMixComfort",
    "answers" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PersonalityResult_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" TEXT NOT NULL,
    "questionNumber" INTEGER NOT NULL,
    "section" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "order" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuestionOption" (
    "id" TEXT NOT NULL,
    "questionId" TEXT NOT NULL,
    "optionKey" TEXT NOT NULL,
    "text" TEXT NOT NULL,
    "traitImpacts" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "User_googleId_key" ON "User"("googleId");

-- CreateIndex
CREATE INDEX "User_email_idx" ON "User"("email");

-- CreateIndex
CREATE INDEX "User_googleId_idx" ON "User"("googleId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalityResult_userId_key" ON "PersonalityResult"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "PersonalityResult_sessionId_key" ON "PersonalityResult"("sessionId");

-- CreateIndex
CREATE INDEX "PersonalityResult_sessionId_idx" ON "PersonalityResult"("sessionId");

-- CreateIndex
CREATE INDEX "PersonalityResult_userId_idx" ON "PersonalityResult"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "Question_questionNumber_key" ON "Question"("questionNumber");

-- CreateIndex
CREATE INDEX "Question_questionNumber_idx" ON "Question"("questionNumber");

-- CreateIndex
CREATE INDEX "Question_order_idx" ON "Question"("order");

-- CreateIndex
CREATE UNIQUE INDEX "QuestionOption_questionId_optionKey_key" ON "QuestionOption"("questionId", "optionKey");

-- AddForeignKey
ALTER TABLE "PersonalityResult" ADD CONSTRAINT "PersonalityResult_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuestionOption" ADD CONSTRAINT "QuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "Question"("id") ON DELETE CASCADE ON UPDATE CASCADE;
