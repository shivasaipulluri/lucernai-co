"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import type { AnalyticsData, TimeRange } from "@/lib/types"

/**
 * Fetches analytics data for a user
 */
export async function getAnalyticsData(userId: string, timeRange: TimeRange = "all"): Promise<AnalyticsData> {
  try {
    // Determine date range
    let startDate: Date | undefined
    const now = new Date()

    if (timeRange === "7days") {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 7)
    } else if (timeRange === "30days") {
      startDate = new Date(now)
      startDate.setDate(now.getDate() - 30)
    }

    // Date filter condition
    const dateFilter = startDate ? { createdAt: { gte: startDate } } : {}

    // Fetch resume stats
    const resumeStats = await getResumeStats(userId, dateFilter)

    // Fetch cover letter stats
    const coverLetterStats = await getCoverLetterStats(userId, dateFilter)

    // Fetch LinkedIn stats
    const linkedInStats = await getLinkedInStats(userId, dateFilter)

    // Fetch resume iteration trends
    const resumeIterationTrends = await getResumeIterationTrends(userId, dateFilter)

    // Fetch tailoring mode usage
    const tailoringModeUsage = await getTailoringModeUsage(userId, dateFilter)

    // Fetch golden rule stats
    const goldenRuleStats = await getGoldenRuleStats(userId, dateFilter)

    // Fetch top performing resumes
    const topPerformingResumes = await getTopPerformingResumes(userId, dateFilter)

    return {
      resumeStats,
      coverLetterStats,
      linkedInStats,
      resumeIterationTrends,
      tailoringModeUsage,
      goldenRuleStats,
      topPerformingResumes,
      hasData: resumeStats.totalResumes > 0,
    }
  } catch (error) {
    console.error("Error fetching analytics data:", error)
    return {
      resumeStats: {
        totalResumes: 0,
        refinedResumes: 0,
        goldenRulePassRate: 0,
        avgAtsScore: 0,
        avgJdScore: 0,
        mostUsedTailoringMode: null,
        mostActiveTimeOfDay: null,
        mostActiveDay: null,
      },
      coverLetterStats: {
        totalCoverLetters: 0,
        toneBreakdown: [],
        avgWordCount: 0,
        rewritesPerResume: 0,
      },
      linkedInStats: {
        totalOptimizations: 0,
        mostUsedTone: null,
        avgCharacterImprovement: 0,
        lastOptimization: null,
      },
      resumeIterationTrends: [],
      tailoringModeUsage: [],
      goldenRuleStats: { passed: 0, failed: 0 },
      topPerformingResumes: [],
      hasData: false,
    }
  }
}

/**
 * Fetches resume statistics
 */
