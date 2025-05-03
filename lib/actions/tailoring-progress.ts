"use server"

import { prisma } from "@/lib/prisma"
import { debugLog, errorLog } from "@/lib/utils/debug-utils"

/**
 * Helper function to update tailoring progress
 */
export async function updateTailoringProgress(
  resumeId: string,
  userId: string,
  status: string,
  progress: number,
  currentAttempt?: number,
): Promise<void> {
  try {
    await prisma.tailoringProgress.upsert({
      where: {
        resumeId_userId: {
          resumeId,
          userId,
        },
      },
      update: {
        status,
        progress,
        ...(currentAttempt !== undefined ? { currentAttempt } : {}),
        updatedAt: new Date(),
      },
      create: {
        resumeId,
        userId,
        status,
        progress,
        currentAttempt: currentAttempt || 0,
        maxAttempts: 3,
      },
    })

    if (status === "completed") {
      debugLog("PROGRESS_UPDATE", `Tailoring completed for resumeId: ${resumeId}`)
      // Client will handle refresh
    }
  } catch (error) {
    errorLog("PROGRESS_UPDATE", "Error updating tailoring progress:", error)
  }
}
