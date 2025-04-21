-- AlterTable
ALTER TABLE "tailoring_attempts" ADD COLUMN     "modifiedSectionsReceived" TEXT,
ADD COLUMN     "modifiedSectionsSent" TEXT,
ADD COLUMN     "promptTokens" INTEGER;
