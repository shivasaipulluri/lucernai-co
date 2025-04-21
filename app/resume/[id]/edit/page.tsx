import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { ResumeEditClient } from "@/components/resume/resume-edit-client"
import { redirect } from "next/navigation"
import type { Resume } from "@/lib/types"

export const metadata = {
  title: "Edit Resume | Lucerna AI",
  description: "Manually edit your tailored resume",
}

async function getResumeForEditing(id: string) {
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

    return {
      success: true,
      data: resume,
    }
  } catch (error) {
    console.error("Error fetching resume for editing:", error)
    return { success: false, error: "Failed to fetch resume" }
  }
}

export default async function ResumeEditPage({ params }: { params: { id: string } }) {
  const { id } = await params
  const result = await getResumeForEditing(id)

  if (!result.success || !result.data) {
    redirect("/dashboard")
  }

  // Convert the Prisma resume object to the expected Resume type
  // We need to convert Date objects to strings
  const resumeData: Resume = {
    ...result.data,
    createdAt: result.data.createdAt.toISOString(),
    updatedAt: result.data.updatedAt.toISOString(),
    // Convert tailoringAttempts if they exist
    tailoringAttempts: result.data.tailoringAttempts?.map((attempt) => ({
      ...attempt,
      createdAt: attempt.createdAt.toISOString(),
    })),
  } as Resume

  return <ResumeEditClient resume={resumeData} resumeId={id} />
}
