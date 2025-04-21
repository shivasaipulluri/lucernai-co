import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { ResumeLabClient } from "@/components/resume/resume-lab-client"
import { redirect } from "next/navigation"
import { getTailoringProgress } from "@/lib/actions/tailoring-engine"
import type { Resume, TailoringProgress } from "@/lib/types"

export const dynamic = "force-dynamic"

export const metadata = {
  title: "Resume Lab | Lucerna AI",
  description: "View and refine your tailored resume",
}

async function getResume(id: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const resume = await prisma.resume.findUnique({
      where: {
        id,
        userId: user.id,
      },
      include: {
        tailoringAttempts: {
          orderBy: {
            attemptNumber: "desc",
          },
          take: 1,
        },
      },
    })

    if (!resume) {
      return { success: false, error: "Resume not found" }
    }

    // Get the tailoring progress
    const progress = await getTailoringProgress(id)

    // Get version history
    let versionHistory: any[] = []

    // If this is a refinement or has a version > 1, fetch the version history
    if (resume.isRefinement || resume.version > 1) {
      // If we have an original resume ID, use that to find all versions
      const originalId = resume.originalResumeId || id

      // Find all resumes with the same original ID or that are the original
      versionHistory = await prisma.resume.findMany({
        where: {
          OR: [{ id: originalId }, { originalResumeId: originalId }],
          userId: user.id,
        },
        select: {
          id: true,
          version: true,
          atsScore: true,
          jdScore: true,
          goldenPassed: true,
          createdAt: true,
        },
        orderBy: {
          version: "asc",
        },
      })
    }

    return {
      success: true,
      data: resume,
      progress,
      versionHistory,
    }
  } catch (error) {
    console.error("Error fetching resume:", error)
    return { success: false, error: "Failed to fetch resume" }
  }
}

export default async function ResumePage({ params }: { params: { id: string } }) {
  const { id } = await params
  const result = await getResume(id)

  if (!result.success) {
    redirect("/dashboard")
  }

  // Convert the Prisma resume object to the expected Resume type
  // We need to convert Date objects to strings
  const resumeData: Resume = {
    ...result.data,
    createdAt: result.data?.createdAt.toISOString(),
    updatedAt: result.data?.updatedAt.toISOString(),
    // Convert tailoringAttempts if they exist
    tailoringAttempts: result.data?.tailoringAttempts?.map((attempt) => ({
      ...attempt,
      createdAt: attempt.createdAt.toISOString(),
    })),
  } as Resume

  // Ensure we have a valid TailoringProgress object
  const progressData = result.progress || { status: "not_started", progress: 0 }

  // Convert version history dates to strings
  const formattedVersionHistory =
    result.versionHistory?.map((version) => ({
      ...version,
      createdAt: version.createdAt.toISOString(),
    })) || []

  return (
    <ResumeLabClient
      resume={resumeData}
      resumeId={id}
      initialProgress={progressData as TailoringProgress}
      versionHistory={formattedVersionHistory}
    />
  )
}
