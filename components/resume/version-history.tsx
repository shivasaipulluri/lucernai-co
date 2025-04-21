"use client"

import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ArrowRight, CheckCircle } from "lucide-react"
import Link from "next/link"
import type { Resume } from "@/lib/types"
import { cn } from "@/lib/utils"

interface VersionHistoryProps {
  versions: Resume[]
  currentVersionId: string
}

export function VersionHistory({ versions, currentVersionId }: VersionHistoryProps) {
  // Sort versions by version number
  const sortedVersions = [...versions].sort((a, b) => (a.version || 1) - (b.version || 1))

  return (
    <Card>
      <CardContent className="p-4">
        <h3 className="text-lg font-medium mb-4">Version History</h3>
        <div className="flex flex-nowrap overflow-x-auto gap-4 pb-2">
          {sortedVersions.map((version, index) => (
            <Link
              key={version.id}
              href={`/resume/${version.id}`}
              className={cn(
                "min-w-[200px] p-4 rounded-lg border transition-all",
                version.id === currentVersionId
                  ? "border-primary bg-primary/5 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50",
              )}
            >
              <div className="flex justify-between items-center mb-2">
                <Badge variant={version.id === currentVersionId ? "default" : "outline"}>
                  Version {version.version || 1}
                </Badge>
                {version.id === currentVersionId && <CheckCircle className="h-4 w-4 text-primary" />}
              </div>

              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">ATS:</span>
                  <Badge variant="outline" className="text-xs">
                    {version.atsScore || "N/A"}%
                  </Badge>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-gray-500">JD:</span>
                  <Badge variant="outline" className="text-xs">
                    {version.jdScore || "N/A"}%
                  </Badge>
                </div>
              </div>

              {index < sortedVersions.length - 1 && (
                <div className="absolute right-[-12px] top-1/2 transform -translate-y-1/2 z-10">
                  <ArrowRight className="h-4 w-4 text-gray-400" />
                </div>
              )}
            </Link>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
