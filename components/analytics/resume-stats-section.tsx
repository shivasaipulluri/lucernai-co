"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { ResumeStats } from "@/lib/types"
import { InfoIcon as InfoCircle } from "lucide-react"

interface ResumeStatsSectionProps {
  data: ResumeStats
  isLoading: boolean
  viewMode: "compact" | "detailed"
}

export function ResumeStatsSection({ data, isLoading, viewMode }: ResumeStatsSectionProps) {
  // Format tailoring mode for display
  const formatTailoringMode = (mode: string | null) => {
    if (!mode) return "N/A"

    switch (mode) {
      case "basic":
        return "Basic"
      case "personalized":
        return "Personalized"
      case "aggressive":
        return "Aggressive"
      default:
        return mode.charAt(0).toUpperCase() + mode.slice(1)
    }
  }

  // Format time of day for display
  const formatTimeOfDay = (timeOfDay: string | null) => {
    if (!timeOfDay) return "N/A"

    return timeOfDay.charAt(0).toUpperCase() + timeOfDay.slice(1)
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
            Total Resumes
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoCircle className="h-3 w-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Total number of resumes you've tailored</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <div className="text-3xl font-bold">{data.totalResumes}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
            Refined Resumes
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoCircle className="h-3 w-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Resumes that have been refined (version 2+)</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <div className="text-3xl font-bold">{data.refinedResumes}</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
            Avg. ATS Score
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoCircle className="h-3 w-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Average ATS compatibility score across all resumes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <div className="text-3xl font-bold">{data.avgAtsScore}%</div>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
            Avg. JD Score
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger>
                  <InfoCircle className="h-3 w-3 text-gray-400" />
                </TooltipTrigger>
                <TooltipContent>
                  <p>Average job description match score across all resumes</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <Skeleton className="h-10 w-16" />
          ) : (
            <div className="text-3xl font-bold">{data.avgJdScore}%</div>
          )}
        </CardContent>
      </Card>

      {viewMode === "detailed" && (
        <>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500 flex items-center gap-1">
                Golden Rule Pass Rate
                <TooltipProvider>
                  <Tooltip>
                    <TooltipTrigger>
                      <InfoCircle className="h-3 w-3 text-gray-400" />
                    </TooltipTrigger>
                    <TooltipContent>
                      <p>Percentage of resumes passing all 5 quality rules</p>
                    </TooltipContent>
                  </Tooltip>
                </TooltipProvider>
              </CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-16" />
              ) : (
                <div className="text-3xl font-bold">{data.goldenRulePassRate}%</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Most Used Mode</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-xl font-medium">{formatTailoringMode(data.mostUsedTailoringMode)}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Most Active Time</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-xl font-medium">{formatTimeOfDay(data.mostActiveTimeOfDay)}</div>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-gray-500">Most Active Day</CardTitle>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <Skeleton className="h-10 w-24" />
              ) : (
                <div className="text-xl font-medium">{data.mostActiveDay || "N/A"}</div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  )
}
