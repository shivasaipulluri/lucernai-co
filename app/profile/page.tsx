export const dynamic = "force-dynamic"


import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ProfileClient } from "@/components/profile/profile-client"
import { getTemplateById, getDefaultTemplate } from "@/lib/templates/resume-templates"

export const metadata = {
  title: "Profile | Lucerna AI",
  description: "Manage your account settings, subscription, and preferences",
}

async function getUserProfile() {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get user data from Prisma
    const userData = await prisma.user.findUnique({
      where: { id: user.id },
      select: {
        email: true,
        isPremium: true,
        resumeTemplate: true,
        dailyBasicTailoringsUsed: true,
        dailyPersonalizedTailoringsUsed: true,
        dailyAggressiveTailoringsUsed: true,
        dailyCoverLettersUsed: true,
        dailyLinkedinOptimizationsUsed: true,
        dailyInterviewSessionsUsed: true,
        dailyResetDate: true,
        createdAt: true,
      },
    })

    if (!userData) {
      return { success: false, error: "User data not found" }
    }

    // Get the template information
    const templateId = userData.resumeTemplate || getDefaultTemplate().id
    const template = getTemplateById(templateId)

    // Get recent exports (if any)
    const recentExport = await prisma.resumeExport.findFirst({
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
    })

    return {
      success: true,
      data: {
        id: user.id,
        email: userData.email,
        isPremium: userData.isPremium,
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
    console.error("Error fetching user profile:", error)
    return { success: false, error: "Failed to fetch user profile" }
  }
}

export default async function ProfilePage() {
  const result = await getUserProfile()

  if (!result.success) {
    redirect("/auth")
  }

  return <ProfileClient profile={result.data} />
}
