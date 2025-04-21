"use client"

import { useState, useEffect } from "react"
import { Progress } from "@/components/ui/progress"
import { Sparkles, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import { cn } from "@/lib/utils"

interface TailoringProgressProps {
  progress: number
  currentAttempt?: number
  maxAttempts?: number
  status: string
}

export function TailoringProgress({ progress, currentAttempt = 1, maxAttempts = 3, status }: TailoringProgressProps) {
  const [animatedProgress, setAnimatedProgress] = useState(0)
  const [showSparkle, setShowSparkle] = useState(false)
  const [sparklePosition, setSparklePosition] = useState({ left: "10%", opacity: 1 })

  // Smooth progress animation
  useEffect(() => {
    // Always animate smoothly to the target progress
    const animationDuration = 1000 // 1 second animation
    const startTime = Date.now()
    const startValue = animatedProgress
    const endValue = progress

    const animateProgress = () => {
      const elapsed = Date.now() - startTime
      const progress = Math.min(elapsed / animationDuration, 1)
      // Use easeOutQuad for smoother deceleration
      const eased = 1 - (1 - progress) * (1 - progress)
      const newValue = startValue + (endValue - startValue) * eased

      setAnimatedProgress(newValue)

      if (progress < 1) {
        requestAnimationFrame(animateProgress)
      }
    }

    requestAnimationFrame(animateProgress)
  }, [progress])

  // Sparkle animation effect
  useEffect(() => {
    // Show sparkle at certain progress milestones or when changing iterations
    const shouldShowSparkle =
      (animatedProgress > 25 && animatedProgress < 28) ||
      (animatedProgress > 50 && animatedProgress < 53) ||
      (animatedProgress > 75 && animatedProgress < 78) ||
      (currentAttempt > 1 && animatedProgress % 20 < 3)

    if (shouldShowSparkle && !showSparkle) {
      setShowSparkle(true)
      // Calculate position based on progress
      const newPosition = `${Math.min(animatedProgress, 95)}%`
      setSparklePosition({ left: newPosition, opacity: 1 })

      // Hide sparkle after animation
      const timer = setTimeout(() => {
        setSparklePosition((prev) => ({ ...prev, opacity: 0 }))
        setTimeout(() => setShowSparkle(false), 500)
      }, 1500)

      return () => clearTimeout(timer)
    }
  }, [animatedProgress, currentAttempt, showSparkle])

  // Determine status display
  const getStatusDisplay = () => {
    switch (status) {
      case "not_started":
        return "Preparing..."
      case "started":
        return "Tailoring in progress..."
      case "analyzing":
        return "Analyzing resume structure..."
      case "extracting":
        return "Extracting key qualifications..."
      case "matching":
        return "Matching to job requirements..."
      case "optimizing":
        return "Optimizing content..."
      case "formatting":
        return "Perfecting format and style..."
      case "refining":
        return "Refining language and tone..."
      case "finalizing":
        return "Finalizing your resume..."
      case "completed":
        return "Tailoring complete!"
      case "loading_resume":
        return "Loading your tailored resume..."
      case "error":
        return "Error tailoring resume"
      default:
        return "Processing..."
    }
  }

  // Get a more detailed message based on progress
  const getDetailedMessage = () => {
    if (status === "error") return "We encountered an issue. Please try again."
    if (status === "loading_resume") return "Almost there! Your resume is ready to view."

    // For iteration transitions, show special messages
    if (currentAttempt > 1) {
      if (animatedProgress < 30) return "Applying insights from previous iteration..."
      if (animatedProgress < 60) return "Enhancing resume quality based on AI feedback..."
    }

    // Progress-based messages
    if (animatedProgress < 20) return "Analyzing your experience and skills..."
    if (animatedProgress < 40) return "Identifying key achievements to highlight..."
    if (animatedProgress < 60) return "Aligning your qualifications with job requirements..."
    if (animatedProgress < 80) return "Optimizing language for maximum impact..."
    return "Putting final touches on your tailored resume..."
  }

  return (
    <div className="w-full max-w-md">
      <div className="relative mb-2">
        <Progress
          value={animatedProgress}
          className={cn(
            "h-3 bg-gray-100 transition-all duration-500",
            status === "completed" || status === "loading_resume" ? "bg-green-100" : "bg-blue-50",
          )}
        />

        {/* Animated sparkle effect */}
        {showSparkle && (
          <div
            className="absolute top-0 transform -translate-y-1/2 transition-all duration-500 z-10"
            style={{
              left: sparklePosition.left,
              opacity: sparklePosition.opacity,
              transition: "left 0.5s ease-out, opacity 0.5s ease-in-out",
            }}
          >
            <Sparkles className="h-6 w-6 text-amber-400 animate-pulse" />
          </div>
        )}
      </div>

      <div className="flex justify-between items-center mb-4">
        <div className="text-sm text-gray-500">{animatedProgress.toFixed(0)}% complete</div>

        {maxAttempts > 1 && (
          <div className="text-sm text-gray-500">
            Iteration {currentAttempt} of {maxAttempts}
          </div>
        )}
      </div>

      <div className="flex items-center gap-2 mb-1">
        {status === "error" ? (
          <AlertTriangle className="h-4 w-4 text-red-500" />
        ) : status === "completed" ? (
          <CheckCircle className="h-4 w-4 text-green-500" />
        ) : (
          <Loader2 className="h-4 w-4 text-blue-500 animate-spin" />
        )}

        <div className="font-medium">{getStatusDisplay()}</div>
      </div>

      <p className="text-sm text-gray-600">{getDetailedMessage()}</p>
    </div>
  )
}
