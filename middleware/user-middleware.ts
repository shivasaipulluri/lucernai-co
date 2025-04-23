import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import { prisma } from "@/lib/prisma"

// Helper function to ensure user exists in the database
async function ensureUserInDb(userId: string, email: string) {
  console.log("Middleware: Ensuring user exists in database:", userId, email)

  try {
    // Check if user exists in the database
    const existingUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true },
    })

    // If user doesn't exist, create a new record
    if (!existingUser) {
      console.log("Middleware: Creating new user in database:", userId)
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
      console.log("Middleware: User created successfully in database")
    } else {
      console.log("Middleware: User already exists in database")
    }

    return true
  } catch (error) {
    console.error("Middleware: Error ensuring user in database:", error)
    return false
  }
}

export async function userMiddleware(request: NextRequest) {
  // Create a response object that we can modify
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [...request.cookies.getAll()].map(({ name, value }) => ({
              name,
              value,
            }))
          },
          setAll(cookies) {
            cookies.forEach(({ name, value, options }) => {
              response.cookies.set({
                name,
                value,
                ...options,
              })
            })
          },
        },
      },
    )

    const {
      data: { session },
    } = await supabase.auth.getSession()

    // If session exists, ensure user exists in database
    if (session?.user) {
      await ensureUserInDb(session.user.id, session.user.email || "")
    }
  } catch (error) {
    console.error("Error in user middleware:", error)
  }

  return response
}
