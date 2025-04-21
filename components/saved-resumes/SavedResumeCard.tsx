"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Eye, Edit, Copy, Tag } from "lucide-react"
import { Resume } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"

interface Props {
  resume: Resume
  onPreview: (r: Resume) => void
}

export default function SavedResumeCard({ resume, onPreview }: Props) {
  const router = useRouter()

  return (
    <Card className="hover:shadow-md transition duration-300 ease-in-out border-muted/40">
      <CardContent className="p-4">
        <div className="flex justify-between items-start mb-2">
          <div>
            <h3 className="text-xl font-medium">{resume.label || "Untitled Resume"}</h3>
            <p className="text-sm text-muted-foreground mt-1">Last edited: {new Date(resume.updatedAt).toLocaleDateString()}</p>
          </div>
          {resume.label && <Tag className="text-muted w-4 h-4 mt-1" />}
        </div>

        <div className="flex gap-2 mt-4">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" onClick={() => onPreview(resume)}>
                  <Eye className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Preview</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" onClick={() => router.push(`/resume/${resume.id}/edit`)}>
                  <Edit className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Edit</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" onClick={() => navigator.clipboard.writeText(resume.resumeText)}>
                  <Copy className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Copy</TooltipContent>
            </Tooltip>

            <Tooltip>
              <TooltipTrigger asChild>
                <Button variant="ghost" onClick={() => downloadResume(resume)}>
                  <Download className="w-4 h-4" />
                </Button>
              </TooltipTrigger>
              <TooltipContent>Download</TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </div>
      </CardContent>
    </Card>
  )
}

function downloadResume(resume: Resume) {
  const blob = new Blob([resume.resumeText], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${resume.label || "resume"}.txt`
  link.click()
}
