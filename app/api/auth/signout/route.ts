import { createClient } from "@/lib/supabase/server"
import { cookies } from "next/headers"
import { type NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  console.log("API route: /api/auth/signout called")

  // Get the request URL to determine the origin
  const requestUrl = new URL(request.url)
  const origin = requestUrl.origin

  try {
    // Create a Supabase client
    const supabase = await createClient()

    // Sign out from Supabase
    await supabase.auth.signOut()
    console.log("API route: Supabase signOut successful")

    // Clear all auth-related cookies manually
    const cookieStore = await cookies()

    // Comprehensive list of cookies to clear
    const possibleAuthCookies = [
      "sb-access-token",
      "sb-refresh-token",
      "supabase-auth-token",
      "__session",
      "sb-provider-token",
      "sb-auth-token",
      // Add any other potential auth cookies
    ]

    for (const cookieName of possibleAuthCookies) {
      try {
        // Delete the cookie with various domain settings to ensure it's removed
        cookieStore.delete({
          name: cookieName,
          path: "/",
        })
        console.log(`API route: Deleted cookie ${cookieName}`)
      } catch (e) {
        // Ignore errors if cookie doesn't exist
      }
    }

    // Create a response with a redirect
    const response = NextResponse.redirect(new URL("/", origin))

    // Explicitly clear cookies in the response as well
    for (const cookieName of possibleAuthCookies) {
      response.cookies.delete(cookieName)
    }

    console.log(`API route: Redirecting to home page with origin: ${origin}`)
    return response
  } catch (error) {
    console.error("API route: Error during sign out:", error)

    // Even on error, redirect to home page using the request's origin
    return NextResponse.redirect(new URL("/", origin))
  }
}
