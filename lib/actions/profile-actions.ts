"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

export type ProfileUpdateData = {
  fullName?: string
  preferredTailoringMode?: string
  analyticsTimeRange?: string
  analyticsViewMode?: string
}

export async function updateUserProfile(data: ProfileUpdateData) {
  try {
    // Get the user ID from the Supabase session
    const supabase = await createClient()
    const {
      data: { user },
      error,
    } = await supabase.auth.getUser()

    if (error || !user) {
      console.error("Error getting user:", error)
      return { success: false, error: "Authentication error" }
    }

    const userId = user.id

    // Check if user exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    if (!existingUser) {
      console.error("User not found in database:", userId)
      return { success: false, error: "User not found in database" }
    }

    // Validate the data
    if (data.fullName && data.fullName.length > 100) {
      return {
        success: false,
        error: "Full name must be less than 100 characters",
      }
    }

    if (data.preferredTailoringMode && !["basic", "personalized", "aggressive"].includes(data.preferredTailoringMode)) {
      return {
        success: false,
        error: "Invalid tailoring mode",
      }
    }

    if (data.analyticsTimeRange && !["7days", "30days", "all"].includes(data.analyticsTimeRange)) {
      return {
        success: false,
        error: "Invalid analytics time range",
      }
    }

    if (data.analyticsViewMode && !["compact", "detailed"].includes(data.analyticsViewMode)) {
      return {
        success: false,
        error: "Invalid analytics view mode",
      }
    }

    // Prepare update data (only include fields that are provided)
    const updateData: Record<string, any> = {}
    if (data.fullName !== undefined) updateData.fullName = data.fullName
    if (data.preferredTailoringMode !== undefined) updateData.preferredTailoringMode = data.preferredTailoringMode
    if (data.analyticsTimeRange !== undefined) updateData.analyticsTimeRange = data.analyticsTimeRange
    if (data.analyticsViewMode !== undefined) updateData.analyticsViewMode = data.analyticsViewMode

    // Only update if there are changes
    if (Object.keys(updateData).length === 0) {
      return { success: true, message: "No changes to save" }
    }

    console.log("Updating user profile:", userId, updateData)

    // Update the user profile
    await prisma.user.update({
      where: { id: userId },
      data: updateData,
    })

    // Force revalidation of the profile page
    revalidatePath("/profile", "page")

    return {
      success: true,
      message: "Profile updated successfully",
      updatedData: updateData,
    }
  } catch (error: any) {
    console.error("Error updating profile:", error)

    // Check for specific Prisma errors
    if (error.code === "P2025") {
      return {
        success: false,
        error: "User not found. Please refresh the page and try again.",
      }
    }

    return {
      success: false,
      error: "Failed to update profile: " + (error.message || "Unknown error"),
    }
  }
}
