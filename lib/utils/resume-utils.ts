import {
  cleanSectionContent,
  extractSections,
  reconstructResumeFromSections,
  validateFinalResume,
  validateATSSafeResume,
} from "@/utils/ai/resume-section-utils"
import { prisma } from "@/lib/prisma"

/**
 * Cleans the resume output from the AI to ensure it's properly formatted
 * @param resumeText The raw resume text from the AI
 * @returns Cleaned and properly formatted resume text
 */
export function cleanResumeOutput(resumeText: string): string {
  if (!resumeText) return ""

  // First, do a basic cleanup of the entire text to remove any debugging markers
  const cleaned = resumeText
    .replace(/\[\s*HEADER\s*\]/gi, "")
    .replace(/\[\s*MODIFIED(\s+IN\s+ITERATION\s+\d+)?\s*\]/gi, "")
    .replace(/\[\s*RESUME\s+SECTION\s*\]/gi, "")
    .replace(/\[\s*SECTION:?\s*[^\]]*\]/gi, "")
    .replace(/\[\s*ORIGINAL\s*\]/gi, "")
    .replace(/\[\s*TAILORED\s*\]/gi, "")
    .replace(/\[\s*UNCHANGED\s*\]/gi, "")
    .replace(/\[\s*MODIFIED\s*\]/gi, "")
    .replace(/\[\s*ADDED\s*\]/gi, "")
    .replace(/\[\s*REMOVED\s*\]/gi, "")
    .replace(/\[\s*UPDATED\s*\]/gi, "")
    .replace(/\[\s*ENHANCED\s*\]/gi, "")
    .replace(/\[\s*IMPROVED\s*\]/gi, "")
    .replace(/\[\s*OPTIMIZED\s*\]/gi, "")
    .replace(/\[\s*REFINED\s*\]/gi, "")
    .replace(/\[\s*REVISED\s*\]/gi, "")
    .replace(/\[\s*EDITED\s*\]/gi, "")
    .replace(/\[\s*REWRITTEN\s*\]/gi, "")
    .replace(/\[\s*REWORDED\s*\]/gi, "")
    .replace(/\[\s*REFORMATTED\s*\]/gi, "")
    .replace(/\[\s*RESTRUCTURED\s*\]/gi, "")
    .replace(/\[\s*REORGANIZED\s*\]/gi, "")
    .replace(/\[\s*REARRANGED\s*\]/gi, "")
    .replace(/\[\s*REORDERED\s*\]/gi, "")
    .replace(/\[\s*REPHRASED\s*\]/gi, "")
    .replace(/\[\s*REPURPOSED\s*\]/gi, "")
    .replace(/\[\s*REALIGNED\s*\]/gi, "")
    .replace(/\[\s*ADJUSTED\s*\]/gi, "")
    .replace(/\[\s*ALIGNED\s*\]/gi, "")
    .replace(/\[\s*FORMATTED\s*\]/gi, "")
    .replace(/\[\s*FORMATTED\s+FOR\s+ATS\s*\]/gi, "")
    .replace(
      /This section (was|has been) (modified|tailored|updated|changed|enhanced|improved|optimized|refined|revised|edited|rewritten|reworded|reformatted|restructured|reorganized|rearranged|reordered|rephrased|repurposed|realigned|adjusted|aligned|formatted).*?$/gim,
      "",
    )
    .replace(
      /I (have|'ve) (modified|tailored|updated|changed|enhanced|improved|optimized|refined|revised|edited|rewritten|reworded|reformatted|restructured|reorganized|rearranged|reordered|rephrased|repurposed|realigned|adjusted|aligned|formatted).*?$/gim,
      "",
    )
    .replace(/Changes made:.*?$/gim, "")
    .replace(/Modifications:.*?$/gim, "")
    .replace(/Updates:.*?$/gim, "")
    .replace(/Enhancements:.*?$/gim, "")
    .replace(/Improvements:.*?$/gim, "")
    .replace(/Optimizations:.*?$/gim, "")
    .replace(/Refinements:.*?$/gim, "")
    .replace(/Revisions:.*?$/gim, "")
    .replace(/Edits:.*?$/gim, "")
    .replace(/Rewrites:.*?$/gim, "")
    .replace(/Rewording:.*?$/gim, "")
    .replace(/Reformatting:.*?$/gim, "")
    .replace(/Restructuring:.*?$/gim, "")
    .replace(/Reorganizing:.*?$/gim, "")
    .replace(/Rearranging:.*?$/gim, "")
    .replace(/Reordering:.*?$/gim, "")
    .replace(/Rephrasing:.*?$/gim, "")
    .replace(/Repurposing:.*?$/gim, "")
    .replace(/Realigning:.*?$/gim, "")
    .replace(/Adjustments:.*?$/gim, "")
    .replace(/Alignments:.*?$/gim, "")
    .replace(/Formatting:.*?$/gim, "")

  // Extract sections, clean each one, and reconstruct
  const sections = extractSections(cleaned)

  // If we couldn't extract sections properly, just return the cleaned text
  if (Object.keys(sections).length <= 1) {
    return cleanSectionContent(cleaned)
  }

  // Otherwise, reconstruct from cleaned sections
  return reconstructResumeFromSections(sections)
}

