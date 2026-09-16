-- DropForeignKey
ALTER TABLE "meal_logs" DROP CONSTRAINT "meal_logs_mealId_fkey";

-- DropForeignKey
ALTER TABLE "meal_logs" DROP CONSTRAINT "meal_logs_userId_fkey";

-- DropForeignKey
ALTER TABLE "meal_suggestions" DROP CONSTRAINT "meal_suggestions_substituteForId_fkey";

-- DropForeignKey
ALTER TABLE "meals" DROP CONSTRAINT "meals_nutritionPlanId_fkey";

-- DropForeignKey
ALTER TABLE "meals" DROP CONSTRAINT "meals_suggestionId_fkey";

-- DropForeignKey
ALTER TABLE "nutrition_plans" DROP CONSTRAINT "nutrition_plans_workoutPlanId_fkey";

-- AlterTable
ALTER TABLE "admin_analytics_snapshots" DROP COLUMN "popularMealCategory";

-- DropTable
DROP TABLE "meal_logs";

-- DropTable
DROP TABLE "meal_suggestions";

-- DropTable
DROP TABLE "meals";

-- DropTable
DROP TABLE "nutrition_plans";

-- DropEnum
DROP TYPE "MealCategory";

-- DropEnum
DROP TYPE "MealType";
