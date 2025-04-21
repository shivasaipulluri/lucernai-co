import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { Resume } from "@/lib/types"
import ResumeTimeline from "@/components/resume-timeline/ResumeTimeline"

export const metadata = {
  title: "Resume Timeline | Lucerna AI",
  description: "Track the evolution of your resume through tailoring iterations and manual edits.",
}

async function getResumeVersions(resumeId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the original resume
    const originalResume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: user.id,
      },
    })

    if (!originalResume) {
      return { success: false, error: "Resume not found" }
    }

    // If we have an original resume ID, use that to find all versions
    const originalId = originalResume.originalResumeId || resumeId

    // Find all resumes with the same original ID or that are the original
    const versionHistory = await prisma.resume.findMany({
      where: {
        OR: [{ id: originalId }, { originalResumeId: originalId }],
        userId: user.id,
      },
      orderBy: {
        version: "asc",
      },
    })

    return { success: true, data: versionHistory }
  } catch (error) {
    console.error("Error fetching resume versions:", error)
    return { success: false, error: "Failed to fetch resume versions" }
  }
}

interface Props {
  params: { resumeId: string }
}

export default async function ResumeTimelinePage(props: Props) {
  const { resumeId } = await props.params
  const versionResult = await getResumeVersions(resumeId)


  // If not authenticated, redirect to auth page
  if (!versionResult.success && versionResult.error === "Not authenticated") {
    redirect("/auth")
  }

  return (
    <ResumeTimeline
      versions={
        (versionResult.data || []).map((v) => ({
          ...v,
          createdAt: v.createdAt.toISOString(),
          updatedAt: v.updatedAt.toISOString(),
        })) as Resume[]
      }
    />
  )  
}
