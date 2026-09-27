-- CreateEnum
CREATE TYPE "ChallengeMetric" AS ENUM ('WORKOUTS_COMPLETED', 'WATER_GOAL_HITS', 'PROTEIN_GOAL_HITS', 'LOG_STREAK');

-- CreateEnum
CREATE TYPE "ChallengeInviteStatus" AS ENUM ('ACTIVE', 'EXPIRED');

-- CreateEnum
CREATE TYPE "ChallengeParticipantStatus" AS ENUM ('INVITED', 'ACCEPTED', 'DECLINED');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'CHALLENGE_INVITE';
ALTER TYPE "NotificationType" ADD VALUE 'CHALLENGE_COMPLETED';

-- AlterEnum
ALTER TYPE "XpSource" ADD VALUE 'CHALLENGE_COMPLETE';

-- CreateTable
CREATE TABLE "challenges" (
    "id" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "icon" TEXT NOT NULL,
    "metric" "ChallengeMetric" NOT NULL,
    "targetValue" INTEGER NOT NULL,
    "periodDays" INTEGER NOT NULL DEFAULT 7,
    "xpReward" INTEGER NOT NULL DEFAULT 100,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "challenges_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_invites" (
    "id" TEXT NOT NULL,
    "challengeId" TEXT NOT NULL,
    "createdByUserId" TEXT NOT NULL,
    "periodStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "periodEnd" TIMESTAMP(3) NOT NULL,
    "status" "ChallengeInviteStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_invites_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "challenge_participants" (
    "id" TEXT NOT NULL,
    "challengeInviteId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "status" "ChallengeParticipantStatus" NOT NULL DEFAULT 'INVITED',
    "progressValue" INTEGER NOT NULL DEFAULT 0,
    "completedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "challenge_participants_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "challenge_invites_createdByUserId_idx" ON "challenge_invites"("createdByUserId");

-- CreateIndex
CREATE INDEX "challenge_invites_status_periodEnd_idx" ON "challenge_invites"("status", "periodEnd");

-- CreateIndex
CREATE INDEX "challenge_participants_userId_idx" ON "challenge_participants"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "challenge_participants_challengeInviteId_userId_key" ON "challenge_participants"("challengeInviteId", "userId");

-- AddForeignKey
ALTER TABLE "challenge_invites" ADD CONSTRAINT "challenge_invites_challengeId_fkey" FOREIGN KEY ("challengeId") REFERENCES "challenges"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_invites" ADD CONSTRAINT "challenge_invites_createdByUserId_fkey" FOREIGN KEY ("createdByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_challengeInviteId_fkey" FOREIGN KEY ("challengeInviteId") REFERENCES "challenge_invites"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "challenge_participants" ADD CONSTRAINT "challenge_participants_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

