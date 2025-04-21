"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

interface LogFeedbackResult {
  success: boolean
  error?: string
}

/**
 * Logs user feedback for a resume
 */
export async function logUserResumeFeedback(
  userId: string,
  resumeId: string,
  version: number,
  feedbackType: "positive" | "negative",
  feedbackText?: string,
): Promise<LogFeedbackResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Log the feedback event
    await prisma.resumeFeedback.create({
      data: {
        userId: userId,
        resumeId: resumeId,
        feedbackType: `user_feedback_${feedbackType}`,
        feedbackPoints: feedbackText ? [feedbackText] : [],
        sourceVersion: version,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error logging user feedback:", error)
    return { success: false, error: "Failed to log user feedback" }
  }
}

/**
 * Stores section-specific rationale in the database
 */
export async function storeSectionRationale(
  resumeId: string,
  userId: string,
  sectionRationale: Record<string, string>,
): Promise<{ success: boolean; error?: string }> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Create the data array for the createMany operation
    const data = Object.entries(sectionRationale).map(([sectionName, rationale]) => ({
      resumeId,
      userId,
      sectionName,
      rationale,
      createdAt: new Date(),
    }))

    // Delete existing rationales for this resume to avoid duplicates
    await prisma.resumeSectionRationale.deleteMany({
      where: {
        resumeId,
        userId,
      },
    })

    // Insert the new rationales
    if (data.length > 0) {
      await prisma.resumeSectionRationale.createMany({
        data,
        skipDuplicates: true,
      })
    }

    return { success: true }
  } catch (error) {
    console.error("Error storing section rationale:", error)
    return { success: false, error: "Failed to store section rationale" }
  }
}
