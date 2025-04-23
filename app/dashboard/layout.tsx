import type React from "react"
import { headers } from "next/headers"
import { ensureUserInDb } from "@/lib/actions/user-actions"
import { createClient } from "@/lib/supabase/server"

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  console.log("Dashboard Layout - Checking for user creation header")

  // Get headers to check if user creation is needed
  const headersList = await headers()
  const shouldCreateUser = headersList.get("x-create-user") === "true"

  if (shouldCreateUser) {
    const userId = headersList.get("x-user-id")
    const userEmail = headersList.get("x-user-email")

    if (userId && userEmail) {
      console.log("Dashboard Layout - Creating user from headers:", userId, userEmail)
      await ensureUserInDb(userId, userEmail)
    }
  } else {
    // Fallback: Check session directly if headers aren't set
    console.log("Dashboard Layout - Headers not set, checking session directly")
    const supabase = await createClient()
    const {
      data: { session },
    } = await supabase.auth.getSession()

    if (session?.user) {
      console.log("Dashboard Layout - Creating user from session:", session.user.id)
      await ensureUserInDb(session.user.id, session.user.email || "")
    }
  }

  return <>{children}</>
}
