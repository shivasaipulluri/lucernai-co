import { NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/dashboard"

  if (!code) {
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=${encodeURIComponent("No code provided")}`)
  }

  try {
    const supabase = await createClient()

    // Exchange the auth code for a session
    const { error } = await supabase.auth.exchangeCodeForSession(code)

    if (error) {
      console.error("Error exchanging code for session:", error)
      throw error
    }

    // Redirect to the requested page or dashboard
    return NextResponse.redirect(`${requestUrl.origin}${redirectTo}`)
  } catch (error: any) {
    console.error("Error in auth callback:", error)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth?error=${encodeURIComponent(error.message || "Failed to sign in")}`,
    )
  }
}
