-- AlterEnum
ALTER TYPE "Role" ADD VALUE 'COACH';

-- CreateTable
CREATE TABLE "coach_assignments" (
    "id" TEXT NOT NULL,
    "coachId" TEXT NOT NULL,
    "clientId" TEXT NOT NULL,
    "active" BOOLEAN NOT NULL DEFAULT true,
    "assignedById" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "coach_assignments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "coach_assignments_clientId_key" ON "coach_assignments"("clientId");

-- CreateIndex
CREATE INDEX "coach_assignments_coachId_active_idx" ON "coach_assignments"("coachId", "active");

-- AddForeignKey
ALTER TABLE "coach_assignments" ADD CONSTRAINT "coach_assignments_coachId_fkey" FOREIGN KEY ("coachId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "coach_assignments" ADD CONSTRAINT "coach_assignments_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
