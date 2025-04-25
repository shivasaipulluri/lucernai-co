/**
 * Tailoring prompt compilation system
 *
 * This module handles the dynamic generation of tailoring prompts based on:
 * - Tailoring mode (basic, personalized, aggressive)
 * - Resume content and job description
 * - Previous feedback (for iterative improvements)
 * - Version information
 */

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
  // Get the configuration for the selected mode
  const modeConfig = TAILORING_MODES[mode]

  // Build the prompt header - more concise but still effective
  let prompt = `You are an expert resume tailor with years of experience helping candidates optimize their resumes for specific job opportunities.

TASK:
Rewrite the following resume to better match the provided job description.

TAILORING MODE: ${modeConfig.name} (${modeConfig.description})

TAILORING INSTRUCTIONS:
${modeConfig.instructions}
`

  // Add JD intelligence if available - more focused
  if (jdIntelligence) {
    prompt += `
JOB INTELLIGENCE:
Role: ${jdIntelligence.role}
Seniority: ${jdIntelligence.seniority}
Key Keywords: ${jdIntelligence.keywords.join(", ")}
Key Responsibilities: 
${jdIntelligence.responsibilities
  .slice(0, 5)
  .map((r: string) => `- ${r}`)
  .join("\n")}
Key Qualifications: 
${jdIntelligence.qualifications
  .slice(0, 5)
  .map((q: string) => `- ${q}`)
  .join("\n")}

Use this intelligence to guide your tailoring approach.
`
  }

  // Add version-specific guidance
  if (version > 1) {
    prompt += `
VERSION CONTEXT:
This is version ${version} of the resume. Focus on refining and improving the previous version.
`
  }

  // Add previous feedback if available - more focused
  if (previousFeedback && previousFeedback.length > 0) {
    prompt += `
PREVIOUS FEEDBACK TO ADDRESS:
${previousFeedback
  .slice(0, 5)
  .map((feedback) => `• ${feedback}`)
  .join("\n")}

Please incorporate this feedback in your tailoring approach.
`
  }

  // Add output format instructions - streamlined but comprehensive
  prompt += `
OUTPUT FORMAT REQUIREMENTS:
• Return ONLY the tailored resume text without any explanations or commentary
• Do NOT include any section labels, debugging markers, or explanatory text
• Preserve the same section order, spacing, and formatting as the original resume
• Maintain consistent bullet point styles and indentation throughout
• Keep the same heading format and capitalization as the original resume
• Ensure proper spacing between sections (typically one blank line)
• Do not duplicate any sections or content
`

  // Add any additional mode-specific guidance
  if (modeConfig.additionalGuidance) {
    prompt += `
ADDITIONAL GUIDANCE:
${modeConfig.additionalGuidance}
`
  }

  // Add the resume and job description
  prompt += `
RESUME:
${resumeText}

JOB DESCRIPTION:
${jobDescription}
`

  // Add final instruction to ensure proper output
  prompt += `
Remember to return ONLY the tailored resume text without any explanations, introductions, or commentary.
`

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
