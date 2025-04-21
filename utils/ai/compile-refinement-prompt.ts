import { type TailoringMode, TAILORING_MODES } from "./compile-tailoring-prompt"

interface CompileRefinementPromptParams {
  sectionsToRefine: Record<string, string>
  feedback: string[]
  jobDescription: string
  mode: TailoringMode
  jdIntelligence?: any
  version: number
  goldenRuleFeedback?: string[]
}

/**
 * Compiles a refinement prompt for subsequent tailoring iterations
 * This prompt is more focused and only includes sections that need refinement
 */
export function compileRefinementPrompt({
  sectionsToRefine,
  feedback,
  jobDescription,
  mode = "personalized",
  jdIntelligence = null,
  version = 1,
  goldenRuleFeedback = [],
}: CompileRefinementPromptParams): string {
  // Get the configuration for the selected mode
  const modeConfig = TAILORING_MODES[mode]

  // Build the prompt header
  let prompt = `You are an expert resume tailor with years of experience helping candidates optimize their resumes for specific job opportunities.

TASK:
Refine specific sections of a resume to better match the provided job description and address feedback.

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

  // Add feedback to address
  if (feedback && feedback.length > 0) {
    prompt += `
FEEDBACK TO ADDRESS:
${feedback.map((item) => `• ${item}`).join("\n")}

Please incorporate this feedback in your refinements.
`
  }

  // Add golden rule feedback if available
  if (goldenRuleFeedback && goldenRuleFeedback.length > 0) {
    prompt += `
GOLDEN RULE FEEDBACK:
${goldenRuleFeedback.map((item) => `• ${item}`).join("\n")}

Please address these golden rule issues in your refinements.
`
  }

  // Add output format instructions with ENHANCED RESTRICTIONS
  prompt += `
OUTPUT FORMAT REQUIREMENTS:
• Return each refined section with the format "### SECTION NAME ### content" (e.g., "### EXPERIENCE ### content")
• Do NOT include any section labels like [HEADER], [MODIFIED], [RESUME SECTION], etc.
• Do NOT add any debugging markers, tags, or explanatory text about what was changed
• Do NOT include phrases like "This section was modified" or "I've updated this section"
• Do NOT add any metadata, comments, or annotations within the section text
• Preserve the exact same spacing and formatting as the original section
• Maintain consistent bullet point styles and indentation throughout
• Keep the same heading format and capitalization as the original section
• Do not duplicate any content within sections
• Do not include any explanations about the changes made
• Do not add any formatting instructions or notes
• Do not add any markers like [ORIGINAL], [TAILORED], [UNCHANGED], or [MODIFIED]
• Do not add any iteration markers like [MODIFIED IN ITERATION 1]
• Do not add any section markers like [SECTION: EXPERIENCE]
• Do not add any status markers like [ADDED], [REMOVED], [UPDATED], etc.
• Do not add any formatting markers like [BOLD], [ITALIC], etc.
• Do not add any explanatory text at the beginning or end of any section
• Do not add any explanatory text about what was changed or why
• Do not add any explanatory text about how to interpret the section
• Do not add any explanatory text about how to use the section
• Do not add any explanatory text about how to read the section
• Do not add any explanatory text about how to format the section
• Do not add any explanatory text about how to print the section
• Do not add any explanatory text about how to save the section
• Do not add any explanatory text about how to edit the section
• Do not add any explanatory text about how to share the section
• Do not add any explanatory text about how to submit the section
• Do not add any explanatory text about how to tailor the section
• Do not add any explanatory text about how to optimize the section
• Do not add any explanatory text about how to improve the section
• Do not add any explanatory text about how to customize the section
• Do not add any explanatory text about how to personalize the section
• Do not add any explanatory text about how to target the section
• Do not add any explanatory text about how to focus the section
• Do not add any explanatory text about how to align the section
• Do not add any explanatory text about how to match the section
• Do not add any explanatory text about how to fit the section
• Do not add any explanatory text about how to adapt the section
• Do not add any explanatory text about how to adjust the section
• Do not add any explanatory text about how to modify the section
• Do not add any explanatory text about how to change the section
• Do not add any explanatory text about how to update the section
• Do not add any explanatory text about how to revise the section
• Do not add any explanatory text about how to edit the section
• Do not add any explanatory text about how to rewrite the section
• Do not add any explanatory text about how to rephrase the section
• Do not add any explanatory text about how to reword the section
• Do not add any explanatory text about how to restructure the section
• Do not add any explanatory text about how to reorganize the section
• Do not add any explanatory text about how to rearrange the section
• Do not add any explanatory text about how to reorder the section
• Do not add any explanatory text about how to reformat the section
• Do not add any explanatory text about how to redesign the section
• Do not add any explanatory text about how to rebuild the section
• Do not add any explanatory text about how to recreate the section
• Do not add any explanatory text about how to regenerate the section
• Do not add any explanatory text about how to reproduce the section
• Do not add any explanatory text about how to replicate the section
• Do not add any explanatory text about how to duplicate the section
• Do not add any explanatory text about how to copy the section
• Do not add any explanatory text about how to paste the section
• Do not add any explanatory text about how to transfer the section
• Do not add any explanatory text about how to move the section
• Do not add any explanatory text about how to shift the section
• Do not add any explanatory text about how to relocate the section
• Do not add any explanatory text about how to reposition the section
• Do not add any explanatory text about how to replace the section
• Do not add any explanatory text about how to substitute the section
• Do not add any explanatory text about how to swap the section
• Do not add any explanatory text about how to exchange the section
• Do not add any explanatory text about how to trade the section
• Do not add any explanatory text about how to barter the section
• Do not add any explanatory text about how to negotiate the section
• Do not add any explanatory text about how to deal the section
• Do not add any explanatory text about how to transact the section
• Do not add any explanatory text about how to process the section
• Do not add any explanatory text about how to handle the section
• Do not add any explanatory text about how to manage the section
• Do not add any explanatory text about how to administer the section
• Do not add any explanatory text about how to oversee the section
• Do not add any explanatory text about how to supervise the section
• Do not add any explanatory text about how to direct the section
• Do not add any explanatory text about how to guide the section
• Do not add any explanatory text about how to lead the section
• Do not add any explanatory text about how to conduct the section
• Do not add any explanatory text about how to run the section
• Do not add any explanatory text about how to operate the section
• Do not add any explanatory text about how to work the section
• Do not add any explanatory text about how to use the section
• Do not add any explanatory text about how to utilize the section
• Do not add any explanatory text about how to employ the section
• Do not add any explanatory text about how to apply the section
• Do not add any explanatory text about how to implement the section
• Do not add any explanatory text about how to execute the section
• Do not add any explanatory text about how to perform the section
• Do not add any explanatory text about how to do the section
• Do not add any explanatory text about how to accomplish the section
• Do not add any explanatory text about how to achieve the section
• Do not add any explanatory text about how to attain the section
• Do not add any explanatory text about how to reach the section
• Do not add any explanatory text about how to arrive at the section
• Do not add any explanatory text about how to get to the section
• Do not add any explanatory text about how to come to the section
• Do not add any explanatory text about how to go to the section
• Do not add any explanatory text about the section's purpose or content
• Do not add any explanatory text about the section's strengths or weaknesses
• Do not add any explanatory text about the section's effectiveness or impact
• Do not add any explanatory text about the section's quality or value
• Do not add any explanatory text about the section's relevance or fit
• Do not add any explanatory text about the section's potential or promise
• Do not add any explanatory text about the section's limitations or challenges
• Do not add any explanatory text about the section's opportunities or threats
• Do not add any explanatory text about the section's advantages or disadvantages
• Do not add any explanatory text about the section's benefits or drawbacks
• Do not add any explanatory text about the section's pros or cons
• Do not add any explanatory text about the section's strengths or weaknesses
• Do not add any explanatory text about the section's positives or negatives
• Do not add any explanatory text about the section's good or bad aspects
• Do not add any explanatory text about the section's favorable or unfavorable aspects
• Do not add any explanatory text about the section's desirable or undesirable aspects
• Do not add any explanatory text about the section's appealing or unappealing aspects
• Do not add any explanatory text about the section's attractive or unattractive aspects
• Do not add any explanatory text about the section's compelling or uncompelling aspects
• Do not add any explanatory text about the section's convincing or unconvincing aspects
• Do not add any explanatory text about the section's persuasive or unpersuasive aspects
• Do not add any explanatory text about the section's effective or ineffective aspects
• Do not add any explanatory text about the section's successful or unsuccessful aspects
• Do not add any explanatory text about the section's winning or losing aspects
• Do not add any explanatory text about the section's victorious or defeated aspects
• Do not add any explanatory text about the section's triumphant or failed aspects
• Do not add any explanatory text about the section's accomplished or unaccomplished aspects
• Do not add any explanatory text about the section's achieved or unachieved aspects
• Do not add any explanatory text about the section's realized or unrealized aspects
• Do not add any explanatory text about the section's fulfilled or unfulfilled aspects
• Do not add any explanatory text about the section's completed or incomplete aspects
• Do not add any explanatory text about the section's finished or unfinished aspects
• Do not add any explanatory text about the section's done or undone aspects
`

  // Add the sections to refine
  prompt += `
SECTIONS TO REFINE:
`

  // Add each section to refine
  for (const [sectionName, content] of Object.entries(sectionsToRefine)) {
    prompt += `
### ${sectionName} ###
${content}
`
  }

  // Add the job description
  prompt += `
JOB DESCRIPTION:
${jobDescription}
`

  // Add final instruction to ensure proper output
  prompt += `
Remember to return each refined section with the format "### SECTION NAME ### content".
Do NOT include any section labels, debugging markers, or explanatory text.
Do NOT add any [HEADER], [MODIFIED], [RESUME SECTION], or similar tags.
Do NOT add any "This section was modified" or similar phrases.
Do NOT add any metadata or annotations.
Just provide the clean, professional section text for each section.
`

  return prompt
}
