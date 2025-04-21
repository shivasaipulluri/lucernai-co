"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import type { CoverLetterStats } from "@/lib/types"
import { InfoIcon as InfoCircle } from "lucide-react"
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip as RechartsTooltip } from "recharts"

interface CoverLetterInsightsProps {
  data: CoverLetterStats
  isLoading: boolean
  viewMode: "compact" | "detailed"
}

export function CoverLetterInsights({ data, isLoading, viewMode }: CoverLetterInsightsProps) {
  // Colors for the tone chart
  const COLORS = ["#3B82F6", "#EC4899", "#10B981", "#F59E0B"]

  // Format tone name for display
  const formatToneName = (name: string) => {
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

  // Format the data for the chart
  const chartData = data.toneBreakdown.map((item) => ({
    ...item,
    name: formatToneName(item.name),
  }))

  return (
    <Card className={viewMode === "detailed" ? "col-span-full" : ""}>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          Cover Letter Insights
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoCircle className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p>Statistics about your cover letter generation</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
      </CardHeader>
      <CardContent>
        {data.totalCoverLetters === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-gray-400">No cover letter data available</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Total Cover Letters</h3>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold">{data.totalCoverLetters}</div>
                )}
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-1">Average Word Count</h3>
                {isLoading ? (
                  <Skeleton className="h-8 w-16" />
                ) : (
                  <div className="text-3xl font-bold">{data.avgWordCount}</div>
                )}
              </div>

              {viewMode === "detailed" && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 mb-1">Rewrites Per Resume</h3>
                  {isLoading ? (
                    <Skeleton className="h-8 w-16" />
                  ) : (
                    <div className="text-3xl font-bold">{data.rewritesPerResume}</div>
                  )}
                </div>
              )}
            </div>

            {chartData.length > 0 && (
              <div className="h-[200px]">
                <h3 className="text-sm font-medium text-gray-500 mb-2">Tone Distribution</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={chartData}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {chartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <RechartsTooltip formatter={(value) => [`${value} cover letters`, ""]} />
                    <Legend />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
