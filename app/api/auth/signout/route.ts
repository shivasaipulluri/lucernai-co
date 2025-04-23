import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"

export async function POST() {
  try {
    const supabase = await createClient()

    // Sign out from Supabase
    await supabase.auth.signOut()

    // Clear all auth-related cookies manually
    const cookieStore = await cookies()
    const possibleAuthCookies = [
      "sb-access-token",
      "sb-refresh-token",
      "supabase-auth-token",
      "__session",
      "sb-provider-token",
      "sb:token",
      "sb-provider-token",
      "sb-refresh-token-nonce",
    ]

    for (const cookieName of possibleAuthCookies) {
      try {
        cookieStore.delete({ name: cookieName, path: "/" })
      } catch (e) {
        // Ignore errors if cookie doesn't exist
      }
    }

    // Set cache control headers to prevent caching
    const headers = new Headers()
    headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
    headers.set("Pragma", "no-cache")
    headers.set("Expires", "0")
    headers.set("Surrogate-Control", "no-store")

    return NextResponse.json(
      { success: true, redirectTo: "/" },
      {
        status: 200,
        headers,
      },
    )
  } catch (error) {
    console.error("Error in signout route:", error)
    return NextResponse.json({ success: false, error: "Failed to sign out" }, { status: 500 })
  }
}
