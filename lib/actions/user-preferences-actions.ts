"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import type { TailoringMode } from "@/utils/ai/compile-tailoring-prompt"

interface SavePreferenceResult {
  success: boolean
  error?: string
}

/**
 * Saves the user's preferred tailoring mode
 */
export async function savePreferredTailoringMode(mode: TailoringMode): Promise<SavePreferenceResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Update the user's preferred tailoring mode
    await prisma.user.update({
      where: { id: user.id },
      data: {
        preferredTailoringMode: mode,
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error saving preferred tailoring mode:", error)
    return { success: false, error: "Failed to save preference" }
  }
}

/**
 * Gets the user's preferred tailoring mode
 */
export async function getPreferredTailoringMode(): Promise<TailoringMode | null> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return null
    }

    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: { preferredTailoringMode: true },
    })

    return (userData?.preferredTailoringMode as TailoringMode) || null
  } catch (error) {
    console.error("Error getting preferred tailoring mode:", error)
    return null
  }
}
