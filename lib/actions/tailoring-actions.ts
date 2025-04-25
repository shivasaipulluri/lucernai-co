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
import { callMixtralForScoring } from "@/lib/actions/mixtral-scoring"

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
 * Helper function to determine the temperature for content generation based on the tailoring mode.
 */
function getTemperatureForMode(mode: TailoringMode): number {
  switch (mode) {
    case "aggressive":
      return 0.7 // Higher temperature for more creative and potentially riskier outputs
    case "balanced":
      return 0.5 // Balanced temperature for a mix of creativity and coherence
    case "conservative":
      return 0.3 // Lower temperature for more coherent and predictable outputs
    case "personalized":
    default:
      return 0.5 // Default temperature for personalized mode
  }
}

type TailoringMode = "personalized" | "aggressive" | "balanced" | "conservative"

/**
 * Runs the tailoring analysis with analytics tracking.
 * This is the main function that handles the tailoring process.
 * Optimized for performance and reliability.
 */
export async function runTailoringAnalysisWithAnalytics(
  resumeId: string,
  isRefinement = false,
): Promise<TailoringResult> {
  // Performance tracking
  const startTime = Date.now()
  const perfMetrics: Record<string, number> = {}

  try {
    debugLog("TAILOR", `Starting optimized tailoring for resumeId: ${resumeId}, isRefinement: ${isRefinement}`)
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      errorLog("TAILOR", "Not authenticated")
      return { success: false, error: "Not authenticated" }
    }

    // Check if the resume exists and belongs to the user
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: user.id,
      },
      include: {
        tailoringAttempts: true, // Include previous attempts for context
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

    // Analyze the job description to get intelligence - run in parallel with initial setup
    const jdAnalysisPromise = analyzeJobDescription(jobDescription).catch((error) => {
      errorLog("TAILOR", "Error analyzing job description:", error)
      return { success: false, data: null }
    })

    // Update progress for JD analysis
    await updateTailoringProgress(resumeId, user.id, "analyzing_jd", 15)

    // Extract original sections for tracking
    const originalSections = extractSections(resumeText)

    // Constants for tailoring
    const MAX_ATTEMPTS = 3
    let iterations = 0
    let bestAttempt = {
      resumeText: "",
      atsScore: 0,
      jdScore: 0,
      golden_passed: false,
      atsFeedback: "",
      jdFeedback: "",
    }
    let bestScore = 0
    let previousFeedback: string[] = []
    let previousSuggestions: string[] = []

    // Initialize the current resume sections map to track all sections across iterations
    const modifiedSectionsMap: Record<string, string> = { ...originalSections }

    // Track all modified sections across all iterations for logging
    let allModifiedSections: string[] = []

    // Wait for JD analysis to complete
    const jdAnalysisResult = await jdAnalysisPromise
    let jdIntelligence = null

    if (jdAnalysisResult.success && jdAnalysisResult.data) {
      jdIntelligence = jdAnalysisResult.data
      perfMetrics.jdAnalysisTime = Date.now() - startTime

      // Store the JD intelligence in parallel with other operations
      prisma.jobDescriptionIntelligence
        .create({
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
        .catch((error) => {
          errorLog("TAILOR", "Error storing JD intelligence:", error)
          // Non-critical error, continue with tailoring
        })

      debugLog("TAILOR", `JD intelligence obtained and storing initiated`)
    }

    // Optimization: Prepare context for all iterations upfront
    const tailoringContext = {
      resumeText,
      jobDescription,
      mode: tailoringMode as any,
      jdIntelligence,
      version: resume.version,
    }

    // Multi-iteration tailoring process with optimized approach
    for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
      const attemptStartTime = Date.now()
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

      let tailoredResume = ""
      let promptUsed = ""
      let modifiedSections: Record<string, { before: string; after: string }> = {}
      let modifiedSectionNames: string[] = []
      let sectionsToRefine: Record<string, string> = {}

      // First iteration: Send full resume
      // Subsequent iterations: Use more targeted approach
      if (attempt === 1) {
        // Create tailoring prompt with full resume
        promptUsed = compileTailoringPrompt({
          ...tailoringContext,
          previousFeedback,
        })

        debugLog("TAILOR", `Compiled full tailoring prompt for first iteration, length: ${promptUsed.length} chars`)

        // Generate tailored resume with real-time API call
        const { success, text } = await generateContent(
          "", // API key from env
          promptUsed,
          "gemini-1.5-flash",
          getTemperatureForMode(tailoringMode as TailoringMode),
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

        // Compute section-level changes
        modifiedSections = diffSections(resumeText, tailoredResume)
        modifiedSectionNames = Object.keys(modifiedSections)
        debugLog("TAILOR", `Identified ${modifiedSectionNames.length} modified sections`)

        // Update the modifiedSectionsMap with the new sections
        const newSections = extractSections(tailoredResume)
        Object.keys(newSections).forEach((sectionName) => {
          if (modifiedSections[sectionName]) {
            // Clean the section content before storing it
            modifiedSectionsMap[sectionName] = cleanSectionContent(newSections[sectionName])
          }
        })

        // Add to the cumulative list of modified sections
        allModifiedSections = [...new Set([...allModifiedSections, ...modifiedSectionNames])]
      } else {
        // For subsequent iterations, use a more targeted approach
        // Reconstruct the current best resume from all sections
        const currentBestResume = reconstructResumeFromSections(modifiedSectionsMap)

        // Optimization: Only refine if we have feedback and the previous attempt wasn't successful
        if (previousFeedback.length === 0 && bestAttempt.golden_passed) {
          debugLog("TAILOR", `Skipping iteration ${attempt} - no feedback needed and golden rules passed`)
          break
        }

        // Determine which sections need refinement based on feedback
        sectionsToRefine = {}

        // Optimization: Use a smarter approach to identify sections needing refinement
        if (previousFeedback.length > 0) {
          // Extract section names from feedback
          const feedbackText = previousFeedback.join(" ").toLowerCase()

          // Find sections mentioned in feedback
          Object.keys(modifiedSectionsMap).forEach((sectionName) => {
            if (feedbackText.includes(sectionName.toLowerCase())) {
              sectionsToRefine[sectionName] = modifiedSectionsMap[sectionName]
            }
          })

          // If no specific sections found, include sections from previous modifications
          if (Object.keys(sectionsToRefine).length === 0) {
            Object.entries(modifiedSections).forEach(([sectionName, { after }]) => {
              sectionsToRefine[sectionName] = after
            })
          }

          // If still no sections, include key resume sections
          if (Object.keys(sectionsToRefine).length === 0) {
            const keySections = ["EXPERIENCE", "SKILLS", "SUMMARY", "EDUCATION"].filter(
              (section) => modifiedSectionsMap[section],
            )

            keySections.forEach((section) => {
              sectionsToRefine[section] = modifiedSectionsMap[section]
            })
          }
        }

        // If we still have no sections to refine, use the full resume
        if (Object.keys(sectionsToRefine).length === 0) {
          debugLog("TAILOR", `No specific sections to refine, using full resume for iteration ${attempt}`)
          promptUsed = compileTailoringPrompt({
            ...tailoringContext,
            resumeText: currentBestResume,
            previousFeedback,
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

          debugLog(
            "TAILOR",
            `Refining ${Object.keys(sectionsToRefine).length} sections: ${Object.keys(sectionsToRefine).join(", ")}`,
          )
        }

        // Generate refined content
        const { success, text } = await generateContent(
          "", // API key from env
          promptUsed,
          "gemini-1.5-flash",
          getTemperatureForMode(tailoringMode as TailoringMode),
        )

        if (!success || !text) {
          errorLog("TAILOR", `Refinement attempt ${attempt} failed to generate content`)
          continue
        }

        // Clean the generated text
        const cleanedText = cleanResumeOutput(text)

        // Process the refined content
        if (Object.keys(sectionsToRefine).length > 0) {
          // Parse the refined sections from the response
          const refinedSections: Record<string, string> = {}
          const sectionMatches = cleanedText.matchAll(/### (.+?) ###([\s\S]+?)(?=### |$)/g)

          for (const match of Array.from(sectionMatches)) {
            const sectionName = match[1].trim()
            const sectionContent = match[2].trim()
            refinedSections[sectionName] = cleanSectionContent(sectionContent)
          }

          // If we couldn't parse sections properly, try to extract them
          if (Object.keys(refinedSections).length === 0) {
            const extractedSections = extractSections(cleanedText)
            Object.entries(extractedSections).forEach(([name, content]) => {
              if (sectionsToRefine[name]) {
                refinedSections[name] = cleanSectionContent(content)
              }
            })
          }

          // Update the modified sections map with refined content
          Object.entries(refinedSections).forEach(([sectionName, content]) => {
            if (content && content.length > 10) {
              modifiedSectionsMap[sectionName] = content
            }
          })

          // Track which sections were modified
          modifiedSectionNames = Object.keys(refinedSections)

          // Reconstruct the full resume from updated sections
          tailoredResume = reconstructResumeFromSections(modifiedSectionsMap)
        } else {
          // If we sent the full resume, use the full response
          tailoredResume = cleanedText

          // Update modified sections map
          const newSections = extractSections(tailoredResume)
          Object.entries(newSections).forEach(([name, content]) => {
            modifiedSectionsMap[name] = cleanSectionContent(content)
          })

          // Compute changes
          modifiedSections = diffSections(currentBestResume, tailoredResume)
          modifiedSectionNames = Object.keys(modifiedSections)
        }

        // Add to the cumulative list of modified sections
        allModifiedSections = [...new Set([...allModifiedSections, ...modifiedSectionNames])]
      }

      // Update progress to indicate we're scoring the result
      await updateTailoringProgress(
        resumeId,
        user.id,
        `scoring_${attempt}`,
        Math.round(20 + ((attempt - 0.5) / MAX_ATTEMPTS) * 50),
        attempt,
      )

      // Run golden rules check and scoring in parallel for efficiency
      const [goldenRulesResult, scoringResult] = await Promise.all([
        checkGoldenRules(tailoredResume, jobDescription),
        calculateScoresWithGPT(resumeText, tailoredResume, jobDescription, { atsWeight: 0.3, jdWeight: 0.7 }),
      ])

      debugLog("TAILOR", `Golden rules result: passed=${goldenRulesResult.passed}`)
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
          atsScore: ats_score,
          jdScore: jd_score,
          golden_passed: goldenRulesResult.passed,
          atsFeedback,
          jdFeedback,
        }
        bestScore = totalScore
        debugLog("TAILOR", `New best attempt: ats=${ats_score}, jd=${jd_score}, total=${totalScore}`)
      }

      // Store the tailoring attempt
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
          modifiedSectionsSent: JSON.stringify(Object.keys(sectionsToRefine || {})),
          modifiedSectionsReceived: JSON.stringify(modifiedSectionNames),
          promptTokens: promptUsed.length,
          goldenRuleFeedback: JSON.stringify(goldenRulesResult),
          iteration: attempt,
          modifiedSections: JSON.stringify(modifiedSections),
          score: totalScore,
        },
      })

      // Track performance metrics
      perfMetrics[`attempt_${attempt}_time`] = Date.now() - attemptStartTime

      // Exit early if golden rules passed or we have a high score
      if (goldenRulesResult.passed || totalScore > 170) {
        debugLog(
          "TAILOR",
          `Early termination at attempt ${attempt}: golden_passed=${goldenRulesResult.passed}, score=${totalScore}`,
        )
        break
      }
    }

    // Update progress to processing
    await updateTailoringProgress(resumeId, user.id, "processing", 80)

    // Ensure all original sections are present in the final output
    Object.keys(originalSections).forEach((sectionName) => {
      if (!modifiedSectionsMap[sectionName]) {
        modifiedSectionsMap[sectionName] = cleanSectionContent(originalSections[sectionName])
      }
    })

    // Reconstruct the final resume from all sections
    const finalTailoredResume = reconstructResumeFromSections(modifiedSectionsMap)

    // Clean the tailored resume output one final time
    const cleanedResume = cleanResumeOutput(finalTailoredResume)
    debugLog("TAILOR", `Final resume length: ${cleanedResume.length} chars`)

    // Validate the cleaned resume
    if (!cleanedResume || cleanedResume.length < 50) {
      errorLog("TAILOR", `Cleaned resume is too short or empty: "${cleanedResume}"`)

      // Create a fallback resume content
      const fallbackContent = `
[TAILORING ENCOUNTERED AN ERROR]

Original Resume:
${resumeText.substring(0, 500)}...

We apologize, but we encountered an issue while tailoring your resume. 
Please try again or contact support if the problem persists.
`.trim()

      // Update the resume with the fallback content
      await prisma.resume.update({
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
          finalModifiedSections: JSON.stringify(allModifiedSections),
        },
      })

      // Update progress to error
      await updateTailoringProgress(resumeId, user.id, "error", 0)
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
    try {
      const updatedResume = await prisma.resume.update({
        where: {
          id: resumeId,
          userId: user.id,
        },
        data: {
          modifiedResume: cleanedResume,
          atsScore: bestAttempt.atsScore,
          jdScore: bestAttempt.jdScore,
          version: currentVersion,
          tailoringMode: tailoringMode,
          goldenPassed: finalGoldenRulesResult.passed,
          finalModifiedSections: JSON.stringify(allModifiedSections),
        },
      })

      if (!updatedResume.modifiedResume || updatedResume.modifiedResume.length < 50) {
        throw new Error("Failed to save valid resume content")
      }
    } catch (error) {
      errorLog("TAILOR", `Error updating resume:`, error)
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
        atsScore: bestAttempt.atsScore,
        jdScore: bestAttempt.jdScore,
        goldenPassed: finalGoldenRulesResult.passed,
        isRefinement: isRefinement,
        modifiedSections: JSON.stringify(allModifiedSections),
      },
    })

    // Update progress to completed
    await updateTailoringProgress(resumeId, user.id, "completed", 100)

    // Log analytics
    await logTailoringAnalytics({
      userId: user.id,
      resumeId,
      originalText: resumeText,
      tailoredText: cleanedResume,
      jobDescription,
      atsScore: bestAttempt.atsScore,
      jdScore: bestAttempt.jdScore,
      tailoringMode,
      isRefinement,
      iterations,
      goldenPassed: finalGoldenRulesResult.passed,
      modifiedSections: allModifiedSections,
    })

    // Log performance metrics
    perfMetrics.totalTime = Date.now() - startTime
    debugLog("TAILOR_PERF", `Performance metrics: ${JSON.stringify(perfMetrics)}`)

    return {
      success: true,
      data: {
        version: currentVersion,
        ats_score: bestAttempt.atsScore,
        jd_score: bestAttempt.jdScore,
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
