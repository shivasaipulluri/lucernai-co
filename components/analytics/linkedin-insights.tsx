"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Badge } from "@/components/ui/badge"
import type { LinkedInStats } from "@/lib/types"
import { InfoIcon as InfoCircle, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

interface LinkedInInsightsProps {
  data: LinkedInStats
  isLoading: boolean
  viewMode: "compact" | "detailed"
}

export function LinkedInInsights({ data, isLoading, viewMode }: LinkedInInsightsProps) {
  // Format tone name for display
  const formatToneName = (name: string | null) => {
    if (!name) return "N/A"

    switch (name) {
      case "professional":
        return "Professional"
      case "enthusiastic":
        return "Enthusiastic"
      case "confident":
        return "Confident"
      case "conversational":
        return "Conversational"
      default:
        return name.charAt(0).toUpperCase() + name.slice(1)
    }
  }

  // Format date for display
  const formatDate = (dateString: string | undefined) => {
    if (!dateString) return "N/A"

    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return "Invalid date"
    }
  }

  return (
    <Card className={viewMode === "detailed" ? "col-span-full" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          LinkedIn Optimizer Insights
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoCircle className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Statistics about your LinkedIn profile optimizations</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.totalOptimizations === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-gray-400">
            No LinkedIn optimization data available
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Optimizations</h3>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold">{data.totalOptimizations}</div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Most Used Tone</h3>
                {isLoading ? (
                  <Skeleton className="h-8 w-24" />
                ) : (
                  <div className="text-xl font-medium">{formatToneName(data.mostUsedTone)}</div>
                )}
              </div>

              {viewMode === "detailed" && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Avg. Character Change</h3>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-3xl font-bold">
                      {data.avgCharacterImprovement > 0 ? "+" : ""}
                      {data.avgCharacterImprovement}
                    </div>
                  )}
                </div>
              )}
            </div>

            {data.lastOptimization && (
              <div className="space-y-2">
                <h3 className="text-sm font-medium text-gray-500 mb-1">Last Optimization</h3>
                <Card className="bg-gray-50">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <Badge>{formatToneName(data.lastOptimization.tone)}</Badge>
                      <div className="text-xs text-gray-500 flex items-center">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDate(data.lastOptimization.createdAt)}
                      </div>
                    </div>
                    <p className="text-sm text-gray-600">
                      LinkedIn About section optimized with {formatToneName(data.lastOptimization.tone).toLowerCase()}{" "}
                      tone
                    </p>
                  </CardContent>
                </Card>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
