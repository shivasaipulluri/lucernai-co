import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const supabase = await createClient()
    await supabase.auth.signOut()

    // Clear all auth-related cookies manually
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
      } catch (e) {
        // Ignore errors if cookie doesn't exist
      }
    }

    return NextResponse.json({ success: true, redirectTo: "/" })
  } catch (error) {
    console.error("Error in signout route:", error)
    return NextResponse.json({ success: false, error: "Failed to sign out" }, { status: 500 })
  }
}
