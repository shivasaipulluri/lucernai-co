"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"

interface LogResumeEventParams {
  userId: string
  eventType: string
  resumeId: string
  resumeText?: string
  jobDescription?: string
  metadata?: Record<string, any>
}

export async function logResumeEvent(params: LogResumeEventParams): Promise<boolean> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== params.userId) {
      console.log("[MODEL LOG] FAILURE: No user found or user mismatch for analytics logging in logResumeEvent")
      return false
    }

    await prisma.resumeEvent.create({
      data: {
        userId: params.userId,
        resumeId: params.resumeId,
        eventType: params.eventType,
        resumeText: params.resumeText,
        jobDescription: params.jobDescription,
        metadata: params.metadata,
      },
    })

    return true
  } catch (error) {
    console.error("Error logging resume event:", error)
    return false
  }
}

interface LogAnalyticsEventParams {
  userId?: string
  eventType: string
  metadata?: Record<string, any>
}

export async function logAnalyticsEvent(eventType: string, metadata: Record<string, any> = {}): Promise<boolean> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    const userId = user?.id

    await prisma.analyticsEvent.create({
      data: {
        userId: userId,
        eventType: eventType,
        metadata: metadata,
      },
    })

    return true
  } catch (error) {
    console.error("Error logging analytics event:", error)
    return false
  }
}

interface LogTailoringAnalyticsParams {
  userId: string
  resumeId: string
  originalText: string
  tailoredText: string
  jobDescription: string
  atsScore: number
  jdScore: number
  tailoringMode: string
  isRefinement: boolean
  iterations: number
  goldenPassed: boolean
  modifiedSections?: string[]
}

export async function logTailoringAnalytics(params: LogTailoringAnalyticsParams): Promise<boolean> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== params.userId) {
      console.log("[MODEL LOG] FAILURE: No user found or user mismatch for analytics logging in logTailoringAnalytics")
      return false
    }

    // Log tailoring event details (replace with your actual logging mechanism)
    console.log(
      `[TAILORING ANALYTICS] User: ${params.userId}, Resume: ${params.resumeId}, Mode: ${params.tailoringMode}, ATS: ${params.atsScore}, JD: ${params.jdScore}`,
    )
    console.log(
      `[TAILORING ANALYTICS] Iterations: ${params.iterations}, Golden Passed: ${params.goldenPassed}, Is Refinement: ${params.isRefinement}`,
    )

    return true
  } catch (error) {
    console.error("Error logging tailoring analytics:", error)
    return false
  }
}
