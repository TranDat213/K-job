/*
  Warnings:

  - You are about to drop the column `userId` on the `job_templates` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('ADMIN', 'USER');

-- CreateEnum
CREATE TYPE "JobTemplateScope" AS ENUM ('SYSTEM', 'USER');

-- DropForeignKey
ALTER TABLE "job_templates" DROP CONSTRAINT "job_templates_userId_fkey";

-- DropIndex
DROP INDEX "job_templates_userId_idx";

-- AlterTable
ALTER TABLE "job_templates" DROP COLUMN "userId",
ADD COLUMN     "isActive" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "ownerId" TEXT,
ADD COLUMN     "scope" "JobTemplateScope" NOT NULL DEFAULT 'USER';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "role" "UserRole" NOT NULL DEFAULT 'USER';

-- CreateIndex
CREATE INDEX "job_templates_ownerId_idx" ON "job_templates"("ownerId");

-- CreateIndex
CREATE INDEX "job_templates_scope_idx" ON "job_templates"("scope");

-- CreateIndex
CREATE INDEX "job_templates_isActive_idx" ON "job_templates"("isActive");

-- AddForeignKey
ALTER TABLE "job_templates" ADD CONSTRAINT "job_templates_ownerId_fkey" FOREIGN KEY ("ownerId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;
