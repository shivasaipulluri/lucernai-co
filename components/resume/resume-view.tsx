"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Check, Copy, Download, Printer, FileText, Briefcase, BarChart, ChevronRight } from "lucide-react"
import type { Resume } from "@/lib/types"
import {
  logCopyToClipboardAnalytics,
  logDownloadResumeAnalytics,
  logPrintResumeAnalytics,
} from "@/lib/actions/analytics-actions"
import {
  hydrateFinalResumeSections,
  generateChangeSummary,
  generateMotivationalSummary,
} from "@/utils/ai/resume-section-utils"
import { Badge } from "@/components/ui/badge"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"
import { Sparkles as SparklesIcon } from "@/components/ui/sparkles"
import { logUserResumeFeedback } from "@/lib/actions/feedback-actions"

interface ResumeViewProps {
  resume: Resume
}

export function ResumeView({ resume }: ResumeViewProps) {
  const [activeTab, setActiveTab] = useState("tailored")
  const [copied, setCopied] = useState(false)
  const [downloading, setDownloading] = useState(false)
  const [printing, setPrinting] = useState(false)
  const [userFeedback, setUserFeedback] = useState<"positive" | "negative" | null>(null)
  const [isSubmittingFeedback, setIsSubmittingFeedback] = useState(false)
  const [animateIn, setAnimateIn] = useState(false)

  // Animation effect when component mounts
  useEffect(() => {
    setAnimateIn(true)
  }, [])

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)

      // Log analytics event
      if (resume.id) {
        await logCopyToClipboardAnalytics(resume.userId, resume.id, resume.version || 1, { source: "resume_view" })
      }

      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy text: ", err)
    }
  }

  const downloadAsText = async () => {
    if (!resume?.modifiedResume) return

    setDownloading(true)

    try {
      const blob = new Blob([resume.modifiedResume], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `tailored-resume-v${resume.version || 1}${resume.wasManuallyEdited ? "-edited" : ""}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      // Log analytics event
      if (resume.id) {
        await logDownloadResumeAnalytics(resume.userId, resume.id, resume.version || 1, "txt", {
          source: "resume_view",
        })
      }
    } catch (error) {
      console.error("Download failed:", error)
    } finally {
      setDownloading(false)
    }
  }

  const printResume = async () => {
    setPrinting(true)

    try {
      const printWindow = window.open("", "_blank")
      if (!printWindow) return

      printWindow.document.write(`
       <html>
         <head>
           <title>Tailored Resume - v${resume.version || 1}${resume.wasManuallyEdited ? " (Edited)" : ""}</title>
           <style>
             body {
               font-family: Arial, sans-serif;
               line-height: 1.5;
               padding: 20px;
               white-space: pre-wrap;
             }
           </style>
         </head>
         <body>
           ${resume.modifiedResume?.replace(/\n/g, "<br>")}
         </body>
       </html>
     `)

      printWindow.document.close()
      printWindow.focus()

      // Wait for content to load
      setTimeout(() => {
        printWindow.print()
        printWindow.close()
      }, 500)

      // Log analytics event
      if (resume.id) {
        await logPrintResumeAnalytics(resume.userId, resume.id, resume.version || 1, { source: "resume_view" })
      }
    } catch (error) {
      console.error("Print failed:", error)
    } finally {
      setPrinting(false)
    }
  }

  const handleUserFeedback = async (type: "positive" | "negative") => {
    setUserFeedback(type)
    setIsSubmittingFeedback(true)

    try {
      await logUserResumeFeedback(resume.userId, resume.id, resume.version || 1, type)
    } catch (error) {
      console.error("Error submitting feedback:", error)
    } finally {
      setIsSubmittingFeedback(false)
    }
  }

  // Get the hydrated sections with all the intelligence data
  const hydratedSections = hydrateFinalResumeSections(resume)

  // Generate the AI rationale summary
  const generateAIRationaleSummary = (resume: Resume) => {
    return "This is a placeholder for the AI rationale summary."
  }

  // Generate user-friendly change summary
  const changeSummary = generateChangeSummary(
    Object.entries(hydratedSections)
      .filter(([_, data]) => data.wasModified)
      .map(([name, data]) => ({
        sectionName: name,
        originalContent: data.originalContent || "",
        modifiedContent: data.content,
        iteration: data.iteration || 1,
        changeReason: data.changeReason || "",
        confidence: data.confidence,
      })),
  )

  // Generate motivational summary
  const motivationalSummary = generateMotivationalSummary(
    resume.atsScore || 0,
    resume.jdScore || 0,
    resume.goldenPassed || false,
  )

  return (
    <div className={`mt-0 transition-all duration-500 ${animateIn ? "opacity-100" : "opacity-0"}`}>
      <div className="mb-6 flex justify-between items-center">
        <div className="flex items-center">
          <LucernaSunIcon className="h-8 w-8 text-blue-600 mr-2" />
          <h1 className="text-2xl font-bold text-gray-800">Your Tailored Resume</h1>
        </div>
        <div className="flex items-center space-x-2">
          <span className="text-sm text-gray-500">Version {resume.version || 1}</span>
          {resume.wasManuallyEdited && (
            <Badge variant="outline" className="bg-blue-50 text-blue-700">
              Edited
            </Badge>
          )}
        </div>
      </div>

      <Tabs defaultValue="tailored" onValueChange={setActiveTab} className="w-full">
        <div className="flex justify-between items-center mb-4">
          <TabsList className="bg-blue-50 p-1">
            <TabsTrigger
              value="tailored"
              className="flex items-center data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Tailored Resume
            </TabsTrigger>
            <TabsTrigger
              value="original"
              className="flex items-center data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <FileText className="h-4 w-4 mr-2" />
              Original Resume
            </TabsTrigger>
            <TabsTrigger
              value="job"
              className="flex items-center data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <Briefcase className="h-4 w-4 mr-2" />
              Job Description
            </TabsTrigger>
            <TabsTrigger
              value="summary"
              className="flex items-center data-[state=active]:bg-blue-600 data-[state=active]:text-white"
            >
              <BarChart className="h-4 w-4 mr-2" />
              Summary
            </TabsTrigger>
          </TabsList>
        </div>

        <TabsContent value="tailored" className="animate-in fade-in-50 duration-300">
          <Card className="overflow-hidden border-blue-200 shadow-sm">
            <CardContent className="p-6">
              {resume.modifiedResume ? (
                <div>
                  {/* Motivational summary at the top */}
                  <div className="mb-4 p-4 bg-gradient-to-r from-blue-50 to-blue-100 border-b border-blue-200">
                    <div className="flex items-start">
                      <SparklesIcon className="h-5 w-5 text-blue-600 mr-2 mt-0.5 flex-shrink-0" />
                      <p className="text-blue-800">{motivationalSummary}</p>
                    </div>
                  </div>

                  <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-md max-h-[600px] overflow-y-auto">
                    {resume.modifiedResume}
                  </div>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => copyToClipboard(resume.modifiedResume || "")}
                      className="flex items-center gap-1 bg-white hover:bg-blue-50"
                      disabled={copied}
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={downloadAsText}
                      className="flex items-center gap-1 bg-white hover:bg-blue-50"
                      disabled={downloading}
                    >
                      <Download className="h-4 w-4" />
                      {downloading ? "..." : "Download"}
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={printResume}
                      className="flex items-center gap-1 bg-white hover:bg-blue-50"
                      disabled={printing}
                    >
                      <Printer className="h-4 w-4" />
                      {printing ? "..." : "Print"}
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No tailored resume available yet.</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="original" className="animate-in fade-in-50 duration-300">
          <Card className="overflow-hidden border-blue-200 shadow-sm">
            <CardContent className="p-6">
              <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-md border max-h-[600px] overflow-y-auto">
                {resume.resumeText}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="job" className="animate-in fade-in-50 duration-300">
          <Card className="overflow-hidden border-blue-200 shadow-sm">
            <CardContent className="p-6">
              <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-md border max-h-[600px] overflow-y-auto">
                {resume.jobDescription}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="summary" className="animate-in fade-in-50 duration-300">
          <Card className="border-blue-200 shadow-sm">
            <CardContent className="p-6">
              <div className="space-y-6">
                {/* Change Summary */}
                <div className="bg-white p-4 rounded-lg border border-blue-100">
                  <h3 className="text-lg font-medium mb-2 text-blue-800 flex items-center">
                    <ChevronRight className="h-5 w-5 mr-1 text-blue-600" />
                    Changes Summary
                  </h3>
                  <p>{changeSummary}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
