import type { ResumeData } from "@/types/resume"
// Mock implementation if jsPDF is not available
let jsPDF: any

try {
  const jsPDFModule = require("jspdf")
  jsPDF = jsPDFModule.jsPDF
  require("jspdf-autotable")
} catch (e) {
  console.warn("jsPDF not available, using mock implementation")
  jsPDF = class MockJsPDF {
    constructor() {
      console.log("Creating mock PDF document")
    }
    setFont() {}
    setFontSize() {}
    setTextColor() {}
    setDrawColor() {}
    text() {}
    line() {}
    getTextWidth() {
      return 50
    }
    splitTextToSize() {
      return ["Mock text line 1", "Mock text line 2"]
    }
    addPage() {}
    output() {
      return "data:application/pdf;base64,MOCK_PDF_DATA"
    }
  }
}

export async function generatePdf(resumeData: ResumeData): Promise<string> {
  // Create a new PDF document
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  })

  // Set font based on resume style
  const fontMapping: Record<string, string> = {
    Inter: "helvetica",
    Georgia: "times",
    Roboto: "helvetica",
    Merriweather: "times",
    Montserrat: "helvetica",
  }

  const fontFamily = fontMapping[resumeData.style.fontFamily] || "helvetica"
  doc.setFont(fontFamily)

  // Set font size based on resume style
  const fontSizeMapping: Record<string, number> = {
    small: 10,
    medium: 12,
    large: 14,
  }

  const baseFontSize = fontSizeMapping[resumeData.style.fontSize] || 12

  // Set colors based on resume style
  const colorMapping: Record<string, { primary: string; secondary: string }> = {
    blue: { primary: "#1e40af", secondary: "#3b82f6" },
    green: { primary: "#15803d", secondary: "#22c55e" },
    purple: { primary: "#7e22ce", secondary: "#a855f7" },
    red: { primary: "#b91c1c", secondary: "#ef4444" },
    gray: { primary: "#4b5563", secondary: "#9ca3af" },
  }

  const colors = colorMapping[resumeData.style.color] || colorMapping.blue

  // Set spacing based on resume style
  const spacingMapping: Record<string, number> = {
    compact: 5,
    normal: 8,
    spacious: 12,
  }

  const baseSpacing = spacingMapping[resumeData.style.spacing] || 8

  // Start drawing the resume
  let yPos = 20 // Starting y position

  // Title
  doc.setFontSize(baseFontSize + 6)
  doc.setTextColor(colors.primary)
  doc.text(resumeData.title, 105, yPos, { align: "center" })
  yPos += baseSpacing + 5

  // Sort sections by order
  const visibleSections = resumeData.sections.filter((section) => section.isVisible).sort((a, b) => a.order - b.order)

  // Draw each section
  for (const section of visibleSections) {
    // Section title
    doc.setFontSize(baseFontSize + 2)
    doc.setTextColor(colors.primary)
    doc.text(section.title, 20, yPos)

    // Draw a line under the section title
    doc.setDrawColor(colors.secondary)
    doc.line(20, yPos + 1, 190, yPos + 1)
    yPos += baseSpacing

    // Section content
    doc.setFontSize(baseFontSize)
    doc.setTextColor(0, 0, 0) // Black text for content

    if (typeof section.content === "string") {
      // For string content (like contact info, summary, skills)
      const lines = doc.splitTextToSize(section.content, 170)
      doc.text(lines, 20, yPos)
      yPos += lines.length * (baseFontSize * 0.5) + baseSpacing
    } else {
      // For array content (like experience, education)
      for (const item of section.content) {
        // Item title and organization
        doc.setFontSize(baseFontSize)
        doc.setFont(fontFamily, "bold")
        doc.text(item.title, 20, yPos)

        // If there's an organization, add it
        if (item.organization) {
          const orgText = item.organization
          const orgWidth = doc.getTextWidth(orgText)
          doc.setFont(fontFamily, "italic")
          doc.text(orgText, 190 - orgWidth, yPos)
        }
        yPos += baseSpacing - 2

        // Dates and location
        if (item.startDate || item.location) {
          doc.setFontSize(baseFontSize - 1)
          doc.setFont(fontFamily, "normal")

          let dateText = ""
          if (item.startDate) {
            const startDate = formatDate(item.startDate)
            const endDate = item.current ? "Present" : formatDate(item.endDate || "")
            dateText = `${startDate} - ${endDate}`
          }

          doc.text(dateText, 20, yPos)

          if (item.location) {
            const locWidth = doc.getTextWidth(item.location)
            doc.text(item.location, 190 - locWidth, yPos)
          }

          yPos += baseSpacing - 2
        }

        // Description
        if (item.description) {
          doc.setFont(fontFamily, "normal")
          const descLines = doc.splitTextToSize(item.description, 170)
          doc.text(descLines, 20, yPos)
          yPos += descLines.length * (baseFontSize * 0.5) + 2
        }

        // Bullets
        if (item.bullets && item.bullets.length > 0) {
          doc.setFont(fontFamily, "normal")
          for (const bullet of item.bullets) {
            const bulletText = `• ${bullet}`
            const bulletLines = doc.splitTextToSize(bulletText, 165)
            doc.text(bulletLines, 25, yPos)
            yPos += bulletLines.length * (baseFontSize * 0.5) + 2
          }
        }

        yPos += baseSpacing

        // Check if we need a new page
        if (yPos > 270) {
          doc.addPage()
          yPos = 20
        }
      }
    }

    // Add spacing between sections
    yPos += baseSpacing
  }

  // Save the PDF and return the data URL
  return doc.output("dataurlstring")
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
