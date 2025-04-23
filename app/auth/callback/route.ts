import { createClient } from "@/lib/supabase/server"
import { NextResponse, type NextRequest } from "next/server"
import { prisma } from "@/lib/prisma"

// Helper function to ensure user exists in the database
async function createUserInDb(userId: string, email: string) {
  console.log("Auth callback: Ensuring user exists in database:", userId, email)

  try {
    // Check if user exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    // If user doesn't exist, create a new record
    if (!existingUser) {
      console.log("Auth callback: Creating new user in database:", userId)
      await prisma.user.create({
        data: {
          id: userId,
          email: email,
          isPremium: false,
          dailyBasicTailoringsUsed: 0,
          dailyPersonalizedTailoringsUsed: 0,
          dailyAggressiveTailoringsUsed: 0,
          dailyCoverLettersUsed: 0,
          dailyLinkedinOptimizationsUsed: 0,
          dailyInterviewSessionsUsed: 0,
          dailyResetDate: new Date(),
        },
      })
      console.log("Auth callback: User created successfully in database")
    } else {
      console.log("Auth callback: User already exists in database")
    }

    return true
  } catch (error) {
    console.error("Auth callback: Error ensuring user in database:", error)
    return false
  }
}

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const redirectTo = requestUrl.searchParams.get("redirectTo") || "/resume/lab"

  console.log("Auth callback route - Processing code:", code ? "Code exists" : "No code")
  console.log("Auth callback route - Redirect destination:", redirectTo)

  if (code) {
    const supabase = await createClient()

    try {
      const { data, error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Auth callback route - Error exchanging code for session:", error.message)
        return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent(error.message)}`, request.url))
      }

      // Ensure user exists in database after successful authentication
      if (data.session?.user) {
        // Use our local function to ensure immediate user creation
        await createUserInDb(data.session.user.id, data.session.user.email || "")
      }

      console.log("Auth callback route - Authentication successful, redirecting to:", redirectTo)
      return NextResponse.redirect(new URL(redirectTo, request.url))
    } catch (error: any) {
      console.error("Auth callback route - Unexpected error:", error)
      return NextResponse.redirect(
        new URL(`/auth?error=${encodeURIComponent("An unexpected error occurred")}`, request.url),
      )
    }
  }

  console.error("Auth callback route - No code provided")
  return NextResponse.redirect(new URL(`/auth?error=${encodeURIComponent("No code provided")}`, request.url))
}
