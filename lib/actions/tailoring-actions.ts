"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { generateContent } from "./generate-content"
import { cleanResumeOutput } from "@/lib/utils/resume-utils"
import { calculateScoresWithGPT } from "./scoring"
import { checkGoldenRules } from "./golden-rules"
import { compileTailoringPrompt } from "@/utils/ai/compile-tailoring-prompt"
import { logTailoringAnalytics } from "@/lib/analytics"
import { analyzeJobDescription } from "@/lib/intelligence/jd-analyzer"
import { debugLog, errorLog, previewContent } from "@/lib/utils/debug-utils"
import { revalidateResumePage, revalidateDashboardPage } from "@/lib/server-utils/revalidate"
import {
  diffSections,
  extractSections,
  reconstructResumeFromSections,
  cleanSectionContent,
} from "@/utils/ai/resume-section-utils"
import { compileRefinementPrompt } from "@/utils/ai/compile-refinement-prompt"
import { createHash } from "crypto"

interface TailoringResult {
  success: boolean
  error?: string
  data?: {
    version: number
    ats_score?: number
    jd_score?: number
  }
}

interface SaveResult {
  success: boolean
  error?: string
}

/**
 * Saves a resume to the user's collection by setting the `is_saved` flag to true.
 */
export async function saveResumeToCollection(resumeId: string): Promise<SaveResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      errorLog("SAVE", "Not authenticated")
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
      errorLog("SAVE", `Resume not found: ${resumeId}`)
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

    // Safely revalidate paths
    try {
      await revalidateResumePage(resumeId)
      await revalidateDashboardPage()
    } catch (error) {
      errorLog("SAVE", "Error revalidating paths:", error)
    }

    return { success: true }
  } catch (error) {
    errorLog("SAVE", "Error saving resume:", error)
    return { success: false, error: "Failed to save resume" }
  }
}

interface TailoringProgressResult {
  status: string
  progress: number
  currentAttempt?: number
  maxAttempts?: number
}

/**
 * Retrieves the tailoring progress for a given resume.
 */
export async function getTailoringProgress(resumeId: string): Promise<TailoringProgressResult> {
  try {
    debugLog("PROGRESS", `Getting tailoring progress for resumeId: ${resumeId}`)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      errorLog("PROGRESS", "Not authenticated")
      return { status: "error", progress: 0 }
    }

    const progress = await prisma.tailoringProgress.findUnique({
      where: {
        resumeId_userId: {
          resumeId: resumeId,
          userId: user.id,
        },
      },
    })

    if (!progress) {
      debugLog("PROGRESS", `No progress found for resumeId: ${resumeId}, returning not_started}`)
      return { status: "not_started", progress: 0 }
    }

    debugLog(
      "PROGRESS",
      `Found progress for resumeId: ${resumeId}, status: ${progress.status}, progress: ${progress.progress}`,
    )
    return {
      status: progress.status,
      progress: progress.progress,
      currentAttempt: progress.currentAttempt || undefined,
      maxAttempts: progress.maxAttempts || undefined,
    }
  } catch (error) {
    errorLog("PROGRESS", "Error fetching tailoring progress:", error)
    return { status: "error", progress: 0 }
  }
}

/**
 * Starts the tailoring analysis for a given resume.
 */
