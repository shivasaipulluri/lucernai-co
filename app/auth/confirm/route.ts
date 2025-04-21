import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const token_hash = requestUrl.searchParams.get("token_hash")
  const type = requestUrl.searchParams.get("type")
  const next = requestUrl.searchParams.get("next") || "/dashboard"

  if (!token_hash || !type) {
    return NextResponse.redirect(`${requestUrl.origin}/auth?error=${encodeURIComponent("Missing token or type")}`)
  }

  try {
    const supabase = await createClient()

    // Verify the OTP
    const { error } = await supabase.auth.verifyOtp({
      token_hash,
      type: type as any,
    })

    if (error) {
      console.error("Error verifying OTP:", error)
      throw error
    }

    // Redirect to the requested page or dashboard with success message
    return NextResponse.redirect(
      `${requestUrl.origin}${next}?message=${encodeURIComponent("Email confirmed successfully")}`,
    )
  } catch (error: any) {
    console.error("Error in auth confirm:", error)
    return NextResponse.redirect(
      `${requestUrl.origin}/auth?error=${encodeURIComponent(error.message || "Failed to confirm email")}`,
    )
  }
}
