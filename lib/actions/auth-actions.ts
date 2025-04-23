"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { ensureUserInDb as _ensureUserInDb } from "./user-actions"
import { cleanupAuthTokens } from "@/lib/utils/auth-cleanup"

// Re-export for backward compatibility
export { ensureUserInDb } from "./user-actions"

// Helper function to get the site URL based on environment
function getSiteUrl() {
  // In development, use localhost
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000"
  }

  // In production, use the configured site URL or default to lucernai.co
  return process.env.NEXT_PUBLIC_SITE_URL || "https://www.lucernai.co"
}

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = (formData.get("redirectTo") as string) || "/resume/lab"

  const supabase = await createClient()

  // First, ensure any stale tokens are cleared
  await cleanupAuthTokens()

  const { data, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Ensure user exists in database immediately after sign in
  if (data.user) {
    console.log("Sign In - Creating user in database immediately after sign in")
    await _ensureUserInDb(data.user.id, data.user.email || "")
  }

  revalidatePath("/", "layout")
  redirect(redirectTo)
}

export async function signUp(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string
  const redirectTo = (formData.get("redirectTo") as string) || "/resume/lab"

  const siteUrl = getSiteUrl()
  const supabase = await createClient()

  // First, ensure any stale tokens are cleared
  await cleanupAuthTokens()

  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      // Explicitly use the auth/callback route
      emailRedirectTo: `${siteUrl}/auth/callback?redirectTo=${redirectTo}`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  // Create user in database immediately if auto-confirmed (no email verification required)
  if (data.user && !data.session) {
    return { success: "Check your email to confirm your account" }
  } else if (data.user && data.session) {
    // User was auto-confirmed, create in database
    console.log("Sign Up - Creating user in database immediately after auto-confirmed sign up")
    await _ensureUserInDb(data.user.id, data.user.email || "")
    revalidatePath("/", "layout")
    redirect(redirectTo)
  }

  return { success: "Account created successfully" }
}

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

    // Clean up auth tokens
    await cleanupAuthTokens()

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

export async function signInWithGoogle(redirectTo = "/resume/lab") {
  const siteUrl = getSiteUrl()
  const supabase = await createClient()

  // First, ensure any stale tokens are cleared
  await cleanupAuthTokens()

  const { data, error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      // Explicitly use the auth/callback route
      redirectTo: `${siteUrl}/auth/callback?redirectTo=${redirectTo}`,
    },
  })

  if (error) {
    return { error: error.message }
  }

  return { url: data.url }
}
