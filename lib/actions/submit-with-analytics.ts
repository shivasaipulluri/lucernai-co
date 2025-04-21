"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { logResumeEvent } from "@/lib/analytics"
import { startTailoringAnalysis } from "@/lib/actions/tailoring-engine"
import { debugLog, errorLog } from "@/lib/utils/debug-utils"

interface SubmitResult {
  success: boolean
  error?: string
  data?: {
    id: string
  }
}

export async function submitResumeWithAnalytics(
  resumeText: string,
  jobDescription: string,
  tailoringMode = "personalized",
): Promise<SubmitResult> {
  try {
    debugLog("SUBMIT", `Starting submitResumeWithAnalytics with mode: ${tailoringMode}`)

    // Validate inputs
    if (!resumeText || resumeText.trim().length < 50) {
      errorLog("SUBMIT", "Invalid resume text: too short or empty")
      return { success: false, error: "Resume text is too short or empty" }
    }

    if (!jobDescription || jobDescription.trim().length < 50) {
      errorLog("SUBMIT", "Invalid job description: too short or empty")
      return { success: false, error: "Job description is too short or empty" }
    }

    // Get the user ID
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      errorLog("SUBMIT", "Authentication error: No user found")
      return { success: false, error: "Not authenticated" }
    }

    debugLog("SUBMIT", `User authenticated: ${user.id}`)

    // Create the resume in the database
    const resume = await prisma.resume.create({
      data: {
        userId: user.id,
        resumeText: resumeText,
        jobDescription: jobDescription,
        version: 1,
        tailoringMode: tailoringMode,
      },
    })

    debugLog("SUBMIT", `Resume created with ID: ${resume.id}`)

    // If the submission was successful, log the event
    if (resume) {
      try {
        debugLog("SUBMIT", `Logging resume upload event for resumeId: ${resume.id}`)
        await logResumeEvent({
          userId: user.id,
          eventType: "upload",
          resumeId: resume.id,
          resumeText: resumeText,
          jobDescription: jobDescription,
          metadata: { tailoringMode },
        })
        debugLog("SUBMIT", "Resume upload logged successfully")

        // Start the tailoring process
        debugLog("SUBMIT", `Starting tailoring analysis for resumeId: ${resume.id}`)

        // Important: We need to explicitly start the tailoring process and handle errors
        try {
          const startResult = await startTailoringAnalysis(resume.id, false)
          debugLog("SUBMIT", `Tailoring analysis started: ${JSON.stringify(startResult)}`)

          if (!startResult.success) {
            errorLog("SUBMIT", `Failed to start tailoring: ${startResult.error}`)
            // We'll still return success since the resume was created
          }
        } catch (tailoringError) {
          errorLog("SUBMIT", "Error starting tailoring analysis:", tailoringError)
          // We'll still return success since the resume was created
        }
      } catch (modelError) {
        errorLog("SUBMIT", "Failed to log resume upload:", modelError)
        // Continue even if logging fails
      }

      return {
        success: true,
        data: {
          id: resume.id,
        },
      }
    } else {
      errorLog("SUBMIT", "Resume submission failed, no resume created")
      return { success: false, error: "Failed to create resume" }
    }
  } catch (error) {
    errorLog("SUBMIT", "Error in submitResumeWithAnalytics:", error)
    return { success: false, error: "Failed to submit resume" }
  }
}
