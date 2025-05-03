/**
 * Tailoring prompt compilation system
 *
 * This module handles the dynamic generation of tailoring prompts based on:
 * - Tailoring mode (basic, personalized, aggressive)
 * - Resume content and job description
 * - Previous feedback (for iterative improvements)
 * - Version information
 */

// Optimize the prompt compilation to be more efficient

// Add a prompt cache at the top of the file
import { createHash } from "crypto"

const promptCache = new Map<string, string>()
const MAX_PROMPT_CACHE_SIZE = 50

// Add a function to generate a cache key
function generatePromptCacheKey(params: CompileTailoringPromptParams): string {
  const { resumeText, jobDescription, mode, version } = params
  // Create a hash of the key inputs
  return `${mode || "personalized"}:${version || 1}:${createHash("sha256")
    .update((resumeText || "").substring(0, 500) + (jobDescription || "").substring(0, 500))
    .digest("hex")}`
}

// Define the tailoring modes and their configurations
export type TailoringMode = "basic" | "personalized" | "aggressive"

interface TailoringModeConfig {
  name: string
  description: string
  instructions: string
  temperature: number
  examples?: string
  additionalGuidance?: string
}

// Configuration object for all tailoring modes
// This makes it easy to update instructions per mode or add new modes
export const TAILORING_MODES: Record<TailoringMode, TailoringModeConfig> = {
  basic: {
    name: "Basic",
    description: "Light optimization with minimal changes",
    temperature: 0.3,
    instructions: `
Make only minimal improvements to grammar, structure, and formatting. 
Do not change content or tone. 
Lightly enhance flow and alignment with the job description.
Focus on keyword matching without changing the resume's structure.
Preserve all sections and formatting from the original resume.
Only make changes that are necessary for better ATS compatibility.
Do not add new experiences or qualifications that aren't in the original.
`,
    additionalGuidance: `
For Basic mode, think of yourself as an editor rather than a rewriter.
Your goal is to make the resume more effective without changing its essence.
Focus on small optimizations that improve ATS compatibility and readability.
`,
  },

  personalized: {
    name: "Personalized",
    description: "Enhanced alignment while preserving personal voice",
    temperature: 0.5,
    instructions: `
Preserve the candidate's unique tone and story.
Improve clarity, flow, and alignment with the job.
Do not over-sanitize or remove personality.
Enhance the resume's impact by highlighting relevant experiences.
Maintain the candidate's voice and personal achievements.
Restructure content only when it significantly improves job alignment.
Ensure all changes feel authentic to the candidate's background.
`,
    additionalGuidance: `
For Personalized mode, balance optimization with authenticity.
Your goal is to make the resume more effective while preserving the candidate's unique voice.
Think of yourself as a career coach helping the candidate tell their story better.
`,
  },

  aggressive: {
    name: "Aggressive",
    description: "Maximum alignment with job requirements",
    temperature: 0.7,
    instructions: `
Rewrite boldly for maximum alignment with the job description.
Restructure content as needed to highlight relevant experience.
Prioritize keyword matching, ATS formatting, and direct job description relevance.
Do not preserve fluff or passive language.
Transform the resume to directly address the job requirements.
Use strong, active language throughout.
Reorganize sections to prioritize the most relevant experiences.
Ensure every bullet point demonstrates value relevant to the target role.
`,
    additionalGuidance: `
For Aggressive mode, prioritize effectiveness over preserving the original structure.
Your goal is to transform the resume into the most competitive version possible.
Think of yourself as a strategic advisor preparing the candidate for a highly competitive role.
`,
  },
}

// Interface for the function parameters
interface CompileTailoringPromptParams {
  resumeText: string
  jobDescription: string
  mode: TailoringMode
  jdIntelligence?: any
  previousFeedback?: string[]
  version?: number
}

function extractKeywords(jobDescription: string, count = 5): string[] {
  // Implement your keyword extraction logic here
  // This is a placeholder implementation
  const keywords = jobDescription.split(" ").slice(0, count)
  return keywords
}

/**
 * Compiles a tailoring prompt based on the specified parameters
 * Optimized for efficiency and effectiveness
 */
