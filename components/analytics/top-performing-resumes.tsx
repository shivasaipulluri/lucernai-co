"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Skeleton } from "@/components/ui/skeleton"
import { Badge } from "@/components/ui/badge"
import type { TopPerformingResume } from "@/lib/types"
import { formatDistanceToNow } from "date-fns"

interface TopPerformingResumesProps {
  data: TopPerformingResume[]
  isLoading: boolean
}

export function TopPerformingResumes({ data, isLoading }: TopPerformingResumesProps) {
  // Format tailoring mode for display
  const formatTailoringMode = (mode: string | null) => {
    if (!mode) return "Standard"

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

  // Format date for display
  const formatDate = (dateString: string) => {
    try {
      return formatDistanceToNow(new Date(dateString), { addSuffix: true })
    } catch (error) {
      return "Unknown date"
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Top Performing Resumes</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4">
            {[...Array(3)].map((_, i) => (
              <Skeleton key={i} className="h-20 w-full" />
            ))}
          </div>
        ) : data.length === 0 ? (
          <div className="flex items-center justify-center h-[200px] text-gray-400">No resume data available</div>
        ) : (
          <div className="space-y-4">
            {data.map((resume) => (
              <div key={resume.id} className="flex items-center justify-between p-4 border rounded-lg">
                <div>
                  <h3 className="font-medium">
                    Resume v{resume.version} ({formatTailoringMode(resume.tailoringMode)})
                  </h3>
                  <p className="text-sm text-gray-500">Created {formatDate(resume.createdAt)}</p>
                </div>
                <div className="flex gap-2">
                  <Badge variant="outline">ATS: {resume.atsScore || "N/A"}%</Badge>
                  <Badge variant="outline">JD: {resume.jdScore || "N/A"}%</Badge>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  )
}
