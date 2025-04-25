import type { Resume, TailoringAttempt } from "@/lib/types"

/**
 * Utilities for working with resume sections and tracking changes
 */

// Common resume section headers to identify sections
const COMMON_SECTION_HEADERS = [
  "SUMMARY",
  "PROFESSIONAL SUMMARY",
  "EXPERIENCE",
  "WORK EXPERIENCE",
  "PROFESSIONAL EXPERIENCE",
  "EMPLOYMENT HISTORY",
  "EDUCATION",
  "SKILLS",
  "TECHNICAL SKILLS",
  "CERTIFICATIONS",
  "PROJECTS",
  "ACHIEVEMENTS",
  "AWARDS",
  "LANGUAGES",
  "INTERESTS",
  "VOLUNTEER EXPERIENCE",
  "PUBLICATIONS",
  "REFERENCES",
]

/**
 * Extracts sections from a resume text
 * Optimized for performance with regex caching and more efficient processing
 */
export function extractSections(text: string): Record<string, string> {
  // Use a more efficient approach to section extraction
  const sections: Record<string, string> = {}
  let currentSection = "HEADER" // Default section for content before any section header
  let currentContent = ""

  // Prepare a regex pattern for section headers
  // This is more efficient than checking each header individually
  const sectionHeaderPattern = new RegExp(`^\\s*(${COMMON_SECTION_HEADERS.join("|")})\\s*(?::|$)`, "i")

  // Split the text into lines
  const lines = text.split("\n")

  for (const line of lines) {
    const trimmedLine = line.trim()

    // Check if this line is a section header using the regex pattern
    const headerMatch = trimmedLine.match(sectionHeaderPattern)

    if (headerMatch) {
      // Save the previous section
      if (currentContent.trim()) {
        sections[currentSection] = currentContent.trim()
      }

      // Start a new section
      currentSection = headerMatch[1].toUpperCase()
      currentContent = ""
    } else {
      // Add this line to the current section
      currentContent += line + "\n"
    }
  }

  // Save the last section
  if (currentContent.trim()) {
    sections[currentSection] = currentContent.trim()
  }

  return sections
}

/**
 * Cleans section content by removing any debugging markers, tags, or unwanted formatting
 */