export function compileTailoringPrompt({
  resumeText,
  jobDescription,
  mode = "personalized",
  jdIntelligence = null,
  previousFeedback = [],
  version = 1,
}: CompileTailoringPromptParams): string {
  // For refinements with feedback, skip cache
  if (previousFeedback.length === 0) {
    const cacheKey = generatePromptCacheKey({
      resumeText: resumeText || "",
      jobDescription: jobDescription || "",
      mode: mode || "personalized",
      jdIntelligence,
      previousFeedback,
      version: version || 1,
    })

    // Check cache
    if (promptCache.has(cacheKey)) {
      return promptCache.get(cacheKey)!
    }
  }

  // Get the configuration for the selected mode
  const modeConfig = TAILORING_MODES[mode]

  // Build a more concise prompt
  let prompt = `You are an expert resume tailor.

TASK: Rewrite the resume to match the job description.
MODE: ${modeConfig.name} (${modeConfig.description})
INSTRUCTIONS:
${modeConfig.instructions}
`

  // Add JD intelligence if available - more focused
  if (jdIntelligence) {
    prompt += `
JOB INTELLIGENCE:
Role: ${jdIntelligence.role}
Keywords: ${jdIntelligence.keywords.slice(0, 5).join(", ")}
Key Responsibilities: ${jdIntelligence.responsibilities
      .slice(0, 3)
      .map((r: string) => r)
      .join("; ")}
Key Qualifications: ${jdIntelligence.qualifications
      .slice(0, 3)
      .map((q: string) => q)
      .join("; ")}
`
  }

  // Add version-specific guidance
  if (version > 1) {
    prompt += `VERSION: ${version} - Focus on refining previous version.
`
  }

  // Add previous feedback if available - more focused
  if (previousFeedback && previousFeedback.length > 0) {
    prompt += `
FEEDBACK TO ADDRESS:
${previousFeedback
  .slice(0, 3)
  .map((feedback) => `• ${feedback}`)
  .join("\n")}
`
  }

  // Add output format instructions - streamlined
  prompt += `
OUTPUT FORMAT:
• Return ONLY the tailored resume text
• Preserve section order and formatting
• No explanations or commentary
`

  // Add the resume and job description
  prompt += `
RESUME:
${resumeText || ""}

JOB DESCRIPTION:
${jobDescription || ""}
`

  // Cache the prompt if not a refinement with feedback
  if (previousFeedback.length === 0) {
    const cacheKey = generatePromptCacheKey({
      resumeText: resumeText || "",
      jobDescription: jobDescription || "",
      mode: mode || "personalized",
      jdIntelligence,
      previousFeedback,
      version: version || 1,
    })

    // Manage cache size
    if (promptCache.size >= MAX_PROMPT_CACHE_SIZE) {
      // Remove oldest entry
      const firstKey = promptCache.keys().next().value
      if (firstKey !== undefined) {
        promptCache.delete(firstKey)
      }
    }

    promptCache.set(cacheKey, prompt)
  }

  return prompt
}

/**
 * Utility function to extract feedback points from a feedback string
 * This can be used to convert feedback from a string to an array for the compileTailoringPrompt function
 */
export function extractFeedbackPoints(feedbackString: string): string[] {
  if (!feedbackString) return []

  // Split by common bullet point markers and newlines
  const points = feedbackString
    .split(/(?:•|\*|-|\d+\.|[\r\n]+)/g)
    .map((point) => point.trim())
    .filter((point) => point.length > 0)

  return points
}

/**
 * Get the recommended temperature setting for a given tailoring mode
 */
export function getTemperatureForMode(mode: TailoringMode): number {
  return TAILORING_MODES[mode]?.temperature || 0.5
}

/**
 * Compiles a prompt for the Lite Tailoring system based on the specified mode
 * This is a simplified version of the full tailoring prompt for faster processing
 */
export function compileLiteTailoringPrompt({
  resumeText,
  jobDescription,
  mode = "personalized",
}: {
  resumeText: string
  jobDescription: string
  mode?: TailoringMode
}): string {
  // Common instructions for all modes
  const commonInstructions = `
You are an expert resume tailoring AI assistant. Your task is to tailor the provided resume to better match the job description.

RESUME:
${resumeText || ""}

JOB DESCRIPTION:
${jobDescription || ""}

IMPORTANT GUIDELINES:
- Maintain the original resume structure and formatting
- Do not add fictional experiences or qualifications
- Ensure the tailored resume is ATS-friendly
- Focus on highlighting relevant skills and experiences
- Return the complete tailored resume text
- Do not include explanations or comments in your response
`.trim()

  // Mode-specific instructions
  let modeInstructions = ""

  switch (mode) {
    case "basic":
      modeInstructions = `
TAILORING INSTRUCTIONS (BASIC MODE):
1. Extract the top 10 most important keywords from the job description
2. Naturally incorporate these keywords into the resume where relevant
3. Edit 6-7 sentences to better align with the job requirements
4. Make minimal changes to preserve the original content
5. Focus on optimizing the Summary/Profile section and bullet points in Experience
6. Ensure all changes maintain the candidate's authentic experience
`.trim()
      break

    case "personalized":
      modeInstructions = `
TAILORING INSTRUCTIONS (PERSONALIZED MODE):
1. Extract the top 15 most important keywords from the job description
2. Naturally incorporate these keywords throughout the resume
3. Find or create a "Projects" or "Academic Projects" section
4. Add ONE new project entry related to the job requirements using the candidate's existing skills
5. The project should be realistic based on the candidate's background
6. Enhance 8-10 bullet points across the resume to better match the job
7. Improve the Summary/Profile section to highlight relevant qualifications
8. Ensure all changes maintain the candidate's authentic experience
`.trim()
      break

    case "aggressive":
      modeInstructions = `
TAILORING INSTRUCTIONS (AGGRESSIVE MODE):
1. Extract the top 20 most important keywords and phrases from the job description
2. Strategically place these keywords throughout the resume for maximum impact
3. Rewrite the Summary/Profile section to strongly align with the job
4. Restructure bullet points in the Experience section to emphasize relevant achievements
5. Reorganize Skills section to prioritize job-relevant skills
6. Rewrite 40-50% of the resume content to better match the job requirements
7. Add relevant industry-specific terminology where appropriate
8. Ensure all changes maintain the candidate's authentic experience and qualifications
`.trim()
      break
  }

  // Final output instructions
  const outputInstructions = `
OUTPUT INSTRUCTIONS:
- Return ONLY the complete tailored resume text
- Do not include explanations, comments, or markdown formatting
- Maintain proper spacing and formatting for ATS compatibility
`.trim()

  // Combine all instructions
  return `${commonInstructions}

${modeInstructions}

${outputInstructions}`
}
