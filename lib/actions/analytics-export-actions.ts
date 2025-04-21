"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { getAnalyticsData } from "./analytics-actions"
import type { TimeRange } from "@/lib/types"
import { v4 as uuidv4 } from "uuid"

interface ExportResult {
  success: boolean
  error?: string
  url?: string
}

interface ShareResult {
  success: boolean
  error?: string
  url?: string
}

interface EmailResult {
  success: boolean
  error?: string
}

/**
 * Export analytics summary as PDF
 */
export async function exportAnalyticsSummary(
  userId: string,
  timeRange: TimeRange = "all",
  viewMode: "compact" | "detailed" = "detailed",
): Promise<ExportResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Get analytics data
    const analyticsData = await getAnalyticsData(userId, timeRange)

    // In a real implementation, we would use a PDF generation library like Puppeteer
    // For now, we'll simulate the PDF generation with a mock URL

    // Generate a unique filename
    const filename = `analytics-summary-${timeRange}-${new Date().toISOString().split("T")[0]}.pdf`

    // In a real implementation, we would store the PDF in a storage service
    // and return the URL to download it
    const mockUrl = `/api/download/analytics/${filename}?token=${uuidv4()}`

    // Log the export event
    await prisma.analyticsEvent.create({
      data: {
        userId: userId,
        eventType: "export_analytics",
        metadata: {
          timeRange,
          viewMode,
          format: "pdf",
        },
      },
    })

    return {
      success: true,
      url: mockUrl,
    }
  } catch (error) {
    console.error("Error exporting analytics summary:", error)
    return { success: false, error: "Failed to export analytics summary" }
  }
}

/**
 * Generate a shareable link for analytics
 */
export async function generateShareableLink(userId: string, timeRange: TimeRange = "all"): Promise<ShareResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Generate a unique token for the shareable link
    const token = uuidv4()

    // In a real implementation, we would store the token in the database
    // with an expiration date and associate it with the user and timeRange

    // For now, we'll just generate a mock URL
    const shareableUrl = `${process.env.NEXT_PUBLIC_APP_URL || "https://lucerna-ai.vercel.app"}/share/analytics/${userId}?token=${token}&timeRange=${timeRange}`

    // Log the share event
    await prisma.analyticsEvent.create({
      data: {
        userId: userId,
        eventType: "share_analytics",
        metadata: {
          timeRange,
          token,
        },
      },
    })

    return {
      success: true,
      url: shareableUrl,
    }
  } catch (error) {
    console.error("Error generating shareable link:", error)
    return { success: false, error: "Failed to generate shareable link" }
  }
}

/**
 * Email analytics summary to user
 */
export async function emailAnalyticsSummary(
  userId: string,
  timeRange: TimeRange = "all",
  viewMode: "compact" | "detailed" = "detailed",
): Promise<EmailResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if user is premium
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      select: { isPremium: true, email: true },
    })

    if (!userData?.isPremium) {
      return { success: false, error: "Premium subscription required" }
    }

    // Get analytics data
    const analyticsData = await getAnalyticsData(userId, timeRange)

    // In a real implementation, we would use an email service to send the email
    // For now, we'll just simulate the email sending

    // Log the email event
    await prisma.analyticsEvent.create({
      data: {
        userId: userId,
        eventType: "email_analytics",
        metadata: {
          timeRange,
          viewMode,
          email: userData.email,
        },
      },
    })

    return { success: true }
  } catch (error) {
    console.error("Error emailing analytics summary:", error)
    return { success: false, error: "Failed to email analytics summary" }
  }
}
