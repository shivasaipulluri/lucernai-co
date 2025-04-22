"use server"

import { createClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import { redirect } from "next/navigation"
import { cookies } from "next/headers"

export async function signOut() {
  console.log("Server action: signOut called")

  try {
    // Create a Supabase client
    const supabase = await createClient()

    // Sign out from Supabase
    const { error } = await supabase.auth.signOut()

    if (error) {
      console.error("Server action: Supabase signOut error:", error)
    } else {
      console.log("Server action: Supabase signOut successful")
    }

    // Clear all auth-related cookies manually to ensure clean state
    const cookieStore = await cookies()
    const possibleAuthCookies = [
      "sb-access-token",
      "sb-refresh-token",
      "supabase-auth-token",
      "__session",
      "sb-provider-token",
    ]

    for (const cookieName of possibleAuthCookies) {
      try {
        cookieStore.delete(cookieName)
        console.log(`Server action: Deleted cookie ${cookieName}`)
      } catch (e) {
        // Ignore errors if cookie doesn't exist
      }
    }

    // Revalidate all paths to clear any cached data
    revalidatePath("/", "layout")
    console.log("Server action: Revalidated paths")
  } catch (error) {
    console.error("Server action: Error during sign out:", error)
  }

  console.log("Server action: Redirecting to home page")
  // Always redirect to home page, even if there were errors
  redirect("/")
}

// Add a new function to handle profile form submissions
export async function updateProfile(formData: FormData) {
  // This is a placeholder for any profile update functionality
  // It will properly handle form submissions from the profile page

  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Process form data here
    // ...

    revalidatePath("/profile")
    return { success: true }
  } catch (error) {
    console.error("Error updating profile:", error)
    return { success: false, error: "Failed to update profile" }
  }
}
