"use server"
import { revalidatePath } from "next/cache"

export async function revalidateResumePage(resumeId: string) {
  if (process.env.NODE_ENV === "development") {
    try {
      revalidatePath(`/resume/${resumeId}`)
      console.log(`[DEV] Revalidated /resume/${resumeId}`)
    } catch (err) {
      console.warn("[DEV] revalidatePath failed:", err)
    }
  }
}

export async function revalidateDashboardPage() {
  if (process.env.NODE_ENV === "development") {
    try {
      revalidatePath("/dashboard")
      console.log("[DEV] Revalidated /dashboard")
    } catch (err) {
      console.warn("[DEV] revalidatePath failed:", err)
    }
  }
}

export async function revalidateCoverLetterPage() {
  if (process.env.NODE_ENV === "development") {
    try {
      revalidatePath("/cover-letter")
      console.log("[DEV] Revalidated /cover-letter")
    } catch (err) {
      console.warn("[DEV] revalidatePath failed:", err)
    }
  }
}

export async function revalidateLinkedInPage() {
  if (process.env.NODE_ENV === "development") {
    try {
      revalidatePath("/linkedin")
      console.log("[DEV] Revalidated /linkedin")
    } catch (err) {
      console.warn("[DEV] revalidatePath failed:", err)
    }
  }
}

export async function revalidateTemplatesPage() {
  if (process.env.NODE_ENV === "development") {
    try {
      revalidatePath("/templates")
      console.log("[DEV] Revalidated /templates")
    } catch (err) {
      console.warn("[DEV] revalidatePath failed:", err)
    }
  }
}

export async function revalidateAnalyticsPage() {
  if (process.env.NODE_ENV === "development") {
    try {
      revalidatePath("/analytics")
      console.log("[DEV] Revalidated /analytics")
    } catch (err) {
      console.warn("[DEV] revalidatePath failed:", err)
    }
  }
}

export async function revalidateInterviewPage() {
  if (process.env.NODE_ENV === "development") {
    try {
      revalidatePath("/interview")
      console.log("[DEV] Revalidated /interview")
    } catch (err) {
      console.warn("[DEV] revalidatePath failed:", err)
    }
  }
 }
 