export function cleanSectionContent(content: string): string {
  if (!content) return ""

  // Remove any section markers or tags - more comprehensive pattern matching
  let cleaned = content
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

  // Remove explanatory text about changes
  cleaned = cleaned.replace(
    /This section (was|has been) (modified|tailored|updated|changed|enhanced|improved|optimized|refined|revised|edited|rewritten|reworded|reformatted|restructured|reorganized|rearranged|reordered|rephrased|repurposed|realigned|adjusted|aligned|formatted).*?$/gim,
    "",
  )
  cleaned = cleaned.replace(
    /I (have|'ve) (modified|tailored|updated|changed|enhanced|improved|optimized|refined|revised|edited|rewritten|reworded|reformatted|restructured|reorganized|rearranged|reordered|rephrased|repurposed|realigned|adjusted|aligned|formatted).*?$/gim,
    "",
  )
  cleaned = cleaned.replace(/Changes made:.*?$/gim, "")
  cleaned = cleaned.replace(/Modifications:.*?$/gim, "")
  cleaned = cleaned.replace(/Updates:.*?$/gim, "")
  cleaned = cleaned.replace(/Enhancements:.*?$/gim, "")
  cleaned = cleaned.replace(/Improvements:.*?$/gim, "")
  cleaned = cleaned.replace(/Optimizations:.*?$/gim, "")
  cleaned = cleaned.replace(/Refinements:.*?$/gim, "")
  cleaned = cleaned.replace(/Revisions:.*?$/gim, "")
  cleaned = cleaned.replace(/Edits:.*?$/gim, "")
  cleaned = cleaned.replace(/Rewrites:.*?$/gim, "")
  cleaned = cleaned.replace(/Rewording:.*?$/gim, "")
  cleaned = cleaned.replace(/Reformatting:.*?$/gim, "")
  cleaned = cleaned.replace(/Restructuring:.*?$/gim, "")
  cleaned = cleaned.replace(/Reorganizing:.*?$/gim, "")
  cleaned = cleaned.replace(/Rearranging:.*?$/gim, "")
  cleaned = cleaned.replace(/Reordering:.*?$/gim, "")
  cleaned = cleaned.replace(/Rephrasing:.*?$/gim, "")
  cleaned = cleaned.replace(/Repurposing:.*?$/gim, "")
  cleaned = cleaned.replace(/Realigning:.*?$/gim, "")
  cleaned = cleaned.replace(/Adjustments:.*?$/gim, "")
  cleaned = cleaned.replace(/Alignments:.*?$/gim, "")
  cleaned = cleaned.replace(/Formatting:.*?$/gim, "")

  // Fix inconsistent bullet points (ensure all are the same style)
  const bulletStyles = ["-", "•", "*", "○", "▪", "▫", "◦"]
  let dominantBullet = "-" // Default

  // Determine the most common bullet style
  let maxCount = 0
  for (const bullet of bulletStyles) {
    const count = (cleaned.match(new RegExp(`^\\s*\\${bullet}\\s`, "gm")) || []).length
    if (count > maxCount) {
      maxCount = count
      dominantBullet = bullet
    }
  }

  // Standardize bullet points to the dominant style
  for (const bullet of bulletStyles) {
    if (bullet !== dominantBullet) {
      cleaned = cleaned.replace(new RegExp(`^(\\s*)\\${bullet}(\\s)`, "gm"), `$1${dominantBullet}$2`)
    }
  }

  // Fix inconsistent indentation
  const lines = cleaned.split("\n")
  const indentedLines = lines.map((line) => {
    // If line starts with a bullet point, ensure consistent indentation
    if (line.trim().startsWith(dominantBullet)) {
      // Extract the current indentation
      const currentIndent = line.match(/^\s*/)?.[0] || ""
      // Standardize to 2 spaces before bullet
      return "  " + dominantBullet + line.substring(currentIndent.length + dominantBullet.length)
    }
    return line
  })

  // Fix formatting issues
  let finalLines = indentedLines

  // Fix bullet point formatting
  finalLines = finalLines.map((line) => {
    if (line.includes("  " + dominantBullet) && !line.trim().startsWith(dominantBullet)) {
      return line.replace("  " + dominantBullet, "\n  " + dominantBullet)
    }
    return line
  })

  // Join lines back together
  cleaned = finalLines.join("\n")

  // Fix common formatting issues
  cleaned = cleaned
    .replace(/\n{3,}/g, "\n\n") // Normalize excessive line breaks
    .replace(/\s+•/g, "\n•") // Fix bullet point formatting
    .replace(/\s+-/g, "\n-") // Fix dash formatting
    .replace(/\t/g, "  ") // Convert tabs to spaces
    .replace(/\r/g, "") // Remove carriage returns

  // Trim leading/trailing whitespace
  cleaned = cleaned.trim()

  return cleaned
}

/**
 * Compares two section maps and returns the differences
 */
export function diffSections(
  originalText: string,
  modifiedText: string,
): Record<string, { before: string; after: string }> {
  // Extract sections from both texts
  const originalSections = extractSections(originalText)
  const modifiedSections = extractSections(modifiedText)

  const diff: Record<string, { before: string; after: string }> = {}

  // Clean all sections first to ensure fair comparison
  const cleanedOriginalSections: Record<string, string> = {}
  const cleanedModifiedSections: Record<string, string> = {}

  for (const [key, content] of Object.entries(originalSections)) {
    cleanedOriginalSections[key] = cleanSectionContent(content)
  }

  for (const [key, content] of Object.entries(modifiedSections)) {
    cleanedModifiedSections[key] = cleanSectionContent(content)
  }

  // Check all sections in the modified resume
  for (const [sectionName, modifiedContent] of Object.entries(cleanedModifiedSections)) {
    const originalContent = cleanedOriginalSections[sectionName]

    // If the section exists in both and content is different, it was modified
    if (originalContent) {
      // Use a more sophisticated comparison to detect meaningful changes
      const isMeaningfulChange = isSignificantChange(originalContent, modifiedContent)

      if (isMeaningfulChange) {
        diff[sectionName] = {
          before: originalSections[sectionName], // Keep the original uncleaned content
          after: modifiedSections[sectionName], // Keep the modified uncleaned content
        }
      }
    }
    // If the section only exists in the modified resume, it's new
    else {
      diff[sectionName] = {
        before: "",
        after: modifiedSections[sectionName],
      }
    }
  }

  // Check for sections that were in the original but not in the modified
  for (const [sectionName, originalContent] of Object.entries(originalSections)) {
    if (!modifiedSections[sectionName]) {
      diff[sectionName] = {
        before: originalContent,
        after: "",
      }
    }
  }

  return diff
}

/**
 * Determines if changes between two text blocks are significant enough to count as a modification
 */
function isSignificantChange(original: string, modified: string): boolean {
  // If they're exactly the same, no change
  if (original === modified) return false

  // Normalize whitespace for comparison
  const normalizeText = (text: string) => {
    return text
      .replace(/\s+/g, " ") // Replace multiple spaces with a single space
      .replace(/\s*\n\s*/g, " ") // Normalize spaces around newlines
      .trim()
  }

  const normalizedOriginal = normalizeText(original)
  const normalizedModified = normalizeText(modified)

  // If they're the same after normalization, it's just whitespace changes
  if (normalizedOriginal === normalizedModified) return false

  // Calculate the difference ratio
  const levenshteinDistance = (a: string, b: string): number => {
    const matrix = Array(a.length + 1)
      .fill(null)
      .map(() => Array(b.length + 1).fill(null))

    for (let i = 0; i <= a.length; i++) matrix[i][0] = i
    for (let j = 0; j <= b.length; j++) matrix[0][j] = j

    for (let i = 1; i <= a.length; i++) {
      for (let j = 1; j <= b.length; j++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1
        matrix[i][j] = Math.min(matrix[i - 1][j] + 1, matrix[i][j - 1] + 1, matrix[i - 1][j - 1] + cost)
      }
    }

    return matrix[a.length][b.length]
  }

  const distance = levenshteinDistance(normalizedOriginal, normalizedModified)
  const maxLength = Math.max(normalizedOriginal.length, normalizedModified.length)
  const changeRatio = distance / maxLength

  // If the change is less than 5%, it's probably not significant
  return changeRatio > 0.05
}

/**
 * Reconstructs a full resume from sections with proper formatting
 */
export function reconstructResumeFromSections(sections: Record<string, string>): string {
  // First, clean all section content
  const cleanedSections: Record<string, string> = {}
  for (const [key, content] of Object.entries(sections)) {
    cleanedSections[key] = cleanSectionContent(content)
  }

  // Expanded and ordered list of section headers based on common resume structure
  const sectionOrder = [
    "HEADER",
    "SUMMARY",
    "EXECUTIVE SUMMARY",
    "PROFESSIONAL SUMMARY",
    "CAREER SUMMARY",
    "PROFILE",
    "PROFESSIONAL PROFILE",
    "CAREER PROFILE",
    "OBJECTIVE",
    "CAREER OBJECTIVE",
    "PROFESSIONAL OBJECTIVE",
    "EXPERIENCE",
    "WORK EXPERIENCE",
    "PROFESSIONAL EXPERIENCE",
    "EMPLOYMENT HISTORY",
    "WORK HISTORY",
    "CAREER HISTORY",
    "HISTORY OF EMPLOYMENT",
    "HISTORY",
    "EMPLOYMENT",
    "EDUCATION",
    "EDUCATIONAL BACKGROUND",
    "ACADEMIC BACKGROUND",
    "ACADEMIC HISTORY",
    "SKILLS",
    "TECHNICAL SKILLS",
    "CORE SKILLS",
    "KEY SKILLS",
    "PROFESSIONAL SKILLS",
    "COMPETENCIES",
    "CORE COMPETENCIES",
    "KEY COMPETENCIES",
    "CERTIFICATIONS",
    "CERTIFICATES",
    "CREDENTIALS",
    "LICENSES",
    "PROJECTS",
    "KEY PROJECTS",
    "PROFESSIONAL PROJECTS",
    "ACHIEVEMENTS",
    "ACCOMPLISHMENTS",
    "KEY ACHIEVEMENTS",
    "AWARDS",
    "HONORS",
    "RECOGNITIONS",
    "LANGUAGES",
    "LANGUAGE PROFICIENCY",
    "VOLUNTEER EXPERIENCE",
    "VOLUNTEER WORK",
    "COMMUNITY SERVICE",
    "PUBLICATIONS",
    "RESEARCH",
    "PRESENTATIONS",
    "PROFESSIONAL AFFILIATIONS",
    "MEMBERSHIPS",
    "PROFESSIONAL MEMBERSHIPS",
    "INTERESTS",
    "HOBBIES",
    "PERSONAL INTERESTS",
    "ADDITIONAL INFORMATION",
    "ADDITIONAL SKILLS",
    "ADDITIONAL EXPERIENCE",
    "RELEVANT COURSEWORK",
    "COURSEWORK",
    "TRAINING",
    "PROFESSIONAL DEVELOPMENT",
    "LEADERSHIP",
    "LEADERSHIP EXPERIENCE",
    "ACTIVITIES",
    "EXTRACURRICULAR ACTIVITIES",
    "REFERENCES",
    "PROFESSIONAL REFERENCES",
  ]

  // Sort sections based on the predefined order, with unknown sections at the end
  const orderedSections = Object.keys(cleanedSections).sort((a, b) => {
    const indexA = sectionOrder.findIndex((s) => s === a.toUpperCase())
    const indexB = sectionOrder.findIndex((s) => s === b.toUpperCase())

    // If both sections are in the order list, sort by their position
    if (indexA !== -1 && indexB !== -1) {
      return indexA - indexB
    }

    // If only one section is in the order list, prioritize it
    if (indexA !== -1) return -1
    if (indexB !== -1) return 1

    // If neither section is in the order list, maintain their original order
    return 0
  })

  // Build the resume with proper spacing between sections
  return orderedSections
    .map((sectionName) => {
      const content = cleanedSections[sectionName]
      // For the header section, don't add the section name
      if (sectionName.toUpperCase() === "HEADER") {
        return content
      }
      // For other sections, add the section name
      return `${sectionName}\n${content}`
    })
    .join("\n\n")
}

/**
 * Updates specific sections in a resume
 */
export function updateResumeSections(originalResume: string, updatedSections: Record<string, string>): string {
  const originalSections = extractSections(originalResume)

  // Update the sections
  const newSections = {
    ...originalSections,
    ...updatedSections,
  }

  return reconstructResumeFromSections(newSections)
}

/**
 * Analyzes golden rule violations for a section
 */
function analyzeGoldenRuleViolations(sectionName: string, tailoringAttempts: TailoringAttempt[]): string[] {
  const violations: string[] = []

  // Look through all tailoring attempts for this resume
  for (const attempt of tailoringAttempts) {
    if (!attempt.goldenRuleFeedback) continue

    try {
      // Parse the golden rule feedback
      const feedback = JSON.parse(attempt.goldenRuleFeedback)

      // Look for violations related to this section
      for (const rule of feedback) {
        if (
          rule.section?.toUpperCase() === sectionName.toUpperCase() ||
          rule.details?.toUpperCase().includes(sectionName.toUpperCase())
        ) {
          if (!rule.passed) {
            violations.push(`${rule.rule}: ${rule.details}`)
          }
        }
      }
    } catch (error) {
      console.error("Error parsing golden rule feedback:", error)
    }
  }

  return violations
}

/**
 * Determines which iteration modified a section
 */
function determineModificationIteration(sectionName: string, tailoringAttempts: TailoringAttempt[]): number | null {
  // Sort attempts by iteration number
  const sortedAttempts = [...tailoringAttempts].sort((a, b) => (a.iteration || 0) - (b.iteration || 0))

  for (let i = 0; i < sortedAttempts.length; i++) {
    const attempt = sortedAttempts[i]

    if (!attempt.modifiedSections) continue

    try {
      // Parse the modified sections
      const modifiedSections = JSON.parse(attempt.modifiedSections)

      // Check if this section was modified in this iteration
      if (modifiedSections.includes(sectionName)) {
        return attempt.iteration || i + 1
      }
    } catch (error) {
      console.error("Error parsing modified sections:", error)
    }
  }

  return null
}

/**
 * Calculates the confidence level of changes based on the difference size
 */
export function calculateChangeConfidence(before: string, after: string): "minimal" | "moderate" | "significant" {
  if (!before || !after) return "significant"

  const beforeWords = before.split(/\s+/).length
  const afterWords = after.split(/\s+/).length
  const diffPercentage = Math.abs(afterWords - beforeWords) / Math.max(1, beforeWords)

  if (diffPercentage < 0.1) return "minimal"
  if (diffPercentage < 0.3) return "moderate"
  return "significant"
}

/**
 * Generates a change reason for a section based on tailoring attempts
 */
function generateChangeReason(
  sectionName: string,
  wasModified: boolean,
  iteration: number | null,
  violations: string[],
): string {
  if (!wasModified) {
    return "This section already met all golden rules and aligned well with the job description."
  }

  if (violations.length === 0) {
    return `This section was modified in iteration ${iteration || "?"} to better align with the job description.`
  }

  const violationText =
    violations.length === 1
      ? `the following issue: ${violations[0]}`
      : `the following issues: ${violations.slice(0, 2).join("; ")}${violations.length > 2 ? "..." : ""}`

  return `Modified in iteration ${iteration || "?"} to address ${violationText}`
}

/**
 * Hydrates the final resume sections with metadata about changes
 */
export function hydrateFinalResumeSections(resume: Resume): Record<
  string,
  {
    content: string
    wasModified: boolean
    originalContent?: string
    changeReason: string
    iteration: number | null
    confidence: "minimal" | "moderate" | "significant"
  }
> {
  if (!resume.resumeText || !resume.modifiedResume) {
    return {}
  }

  // Extract sections from original and modified resume
  const originalSections = extractSections(resume.resumeText)
  const modifiedSections = extractSections(resume.modifiedResume)

  // Get the differences between the sections
  const sectionDiffs = diffSections(resume.resumeText, resume.modifiedResume)

  // Create the hydrated sections map
  const hydratedSections: Record<string, any> = {}

  // Process all sections from both original and modified resumes to maintain order
  const allSectionNames = new Set([...Object.keys(originalSections), ...Object.keys(modifiedSections)])

  for (const sectionName of allSectionNames) {
    const diff = sectionDiffs[sectionName] || { before: "", after: "" }
    // Use the cleaned content to ensure no debugging markers
    const content = cleanSectionContent(modifiedSections[sectionName] || originalSections[sectionName] || "")

    // Analyze golden rule violations for this section
    const violations = analyzeGoldenRuleViolations(sectionName, resume.tailoringAttempts || [])

    // Determine which iteration modified this section
    const iteration = determineModificationIteration(sectionName, resume.tailoringAttempts || [])

    // Generate a change reason
    const changeReason = generateChangeReason(
      sectionName,
      diff.before !== "" || diff.after !== "",
      iteration,
      violations,
    )

    // Calculate change confidence
    const confidence = calculateChangeConfidence(
      diff.before ? cleanSectionContent(diff.before) : "",
      diff.after ? cleanSectionContent(diff.after) : "",
    )

    hydratedSections[sectionName] = {
      content,
      wasModified: diff.before !== "" || diff.after !== "",
      originalContent: diff.before ? cleanSectionContent(diff.before) : undefined,
      changeReason,
      iteration,
      confidence,
    }
  }

  return hydratedSections
}

/**
 * Generates a user-friendly summary of changes
 */
export function generateChangeSummary(
  modificationHistory: Array<{
    sectionName: string
    originalContent: string
    modifiedContent: string
    iteration: number
    changeReason: string
    confidence: "minimal" | "moderate" | "significant"
  }>,
): string {
  if (modificationHistory.length === 0) {
    return "No changes were made to your resume."
  }

  const significantChanges = modificationHistory.filter((h) => h.confidence === "significant")
  const moderateChanges = modificationHistory.filter((h) => h.confidence === "moderate")
  const minimalChanges = modificationHistory.filter((h) => h.confidence === "minimal")

  let summary = `Your resume was tailored with `

  if (significantChanges.length > 0) {
    summary += `significant improvements to ${significantChanges.length} section${significantChanges.length > 1 ? "s" : ""} `
    summary += `(${significantChanges.map((h) => h.sectionName).join(", ")})`
    if (moderateChanges.length > 0 || minimalChanges.length > 0) summary += ", "
  }

  if (moderateChanges.length > 0) {
    summary += `moderate enhancements to ${moderateChanges.length} section${moderateChanges.length > 1 ? "s" : ""} `
    summary += `(${moderateChanges.map((h) => h.sectionName).join(", ")})`
    if (minimalChanges.length > 0) summary += ", "
  }

  if (minimalChanges.length > 0) {
    summary += `and minor refinements to ${minimalChanges.length} section${minimalChanges.length > 1 ? "s" : ""} `
    summary += `(${minimalChanges.map((h) => h.sectionName).join(", ")})`
  }

  summary += "."

  return summary
}

/**
 * Generates a human-readable summary of the changes made to the resume
 */
export function generateAIRationaleSummary(resume: Resume): string {
  if (!resume.tailoringAttempts || resume.tailoringAttempts.length === 0) {
    return "This resume hasn't been tailored yet."
  }

  // Sort attempts by iteration
  const sortedAttempts = [...resume.tailoringAttempts].sort((a, b) => (a.iteration || 0) - (b.iteration || 0))

  // Count the number of iterations
  const iterationCount = sortedAttempts.length

  // Track which sections were modified and their significance
  const modifiedSections: {
    name: string
    significance: "major" | "minor"
    iteration: number
  }[] = []

  // Track scores for improvement calculation
  let initialAtsScore: number | null = null
  let finalAtsScore: number | null = null
  let initialJdScore: number | null = null
  let finalJdScore: number | null = null

  // Track golden rule improvements
  const initialRuleViolations: string[] = []
  const finalRuleViolations: string[] = []

  // Analyze each tailoring attempt
  for (let i = 0; i < sortedAttempts.length; i++) {
    const attempt = sortedAttempts[i]

    // Track scores
    if (i === 0) {
      initialAtsScore = attempt.atsScore || null
      initialJdScore = attempt.jdScore || null

      // Track initial golden rule violations
      if (attempt.goldenRuleFeedback) {
        try {
          const feedback = JSON.parse(attempt.goldenRuleFeedback)
          for (const rule of feedback) {
            if (!rule.passed) {
              initialRuleViolations.push(rule.rule)
            }
          }
        } catch (error) {
          console.error("Error parsing initial golden rule feedback:", error)
        }
      }
    }

    if (i === sortedAttempts.length - 1) {
      finalAtsScore = attempt.atsScore || null
      finalJdScore = attempt.jdScore || null

      // Track final golden rule violations
      if (attempt.goldenRuleFeedback) {
        try {
          const feedback = JSON.parse(attempt.goldenRuleFeedback)
          for (const rule of feedback) {
            if (!rule.passed) {
              finalRuleViolations.push(rule.rule)
            }
          }
        } catch (error) {
          console.error("Error parsing final golden rule feedback:", error)
        }
      }
    }

    // Track modified sections
    if (attempt.modifiedSections) {
      try {
        const sections = JSON.parse(attempt.modifiedSections)
        for (const section of sections) {
          // Check if we already have this section
          const existingIndex = modifiedSections.findIndex((s) => s.name === section)

          if (existingIndex === -1) {
            // Determine significance based on the feedback
            let significance: "major" | "minor" = "minor"

            // Check if this section had major changes based on feedback
            if (attempt.atsFeedback && attempt.atsFeedback.includes(section)) {
              significance = "major"
            }

            if (attempt.jdFeedback && attempt.jdFeedback.includes(section)) {
              significance = "major"
            }

            modifiedSections.push({
              name: section,
              significance,
              iteration: attempt.iteration || i + 1,
            })
          }
        }
      } catch (error) {
        console.error("Error parsing modified sections:", error)
      }
    }
  }

  // Get the latest attempt for additional context
  const latestAttempt = sortedAttempts[sortedAttempts.length - 1]

  // Extract key improvements from feedback
  const improvements: string[] = []

  if (latestAttempt.atsFeedback) {
    // Look for key phrases in ATS feedback
    if (latestAttempt.atsFeedback.includes("format")) improvements.push("ATS-friendly formatting")
    if (latestAttempt.atsFeedback.includes("keyword")) improvements.push("keyword optimization")
    if (latestAttempt.atsFeedback.includes("bullet")) improvements.push("improved bullet points")
    if (latestAttempt.atsFeedback.includes("metric")) improvements.push("clearer metrics")
  }

  if (latestAttempt.jdFeedback) {
    // Look for key phrases in JD feedback
    if (latestAttempt.jdFeedback.includes("align")) improvements.push("stronger job alignment")
    if (latestAttempt.jdFeedback.includes("skill")) improvements.push("highlighted relevant skills")
    if (latestAttempt.jdFeedback.includes("experience")) improvements.push("emphasized relevant experience")
  }

  // Add default improvements if none were found
  if (improvements.length === 0) {
    improvements.push("improved clarity", "better formatting", "enhanced relevance")
  }

  // Calculate golden rule improvements
  const fixedRules = initialRuleViolations.filter((rule) => !finalRuleViolations.includes(rule))

  // Generate the summary
  let summary = `This resume was tailored in ${iterationCount} iteration${iterationCount !== 1 ? "s" : ""}.`

  // Add information about modified sections
  if (modifiedSections.length > 0) {
    // Group sections by significance
    const majorSections = modifiedSections.filter((s) => s.significance === "major").map((s) => s.name)
    const minorSections = modifiedSections.filter((s) => s.significance === "minor").map((s) => s.name)

    summary += " Sections modified: "

    if (majorSections.length > 0) {
      summary += `${majorSections.join(", ")} (major changes)`
      if (minorSections.length > 0) {
        summary += "; "
      }
    }

    if (minorSections.length > 0) {
      summary += `${minorSections.join(", ")} (minor adjustments)`
    }

    summary += "."
  } else {
    summary += " The tailoring process made subtle improvements while preserving your original content."
  }

  // Add information about improvements
  if (improvements.length > 0) {
    summary += ` Improvements include: ${improvements.slice(0, 3).join(", ")}`
    if (improvements.length > 3) {
      summary += ", and more"
    }
    summary += "."
  }

  // Add information about golden rule improvements
  if (fixedRules.length > 0) {
    summary += ` Golden Rules improved: ${fixedRules.slice(0, 3).join(", ")}`
    if (fixedRules.length > 3) {
      summary += ", and others"
    }
    summary += "."
  }

  // Add information about score improvement
  if (initialAtsScore !== null && finalAtsScore !== null && initialJdScore !== null && finalJdScore !== null) {
    const atsImprovement = finalAtsScore - initialAtsScore
    const jdImprovement = finalJdScore - initialJdScore

    if (atsImprovement > 0 || jdImprovement > 0) {
      summary += " Your resume now scores "

      if (atsImprovement > 0) {
        summary += `${finalAtsScore.toFixed(0)}% for ATS compatibility`
        if (jdImprovement > 0) {
          summary += " and "
        }
      }

      if (jdImprovement > 0) {
        summary += `${finalJdScore.toFixed(0)}% for job description alignment`
      }

      if (finalRuleViolations.length === 0) {
        summary += ", with all golden rules passed."
      } else {
        summary += "."
      }
    }
  }

  // Add a confidence-building conclusion
  if (resume.atsScore && resume.atsScore > 80 && resume.jdScore && resume.jdScore > 80) {
    summary += " This tailored version is well-positioned to pass ATS screening and impress hiring managers."
  } else if (resume.atsScore && resume.atsScore > 70 && resume.jdScore && resume.jdScore > 70) {
    summary += " This tailored version should perform well in the application process."
  }

  return summary
}

/**
 * Extracts keywords from text
 */
function extractKeywords(text: string, count: number): string[] {
  // List of common keywords in job descriptions
  const commonKeywords = [
    "leadership",
    "management",
    "communication",
    "teamwork",
    "problem-solving",
    "analytical",
    "creative",
    "innovative",
    "detail-oriented",
    "organized",
    "project management",
    "strategic",
    "planning",
    "development",
    "implementation",
    "analysis",
    "research",
    "design",
    "testing",
    "evaluation",
    "collaboration",
    "coordination",
    "supervision",
    "training",
    "mentoring",
    "customer service",
    "client relations",
    "sales",
    "marketing",
    "negotiation",
    "budgeting",
    "financial",
    "reporting",
    "compliance",
    "regulation",
    "quality assurance",
    "quality control",
    "process improvement",
    "optimization",
    "technical",
    "programming",
    "software",
    "hardware",
    "network",
    "database",
    "cloud",
    "AI",
    "machine learning",
    "data analysis",
    "big data",
    "agile",
    "scrum",
    "waterfall",
    "lean",
    "six sigma",
    "Microsoft Office",
    "Excel",
    "Word",
    "PowerPoint",
    "Outlook",
    "Adobe",
    "Photoshop",
    "Illustrator",
    "InDesign",
    "Premiere",
    "JavaScript",
    "Python",
    "Java",
    "C++",
    "C#",
    "SQL",
    "NoSQL",
    "MongoDB",
    "MySQL",
    "PostgreSQL",
    "AWS",
    "Azure",
    "Google Cloud",
    "Docker",
    "Kubernetes",
    "React",
    "Angular",
    "Vue",
    "Node.js",
    "Express",
    "HTML",
    "CSS",
    "PHP",
    "Ruby",
    "Swift",
    "mobile",
    "responsive",
    "web",
    "app",
    "development",
    "UX",
    "UI",
    "user experience",
    "user interface",
    "frontend",
    "backend",
    "full-stack",
    "DevOps",
    "CI/CD",
    "version control",
    "Git",
    "security",
    "encryption",
    "authentication",
    "authorization",
    "penetration testing",
    "healthcare",
    "finance",
    "education",
    "retail",
    "manufacturing",
    "logistics",
    "supply chain",
    "inventory",
    "procurement",
    "distribution",
    "HR",
    "human resources",
    "recruitment",
    "talent acquisition",
    "onboarding",
    "accounting",
    "auditing",
    "tax",
    "payroll",
    "benefits",
    "legal",
    "compliance",
    "regulatory",
    "policy",
    "procedure",
    "research",
    "development",
    "R&D",
    "innovation",
    "product development",
    "content",
    "writing",
    "editing",
    "publishing",
    "journalism",
    "social media",
    "digital marketing",
    "SEO",
    "SEM",
    "PPC",
    "analytics",
    "metrics",
    "KPIs",
    "reporting",
    "dashboards",
    "customer experience",
    "CX",
    "customer journey",
    "customer satisfaction",
    "NPS",
    "operations",
    "production",
    "manufacturing",
    "quality",
    "safety",
    "sustainability",
    "environmental",
    "green",
    "renewable",
    "recycling",
  ]

  // Convert text to lowercase for case-insensitive matching
  const lowerText = text.toLowerCase()

  // Find matches
  const matches: string[] = []
  for (const keyword of commonKeywords) {
    if (lowerText.includes(keyword.toLowerCase())) {
      // Use the original case from the text if possible
      const regex = new RegExp(keyword, "i")
      const match = text.match(regex)
      if (match && match[0] && !matches.includes(match[0])) {
        matches.push(match[0])
        if (matches.length >= count) break
      }
    }
  }

  return matches
}

/**
 * Generates a motivational career coaching summary
 */
export function generateMotivationalSummary(atsScore: number, jdScore: number, goldenPassed: boolean): string {
  let summary = ""

  if (atsScore >= 90 && jdScore >= 90) {
    summary =
      "Your resume is now exceptionally well-aligned with this job opportunity! The tailoring process has optimized your content to highlight your most relevant skills and experiences, giving you a competitive edge in the application process."
  } else if (atsScore >= 80 && jdScore >= 80) {
    summary =
      "Your resume has been significantly improved and is now well-positioned for this role. The tailoring process has enhanced your relevant qualifications and experiences to better match what the employer is seeking."
  } else {
    summary =
      "Your resume has been tailored to better align with this job opportunity. While there's always room for improvement, these changes should help strengthen your application."
  }

  if (goldenPassed) {
    summary +=
      " Your resume now passes all our golden rules for effective resumes, which should improve your chances of getting past initial screening."
  } else {
    summary += " Consider reviewing the golden rule feedback to further strengthen your resume."
  }

  return summary
}

/**
 * Validates resume for ATS compatibility
 */
export function validateATSSafeResume(resumeText: string): {
  isValid: boolean
  warnings: string[]
} {
  const warnings: string[] = []

  // Check for common ATS issues
  if (resumeText.includes("<table>") || resumeText.includes("<tr>")) {
    warnings.push("Resume contains HTML tables which may not parse correctly in ATS systems")
  }

  if (resumeText.includes("□") || resumeText.includes("■") || resumeText.includes("●")) {
    warnings.push("Resume contains special characters that may not parse correctly in ATS systems")
  }

  if (resumeText.split("\n").some((line) => line.length > 100)) {
    warnings.push("Resume contains very long lines that may be truncated in some ATS systems")
  }

  // Check for excessive line breaks
  if (resumeText.match(/\n{4,}/g)) {
    warnings.push("Resume contains excessive line breaks that may create parsing issues")
  }

  return {
    isValid: warnings.length === 0,
    warnings,
  }
}

/**
 * Validates final resume before saving to database
 */
export function validateFinalResume(resumeText: string): {
  isValid: boolean
  errors: string[]
} {
  const errors: string[] = []

  // Check for empty content
  if (!resumeText || resumeText.trim().length < 100) {
    errors.push("Resume content is too short or empty")
  }

  // Check for leftover tags
  if (resumeText.match(/\[\s*[A-Z_]+\s*\]/)) {
    errors.push("Resume contains leftover formatting tags")
  }

  // Check for duplicate section headers
  const sections = extractSections(resumeText)
  const sectionNames = Object.keys(sections)
  const uniqueSectionNames = new Set(sectionNames)

  if (sectionNames.length !== uniqueSectionNames.size) {
    errors.push("Resume contains duplicate section headers")
  }

  // Check for empty sections
  const emptySections = Object.entries(sections)
    .filter(([_, content]) => !content || content.trim().length < 5)
    .map(([name, _]) => name)

  if (emptySections.length > 0) {
    errors.push(`Resume contains empty sections: ${emptySections.join(", ")}`)
  }

  return {
    isValid: errors.length === 0,
    errors,
  }
}
