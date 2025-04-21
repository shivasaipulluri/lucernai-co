"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { callMixtralForScoring } from "@/lib/actions/mixtral-scoring"

interface SaveEditResult {
  success: boolean
  error?: string
}

interface RescoreResult {
  success: boolean
  error?: string
  data?: {
    atsScore: number
    jdScore: number
    atsFeedback?: string
    jdFeedback?: string
  }
}

/**
 * Save manual edits to a resume
 */
export async function saveManualEdit(resumeId: string, editedText: string): Promise<SaveEditResult> {
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

    // Update the resume with the edited text
    await prisma.resume.update({
      where: {
        id: resumeId,
      },
      data: {
        modifiedResume: editedText,
        wasManuallyEdited: true,
        scoresStale: true, // Mark scores as stale since the content has changed
      },
    })

    // Create a manual edit entry in the tailoring attempts
    await prisma.manualEdit.create({
      data: {
        userId: user.id,
        resumeId: resumeId,
        editedText: editedText,
      },
    })

    // Safely revalidate paths
    // We'll avoid calling revalidatePath during render
    console.log(`Manual edit saved for resumeId: ${resumeId}`)
    // Client will handle refresh

    return { success: true }
  } catch (error) {
    console.error("Error saving manual edit:", error)
    return { success: false, error: "Failed to save changes" }
  }
}

/**
 * Re-score a manually edited resume
 */
export async function rescoreManualEdit(resumeId: string): Promise<RescoreResult> {
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

    if (!resume.modifiedResume) {
      return { success: false, error: "No modified resume content found" }
    }

    // Call Mixtral for scoring
    const scoringResult = await callMixtralForScoring(resume.modifiedResume, resume.jobDescription)

    if (scoringResult.error) {
      return { success: false, error: scoringResult.error }
    }

    // Update the resume with the new scores
    await prisma.resume.update({
      where: {
        id: resumeId,
      },
      data: {
        atsScore: scoringResult.atsScore,
        jdScore: scoringResult.jdScore,
        scoresStale: false, // Scores are now up-to-date
      },
    })

    // Create a manual scoring entry
    await prisma.manualScoring.create({
      data: {
        userId: user.id,
        resumeId: resumeId,
        atsScore: scoringResult.atsScore,
        jdScore: scoringResult.jdScore,
        atsFeedback: scoringResult.atsFeedback || "",
        jdFeedback: scoringResult.jdFeedback || "",
      },
    })

    // Safely revalidate paths
    // We'll avoid calling revalidatePath during render
    console.log(`Manual edit rescored for resumeId: ${resumeId}`)
    // Client will handle refresh

    return {
      success: true,
      data: {
        atsScore: scoringResult.atsScore,
        jdScore: scoringResult.jdScore,
        atsFeedback: scoringResult.atsFeedback,
        jdFeedback: scoringResult.jdFeedback,
      },
    }
  } catch (error) {
    console.error("Error re-scoring manual edit:", error)
    return { success: false, error: "Failed to re-score resume" }
  }
}
