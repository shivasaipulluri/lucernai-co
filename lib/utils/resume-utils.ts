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
 * Optimized for performance with regex caching and more efficient processing
 * @param resumeText The raw resume text from the AI
 * @returns Cleaned and properly formatted resume text
 */
export function cleanResumeOutput(resumeText: string): string {
  if (!resumeText) return ""

  // Cache regex patterns for better performance
  const REGEX_CACHE = {
    // Section markers and tags
    sectionMarkers:
      /\[\s*(?:HEADER|MODIFIED(?:\s+IN\s+ITERATION\s+\d+)?|RESUME\s+SECTION|SECTION:?\s*[^\]]*|ORIGINAL|TAILORED|UNCHANGED|MODIFIED|ADDED|REMOVED|UPDATED|ENHANCED|IMPROVED|OPTIMIZED|REFINED|REVISED|EDITED|REWRITTEN|REWORDED|REFORMATTED|RESTRUCTURED|REORGANIZED|REARRANGED|REORDERED|REPHRASED|REPURPOSED|REALIGNED|ADJUSTED|ALIGNED|FORMATTED(?:\s+FOR\s+ATS)?)\s*\]/gi,

    // Explanatory text
    explanatoryText:
      /(?:This section (?:was|has been)|I (?:have|'ve)) (?:modified|tailored|updated|changed|enhanced|improved|optimized|refined|revised|edited|rewritten|reworded|reformatted|restructured|reorganized|rearranged|reordered|rephrased|repurposed|realigned|adjusted|aligned|formatted).*?$/gim,

    // Change descriptions
    changeDescriptions:
      /(?:Changes made|Modifications|Updates|Enhancements|Improvements|Optimizations|Refinements|Revisions|Edits|Rewrites|Rewording|Reformatting|Restructuring|Reorganizing|Rearranging|Reordering|Rephrasing|Repurposing|Realigning|Adjustments|Alignments|Formatting):.*?$/gim,

    // Excessive newlines
    excessiveNewlines: /\n{3,}/g,
  }

  // First pass: Remove all section markers and tags in one go
  let cleaned = resumeText.replace(REGEX_CACHE.sectionMarkers, "")

  // Second pass: Remove explanatory text
  cleaned = cleaned.replace(REGEX_CACHE.explanatoryText, "")

  // Third pass: Remove change descriptions
  cleaned = cleaned.replace(REGEX_CACHE.changeDescriptions, "")

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
    const err = error as Error
    return {
      success: false,
      error: `Failed to save resume: ${err.message}`,
    }
  }
}
