-- CreateTable
CREATE TABLE "nutrition_plans" (
    "id" TEXT NOT NULL,
    "workoutPlanId" TEXT NOT NULL,
    "calories" INTEGER NOT NULL,
    "proteinGrams" INTEGER NOT NULL,
    "carbsGrams" INTEGER NOT NULL,
    "fatGrams" INTEGER NOT NULL,
    "sodiumMg" INTEGER NOT NULL,
    "waterLiters" DOUBLE PRECISION NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "nutrition_plans_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "nutrition_plans_workoutPlanId_key" ON "nutrition_plans"("workoutPlanId");

-- AddForeignKey
ALTER TABLE "nutrition_plans" ADD CONSTRAINT "nutrition_plans_workoutPlanId_fkey" FOREIGN KEY ("workoutPlanId") REFERENCES "workout_plans"("id") ON DELETE CASCADE ON UPDATE CASCADE;
