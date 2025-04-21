"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import type { Resume } from "@/lib/types"

interface ResumeHistoryResult {
  success: boolean
  error?: string
  data?: Resume[]
}

export async function getResumeHistory(): Promise<ResumeHistoryResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    const resumes = await prisma.resume.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
    })

    const formattedResumes = resumes.map((resume) => ({
      ...resume,
      modifiedResume: resume.modifiedResume || undefined,
      atsScore: resume.atsScore || undefined,
      jdScore: resume.jdScore || undefined,
      tailoringMode: resume.tailoringMode || undefined,
      originalResumeId: resume.originalResumeId || undefined,
      createdAt: resume.createdAt.toISOString(),
      updatedAt: resume.updatedAt.toISOString(),
    }))

    return { success: true, data: formattedResumes as Resume[] }
  } catch (error) {
    console.error("Error fetching resume history:", error)
    return { success: false, error: "Failed to fetch resume history" }
  }
}

export async function saveResume(resumeId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if the resume exists and belongs to the user
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: user.id,
      },
    })

    if (!resume) {
      return { success: false, error: "Resume not found" }
    }

    // Update the resume to mark it as saved
    await prisma.resume.update({
      where: {
        id: resumeId,
      },
      data: {
        isSaved: true,
      },
    })

    return { success: true, data: { success: true } }
  } catch (error) {
    console.error("Error saving resume:", error)
    return { success: false, error: "Failed to save resume" }
  }
}
