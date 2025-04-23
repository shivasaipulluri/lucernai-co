import type React from "react"
import { headers } from "next/headers"
import { ensureUserInDb } from "@/lib/actions/user-actions"
import { createClient } from "@/lib/supabase/server"

export default async function ResumeLabLayout({ children }: { children: React.ReactNode }) {
  console.log("Resume Lab Layout - Checking for user creation header")

  // Get headers to check if user creation is needed
  const headersList = await headers()
  const shouldCreateUser = headersList.get("x-create-user") === "true"

  if (shouldCreateUser) {
    const userId = headersList.get("x-user-id")
    const userEmail = headersList.get("x-user-email")

    if (userId && userEmail) {
      console.log("Resume Lab Layout - Creating user from headers:", userId, userEmail)
      await ensureUserInDb(userId, userEmail)
    }
  } else {
    // Fallback: Check user directly if headers aren't set
    console.log("Resume Lab Layout - Headers not set, checking user directly")
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (user) {
      console.log("Resume Lab Layout - Creating user from authenticated user data:", user.id)
      await ensureUserInDb(user.id, user.email || "")
    }
  }

  return <>{children}</>
}