export async function startTailoringAnalysis(resumeId: string, isRefinement = false): Promise<SaveResult> {
  try {
    debugLog("START", `Starting tailoring analysis for resumeId: ${resumeId}, isRefinement: ${isRefinement}`)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      errorLog("START", "Not authenticated")
      return { success: false, error: "Not authenticated" }
    }

    debugLog("START", `User authenticated: ${user.id}`)

    // Check if the resume exists and belongs to the user
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: user.id,
      },
    })

    if (!resume) {
      errorLog("START", `Resume not found: ${resumeId}`)
      return { success: false, error: "Resume not found" }
    }

    debugLog("START", `Resume found: ${resumeId}`)

    // Create or update the tailoring progress
    const progressResult = await prisma.tailoringProgress.upsert({
      where: {
        resumeId_userId: {
          resumeId: resumeId,
          userId: user.id,
        },
      },
      update: {
        status: "started",
        progress: 5,
        currentAttempt: 0,
        maxAttempts: 3,
      },
      create: {
        resumeId: resumeId,
        userId: user.id,
        status: "started",
        progress: 5,
        currentAttempt: 0,
        maxAttempts: 3,
      },
    })

    debugLog("START", `Tailoring progress created/updated: ${JSON.stringify(progressResult)}`)

    // Run the tailoring analysis in the background
    // We'll use Promise.resolve().then() to ensure this runs after the current function returns
    Promise.resolve().then(async () => {
      try {
        debugLog("START", `Launching background tailoring for resumeId: ${resumeId}`)
        const result = await runTailoringAnalysisWithAnalytics(resumeId, isRefinement)
        debugLog("START", `Background tailoring completed with result: ${JSON.stringify(result)}`)
      } catch (error) {
        errorLog("START", `Error in background tailoring for resumeId: ${resumeId}:`, error)

        // Update progress to error state if tailoring fails
        try {
          const supabase = await createClient()
          const {
            data: { user },
          } = await supabase.auth.getUser()

          if (user) {
            await updateTailoringProgress(resumeId, user.id, "error", 0)
            debugLog("START", `Updated progress to error state due to background tailoring failure`)
          }
        } catch (progressError) {
          errorLog("START", `Error updating tailoring progress after failure:`, progressError)
        }
      }
    })

    return { success: true }
  } catch (error) {
    errorLog("START", "Error starting tailoring analysis:", error)
    return { success: false, error: "Failed to start tailoring analysis" }
  }
}

/**
 * Helper function to calculate the SHA-256 hash of a string
 */
function sha256Hash(text: string): string {
  const hash = createHash("sha256")
  hash.update(text)
  return hash.digest("hex")
}

/**
 * Runs the tailoring analysis with analytics tracking.
 * This is the main function that handles the tailoring process.
 */
