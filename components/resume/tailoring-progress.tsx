"use client"

import { useEffect, useState } from "react"
import { Progress } from "@/components/ui/progress"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"
import { Sparkles, CheckCircle, AlertTriangle } from "lucide-react"
import { cn } from "@/lib/utils"
import confetti from "canvas-confetti"

interface TailoringProgressProps {
  progress: number
  currentAttempt?: number
  maxAttempts?: number
  status: string
  mode?: "basic" | "personalized" | "aggressive"
}

export function TailoringProgress({
  progress,
  currentAttempt,
  maxAttempts,
  status,
  mode = "basic",
}: TailoringProgressProps) {
  const [sparkleVisible, setSparkleVisible] = useState(false)

  // Trigger confetti when completed
  useEffect(() => {
    if (status === "completed" && progress === 100) {
      // Small delay to ensure the UI has updated
      const timer = setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 },
        })
      }, 500)
      return () => clearTimeout(timer)
    }
  }, [status, progress])

  // Animate sparkles
  useEffect(() => {
    if (progress > 0 && progress < 100) {
      const interval = setInterval(() => {
        setSparkleVisible((prev) => !prev)
      }, 1000)
      return () => clearInterval(interval)
    }
  }, [progress])

  // Get status message based on current status
  const getStatusMessage = () => {
    switch (status) {
      case "not_started":
        return "Preparing to tailor your resume..."
      case "started":
        return "Starting the tailoring process..."
      case "analyzing":
        return "Analyzing your resume and job description..."
      case "extracting_keywords":
        return "Extracting key requirements from job description..."
      case "tailoring":
        return mode === "basic"
          ? "Optimizing resume with key terms..."
          : mode === "personalized"
            ? "Creating personalized content for your resume..."
            : "Aggressively optimizing your resume for maximum impact..."
      case "scoring":
        return "Calculating ATS and job match scores..."
      case "completed":
        return "Tailoring complete! Your resume is ready."
      case "error":
        return "We encountered an issue. Please try again."
      case "loading_resume":
        return "Loading your tailored resume..."
      default:
        if (status.startsWith("attempt_") && currentAttempt && maxAttempts) {
          return `Tailoring attempt ${currentAttempt} of ${maxAttempts}...`
        }
        return "Processing your resume..."
    }
  }

  // Get estimated time remaining
  const getTimeEstimate = () => {
    if (status === "completed" || status === "error") return null

    if (progress < 30) {
      return "Estimated time: ~20 seconds"
    } else if (progress < 60) {
      return "Estimated time: ~10 seconds"
    } else if (progress < 90) {
      return "Almost done! Just a few more seconds..."
    }
    return null
  }

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="flex items-center justify-center mb-4">
        {status === "completed" ? (
          <CheckCircle className="h-8 w-8 text-green-500 animate-in fade-in duration-500" />
        ) : status === "error" ? (
          <AlertTriangle className="h-8 w-8 text-amber-500 animate-in fade-in duration-500" />
        ) : (
          <div className="relative">
            <LucernaSunIcon size={32} glowing={true} className="animate-pulse" />
            <Sparkles
              className={cn(
                "absolute -top-1 -right-1 h-4 w-4 text-amber-400 transition-opacity duration-500",
                sparkleVisible ? "opacity-100" : "opacity-0",
              )}
            />
          </div>
        )}
      </div>

      <div className="mb-2 text-center font-medium">{getStatusMessage()}</div>

      <div className="relative mb-1">
        <Progress
          value={progress}
          className={cn(
            "h-2 transition-all duration-500",
            status === "completed" ? "bg-green-100" : status === "error" ? "bg-red-100" : "bg-amber-50",
          )}
        />
        {progress > 0 && progress < 100 && status !== "error" && (
          <div
            className="absolute top-0 h-2 w-8 bg-gradient-to-r from-transparent via-amber-300 to-transparent animate-shimmer"
            style={{
              left: `${Math.min(Math.max(progress - 8, 0), 92)}%`,
              opacity: 0.7,
            }}
          />
        )}
      </div>

      <div className="flex justify-between text-xs text-gray-500">
        <div>{progress}% complete</div>
        <div>
          {status === "completed" ? (
            <span className="text-green-600 font-medium">Done!</span>
          ) : status === "error" ? (
            <span className="text-red-600 font-medium">Failed</span>
          ) : (
            getTimeEstimate()
          )}
        </div>
      </div>
    </div>
  )
}
