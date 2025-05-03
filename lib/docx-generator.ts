// Mock implementation if docx is not available
let Document: any, Packer: any, Paragraph: any, TextRun: any, HeadingLevel: any, AlignmentType: any, BorderStyle: any

try {
  const docxModule = require("docx")
  Document = docxModule.Document
  Packer = docxModule.Packer
  Paragraph = docxModule.Paragraph
  TextRun = docxModule.TextRun
  HeadingLevel = docxModule.HeadingLevel
  AlignmentType = docxModule.AlignmentType
  BorderStyle = docxModule.BorderStyle
} catch (e) {
  console.warn("docx not available, using mock implementation")

  Document = class MockDocument {
    constructor() {
      console.log("Creating mock DOCX document")
    }
  }

  Packer = {
    toBlob: async () =>
      new Blob(["Mock DOCX content"], {
        type: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      }),
  }

  Paragraph = class MockParagraph {
    constructor() {}
    addChildElement() {}
  }

  TextRun = class MockTextRun {
    constructor() {}
  }

  HeadingLevel = { HEADING_1: "heading1", HEADING_2: "heading2" }
  AlignmentType = { CENTER: "center" }
  BorderStyle = { SINGLE: "single" }
}
import type { ResumeData } from "@/types/resume"

export async function generateDocx(resumeData: ResumeData): Promise<string> {
  // Create a new document
  const doc = new Document({
    sections: [
      {
        properties: {},
        children: generateDocContent(resumeData),
      },
    ],
  })

  // Generate the document as a blob
  const blob = await Packer.toBlob(doc)

  // Convert blob to data URL
  return new Promise((resolve) => {
    const reader = new FileReader()
    reader.onloadend = () => resolve(reader.result as string)
    reader.readAsDataURL(blob)
  })
}

function generateDocContent(resumeData: ResumeData) {
  const children = []

  // Title
  children.push(
    new Paragraph({
      text: resumeData.title,
      heading: HeadingLevel.HEADING_1,
      alignment: AlignmentType.CENTER,
      spacing: {
        after: 200,
      },
    }),
  )

  // Sort sections by order
  const visibleSections = resumeData.sections.filter((section) => section.isVisible).sort((a, b) => a.order - b.order)

  // Generate content for each section
  for (const section of visibleSections) {
    // Section title
    children.push(
      new Paragraph({
        text: section.title,
        heading: HeadingLevel.HEADING_2,
        spacing: {
          before: 400,
          after: 200,
        },
        border: {
          bottom: {
            color: "#3b82f6",
            style: BorderStyle.SINGLE,
            size: 1,
          },
        },
      }),
    )

    // Section content
    if (typeof section.content === "string") {
      // For string content (like contact info, summary, skills)
      const paragraphs = section.content.split("\n")
      for (const paragraph of paragraphs) {
        if (paragraph.trim()) {
          children.push(
            new Paragraph({
              text: paragraph,
              spacing: {
                before: 100,
                after: 100,
              },
            }),
          )
        }
      }
    } else {
      // For array content (like experience, education)
      for (const item of section.content) {
        // Item title and organization
        const titleParagraph = new Paragraph({
          spacing: {
            before: 200,
            after: 100,
          },
          children: [
            new TextRun({
              text: item.title,
              bold: true,
            }),
          ],
        })

        // If there's an organization, add it
        if (item.organization) {
          titleParagraph.addChildElement(
            new TextRun({
              text: ` - ${item.organization}`,
              italics: true,
            }),
          )
        }

        children.push(titleParagraph)

        // Dates and location
        if (item.startDate || item.location) {
          const detailsChildren = []

          if (item.startDate) {
            const startDate = formatDate(item.startDate)
            const endDate = item.current ? "Present" : formatDate(item.endDate || "")
            detailsChildren.push(
              new TextRun({
                text: `${startDate} - ${endDate}`,
              }),
            )
          }

          if (item.location) {
            if (detailsChildren.length > 0) {
              detailsChildren.push(
                new TextRun({
                  text: " | ",
                }),
              )
            }

            detailsChildren.push(
              new TextRun({
                text: item.location,
              }),
            )
          }

          children.push(
            new Paragraph({
              children: detailsChildren,
              spacing: {
                before: 100,
                after: 100,
              },
            }),
          )
        }

        // Description
        if (item.description) {
          children.push(
            new Paragraph({
              text: item.description,
              spacing: {
                before: 100,
                after: 100,
              },
            }),
          )
        }

        // Bullets
        if (item.bullets && item.bullets.length > 0) {
          for (const bullet of item.bullets) {
            children.push(
              new Paragraph({
                text: bullet,
                bullet: {
                  level: 0,
                },
                spacing: {
                  before: 100,
                  after: 100,
                },
              }),
            )
          }
        }
      }
    }
  }

  return children
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