async function getResumeStats(userId: string, dateFilter: any) {
  // Get total resumes
  const totalResumes = await prisma.resume.count({
    where: {
      userId,
      ...dateFilter,
    },
  })

  // Get refined resumes (version > 1)
  const refinedResumes = await prisma.resume.count({
    where: {
      userId,
      version: { gt: 1 },
      ...dateFilter,
    },
  })

  // Get golden rule pass rate
  const totalResumesWithGoldenRule = await prisma.resume.count({
    where: {
      userId,
      ...dateFilter,
    },
  })

  const passedGoldenRules = await prisma.resume.count({
    where: {
      userId,
      goldenPassed: true,
      ...dateFilter,
    },
  })

  const goldenRulePassRate =
    totalResumesWithGoldenRule > 0 ? Math.round((passedGoldenRules / totalResumesWithGoldenRule) * 100) : 0

  // Get average ATS and JD scores
  const scoreStats = await prisma.resume.aggregate({
    where: {
      userId,
      atsScore: { not: null },
      jdScore: { not: null },
      ...dateFilter,
    },
    _avg: {
      atsScore: true,
      jdScore: true,
    },
  })

  /// Get most used tailoring mode
  const tailoringModes = await prisma.resume.groupBy({
    by: ["tailoringMode"],
    where: {
      userId,
      tailoringMode: {
        in: ["personalized", "basic", "aggressive"], // Replace with actual modes in your DB
      },
      ...dateFilter,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 1,
  })


   // Get most active time of day
   let timeOfDayQuery = `
   SELECT 
     CASE 
       WHEN EXTRACT(HOUR FROM "created_at") BETWEEN 5 AND 11 THEN 'morning'
       WHEN EXTRACT(HOUR FROM "created_at") BETWEEN 12 AND 16 THEN 'afternoon'
       WHEN EXTRACT(HOUR FROM "created_at") BETWEEN 17 AND 21 THEN 'evening'
       ELSE 'night'
     END as time_of_day,
     COUNT(*) as count
   FROM "resumes"
   WHERE "user_id" = $1
 `
 const timeParams: any[] = [userId]

 if (dateFilter.createdAt?.gte) {
   timeOfDayQuery += ` AND "created_at" >= $2`
   timeParams.push(dateFilter.createdAt.gte)
 }

 timeOfDayQuery += ` GROUP BY time_of_day ORDER BY count DESC LIMIT 1`

 const timeOfDayStats = await prisma.$queryRawUnsafe(timeOfDayQuery, ...timeParams) as { time_of_day: string; count: number }[]


 // Get most active day of week
 let dayOfWeekQuery = `
   SELECT 
     EXTRACT(DOW FROM "created_at") as day_of_week,
     COUNT(*) as count
   FROM "resumes"
   WHERE "user_id" = $1
 `
 const dayParams: any[] = [userId]

 if (dateFilter.createdAt?.gte) {
   dayOfWeekQuery += ` AND "created_at" >= $2`
   dayParams.push(dateFilter.createdAt.gte)
 }

 dayOfWeekQuery += ` GROUP BY day_of_week ORDER BY count DESC LIMIT 1`

 const dayOfWeekStats = await prisma.$queryRawUnsafe(dayOfWeekQuery, ...dayParams) as { day_of_week: number; count: number }[]
 const dayNames = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"]

  return {
    totalResumes,
    refinedResumes,
    goldenRulePassRate,
    avgAtsScore: Math.round(scoreStats._avg.atsScore || 0),
    avgJdScore: Math.round(scoreStats._avg.jdScore || 0),
    mostUsedTailoringMode: tailoringModes.length > 0 ? tailoringModes[0].tailoringMode : null,
    mostActiveTimeOfDay: timeOfDayStats.length > 0 ? timeOfDayStats[0].time_of_day : null,
    mostActiveDay: dayOfWeekStats.length > 0 ? dayNames[dayOfWeekStats[0].day_of_week] : null,
  }
}

/**
 * Fetches cover letter statistics
 */
async function getCoverLetterStats(userId: string, dateFilter: any) {
  // Get total cover letters
  const totalCoverLetters = await prisma.coverLetter.count({
    where: {
      userId,
      ...dateFilter,
    },
  })

  // Get tone breakdown
  const toneBreakdown = await prisma.coverLetter.groupBy({
    by: ["tone"],
    where: {
      userId,
      ...dateFilter,
    },
    _count: {
      id: true,
    },
  })

  // Get average word count
  const coverLetters = await prisma.coverLetter.findMany({
    where: {
      userId,
      ...dateFilter,
    },
    select: {
      content: true,
    },
  })

  const avgWordCount =
    coverLetters.length > 0
      ? Math.round(
          coverLetters.reduce((sum, cl) => {
            const wordCount = cl.content.split(/\s+/).filter(Boolean).length
            return sum + wordCount
          }, 0) / coverLetters.length,
        )
      : 0

  // Get rewrites per resume
  const coverLettersByResume = await prisma.coverLetter.groupBy({
    by: ["resumeId"],
    where: {
      userId,
      ...dateFilter,
    },
    _count: {
      id: true,
    },
  })

  const rewritesPerResume =
    coverLettersByResume.length > 0
      ? Number.parseFloat((totalCoverLetters / coverLettersByResume.length).toFixed(1))
      : 0

  return {
    totalCoverLetters,
    toneBreakdown: toneBreakdown.map((tone) => ({
      name: tone.tone,
      value: tone._count.id,
    })),
    avgWordCount,
    rewritesPerResume,
  }
}

/**
 * Fetches LinkedIn optimization statistics
 */
async function getLinkedInStats(userId: string, dateFilter: any) {
  // Get total optimizations
  const totalOptimizations = await prisma.linkedInOptimization.count({
    where: {
      userId,
      ...dateFilter,
    },
  })

  // Get most used tone
  const tones = await prisma.linkedInOptimization.groupBy({
    by: ["tone"],
    where: {
      userId,
      ...dateFilter,
    },
    _count: {
      id: true,
    },
    orderBy: {
      _count: {
        id: "desc",
      },
    },
    take: 1,
  })

  // Get average character improvement
  const linkedInOptimizations = await prisma.linkedInOptimization.findMany({
    where: {
      userId,
      ...dateFilter,
    },
    select: {
      originalAbout: true,
      optimizedAbout: true,
    },
  })

  const avgCharacterImprovement =
    linkedInOptimizations.length > 0
      ? Math.round(
          linkedInOptimizations.reduce((sum, opt) => {
            const originalLength = opt.originalAbout.length
            const optimizedLength = opt.optimizedAbout.length
            return sum + (optimizedLength - originalLength)
          }, 0) / linkedInOptimizations.length,
        )
      : 0

  // Get last optimization
  const lastOptimization = await prisma.linkedInOptimization.findFirst({
    where: {
      userId,
      ...dateFilter,
    },
    orderBy: {
      createdAt: "desc",
    },
    select: {
      id: true,
      tone: true,
      createdAt: true,
    },
  })

  return {
    totalOptimizations,
    mostUsedTone: tones.length > 0 ? tones[0].tone : null,
    avgCharacterImprovement,
    lastOptimization: lastOptimization
      ? {
          id: lastOptimization.id,
          tone: lastOptimization.tone,
          createdAt: lastOptimization.createdAt.toISOString(), // Convert Date to string
        }
      : null,
  }
}

/**
 * Fetches resume iteration trends
 */
async function getResumeIterationTrends(userId: string, dateFilter: any) {
  // Get resumes with multiple versions
  const resumeLineages = await prisma.resume.findMany({
    where: {
      userId,
      OR: [
        { originalResumeId: { not: null } },
        {
          id: {
            in: await prisma.resume
              .findMany({
                where: { userId, originalResumeId: { not: null } },
                select: { originalResumeId: true },
              })
              .then((results) => results.map((r) => r.originalResumeId as string)),
          },
        },
      ],
      ...dateFilter,
    },
    select: {
      id: true,
      originalResumeId: true,
      version: true,
      atsScore: true,
      jdScore: true,
    },
    orderBy: {
      version: "asc",
    },
  })

  // Group by lineage
  const lineageMap = new Map<string, any[]>()

  resumeLineages.forEach((resume) => {
    const lineageId = resume.originalResumeId || resume.id
    if (!lineageMap.has(lineageId)) {
      lineageMap.set(lineageId, [])
    }
    lineageMap.get(lineageId)?.push(resume)
  })

  // Format for chart
  const trends = Array.from(lineageMap.values())
    .filter((lineage) => lineage.length > 1)
    .map((lineage) => {
      return lineage.map((resume) => ({
        version: resume.version,
        atsScore: resume.atsScore || 0,
        jdScore: resume.jdScore || 0,
      }))
    })

  return trends
}

/**
 * Fetches tailoring mode usage
 */
async function getTailoringModeUsage(userId: string, dateFilter: any) {
  const modeUsage = await prisma.resume.groupBy({
    by: ["tailoringMode"],
    where: {
      userId,
      ...dateFilter,
    },
    _count: {
      id: true,
    },
  })

  return modeUsage.map((mode) => ({
    name: mode.tailoringMode || "unknown",
    value: mode._count.id,
  }))
}


/**
 * Fetches golden rule statistics
 */
async function getGoldenRuleStats(userId: string, dateFilter: any) {
  const passedCount = await prisma.resume.count({
    where: {
      userId,
      goldenPassed: true,
      ...dateFilter,
    },
  })

  const failedCount = await prisma.resume.count({
    where: {
      userId,
      goldenPassed: false,
      ...dateFilter,
    },
  })

  return {
    passed: passedCount,
    failed: failedCount,
  }
}

/**
 * Fetches top performing resumes
 */
async function getTopPerformingResumes(userId: string, dateFilter: any) {
  const resumes = await prisma.resume.findMany({
    where: {
      userId,
      atsScore: { not: null },
      jdScore: { not: null },
      ...dateFilter,
    },
    select: {
      id: true,
      version: true,
      atsScore: true,
      jdScore: true,
      tailoringMode: true,
      createdAt: true,
    },
    orderBy: [
      {
        atsScore: "desc",
      },
      {
        jdScore: "desc",
      },
    ],
    take: 5,
  })

  // Convert Date objects to strings
  return resumes.map((resume) => ({
    ...resume,
    createdAt: resume.createdAt.toISOString(),
  }))
}

/**
 * Updates the user's analytics preferences
 */
export async function updateAnalyticsPreferences(
  timeRange: TimeRange,
  viewMode: "compact" | "detailed",
): Promise<boolean> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return false
    }

    await prisma.user.update({
      where: {
        id: user.id,
      },
      data: {
        analyticsTimeRange: timeRange,
        analyticsViewMode: viewMode,
      },
    })

    // Safely revalidate paths
    try {
      if (process.env.NODE_ENV === "production") {
        const { revalidateAnalytics } = await import("@/lib/actions/revalidate-path")
        await revalidateAnalytics()
      }
    } catch (error) {
      console.error("Error revalidating paths:", error)
    }

    return true
  } catch (error) {
    console.error("Error updating analytics preferences:", error)
    return false
  }
}

