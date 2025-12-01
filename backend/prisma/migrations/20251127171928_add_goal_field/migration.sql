-- CreateEnum
CREATE TYPE "SurveyStatus" AS ENUM ('AT', 'IN');

-- AlterTable
ALTER TABLE "Survey" ADD COLUMN     "goal" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "goalPerCollector" INTEGER NOT NULL DEFAULT 0,
ADD COLUMN     "status" "SurveyStatus" NOT NULL DEFAULT 'IN';

-- AlterTable
ALTER TABLE "User" ADD COLUMN     "mustChangePassword" BOOLEAN NOT NULL DEFAULT false;
