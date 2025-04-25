import { type TailoringMode, TAILORING_MODES } from "./compile-tailoring-prompt"

/**
 * Compiles a refinement prompt for targeted section improvements
 * Optimized for efficiency and effectiveness
 */
export function compileRefinementPrompt({
  sectionsToRefine,
  feedback,
  jobDescription,
  mode = "personalized",
  jdIntelligence = null,
  version = 1,
  goldenRuleFeedback = [],
}: {
  sectionsToRefine: Record<string, string>
  feedback: string[]
  jobDescription: string
  mode?: TailoringMode
  jdIntelligence?: any
  version?: number
  goldenRuleFeedback?: string[]
}): string {
  // Get the configuration for the selected mode
  const modeConfig = TAILORING_MODES[mode]

  // Build the prompt header - more concise but still effective
  let prompt = `You are an expert resume tailor with years of experience helping candidates optimize their resumes for specific job opportunities.

TASK:
Refine specific sections of a resume to better match the provided job description, based on feedback.

TAILORING MODE: ${modeConfig.name} (${modeConfig.description})

SECTIONS TO REFINE:
`

  // Add each section to refine
  Object.entries(sectionsToRefine).forEach(([sectionName, content]) => {
    prompt += `
### ${sectionName} ###
${content}
`
  })

  // Add feedback to address
  if (feedback && feedback.length > 0) {
    prompt += `
FEEDBACK TO ADDRESS:
${feedback.map((item) => `• ${item}`).join("\n")}
`
  }

  // Add golden rule feedback if available
  if (goldenRuleFeedback && goldenRuleFeedback.length > 0) {
    prompt += `
GOLDEN RULE FEEDBACK:
${goldenRuleFeedback.map((item) => `• ${item}`).join("\n")}
`
  }

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
`
  }

  // Add job description
  prompt += `
JOB DESCRIPTION:
${jobDescription}
`

  // Add output format instructions
  prompt += `
OUTPUT FORMAT:
• Return ONLY the refined sections, each wrapped with ### SECTION_NAME ### markers
• Do NOT include any explanations, introductions, or commentary
• Maintain consistent formatting, bullet points, and indentation
• Focus on addressing the feedback while preserving the candidate's voice
• Example format:

### EXPERIENCE ###
Refined experience section content...

### SKILLS ###
Refined skills section content...
`

  return prompt
}