// Fix the logAnalyticsEvent function to use the correct field names
// Replace this function:
async function logAnalyticsEvent(eventType: string, metadata: Record<string, any> = {}): Promise<boolean> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    await prisma.analyticsEvent.create({
      data: {
        userId: user?.id,
        eventType,
        metadata,
      },
    })
    return true
  } catch (error) {
    console.error("Error logging analytics event:", error)
    return false
  }
}

// Update the logCopyToClipboardAnalytics function to match the schema
export async function logCopyToClipboardAnalytics(
  userId: string,
  resumeId: string,
  version: number,
  metadata: Record<string, any> = {},
): Promise<boolean> {
  try {
    return await logAnalyticsEvent("resume_copy_to_clipboard", {
      resumeId,
      version,
      ...metadata,
    })
  } catch (error) {
    console.error("Error logging copy to clipboard analytics:", error)
    return false
  }
}

// Update the logDownloadResumeAnalytics function to match the schema
export async function logDownloadResumeAnalytics(
  userId: string,
  resumeId: string,
  version: number,
  format: string,
  metadata: Record<string, any> = {},
): Promise<boolean> {
  try {
    return await logAnalyticsEvent("resume_download", {
      resumeId,
      version,
      format,
      ...metadata,
    })
  } catch (error) {
    console.error("Error logging resume download analytics:", error)
    return false
  }
}

// Update the logPrintResumeAnalytics function to match the schema
export async function logPrintResumeAnalytics(
  userId: string,
  resumeId: string,
  version: number,
  metadata: Record<string, any> = {},
): Promise<boolean> {
  try {
    return await logAnalyticsEvent("resume_print", {
      resumeId,
      version,
      ...metadata,
    })
  } catch (error) {
    console.error("Error logging resume print analytics:", error)
    return false
  }
}
