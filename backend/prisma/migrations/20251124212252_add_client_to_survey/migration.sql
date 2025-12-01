-- AlterTable
ALTER TABLE "Survey" ADD COLUMN     "clientId" INTEGER;

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_clientId_fkey" FOREIGN KEY ("clientId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
