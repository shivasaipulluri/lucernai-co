-- AlterTable
ALTER TABLE "tailoring_attempts" ADD COLUMN     "iteration" INTEGER,
ADD COLUMN     "modified_sections" TEXT,
ADD COLUMN     "score" INTEGER;
