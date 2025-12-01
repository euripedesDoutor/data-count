-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SUPERVISOR', 'INTERVIEWER', 'CLIENT');

-- CreateEnum
CREATE TYPE "QuestionType" AS ENUM ('TEXT', 'SINGLE_CHOICE', 'MULTIPLE_CHOICE');

-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "role" "Role" NOT NULL DEFAULT 'INTERVIEWER',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Survey" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "createdById" INTEGER NOT NULL,

    CONSTRAINT "Survey_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Question" (
    "id" SERIAL NOT NULL,
    "text" TEXT NOT NULL,
    "type" "QuestionType" NOT NULL,
    "options" JSONB,
    "order" INTEGER NOT NULL,
    "surveyId" INTEGER NOT NULL,

    CONSTRAINT "Question_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Response" (
    "id" SERIAL NOT NULL,
    "surveyId" INTEGER NOT NULL,
    "interviewerId" INTEGER NOT NULL,
    "location" JSONB NOT NULL,
    "data" JSONB NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Response_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- AddForeignKey
ALTER TABLE "Survey" ADD CONSTRAINT "Survey_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Question" ADD CONSTRAINT "Question_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_surveyId_fkey" FOREIGN KEY ("surveyId") REFERENCES "Survey"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Response" ADD CONSTRAINT "Response_interviewerId_fkey" FOREIGN KEY ("interviewerId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
