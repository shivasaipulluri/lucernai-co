"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Clock, Brain, Code, Briefcase, PuzzleIcon as PuzzlePiece, BookmarkCheck } from "lucide-react"
import type { InterviewType } from "@/lib/actions/interview-actions"

interface InterviewSessionSidebarProps {
  jobDescription: string
  questionCounts: Record<InterviewType, number>
  totalAnswered: number
  totalNeedingReview: number
  totalQuestions: number
  onTimerToggle: () => void
  timerActive: boolean
  timerSeconds: number
}

export function InterviewSessionSidebar({
  jobDescription,
  questionCounts,
  totalAnswered,
  totalNeedingReview,
  totalQuestions,
  onTimerToggle,
  timerActive,
  timerSeconds,
}: InterviewSessionSidebarProps) {
  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Calculate progress percentage
  const progressPercentage = totalQuestions > 0 ? Math.round((totalAnswered / totalQuestions) * 100) : 0

  return (
    <div className="space-y-4 sticky top-6">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Session Summary</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Job Description</div>
            <div className="text-sm line-clamp-4 bg-gray-50 p-2 rounded-md">
              {jobDescription.substring(0, 300)}
              {jobDescription.length > 300 && "..."}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Question Types</div>
            <div className="flex flex-wrap gap-2">
              {questionCounts.Behavioral > 0 && (
                <Badge variant="outline" className="bg-blue-50 text-blue-700 flex items-center gap-1">
                  <Brain className="h-3 w-3" />
                  Behavioral: {questionCounts.Behavioral}
                </Badge>
              )}
              {questionCounts.Technical > 0 && (
                <Badge variant="outline" className="bg-green-50 text-green-700 flex items-center gap-1">
                  <Code className="h-3 w-3" />
                  Technical: {questionCounts.Technical}
                </Badge>
              )}
              {questionCounts["Role-Specific"] > 0 && (
                <Badge variant="outline" className="bg-purple-50 text-purple-700 flex items-center gap-1">
                  <Briefcase className="h-3 w-3" />
                  Role-Specific: {questionCounts["Role-Specific"]}
                </Badge>
              )}
              {questionCounts["Case-Based"] > 0 && (
                <Badge variant="outline" className="bg-amber-50 text-amber-700 flex items-center gap-1">
                  <PuzzlePiece className="h-3 w-3" />
                  Case-Based: {questionCounts["Case-Based"]}
                </Badge>
              )}
            </div>
          </div>

          <div>
            <div className="text-sm font-medium text-gray-500 mb-1">Progress</div>
            <Progress value={progressPercentage} className="h-2 mb-2" />
            <div className="flex justify-between text-xs text-gray-500">
              <span>
                {totalAnswered} of {totalQuestions} answered
              </span>
              <span>{progressPercentage}% complete</span>
            </div>
          </div>

          {totalNeedingReview > 0 && (
            <div className="flex items-center gap-2 p-2 bg-amber-50 rounded-md">
              <BookmarkCheck className="h-4 w-4 text-amber-600" />
              <span className="text-sm text-amber-700">
                {totalNeedingReview} question{totalNeedingReview !== 1 ? "s" : ""} marked for review
              </span>
            </div>
          )}

          <div>
            <div className="text-sm font-medium text-gray-500 mb-2">Interview Timer</div>
            <Button
              variant={timerActive ? "default" : "outline"}
              size="sm"
              onClick={onTimerToggle}
              className="w-full flex items-center justify-center gap-2"
            >
              <Clock className="h-4 w-4" />
              {timerActive ? formatTime(timerSeconds) : "Start Timer"}
            </Button>
            {timerActive && <p className="text-xs text-gray-500 mt-1 text-center">Timer running - click to pause</p>}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Interview Tips</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-sm font-medium">Use the STAR method</p>
            <p className="text-xs text-gray-600">
              Situation, Task, Action, Result - structure your behavioral answers this way.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Be specific, not general</p>
            <p className="text-xs text-gray-600">Use concrete examples and metrics when possible.</p>
          </div>
          <div>
            <p className="text-sm font-medium">Practice out loud</p>
            <p className="text-xs text-gray-600">
              Speaking your answers helps with recall during the actual interview.
            </p>
          </div>
          <div>
            <p className="text-sm font-medium">Time your responses</p>
            <p className="text-xs text-gray-600">Aim for 1-2 minutes per answer - concise but complete.</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
