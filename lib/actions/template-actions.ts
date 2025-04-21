"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { getTemplateById, getDefaultTemplate } from "@/lib/templates/resume-templates"

interface SetTemplateResult {
  success: boolean
  error?: string
  templateId?: string
}

/**
 * Sets the user's preferred resume template
 */
export async function setUserTemplate(templateId: string): Promise<SetTemplateResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Verify that the template exists
    const template = getTemplateById(templateId)
    if (!template) {
      return { success: false, error: "Template not found" }
    }

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

    // Update the user's template preference
    await prisma.user.update({
      where: { id: user.id },
      data: { resumeTemplate: templateId },
    })

    // Safely revalidate paths
    // We'll avoid calling revalidatePath during render
    console.log(`User template set to: ${templateId}`)
    // Client will handle refresh

    return { success: true, templateId }
  } catch (error) {
    console.error("Error setting user template:", error)
    return { success: false, error: "Failed to set template preference" }
  }
}

/**
 * Gets the user's current template preference
 */
export async function getUserTemplate(): Promise<string> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return getDefaultTemplate().id
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { resumeTemplate: true },
    })

    return userData?.resumeTemplate || getDefaultTemplate().id
  } catch (error) {
    console.error("Error getting user template:", error)
    return getDefaultTemplate().id
  }
}

/**
 * Checks if the user is premium
 */
export async function isUserPremium(): Promise<boolean> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { isPremium: true },
    })

    return userData?.isPremium || false
  } catch (error) {
    console.error("Error checking premium status:", error)
    return false
  }
}
