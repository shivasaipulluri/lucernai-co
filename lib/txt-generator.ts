import type { ResumeData } from "@/types/resume"

export function generateTxt(resumeData: ResumeData): string {
  let text = `${resumeData.title.toUpperCase()}\n\n`

  // Sort sections by order
  const visibleSections = resumeData.sections.filter((section) => section.isVisible).sort((a, b) => a.order - b.order)

  // Generate content for each section
  for (const section of visibleSections) {
    // Section title
    text += `${section.title.toUpperCase()}\n`
    text += "=".repeat(section.title.length) + "\n\n"

    // Section content
    if (typeof section.content === "string") {
      // For string content (like contact info, summary, skills)
      text += `${section.content}\n\n`
    } else {
      // For array content (like experience, education)
      for (const item of section.content) {
        // Item title and organization
        text += `${item.title}`

        if (item.organization) {
          text += ` - ${item.organization}`
        }
        text += "\n"

        // Dates and location
        if (item.startDate || item.location) {
          if (item.startDate) {
            const startDate = formatDate(item.startDate)
            const endDate = item.current ? "Present" : formatDate(item.endDate || "")
            text += `${startDate} - ${endDate}`
          }

          if (item.location) {
            if (item.startDate) {
              text += " | "
            }
            text += item.location
          }
          text += "\n"
        }

        // Description
        if (item.description) {
          text += `${item.description}\n`
        }

        // Bullets
        if (item.bullets && item.bullets.length > 0) {
          for (const bullet of item.bullets) {
            text += `* ${bullet}\n`
          }
        }

        text += "\n"
      }
    }

    text += "\n"
  }

  // Create a data URL for the text file
  const blob = new Blob([text], { type: "text/plain" })
  return URL.createObjectURL(blob)
}

// Helper function to format dates
function formatDate(dateString: string): string {
  if (!dateString) return ""
  if (dateString === "Present") return "Present"

  try {
    const [year, month] = dateString.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
  } catch (e) {
    return dateString
  }
}
