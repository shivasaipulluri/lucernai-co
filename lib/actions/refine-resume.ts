"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { runTailoringAnalysisWithAnalytics } from "./tailoring-engine"
import { extractFeedbackPoints } from "@/utils/ai/compile-tailoring-prompt"

interface RefineResumeResult {
  success: boolean
  error?: string
  data?: {
    id: string
    version: number
  }
}

/**
 * Creates a new version of a resume and starts the tailoring process
 * This is triggered by the "Refine Again" button
 */
export async function refineResume(resumeId: string): Promise<RefineResumeResult> {
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
      include: {
        // Get the latest tailoring attempt to carry over feedback
        tailoringAttempts: {
          orderBy: {
            createdAt: "desc",
          },
          take: 1,
        },
      },
    })

    if (!originalResume) {
      return { success: false, error: "Resume not found" }
    }

    // Calculate the new version number
    const newVersion = (originalResume.version || 1) + 1

    // Create a new resume entry
    const newResume = await prisma.resume.create({
      data: {
        userId: user.id,
        // Use the modified resume from the previous version as the starting point
        resumeText: originalResume.modifiedResume || originalResume.resumeText,
        jobDescription: originalResume.jobDescription,
        tailoringMode: originalResume.tailoringMode || "personalized",
        isRefinement: true,
        version: newVersion,
        // Reference to the original resume for tracking lineage (optional)
        originalResumeId: originalResume.originalResumeId || resumeId,
      },
    })

    // Carry over feedback from the previous version
    let previousFeedback: string[] = []

    if (originalResume.tailoringAttempts && originalResume.tailoringAttempts.length > 0) {
      // Extract feedback points from the latest tailoring attempt
      const latestAttempt = originalResume.tailoringAttempts[0]
      previousFeedback = extractFeedbackPoints(latestAttempt.feedback)

      // Also include suggestions as feedback
      const suggestions = extractFeedbackPoints(latestAttempt.suggestions)
      previousFeedback = [...previousFeedback, ...suggestions]
    }

    // Store the previous feedback for the new resume
    if (previousFeedback.length > 0) {
      await prisma.resumeFeedback.create({
        data: {
          resumeId: newResume.id,
          userId: user.id,
          feedbackType: "previous_version",
          feedbackPoints: previousFeedback,
          sourceVersion: originalResume.version || 1,
        },
      })
    }

    // Start the tailoring process for the new resume
    // This will be handled asynchronously, and the user will be redirected to the new resume page
    runTailoringAnalysisWithAnalytics(newResume.id, true).catch((error: Error) => {
      console.error("Error running tailoring analysis:", error)
    })

    // Safely revalidate paths
    // We'll avoid calling revalidatePath during render
    console.log(`Refinement completed for resumeId: ${resumeId}, new resumeId: ${newResume.id}`)
    // Client will handle refresh

    return {
      success: true,
      data: {
        id: newResume.id,
        version: newVersion,
      },
    }
  } catch (error) {
    console.error("Error refining resume:", error)
    return { success: false, error: "Failed to refine resume" }
  }
}
