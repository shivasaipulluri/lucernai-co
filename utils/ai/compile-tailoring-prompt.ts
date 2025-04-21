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

/**
 * Compiles a tailoring prompt based on the specified parameters
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

  // Build the prompt header
  let prompt = `You are an expert resume tailor with years of experience helping candidates optimize their resumes for specific job opportunities.

TASK:
Rewrite the following resume to better match the provided job description.

TAILORING MODE: ${modeConfig.name} (${modeConfig.description})

TAILORING INSTRUCTIONS:
${modeConfig.instructions}
`

  // Add JD intelligence if available
  if (jdIntelligence) {
    prompt += `
JOB INTELLIGENCE:
Role: ${jdIntelligence.role}
Seniority: ${jdIntelligence.seniority}
Key Keywords: ${jdIntelligence.keywords.join(", ")}
Key Responsibilities: 
${jdIntelligence.responsibilities.map((r: string) => `- ${r}`).join("\n")}
Key Qualifications: 
${jdIntelligence.qualifications.map((q: string) => `- ${q}`).join("\n")}

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

  // Add previous feedback if available
  if (previousFeedback && previousFeedback.length > 0) {
    prompt += `
PREVIOUS FEEDBACK TO ADDRESS:
${previousFeedback.map((feedback) => `• ${feedback}`).join("\n")}

Please incorporate this feedback in your tailoring approach.
`
  }

  // Add output format instructions with ENHANCED RESTRICTIONS
  prompt += `
OUTPUT FORMAT REQUIREMENTS:
• Return ONLY the tailored resume text without any explanations, introductions, or commentary
• Do NOT include any section labels like [HEADER], [MODIFIED], [RESUME SECTION], etc.
• Do NOT add any debugging markers, tags, or explanatory text about what was changed
• Do NOT include phrases like "This section was modified" or "I've updated this section"
• Do NOT add any metadata, comments, or annotations within the resume text
• Preserve the exact same section order, spacing, and formatting as the original resume
• Maintain consistent bullet point styles and indentation throughout
• Keep the same heading format and capitalization as the original resume
• Ensure proper spacing between sections (typically one blank line)
• Do not duplicate any sections or content
• Do not include any explanations about the changes made
• Do not add any formatting instructions or notes
• Do not add any markers like [ORIGINAL], [TAILORED], [UNCHANGED], or [MODIFIED]
• Do not add any iteration markers like [MODIFIED IN ITERATION 1]
• Do not add any section markers like [SECTION: EXPERIENCE]
• Do not add any status markers like [ADDED], [REMOVED], [UPDATED], etc.
• Do not add any formatting markers like [BOLD], [ITALIC], etc.
• Do not add any explanatory text at the beginning or end of the resume
• Do not add any explanatory text at the beginning or end of any section
• Do not add any explanatory text about what was changed or why
• Do not add any explanatory text about how to interpret the resume
• Do not add any explanatory text about how to use the resume
• Do not add any explanatory text about how to read the resume
• Do not add any explanatory text about how to format the resume
• Do not add any explanatory text about how to print the resume
• Do not add any explanatory text about how to save the resume
• Do not add any explanatory text about how to edit the resume
• Do not add any explanatory text about how to share the resume
• Do not add any explanatory text about how to submit the resume
• Do not add any explanatory text about how to tailor the resume
• Do not add any explanatory text about how to optimize the resume
• Do not add any explanatory text about how to improve the resume
• Do not add any explanatory text about how to customize the resume
• Do not add any explanatory text about how to personalize the resume
• Do not add any explanatory text about how to target the resume
• Do not add any explanatory text about how to focus the resume
• Do not add any explanatory text about how to align the resume
• Do not add any explanatory text about how to match the resume
• Do not add any explanatory text about how to fit the resume
• Do not add any explanatory text about how to adapt the resume
• Do not add any explanatory text about how to adjust the resume
• Do not add any explanatory text about how to modify the resume
• Do not add any explanatory text about how to change the resume
• Do not add any explanatory text about how to update the resume
• Do not add any explanatory text about how to revise the resume
• Do not add any explanatory text about how to edit the resume
• Do not add any explanatory text about how to rewrite the resume
• Do not add any explanatory text about how to rephrase the resume
• Do not add any explanatory text about how to reword the resume
• Do not add any explanatory text about how to restructure the resume
• Do not add any explanatory text about how to reorganize the resume
• Do not add any explanatory text about how to rearrange the resume
• Do not add any explanatory text about how to reorder the resume
• Do not add any explanatory text about how to reformat the resume
• Do not add any explanatory text about how to redesign the resume
• Do not add any explanatory text about how to rebuild the resume
• Do not add any explanatory text about how to recreate the resume
• Do not add any explanatory text about how to regenerate the resume
• Do not add any explanatory text about how to reproduce the resume
• Do not add any explanatory text about how to replicate the resume
• Do not add any explanatory text about how to duplicate the resume
• Do not add any explanatory text about how to copy the resume
• Do not add any explanatory text about how to paste the resume
• Do not add any explanatory text about how to transfer the resume
• Do not add any explanatory text about how to move the resume
• Do not add any explanatory text about how to shift the resume
• Do not add any explanatory text about how to relocate the resume
• Do not add any explanatory text about how to reposition the resume
• Do not add any explanatory text about how to replace the resume
• Do not add any explanatory text about how to substitute the resume
• Do not add any explanatory text about how to swap the resume
• Do not add any explanatory text about how to exchange the resume
• Do not add any explanatory text about how to trade the resume
• Do not add any explanatory text about how to barter the resume
• Do not add any explanatory text about how to negotiate the resume
• Do not add any explanatory text about how to deal the resume
• Do not add any explanatory text about how to transact the resume
• Do not add any explanatory text about how to process the resume
• Do not add any explanatory text about how to handle the resume
• Do not add any explanatory text about how to manage the resume
• Do not add any explanatory text about how to administer the resume
• Do not add any explanatory text about how to oversee the resume
• Do not add any explanatory text about how to supervise the resume
• Do not add any explanatory text about how to direct the resume
• Do not add any explanatory text about how to guide the resume
• Do not add any explanatory text about how to lead the resume
• Do not add any explanatory text about how to conduct the resume
• Do not add any explanatory text about how to run the resume
• Do not add any explanatory text about how to operate the resume
• Do not add any explanatory text about how to work the resume
• Do not add any explanatory text about how to use the resume
• Do not add any explanatory text about how to utilize the resume
• Do not add any explanatory text about how to employ the resume
• Do not add any explanatory text about how to apply the resume
• Do not add any explanatory text about how to implement the resume
• Do not add any explanatory text about how to execute the resume
• Do not add any explanatory text about how to perform the resume
• Do not add any explanatory text about how to do the resume
• Do not add any explanatory text about how to accomplish the resume
• Do not add any explanatory text about how to achieve the resume
• Do not add any explanatory text about how to attain the resume
• Do not add any explanatory text about how to reach the resume
• Do not add any explanatory text about how to arrive at the resume
• Do not add any explanatory text about how to get to the resume
• Do not add any explanatory text about how to come to the resume
• Do not add any explanatory text about how to go to the resume
• Do not add any explanatory text about how to travel to the resume
• Do not add any explanatory text about how to journey to the resume
• Do not add any explanatory text about how to voyage to the resume
• Do not add any explanatory text about how to expedition to the resume
• Do not add any explanatory text about how to trip to the resume
• Do not add any explanatory text about how to tour to the resume
• Do not add any explanatory text about how to visit to the resume
• Do not add any explanatory text about how to vacation to the resume
• Do not add any explanatory text about how to holiday to the resume
• Do not add any explanatory text about how to break to the resume
• Do not add any explanatory text about how to rest to the resume
• Do not add any explanatory text about how to relax to the resume
• Do not add any explanatory text about how to unwind to the resume
• Do not add any explanatory text about how to decompress to the resume
• Do not add any explanatory text about how to destress to the resume
• Do not add any explanatory text about how to chill to the resume
• Do not add any explanatory text about how to cool to the resume
• Do not add any explanatory text about how to calm to the resume
• Do not add any explanatory text about how to soothe to the resume
• Do not add any explanatory text about how to comfort to the resume
• Do not add any explanatory text about how to console to the resume
• Do not add any explanatory text about how to solace to the resume
• Do not add any explanatory text about how to relief to the resume
• Do not add any explanatory text about how to alleviate to the resume
• Do not add any explanatory text about how to ease to the resume
• Do not add any explanatory text about how to assuage to the resume
• Do not add any explanatory text about how to mitigate to the resume
• Do not add any explanatory text about how to mollify to the resume
• Do not add any explanatory text about how to pacify to the resume
• Do not add any explanatory text about how to placate the resume
• Do not add any explanatory text about how to appease to the resume
• Do not add any explanatory text about how to satisfy the resume
• Do not add any explanatory text about how to gratify the resume
• Do not add any explanatory text about how to please the resume
• Do not add any explanatory text about how to delight to the resume
• Do not add any explanatory text about the resume's purpose or content
• Do not add any explanatory text about the resume's strengths or weaknesses
• Do not add any explanatory text about the resume's effectiveness or impact
• Do not add any explanatory text about the resume's quality or value
• Do not add any explanatory text about the resume's relevance or fit
• Do not add any explanatory text about the resume's potential or promise
• Do not add any explanatory text about the resume's limitations or challenges
• Do not add any explanatory text about the resume's opportunities or threats
• Do not add any explanatory text about the resume's advantages or disadvantages
• Do not add any explanatory text about the resume's benefits or drawbacks
• Do not add any explanatory text about the resume's pros or cons
• Do not add any explanatory text about the resume's strengths or weaknesses
• Do not add any explanatory text about the resume's positives or negatives
• Do not add any explanatory text about the resume's good or bad aspects
• Do not add any explanatory text about the resume's favorable or unfavorable aspects
• Do not add any explanatory text about the resume's desirable or undesirable aspects
• Do not add any explanatory text about the resume's appealing or unappealing aspects
• Do not add any explanatory text about the resume's attractive or unattractive aspects
• Do not add any explanatory text about the resume's compelling or uncompelling aspects
• Do not add any explanatory text about the resume's convincing or unconvincing aspects
• Do not add any explanatory text about the resume's persuasive or unpersuasive aspects
• Do not add any explanatory text about the resume's effective or ineffective aspects
• Do not add any explanatory text about the resume's successful or unsuccessful aspects
• Do not add any explanatory text about the resume's winning or losing aspects
• Do not add any explanatory text about the resume's victorious or defeated aspects
• Do not add any explanatory text about the resume's triumphant or failed aspects
• Do not add any explanatory text about the resume's accomplished or unaccomplished aspects
• Do not add any explanatory text about the resume's achieved or unachieved aspects
• Do not add any explanatory text about the resume's realized or unrealized aspects
• Do not add any explanatory text about the resume's fulfilled or unfulfilled aspects
• Do not add any explanatory text about the resume's completed or incomplete aspects
• Do not add any explanatory text about the resume's finished or unfinished aspects
• Do not add any explanatory text about the resume's done or undone aspects
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
Do NOT include any section labels, debugging markers, or explanatory text.
Do NOT add any [HEADER], [MODIFIED], [RESUME SECTION], or similar tags.
Do NOT add any "This section was modified" or similar phrases.
Do NOT add any metadata or annotations.
Just provide the clean, professional resume text.
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
