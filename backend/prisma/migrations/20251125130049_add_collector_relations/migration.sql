-- AlterTable
ALTER TABLE "User" ADD COLUMN     "managerId" INTEGER;

-- CreateTable
CREATE TABLE "_SurveyCollectors" (
    "A" INTEGER NOT NULL,
    "B" INTEGER NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "_SurveyCollectors_AB_unique" ON "_SurveyCollectors"("A", "B");

-- CreateIndex
CREATE INDEX "_SurveyCollectors_B_index" ON "_SurveyCollectors"("B");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_managerId_fkey" FOREIGN KEY ("managerId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SurveyCollectors" ADD CONSTRAINT "_SurveyCollectors_A_fkey" FOREIGN KEY ("A") REFERENCES "Survey"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_SurveyCollectors" ADD CONSTRAINT "_SurveyCollectors_B_fkey" FOREIGN KEY ("B") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
