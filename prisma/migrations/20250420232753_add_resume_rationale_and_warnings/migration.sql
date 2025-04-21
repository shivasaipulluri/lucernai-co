-- AlterTable
ALTER TABLE "resumes" ADD COLUMN     "ats_warnings" TEXT;

-- CreateTable
CREATE TABLE "resume_section_rationales" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "section_name" TEXT NOT NULL,
    "rationale" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_section_rationales_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "resume_section_rationales_user_id_idx" ON "resume_section_rationales"("user_id");

-- CreateIndex
CREATE INDEX "resume_section_rationales_resume_id_idx" ON "resume_section_rationales"("resume_id");

-- CreateIndex
CREATE UNIQUE INDEX "resume_section_rationales_resume_id_section_name_key" ON "resume_section_rationales"("resume_id", "section_name");

-- AddForeignKey
ALTER TABLE "resume_section_rationales" ADD CONSTRAINT "resume_section_rationales_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_section_rationales" ADD CONSTRAINT "resume_section_rationales_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