export async function runTailoringAnalysisWithAnalytics(
  resumeId: string,
  isRefinement = false,
): Promise<TailoringResult> {
  try {
    debugLog("TAILOR", `Starting tailoring analysis for resumeId: ${resumeId}, isRefinement: ${isRefinement}`)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      errorLog("TAILOR", "Not authenticated")
      return { success: false, error: "Not authenticated" }
    }

    debugLog("TAILOR", `User authenticated: ${user.id}`)

    // Check if the resume exists and belongs to the user
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: user.id,
      },
    })

    if (!resume) {
      errorLog("TAILOR", `Resume not found: ${resumeId}`)
      return { success: false, error: "Resume not found" }
    }

    debugLog("TAILOR", `Resume found: ${resumeId}, tailoringMode: ${resume.tailoringMode}`)

    // Get default tailoring mode
    const defaultTailoringMode = "personalized"
    const resumeText = resume.resumeText
    const jobDescription = resume.jobDescription
    const tailoringMode = resume.tailoringMode || defaultTailoringMode

    // Update progress to indicate we're starting analysis
    await updateTailoringProgress(resumeId, user.id, "analyzing", 10)
    debugLog("TAILOR", `Updated progress: analyzing, 10%`)

    // Analyze the job description to get intelligence
    let jdIntelligence = null
    try {
      await updateTailoringProgress(resumeId, user.id, "analyzing_jd", 15)
      debugLog("TAILOR", `Analyzing job description...`)
      const analysisResult = await analyzeJobDescription(jobDescription)
      debugLog("TAILOR", `JD analysis result: ${JSON.stringify(analysisResult.success)}`)

      if (analysisResult.success && analysisResult.data) {
        jdIntelligence = analysisResult.data

        // Store the JD intelligence
        await prisma.jobDescriptionIntelligence.create({
          data: {
            userId: user.id,
            resumeId: resumeId,
            role: jdIntelligence.role,
            seniority: jdIntelligence.seniority,
            keywords: jdIntelligence.keywords,
            responsibilities: jdIntelligence.responsibilities,
            qualifications: jdIntelligence.qualifications,
            categories: jdIntelligence.categories,
          },
        })
        debugLog("TAILOR", `JD intelligence stored`)
      }
    } catch (error) {
      errorLog("TAILOR", "Error analyzing job description:", error)
      // Continue with tailoring even if JD analysis fails
    }

    // Constants for tailoring
    const MAX_ATTEMPTS = 3
    let iterations = 0
    let bestAttempt = {
      resumeText: "",
      ats_score: 0,
      jd_score: 0,
      golden_passed: false,
      atsFeedback: "",
      jdFeedback: "",
    }
    let bestScore = 0
    let previousFeedback: string[] = []
    let previousSuggestions: string[] = []

    // Initialize the current resume sections map to track all sections across iterations
    const originalSections = extractSections(resumeText)
    const modifiedSectionsMap: Record<string, string> = { ...originalSections }

    // Track all modified sections across all iterations for logging
    let allModifiedSections: string[] = []

    // Multi-iteration tailoring process
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      iterations = attempt
      debugLog("TAILOR", `Starting tailoring attempt ${attempt} of ${MAX_ATTEMPTS}...`)

      // Update progress
      await updateTailoringProgress(
        resumeId,
        user.id,
        `attempt_${attempt}`,
        Math.round(20 + (attempt / MAX_ATTEMPTS) * 50),
        attempt,
      )
      debugLog("TAILOR", `Updated progress: attempt_${attempt}, ${Math.round(20 + (attempt / MAX_ATTEMPTS) * 50)}%`)

      let tailoredResume = ""
      let promptUsed = ""
      let sectionsToModify: Record<string, string> = {}
      let modifiedSections: Record<string, { before: string; after: string }> = {}
      let modifiedSectionNames: string[] = []

      // First iteration: Send full resume
      // Subsequent iterations: Send only sections that need refinement
      if (attempt === 1) {
        // Create tailoring prompt with full resume
        promptUsed = compileTailoringPrompt({
          resumeText,
          jobDescription,
          mode: tailoringMode as any,
          jdIntelligence,
          previousFeedback,
          version: resume.version,
        })
        debugLog("TAILOR", `Compiled full tailoring prompt for first iteration, length: ${promptUsed.length} chars`)

        // Generate tailored resume with real-time API call
        debugLog("TAILOR", `Calling generateContent with model: gemini-1.5-flash`)
        const { success, text } = await generateContent(
          "", // API key from env
          promptUsed,
          "gemini-1.5-flash",
          0.5,
        )

        if (!success || !text) {
          errorLog("TAILOR", `Attempt ${attempt} failed to generate content`)
          continue
        }

        // Clean the generated text immediately to remove any debugging markers
        const cleanedText = cleanResumeOutput(text)
        tailoredResume = cleanedText

        debugLog("TAILOR", `Generated and cleaned tailored resume, length: ${tailoredResume.length} chars`)
        debugLog("TAILOR", `Preview: ${previewContent(tailoredResume, 100)}`)

        // Extract all sections from the first iteration result
        const newSections = extractSections(tailoredResume)

        // Compute section-level changes
        modifiedSections = diffSections(resumeText, tailoredResume)
        modifiedSectionNames = Object.keys(modifiedSections)
        debugLog("TAILOR", `Identified ${modifiedSectionNames.length} modified sections`)

        // Update the modifiedSectionsMap with the new sections
        Object.keys(newSections).forEach((sectionName) => {
          if (modifiedSections[sectionName]) {
            // Clean the section content before storing it
            modifiedSectionsMap[sectionName] = cleanSectionContent(newSections[sectionName])
          }
        })

        // Add to the cumulative list of modified sections
        allModifiedSections = [...new Set([...allModifiedSections, ...modifiedSectionNames])]
      } else {
        // For subsequent iterations, only send sections that need refinement
        // based on feedback from previous iteration

        // Reconstruct the current best resume from all sections
        const currentBestResume = reconstructResumeFromSections(modifiedSectionsMap)

        // Extract sections that need refinement based on feedback
        // For simplicity, we'll send all sections that were modified in the previous iteration
        // A more sophisticated approach would analyze feedback to determine which sections need refinement
        const sectionsToRefine: Record<string, string> = {}
        Object.entries(modifiedSections).forEach(([sectionName, { after }]) => {
          sectionsToRefine[sectionName] = after
        })

        // Store sections being sent for modification
        sectionsToModify = { ...sectionsToRefine }

        // If no sections were modified or we have no feedback, use the full resume
        if (Object.keys(sectionsToRefine).length === 0 || previousFeedback.length === 0) {
          debugLog("TAILOR", `No specific sections to refine, using full resume for iteration ${attempt}`)
          promptUsed = compileTailoringPrompt({
            resumeText: currentBestResume,
            jobDescription,
            mode: tailoringMode as any,
            jdIntelligence,
            previousFeedback,
            version: resume.version,
          })
        } else {
          // Create refinement prompt with only sections that need refinement
          promptUsed = compileRefinementPrompt({
            sectionsToRefine,
            feedback: previousFeedback,
            jobDescription,
            mode: tailoringMode as any,
            jdIntelligence,
            version: resume.version,
            goldenRuleFeedback: previousSuggestions,
          })
          debugLog("TAILOR", `Compiled refinement prompt for iteration ${attempt}, length: ${promptUsed.length} chars`)
          debugLog(
            "TAILOR",
            `Refining ${Object.keys(sectionsToRefine).length} sections: ${Object.keys(sectionsToRefine).join(", ")}`,
          )
        }

        // Generate refined sections
        debugLog("TAILOR", `Calling generateContent for refinement with model: gemini-1.5-flash`)
        const { success, text } = await generateContent(
          "", // API key from env
          promptUsed,
          "gemini-1.5-flash",
          0.5,
        )

        if (!success || !text) {
          errorLog("TAILOR", `Refinement attempt ${attempt} failed to generate content`)
          continue
        }

        // Clean the generated text immediately to remove any debugging markers
        const cleanedText = cleanResumeOutput(text)

        // Parse the refined sections from the response
        const refinedSections: Record<string, string> = {}
        const sectionMatches = cleanedText.matchAll(/### (.+?) ###([\s\S]+?)(?=### |$)/g)

        for (const match of sectionMatches) {
          const sectionName = match[1].trim()
          const sectionContent = match[2].trim()
          // Clean the section content before storing it
          refinedSections[sectionName] = cleanSectionContent(sectionContent)
        }

        // Update the current resume sections with the refined sections, but only if there's a real difference
        Object.entries(refinedSections).forEach(([sectionName, refinedContent]) => {
          const previousContent = modifiedSectionsMap[sectionName] || ""
          const previousHash = sha256Hash(previousContent)
          const refinedHash = sha256Hash(refinedContent)

          if (previousHash !== refinedHash) {
            debugLog("TAILOR", `Updating section ${sectionName} due to content change (hash diff)`)
            modifiedSectionsMap[sectionName] = refinedContent
          } else {
            debugLog("TAILOR", `Skipping section ${sectionName} - no content change detected`)
          }
        })

        // Track which sections were actually modified in the response
        modifiedSectionNames = Object.keys(refinedSections)
        debugLog(
          "TAILOR",
          `Received ${modifiedSectionNames.length} refined sections: ${modifiedSectionNames.join(", ")}`,
        )

        // Add to the cumulative list of modified sections
        allModifiedSections = [...new Set([...allModifiedSections, ...modifiedSectionNames])]

        // Reconstruct the full resume from the updated sections
        tailoredResume = reconstructResumeFromSections(modifiedSectionsMap)

        // Compute section-level changes between previous best and new version
        modifiedSections = diffSections(currentBestResume, tailoredResume)
      }

      // Update progress to indicate we're scoring the result
      await updateTailoringProgress(
        resumeId,
        user.id,
        `scoring_${attempt}`,
        Math.round(20 + ((attempt - 0.5) / MAX_ATTEMPTS) * 50),
        attempt,
      )
      debugLog(
        "TAILOR",
        `Updated progress: scoring_${attempt}, ${Math.round(20 + ((attempt - 0.5) / MAX_ATTEMPTS) * 50)}%`,
      )

      // Check golden rules and score the result
      debugLog("TAILOR", `Checking golden rules...`)
      const goldenRulesResult = await checkGoldenRules(tailoredResume, jobDescription)
      debugLog("TAILOR", `Golden rules result: passed=${goldenRulesResult.passed}`)

      debugLog("TAILOR", `Calculating scores...`)
      const scoringResult = await calculateScoresWithGPT(resumeText, tailoredResume, jobDescription)
      debugLog("TAILOR", `Scoring result: ats=${scoringResult.ats_score}, jd=${scoringResult.jd_score}`)

      const ats_score = scoringResult.ats_score || 0
      const jd_score = scoringResult.jd_score || 0
      const atsFeedback = scoringResult.ats_feedback || ""
      const jdFeedback = scoringResult.jd_feedback || ""

      // Store feedback for next attempt
      previousFeedback = goldenRulesResult.feedback
      previousSuggestions = goldenRulesResult.suggestions

      // Track best attempt based on combined score
      const totalScore = ats_score + jd_score
      if (totalScore > bestScore) {
        bestAttempt = {
          resumeText: tailoredResume,
          ats_score,
          jd_score,
          golden_passed: goldenRulesResult.passed,
          atsFeedback,
          jdFeedback,
        }
        bestScore = totalScore
        debugLog("TAILOR", `New best attempt: ats=${ats_score}, jd=${jd_score}, total=${totalScore}`)
      }

      // Store the tailoring attempt with enhanced logging
      const modifiedSectionsSent = Object.keys(sectionsToModify)
      const modifiedSectionsReceived = modifiedSectionNames
      const promptTokens = promptUsed.length

      await prisma.tailoringAttempt.create({
        data: {
          userId: user.id,
          resumeId: resumeId,
          attemptNumber: attempt,
          atsScore: ats_score,
          jdScore: jd_score,
          goldenPassed: goldenRulesResult.passed,
          feedback: previousFeedback.join("\n"),
          suggestions: previousSuggestions.join("\n"),
          atsFeedback,
          jdFeedback,
          // Store additional data for traceability
          modifiedSectionsSent: JSON.stringify(modifiedSectionsSent),
          modifiedSectionsReceived: JSON.stringify(modifiedSectionsReceived),
          promptTokens: promptTokens, // Approximate token count based on character length
          goldenRuleFeedback: JSON.stringify(goldenRulesResult),
          iteration: attempt,
          modifiedSections: JSON.stringify(modifiedSections),
          score: totalScore,
        },
      })
      debugLog("TAILOR", `Stored tailoring attempt ${attempt} with enhanced logging`)

      // Exit early if golden rules passed
      if (goldenRulesResult.passed) {
        debugLog("TAILOR", `Golden rules passed on attempt ${attempt}, stopping further attempts`)
        break
      }
    }

    // Update progress to processing
    await updateTailoringProgress(resumeId, user.id, "processing", 80)
    debugLog("TAILOR", `Updated progress: processing, 80%`)

    // Ensure all original sections are present in the final output
    Object.keys(originalSections).forEach((sectionName) => {
      if (!modifiedSectionsMap[sectionName]) {
        modifiedSectionsMap[sectionName] = cleanSectionContent(originalSections[sectionName])
        debugLog("TAILOR", `Section "${sectionName}" was not modified, using original content`)
      }
    })

    // Log if any section was not modified in any iteration
    Object.keys(originalSections).forEach((section) => {
      if (!allModifiedSections.includes(section)) {
        debugLog("TAILOR", `Section "${section}" was not modified in any iteration.`)
      }
    })

    // Reconstruct the final resume from all sections
    const finalTailoredResume = reconstructResumeFromSections(modifiedSectionsMap)
    debugLog("TAILOR", `Reconstructed final resume from all sections, length: ${finalTailoredResume.length} chars`)

    // Clean the tailored resume output one final time to ensure no debugging markers remain
    const cleanedResume = cleanResumeOutput(finalTailoredResume)
    debugLog("TAILOR", `Cleaned resume output, length: ${cleanedResume.length} chars`)
    debugLog("TAILOR", `Preview: ${previewContent(cleanedResume, 100)}`)

    // Store the final modified sections
    const finalModifiedSections = diffSections(resumeText, cleanedResume)

    // Validate the cleaned resume
    if (!cleanedResume || cleanedResume.length < 50) {
      errorLog("TAILOR", `Cleaned resume is too short or empty: "${cleanedResume}"`)

      // Create a fallback resume content if cleaning failed
      const fallbackContent = `
[TAILORING ENCOUNTERED AN ERROR]

Original Resume:
${resumeText.substring(0, 500)}...

We apologize, but we encountered an issue while tailoring your resume. 
Please try again or contact support if the problem persists.
`.trim()

      // Update the resume with the fallback content
      const updatedResume = await prisma.resume.update({
        where: {
          id: resumeId,
          userId: user.id,
        },
        data: {
          modifiedResume: fallbackContent,
          atsScore: 0,
          jdScore: 0,
          version: 1,
          tailoringMode: tailoringMode,
          goldenPassed: false,
          finalModifiedSections: JSON.stringify(allModifiedSections), // Store all modified sections for traceability
        },
      })

      // Update progress to error
      await updateTailoringProgress(resumeId, user.id, "error", 0)

      debugLog("TAILOR", `Updated resume with fallback content due to cleaning failure`)

      // Revalidate paths even in error case
      try {
        await revalidateResumePage(resumeId)
        await revalidateDashboardPage()
        debugLog("TAILOR", `Revalidated paths for resumeId: ${resumeId} (error case)`)
      } catch (revalidateError) {
        errorLog("TAILOR", "Error revalidating paths:", revalidateError)
      }

      return {
        success: false,
        error: "Failed to generate valid resume content",
      }
    }

    // Get the final golden rules check result
    const finalGoldenRulesResult = await checkGoldenRules(cleanedResume, jobDescription)

    // Get the current version if this is a refinement
    let currentVersion = 1
    if (isRefinement) {
      currentVersion = resume.version + 1
    }

    // Update the resume with the cleaned tailored resume and scores
    debugLog("TAILOR", `Updating resume with tailored content and scores...`)
    try {
      const updatedResume = await prisma.resume.update({
        where: {
          id: resumeId,
          userId: user.id,
        },
        data: {
          modifiedResume: cleanedResume,
          atsScore: bestAttempt.ats_score,
          jdScore: bestAttempt.jd_score,
          version: currentVersion,
          tailoringMode: tailoringMode,
          goldenPassed: finalGoldenRulesResult.passed, // Use the final golden rules check result
          finalModifiedSections: JSON.stringify(allModifiedSections), // Store all modified sections for traceability
        },
      })

      debugLog(
        "TAILOR",
        `Resume updated successfully: ${JSON.stringify({
          id: updatedResume.id,
          atsScore: updatedResume.atsScore,
          jdScore: updatedResume.jdScore,
          modifiedResumeLength: updatedResume.modifiedResume?.length || 0,
          modifiedResumePreview: previewContent(updatedResume.modifiedResume, 50),
          finalModifiedSections: allModifiedSections,
        })}`,
      )

      if (!updatedResume.modifiedResume || updatedResume.modifiedResume.length < 50) {
        errorLog("TAILOR", `Updated resume has invalid modifiedResume: "${updatedResume.modifiedResume}"`)
        throw new Error("Failed to save valid resume content")
      }
    } catch (error) {
      errorLog("TAILOR", `Error updating resume:`, error)
      // Update progress to error
      await updateTailoringProgress(resumeId, user.id, "error", 0)
      throw error
    }

    // Create a tailoring analytics entry
    await prisma.tailoringAnalytics.create({
      data: {
        userId: user.id,
        resumeId: resumeId,
        tailoringMode: tailoringMode,
        iterations: iterations,
        atsScore: bestAttempt.ats_score,
        jdScore: bestAttempt.jd_score,
        goldenPassed: finalGoldenRulesResult.passed, // Use the final golden rules check result
        isRefinement: isRefinement,
        modifiedSections: JSON.stringify(allModifiedSections), // Store all modified sections for analytics
      },
    })
    debugLog("TAILOR", `Created tailoring analytics entry`)

    // Update progress to completed
    await updateTailoringProgress(resumeId, user.id, "completed", 100)
    debugLog("TAILOR", `Updated progress: completed, 100%`)

    // Log analytics
    await logTailoringAnalytics({
      userId: user.id,
      resumeId,
      originalText: resumeText,
      tailoredText: cleanedResume,
      jobDescription,
      atsScore: bestAttempt.ats_score,
      jdScore: bestAttempt.jd_score,
      tailoringMode,
      isRefinement,
      iterations,
      goldenPassed: finalGoldenRulesResult.passed, // Use the final golden rules check result
      modifiedSections: allModifiedSections, // Include modified sections in analytics
    })
    debugLog("TAILOR", `Logged tailoring analytics`)

    // Revalidate paths immediately after completion
    // try {
    //   await revalidateResumePage(resumeId)
    //   await revalidateDashboardPage()
    //   debugLog("TAILOR", `Revalidated paths for resumeId: ${resumeId}`)
    // } catch (revalidateError) {
    //   errorLog("TAILOR", "Error revalidating paths:", revalidateError)
    //   // Continue even if revalidation fails
    // }
    // We'll avoid calling revalidatePath during render

    return {
      success: true,
      data: {
        version: currentVersion,
        ats_score: bestAttempt.ats_score,
        jd_score: bestAttempt.jd_score,
      },
    }
  } catch (error) {
    errorLog("TAILOR", "Error in runTailoringAnalysisWithAnalytics:", error)

    // Update progress to error
    try {
      const supabase = await createClient()
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (user) {
        await updateTailoringProgress(resumeId, user.id, "error", 0)
        debugLog("TAILOR", `Updated progress to error state`)
      }
    } catch (progressError) {
      errorLog("TAILOR", "Error updating tailoring progress:", progressError)
    }

    return { success: false, error: "Failed to run tailoring analysis" }
  }
}

/**
 * Helper function to update tailoring progress
 */
async function updateTailoringProgress(
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

    // If status is completed, revalidate the page immediately
    // if (status === "completed") {
    //   try {
    //     await revalidateResumePage(resumeId)
    //     debugLog("PROGRESS_UPDATE", `Revalidated resume page after setting status to completed`)
    //   } catch (error) {
    //     errorLog("PROGRESS_UPDATE", "Error revalidating after progress update:", error)
    //   }
    // }
    if (status === "completed") {
      debugLog("PROGRESS_UPDATE", `Tailoring completed for resumeId: ${resumeId}`)
      // Client will handle refresh
    }
  } catch (error) {
    errorLog("PROGRESS_UPDATE", "Error updating tailoring progress:", error)
  }
}
