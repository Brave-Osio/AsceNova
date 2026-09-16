-- AlterTable
ALTER TABLE "profiles" DROP COLUMN "foodAllergies",
DROP COLUMN "foodPreference",
DROP COLUMN "medicalRestrictions";

-- DropEnum
DROP TYPE "FoodPreference";
