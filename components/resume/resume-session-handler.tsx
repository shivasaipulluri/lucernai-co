"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { debugLog, errorLog } from "@/lib/utils/debug-utils"

export function ResumeSessionHandler({ resumeId }: { resumeId: string }) {
  const [isLoading, setIsLoading] = useState(true)
  const [retryCount, setRetryCount] = useState(0)
  const router = useRouter()
  const supabase = createClient()

  useEffect(() => {
    const maxRetries = 3
    const retryDelay = 1000 // 1 second

    const checkSession = async () => {
      try {
        // Check if we have a session
        const {
          data: { session },
        } = await supabase.auth.getSession()

        if (session) {
          // We have a session, refresh the page to try loading the resume again
          debugLog("SESSION", "Session found, refreshing page")
          router.refresh()
          return true
        } else {
          errorLog("SESSION", "No session found")
          return false
        }
      } catch (error) {
        errorLog("SESSION", "Error checking session:", error)
        return false
      }
    }

    const attemptRetry = async () => {
      if (retryCount >= maxRetries) {
        errorLog("SESSION", "Max retries reached, redirecting to dashboard")
        router.push("/dashboard")
        return
      }

      const hasSession = await checkSession()

      if (!hasSession) {
        // Increment retry count and try again after delay
        setRetryCount((prev) => prev + 1)
        setTimeout(attemptRetry, retryDelay)
      } else {
        setIsLoading(false)
      }
    }

    attemptRetry()
  }, [resumeId, retryCount, router, supabase.auth])

  if (isLoading) {
    return (
      <div className="container-wide py-12">
        <div className="flex flex-col items-center justify-center min-h-[60vh]">
          <Loader2 className="h-12 w-12 text-primary animate-spin mb-4" />
          <h2 className="text-xl font-medium mb-2">Loading your resume...</h2>
          <p className="text-gray-500">Please wait while we retrieve your resume data.</p>
          <p className="text-sm text-gray-400 mt-4">Retry attempt: {retryCount + 1}/3</p>
        </div>
      </div>
    )
  }

  return null
}
