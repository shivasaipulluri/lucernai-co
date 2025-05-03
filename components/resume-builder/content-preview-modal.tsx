"use client"

import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Copy, Check } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import type { ResumeData } from "@/types/resume"

interface ContentPreviewModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  resumeData: ResumeData
}

export function ContentPreviewModal({ open, onOpenChange, resumeData }: ContentPreviewModalProps) {
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    try {
      // Get the modal content element
      const contentElement = document.getElementById("resume-preview-content")
      if (!contentElement) return

      // Copy the text content
      await navigator.clipboard.writeText(contentElement.innerText)

      setCopied(true)
      toast({
        title: "Copied to clipboard",
        description: "Resume content has been copied to your clipboard",
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy content to clipboard",
        variant: "destructive",
      })
    }
  }

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    if (dateString === "Present") return "Present"

    try {
      const [year, month] = dateString.split("-")
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
    } catch (e) {
      return dateString
    }
  }

  // Sort sections by order and filter out invisible ones
  const visibleSections = resumeData.sections.filter((section) => section.isVisible).sort((a, b) => a.order - b.order)

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex justify-between items-center">
            <span>Resume Preview</span>
            <Button variant="outline" size="sm" onClick={handleCopy} className="flex items-center gap-1">
              {copied ? (
                <>
                  <Check className="h-4 w-4" />
                  <span>Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4" />
                  <span>Copy</span>
                </>
              )}
            </Button>
          </DialogTitle>
        </DialogHeader>

        <div
          id="resume-preview-content"
          className="mt-4 p-6 bg-white rounded-md border border-gray-200 dark:bg-gray-900 dark:border-gray-700"
        >
          <h1 className="text-2xl font-bold text-center mb-6">{resumeData.title}</h1>

          {visibleSections.map((section) => (
            <div key={section.id} className="mb-6">
              <h2 className="text-lg font-semibold mb-2 pb-1 border-b border-gray-200 dark:border-gray-700">
                {section.title}
              </h2>

              {typeof section.content === "string" ? (
                <div className="whitespace-pre-line">{section.content}</div>
              ) : (
                <div className="space-y-3">
                  {section.content.map((item) => (
                    <div key={item.id} className="mb-3">
                      <div className="flex justify-between items-start">
                        <h3 className="font-semibold">
                          {item.title}
                          {item.organization && <span className="font-medium ml-1">- {item.organization}</span>}
                        </h3>

                        {(item.startDate || item.location) && (
                          <div className="text-sm text-gray-600 dark:text-gray-400 italic">
                            {item.startDate && (
                              <span>
                                {formatDate(item.startDate)} - {item.current ? "Present" : formatDate(item.endDate)}
                              </span>
                            )}
                            {item.startDate && item.location && " | "}
                            {item.location && <span>{item.location}</span>}
                          </div>
                        )}
                      </div>

                      {item.description && <p className="mt-1 text-sm">{item.description}</p>}

                      {item.bullets && item.bullets.length > 0 && (
                        <ul className="mt-2 space-y-1 pl-5 list-disc">
                          {item.bullets.map((bullet, idx) => (
                            <li key={idx} className="text-sm">
                              {bullet}
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </div>
      </DialogContent>
    </Dialog>
  )
}
