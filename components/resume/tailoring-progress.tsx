"use client"

import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Sparkles, Brain, CheckCircle } from "lucide-react"

interface TailoringProgressProps {
  progress: number
  currentAttempt?: number
  maxAttempts?: number
  status: string
}

export function TailoringProgress({ progress, currentAttempt, maxAttempts, status }: TailoringProgressProps) {
  // Determine the current step based on status
  const getStep = () => {
    if (status.includes("attempt")) {
      return 1
    } else if (status === "processing") {
      return 2
    } else if (status === "completed") {
      return 3
    }
    return 0
  }

  const step = getStep()

  // Get a user-friendly status message
  const getStatusMessage = () => {
    if (status.includes("attempt")) {
      return `AI Pass ${currentAttempt || 1}/${maxAttempts || 3}: Tailoring your resume`
    } else if (status === "processing") {
      return "Finalizing and scoring your resume"
    } else if (status === "completed") {
      return "Tailoring complete!"
    }
    return "Starting tailoring process..."
  }

  return (
    <div className="w-full max-w-md">
      <Progress value={progress} className="h-2 mb-6 bg-gray-200 overflow-hidden">
        <div
          className="h-full bg-gradient-to-r from-amber-400 to-amber-500 transition-all duration-500"
          style={{ width: `${progress}%` }}
        ></div>
      </Progress>

      <div className="flex justify-between mb-8">
        <div className={cn("flex flex-col items-center", step >= 1 ? "text-primary" : "text-gray-400")}>
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mb-2 transition-all duration-300",
              step >= 1 ? "bg-gradient-to-r from-amber-400 to-amber-500 text-white shadow-md" : "bg-gray-100",
            )}
          >
            <Brain className="h-5 w-5" />
          </div>
          <span className="text-xs">AI Tailoring</span>
        </div>

        <div className={cn("flex flex-col items-center", step >= 2 ? "text-primary" : "text-gray-400")}>
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mb-2",
              step >= 2 ? "bg-primary text-white" : "bg-gray-100",
            )}
          >
            <Sparkles className="h-5 w-5" />
          </div>
          <span className="text-xs">Optimization</span>
        </div>

        <div className={cn("flex flex-col items-center", step >= 3 ? "text-primary" : "text-gray-400")}>
          <div
            className={cn(
              "w-10 h-10 rounded-full flex items-center justify-center mb-2",
              step >= 3 ? "bg-primary text-white" : "bg-gray-100",
            )}
          >
            <CheckCircle className="h-5 w-5" />
          </div>
          <span className="text-xs">Complete</span>
        </div>
      </div>

      <div className="text-center">
        <p className="font-medium">{getStatusMessage()}</p>
        <p className="text-sm text-gray-500 mt-1">
          {status.includes("attempt") && currentAttempt && maxAttempts && (
            <>Our AI is making multiple passes to ensure the highest quality result.</>
          )}
        </p>
      </div>
    </div>
  )
}
