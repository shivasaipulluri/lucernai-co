"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { getUserTemplate } from "@/lib/actions/template-actions"
import { getTemplateById, getDefaultTemplate } from "@/lib/templates/resume-templates"

interface ExportResumeResult {
  success: boolean
  error?: string
  url?: string
}

/**
 * Exports a resume with the user's selected template
 */
export async function exportResumeWithTemplate(
  resumeId: string,
  format: "pdf" | "docx" = "pdf",
): Promise<ExportResumeResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the resume
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: user.id,
      },
    })

    if (!resume) {
      return { success: false, error: "Resume not found" }
    }

    // Get the user's template preference
    const templateId = await getUserTemplate()
    const template = getTemplateById(templateId) || getDefaultTemplate()

    // Check if the template is premium and the user is not premium
    if (template.isPremium) {
      const userData = await prisma.user.findUnique({
        where: { id: user.id },
        select: { isPremium: true },
      })

      if (!userData?.isPremium) {
        return { success: false, error: "Premium template requires a premium subscription" }
      }
    }

    // In a real implementation, this would generate a PDF or DOCX with the template applied
    // For now, we'll just simulate the export process

    // Log the export event
    await prisma.resumeExport.create({
      data: {
        userId: user.id,
        resumeId: resumeId,
        templateId: template.id,
        format: format,
      },
    })

    // Return a mock URL (in a real implementation, this would be a download URL)
    return {
      success: true,
      url: `/api/download?id=${resumeId}&template=${template.id}&format=${format}`,
    }
  } catch (error) {
    console.error("Error exporting resume:", error)
    return { success: false, error: "Failed to export resume" }
  }
}
