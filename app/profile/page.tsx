export const dynamic = "force-dynamic"
export const revalidate = 0

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProfileClient } from "@/components/profile/profile-client"
import { getTemplateById, getDefaultTemplate } from "@/lib/templates/resume-templates"
import { ensureUserInDb } from "@/lib/actions/user-actions"

export const metadata = {
  title: "Profile | Lucerna AI",
  description: "Manage your account settings, subscription, and preferences",
}

async function getUserProfile() {
  const startTime = Date.now()
  try {
    const supabase = await createClient()

    // Use getUser instead of getSession for better security
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    if (userError) {
      console.error("Profile page - Auth error:", userError)
      return { success: false, error: "Authentication error", authError: true }
    }

    if (!user) {
      return { success: false, error: "Not authenticated", authError: true }
    }

    console.log("Profile page - User authenticated:", user.id)

    // Ensure user exists in database before proceeding
    await ensureUserInDb(user.id, user.email || "")

    // Get user data from Prisma with optimized query
    // Only select the fields we need and use a single query
    const [userData, recentExport] = await Promise.all([
      prisma.user.findUnique({
        where: { id: user.id },
        select: {
          email: true,
          fullName: true, // Make sure to include fullName
          isPremium: true,
          resumeTemplate: true,
          preferredTailoringMode: true,
          analyticsTimeRange: true,
          analyticsViewMode: true,
          dailyBasicTailoringsUsed: true,
          dailyPersonalizedTailoringsUsed: true,
          dailyAggressiveTailoringsUsed: true,
          dailyCoverLettersUsed: true,
          dailyLinkedinOptimizationsUsed: true,
          dailyInterviewSessionsUsed: true,
          dailyResetDate: true,
          createdAt: true,
        },
      }),
      prisma.resumeExport.findFirst({
        where: { userId: user.id },
        orderBy: { createdAt: "desc" },
        include: {
          resume: {
            select: {
              id: true,
              version: true,
              tailoringMode: true,
            },
          },
        },
      }),
    ])

    // If user doesn't exist in database, this should never happen now
    if (!userData) {
      console.error("Profile page - User not found in database after ensureUserInDb:", user.id)
      return {
        success: false,
        error: "User not found in database",
        authError: false,
      }
    }

    // Get the template information
    const templateId = userData.resumeTemplate || getDefaultTemplate().id
    const template = getTemplateById(templateId)

    const loadTime = Date.now() - startTime
    console.log(`Profile page - Data loaded in ${loadTime}ms`)

    return {
      success: true,
      data: {
        id: user.id,
        email: userData.email,
        fullName: userData.fullName, // Make sure to include fullName
        isPremium: userData.isPremium,
        preferredTailoringMode: userData.preferredTailoringMode,
        analyticsTimeRange: userData.analyticsTimeRange,
        analyticsViewMode: userData.analyticsViewMode,
        template: template || getDefaultTemplate(),
        usage: {
          basicTailorings: userData.dailyBasicTailoringsUsed,
          personalizedTailorings: userData.dailyPersonalizedTailoringsUsed,
          aggressiveTailorings: userData.dailyAggressiveTailoringsUsed,
          coverLetters: userData.dailyCoverLettersUsed,
          linkedinOptimizations: userData.dailyLinkedinOptimizationsUsed,
          interviewSessions: userData.dailyInterviewSessionsUsed,
          resetDate: userData.dailyResetDate,
        },
        recentExport: recentExport,
        createdAt: userData.createdAt,
      },
    }
  } catch (error) {
    console.error("Profile page - Error fetching user profile:", error)
    return { success: false, error: "Failed to fetch user profile", authError: false }
  }
}

export default async function ProfilePage() {
  console.log("Profile page - Component rendering")

  return (
    <>
      {/* Loading state */}
      <div className="container mx-auto py-10">
        <ProfilePageContent />
      </div>
    </>
  )
}

// Separate component to handle async data fetching with loading state
async function ProfilePageContent() {
  const result = await getUserProfile()
  console.log("Profile page - getUserProfile result:", result.success)

  if (!result.success) {
    // Only redirect to auth if specifically not authenticated
    if (result.authError) {
      console.log("Profile page - Redirecting to auth due to auth error")
      redirect("/auth?redirectTo=/profile")
    }

    // For other errors, show an error state
    console.log("Profile page - Showing error state:", result.error)
    return (
      <div className="container mx-auto py-10">
        <h1 className="text-2xl font-bold mb-4">Profile Error</h1>
        <p className="text-red-500">There was an error loading your profile: {result.error}</p>
        <div className="mt-4">
          <a href="/resume/lab" className="text-blue-500 hover:underline">
            Return to Resume Lab
          </a>
        </div>
      </div>
    )
  }

  console.log("Profile page - Rendering ProfileClient component")
  return <ProfileClient profile={result.data} />
}
