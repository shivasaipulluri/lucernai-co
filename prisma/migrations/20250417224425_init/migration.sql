-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "full_name" TEXT,
    "is_premium" BOOLEAN NOT NULL DEFAULT false,
    "daily_reset_date" TIMESTAMP(3),
    "daily_basic_tailorings_used" INTEGER NOT NULL DEFAULT 0,
    "daily_personalized_tailorings_used" INTEGER NOT NULL DEFAULT 0,
    "daily_aggressive_tailorings_used" INTEGER NOT NULL DEFAULT 0,
    "daily_cover_letters_used" INTEGER NOT NULL DEFAULT 0,
    "daily_linkedin_optimizations_used" INTEGER NOT NULL DEFAULT 0,
    "daily_interview_sessions_used" INTEGER NOT NULL DEFAULT 0,
    "analytics_time_range" TEXT,
    "analytics_view_mode" TEXT,
    "resume_template" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resumes" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_text" TEXT NOT NULL,
    "job_description" TEXT NOT NULL,
    "modified_resume" TEXT,
    "tailoring_mode" TEXT NOT NULL,
    "version" INTEGER NOT NULL DEFAULT 1,
    "ats_score" INTEGER,
    "jd_score" INTEGER,
    "golden_passed" BOOLEAN NOT NULL DEFAULT false,
    "is_refinement" BOOLEAN NOT NULL DEFAULT false,
    "is_saved" BOOLEAN NOT NULL DEFAULT false,
    "original_resume_id" TEXT,
    "was_manually_edited" BOOLEAN NOT NULL DEFAULT false,
    "scores_stale" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "event_type" TEXT NOT NULL,
    "resume_text" TEXT,
    "job_description" TEXT,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "analytics_events" (
    "id" TEXT NOT NULL,
    "user_id" TEXT,
    "event_type" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "analytics_events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tailoring_analytics" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "tailoring_mode" TEXT NOT NULL,
    "iterations" INTEGER NOT NULL,
    "ats_score" INTEGER NOT NULL,
    "jd_score" INTEGER NOT NULL,
    "golden_passed" BOOLEAN NOT NULL,
    "is_refinement" BOOLEAN NOT NULL DEFAULT false,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tailoring_analytics_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "scrubbed_resumes" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "clean_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "scrubbed_resumes_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "prompt_archives" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "response" TEXT NOT NULL,
    "metadata" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "prompt_archives_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_interactions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_interactions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_tags" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "tag" TEXT NOT NULL,

    CONSTRAINT "resume_tags_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_metadata" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "content_snippet" TEXT NOT NULL,
    "tailoring_mode" TEXT NOT NULL,
    "iterations" INTEGER NOT NULL,
    "passed_rules" BOOLEAN NOT NULL,
    "ats_score" INTEGER NOT NULL,
    "jd_score" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_metadata_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tailoring_prompts" (
    "id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "tailoring_mode" TEXT NOT NULL,
    "prompt" TEXT NOT NULL,
    "attempt" INTEGER NOT NULL,
    "version" INTEGER NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tailoring_prompts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tailoring_progress" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "progress" INTEGER NOT NULL,
    "current_attempt" INTEGER,
    "max_attempts" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "tailoring_progress_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "tailoring_attempts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "attempt_number" INTEGER NOT NULL,
    "ats_score" INTEGER NOT NULL,
    "jd_score" INTEGER NOT NULL,
    "golden_passed" BOOLEAN NOT NULL,
    "feedback" TEXT NOT NULL,
    "suggestions" TEXT NOT NULL,
    "ats_feedback" TEXT,
    "jd_feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "tailoring_attempts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_feedback" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "feedback_type" TEXT NOT NULL,
    "feedback_points" TEXT[],
    "source_version" INTEGER,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_feedback_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manual_edits" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "edited_text" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manual_edits_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "manual_scorings" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "ats_score" INTEGER NOT NULL,
    "jd_score" INTEGER NOT NULL,
    "ats_feedback" TEXT,
    "jd_feedback" TEXT,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "manual_scorings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "cover_letters" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "job_description" TEXT NOT NULL,
    "content" TEXT NOT NULL,
    "tone" TEXT NOT NULL DEFAULT 'professional',
    "ats_score" INTEGER,
    "jd_score" INTEGER,
    "version" INTEGER NOT NULL DEFAULT 1,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "cover_letters_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "linkedin_optimizations" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_description" TEXT NOT NULL,
    "original_about" TEXT NOT NULL,
    "optimized_about" TEXT NOT NULL,
    "tone" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "linkedin_optimizations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "interview_sessions" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "job_description" TEXT NOT NULL,
    "selected_types" TEXT[],
    "questions" JSONB NOT NULL,
    "answers" JSONB,
    "needs_review" JSONB,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updated_at" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "interview_sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "resume_exports" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT NOT NULL,
    "template_id" TEXT NOT NULL,
    "format" TEXT NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "resume_exports_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "job_description_intelligence" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "resume_id" TEXT,
    "role" TEXT NOT NULL,
    "seniority" TEXT NOT NULL,
    "keywords" TEXT[],
    "responsibilities" TEXT[],
    "qualifications" TEXT[],
    "categories" JSONB NOT NULL,
    "created_at" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "job_description_intelligence_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "resumes_user_id_idx" ON "resumes"("user_id");

-- CreateIndex
CREATE INDEX "tailoring_analytics_user_id_idx" ON "tailoring_analytics"("user_id");

-- CreateIndex
CREATE INDEX "tailoring_analytics_resume_id_idx" ON "tailoring_analytics"("resume_id");

-- CreateIndex
CREATE UNIQUE INDEX "scrubbed_resumes_resume_id_key" ON "scrubbed_resumes"("resume_id");

-- CreateIndex
CREATE INDEX "resume_tags_user_id_idx" ON "resume_tags"("user_id");

-- CreateIndex
CREATE INDEX "resume_tags_resume_id_idx" ON "resume_tags"("resume_id");

-- CreateIndex
CREATE UNIQUE INDEX "resume_metadata_resume_id_key" ON "resume_metadata"("resume_id");

-- CreateIndex
CREATE INDEX "tailoring_progress_user_id_idx" ON "tailoring_progress"("user_id");

-- CreateIndex
CREATE INDEX "tailoring_progress_resume_id_idx" ON "tailoring_progress"("resume_id");

-- CreateIndex
CREATE UNIQUE INDEX "tailoring_progress_resume_id_user_id_key" ON "tailoring_progress"("resume_id", "user_id");

-- CreateIndex
CREATE INDEX "tailoring_attempts_user_id_idx" ON "tailoring_attempts"("user_id");

-- CreateIndex
CREATE INDEX "tailoring_attempts_resume_id_idx" ON "tailoring_attempts"("resume_id");

-- CreateIndex
CREATE INDEX "resume_feedback_user_id_idx" ON "resume_feedback"("user_id");

-- CreateIndex
CREATE INDEX "resume_feedback_resume_id_idx" ON "resume_feedback"("resume_id");

-- CreateIndex
CREATE INDEX "manual_edits_user_id_idx" ON "manual_edits"("user_id");

-- CreateIndex
CREATE INDEX "manual_edits_resume_id_idx" ON "manual_edits"("resume_id");

-- CreateIndex
CREATE INDEX "manual_scorings_user_id_idx" ON "manual_scorings"("user_id");

-- CreateIndex
CREATE INDEX "manual_scorings_resume_id_idx" ON "manual_scorings"("resume_id");

-- CreateIndex
CREATE INDEX "cover_letters_user_id_idx" ON "cover_letters"("user_id");

-- CreateIndex
CREATE INDEX "cover_letters_resume_id_idx" ON "cover_letters"("resume_id");

-- CreateIndex
CREATE INDEX "linkedin_optimizations_user_id_idx" ON "linkedin_optimizations"("user_id");

-- CreateIndex
CREATE INDEX "interview_sessions_user_id_idx" ON "interview_sessions"("user_id");

-- CreateIndex
CREATE INDEX "resume_exports_user_id_idx" ON "resume_exports"("user_id");

-- CreateIndex
CREATE INDEX "resume_exports_resume_id_idx" ON "resume_exports"("resume_id");

-- CreateIndex
CREATE INDEX "job_description_intelligence_user_id_idx" ON "job_description_intelligence"("user_id");

-- CreateIndex
CREATE INDEX "job_description_intelligence_resume_id_idx" ON "job_description_intelligence"("resume_id");

-- AddForeignKey
ALTER TABLE "resumes" ADD CONSTRAINT "resumes_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tailoring_analytics" ADD CONSTRAINT "tailoring_analytics_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tailoring_analytics" ADD CONSTRAINT "tailoring_analytics_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "scrubbed_resumes" ADD CONSTRAINT "scrubbed_resumes_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "prompt_archives" ADD CONSTRAINT "prompt_archives_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_interactions" ADD CONSTRAINT "resume_interactions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_interactions" ADD CONSTRAINT "resume_interactions_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_tags" ADD CONSTRAINT "resume_tags_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_tags" ADD CONSTRAINT "resume_tags_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_metadata" ADD CONSTRAINT "resume_metadata_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_metadata" ADD CONSTRAINT "resume_metadata_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tailoring_prompts" ADD CONSTRAINT "tailoring_prompts_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tailoring_progress" ADD CONSTRAINT "tailoring_progress_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "tailoring_attempts" ADD CONSTRAINT "tailoring_attempts_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_feedback" ADD CONSTRAINT "resume_feedback_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_edits" ADD CONSTRAINT "manual_edits_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "manual_scorings" ADD CONSTRAINT "manual_scorings_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cover_letters" ADD CONSTRAINT "cover_letters_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "cover_letters" ADD CONSTRAINT "cover_letters_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "linkedin_optimizations" ADD CONSTRAINT "linkedin_optimizations_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "interview_sessions" ADD CONSTRAINT "interview_sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_exports" ADD CONSTRAINT "resume_exports_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "resume_exports" ADD CONSTRAINT "resume_exports_resume_id_fkey" FOREIGN KEY ("resume_id") REFERENCES "resumes"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "job_description_intelligence" ADD CONSTRAINT "job_description_intelligence_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