/**
 * Builds a final resume from original resume and modified sections
 */
export function buildFinalResume(originalResume: string, modifiedSectionsMap: Record<string, string>): string {
  // Extract original sections to preserve order and structure
  const originalSections = extractSections(originalResume)

  // Create final sections map with original order
  const finalSections: Record<string, string> = {}

  // For each original section, use the modified version if it exists, otherwise keep original
  Object.keys(originalSections).forEach((sectionName) => {
    const content = modifiedSectionsMap[sectionName] || originalSections[sectionName]
    // Apply thorough cleaning to each section before adding to final output
    finalSections[sectionName] = cleanSectionContent(content)
  })

  // Reconstruct the resume with proper formatting
  return reconstructResumeFromSections(finalSections)
}

/**
 * Tracks modified sections across all iterations
 */
export function trackModifiedSections(
  originalSections: Record<string, string>,
  newSections: Record<string, string>,
  iteration: number,
  isRefinement: boolean,
): {
  modifiedSections: string[]
  changeRationale: Record<string, string>
} {
  const modifiedSections: string[] = []
  const changeRationale: Record<string, string> = {}

  // Use diffSections to identify real changes
  const originalText = reconstructResumeFromSections(originalSections)
  const newText = reconstructResumeFromSections(newSections)

  const diffs = extractSections(originalText)

  // Only include sections that actually changed
  Object.keys(newSections).forEach((sectionName) => {
    const originalContent = originalSections[sectionName]
    const newContent = newSections[sectionName]

    if (!originalContent || originalContent !== newContent) {
      modifiedSections.push(sectionName)

      // Generate change rationale based on iteration and mode
      changeRationale[sectionName] = isRefinement
        ? `Refined in iteration ${iteration} to better align with job requirements`
        : `Modified in iteration ${iteration} to improve ATS compatibility and job match`
    }
  })

  return {
    modifiedSections,
    changeRationale,
  }
}

/**
 * Saves a resume to the database with validation
 */
export async function saveResumeToDatabase(
  resumeId: string,
  resumeText: string,
  userId: string,
): Promise<{ success: boolean; error?: string }> {
  // Validate before saving
  const validation = validateFinalResume(resumeText)

  if (!validation.isValid) {
    return {
      success: false,
      error: `Resume validation failed: ${validation.errors.join(", ")}`,
    }
  }

  // ATS validation (warnings only, doesn't block save)
  const atsValidation = validateATSSafeResume(resumeText)

  try {
    await prisma.resume.update({
      where: {
        id: resumeId,
        userId: userId,
      },
      data: {
        modifiedResume: resumeText,
        atsWarnings: atsValidation.warnings.length > 0 ? JSON.stringify(atsValidation.warnings) : null,
      },
    })

    return { success: true }
  } catch (error) {
    return {
      success: false,
      error: `Failed to save resume: ${error.message}`,
    }
  }
}
