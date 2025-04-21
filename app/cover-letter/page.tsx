import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { CoverLetterClient } from "@/components/cover-letter/cover-letter-client"
import { redirect } from "next/navigation"

// Ensure we're using the same type in both files

type ResumeForCoverLetter = {
  id: string
  jobDescription: string
  version: number
  tailoringMode?: string
  createdAt: string | Date
}

export const metadata = {
  title: "Cover Letter Generator | Lucerna AI",
  description: "Generate a tailored cover letter based on your resume and job description",
}

async function getUserResumes() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get all user's resumes with tailored content
    const resumes = await prisma.resume.findMany({
      where: {
        userId: user.id,
        modifiedResume: {
          not: null,
        },
      },
      orderBy: {
        createdAt: "desc",
      },
      select: {
        id: true,
        jobDescription: true,
        version: true,
        tailoringMode: true,
        createdAt: true,
      },
    })

    return { success: true, data: resumes }
  } catch (error) {
    console.error("Error fetching user resumes:", error)
    return { success: false, error: "Failed to fetch resumes" }
  }
}

export default async function CoverLetterPage({
  searchParams,
}: {
  searchParams: { resumeId?: string; jobDescription?: string }
}) {
  const resumeResult = await getUserResumes()

  // If not authenticated, redirect to auth page
  if (!resumeResult.success && resumeResult.error === "Not authenticated") {
    redirect("/auth")
  }

  // Await searchParams to ensure it's fully resolved
  const params = await searchParams;

  // Get the resumeId and jobDescription from the query parameters
  const resumeId = params.resumeId;
  const jobDescription = params.jobDescription;

  // Later in the file, when passing data to the component:
  const resumes: ResumeForCoverLetter[] =
    resumeResult.success && Array.isArray(resumeResult.data) ? resumeResult.data : []

  return <CoverLetterClient resumes={resumes} initialResumeId={resumeId} initialJobDescription={jobDescription} />
}
