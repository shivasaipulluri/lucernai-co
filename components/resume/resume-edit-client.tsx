"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Textarea } from "@/components/ui/textarea"
import { Save, Download, Copy, Brain, ArrowLeft, AlertTriangle, CheckCircle } from "lucide-react"
import type { Resume } from "@/lib/types"
import { saveManualEdit, rescoreManualEdit } from "@/lib/actions/resume-edit-actions"
import { formatDistanceToNow } from "date-fns"
import { cn } from "@/lib/utils"

interface ResumeEditClientProps {
  resume: Resume
  resumeId: string
}

export function ResumeEditClient({ resume, resumeId }: ResumeEditClientProps) {
  const [resumeText, setResumeText] = useState(resume.modifiedResume || resume.resumeText)
  const [originalText] = useState(resume.modifiedResume || resume.resumeText)
  const [isSaving, setIsSaving] = useState(false)
  const [isRescoring, setIsRescoring] = useState(false)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false)
  const [lastSavedTime, setLastSavedTime] = useState<Date | null>(null)
  const [showScoreChanges, setShowScoreChanges] = useState(false)
  const [newScores, setNewScores] = useState<{ atsScore: number | null; jdScore: number | null }>({
    atsScore: null,
    jdScore: null,
  })
  const textareaRef = useRef<HTMLTextAreaElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Set up autosave timer
  const autosaveTimerRef = useRef<NodeJS.Timeout | null>(null)

  // Check for unsaved changes
  useEffect(() => {
    setHasUnsavedChanges(resumeText !== originalText)
  }, [resumeText, originalText])

  // Set up beforeunload event to warn about unsaved changes
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (hasUnsavedChanges) {
        e.preventDefault()
        e.returnValue = ""
        return ""
      }
    }

    window.addEventListener("beforeunload", handleBeforeUnload)
    return () => {
      window.removeEventListener("beforeunload", handleBeforeUnload)
    }
  }, [hasUnsavedChanges])

  // Set up autosave
  useEffect(() => {
    if (hasUnsavedChanges) {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current)
      }

      autosaveTimerRef.current = setTimeout(() => {
        // Autosave logic - disabled for now, but framework is in place
        // handleSave(true)
      }, 30000) // Autosave after 30 seconds of inactivity
    }

    return () => {
      if (autosaveTimerRef.current) {
        clearTimeout(autosaveTimerRef.current)
      }
    }
  }, [hasUnsavedChanges, resumeText])

  // Handle save
  const handleSave = async (isAutosave = false) => {
    if (!hasUnsavedChanges) return

    setIsSaving(true)

    try {
      const result = await saveManualEdit(resumeId, resumeText)

      if (result.success) {
        setLastSavedTime(new Date())
        setHasUnsavedChanges(false)

        // Force a client-side refresh to get the latest data
        router.refresh()

        if (!isAutosave) {
          toast({
            title: "Changes saved",
            description: "Your resume has been updated successfully.",
            duration: 3000,
          })
        }
      } else {
        throw new Error(result.error || "Failed to save changes")
      }
    } catch (error: any) {
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Handle re-score
  const handleRescore = async () => {
    // Save first if there are unsaved changes
    if (hasUnsavedChanges) {
      await handleSave()
    }

    setIsRescoring(true)

    try {
      const result = await rescoreManualEdit(resumeId)

      if (result.success && result.data) {
        setNewScores({
          atsScore: result.data.atsScore,
          jdScore: result.data.jdScore,
        })
        setShowScoreChanges(true)

        toast({
          title: "Resume re-scored",
          description: "Your resume has been analyzed and scored.",
          duration: 3000,
        })
      } else {
        throw new Error(result.error || "Failed to re-score resume")
      }
    } catch (error: any) {
      toast({
        title: "Scoring failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsRescoring(false)
    }
  }

  // Handle copy to clipboard
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(resumeText)
      toast({
        title: "Copied to clipboard",
        description: "Resume text has been copied to your clipboard.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy resume to clipboard.",
        variant: "destructive",
      })
    }
  }

  // Handle download
  const handleDownload = () => {
    try {
      const blob = new Blob([resumeText], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `resume-v${resume.version || 1}${resume.wasManuallyEdited ? "-edited" : ""}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: "Your resume is being downloaded.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download resume.",
        variant: "destructive",
      })
    }
  }

  // Get the tailoring mode display name
  const getTailoringModeDisplay = (mode: string) => {
    switch (mode) {
      case "basic":
      case "quick":
        return "Basic"
      case "personalized":
      case "story":
        return "Personalized"
      case "aggressive":
        return "Aggressive"
      default:
        return mode.charAt(0).toUpperCase() + mode.slice(1)
    }
  }

  // Format the last saved time
  const getLastSavedText = () => {
    if (!lastSavedTime) {
      return resume.wasManuallyEdited
        ? `Last edited ${formatDistanceToNow(new Date(resume.updatedAt), { addSuffix: true })}`
        : "No manual edits yet"
    }

    return `Last saved ${formatDistanceToNow(lastSavedTime, { addSuffix: true })}`
  }

  return (
    <div className="container-wide py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="mb-2 font-serif">Manual Resume Editor</h1>
          <p className="text-gray-600">Make direct edits to your tailored resume.</p>
        </div>

        <Button
          variant="outline"
          onClick={() => router.push(`/resume/${resumeId}`)}
          className="flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Resume
        </Button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <div>
                <CardTitle className="text-xl font-serif">Edit Resume</CardTitle>
                <CardDescription>
                  Make changes to your resume text below. Changes are{" "}
                  <span className="font-medium text-amber-600">not automatically saved</span>.
                </CardDescription>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={resume.version > 1 ? "bg-amber-50" : ""}>
                  v{resume.version || 1}
                </Badge>
                {resume.wasManuallyEdited && (
                  <Badge variant="outline" className="bg-blue-50">
                    Edited
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="edit">
                <TabsList className="mb-4">
                  <TabsTrigger value="edit">Edit Resume</TabsTrigger>
                  <TabsTrigger value="original">Original Resume</TabsTrigger>
                  <TabsTrigger value="job">Job Description</TabsTrigger>
                </TabsList>

                <TabsContent value="edit" className="space-y-4">
                  <Textarea
                    ref={textareaRef}
                    value={resumeText}
                    onChange={(e) => setResumeText(e.target.value)}
                    className="min-h-[600px] font-mono text-sm resize-y"
                    placeholder="Your resume text..."
                  />

                  <div className="flex justify-between items-center">
                    <div className="text-xs text-gray-500">{getLastSavedText()}</div>
                    {hasUnsavedChanges && (
                      <div className="text-xs text-amber-600 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" />
                        Unsaved changes
                      </div>
                    )}
                  </div>
                </TabsContent>

                <TabsContent value="original">
                  <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-md border min-h-[600px] overflow-y-auto">
                    {resume.resumeText}
                  </div>
                </TabsContent>

                <TabsContent value="job">
                  <div className="whitespace-pre-wrap font-mono text-sm bg-gray-50 p-4 rounded-md border min-h-[600px] overflow-y-auto">
                    {resume.jobDescription}
                  </div>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>

          <div className="flex flex-wrap gap-3">
            <Button
              onClick={() => handleSave()}
              disabled={!hasUnsavedChanges || isSaving}
              className="flex items-center gap-2"
            >
              <Save className="h-4 w-4" />
              {isSaving ? "Saving..." : "Save Changes"}
            </Button>

            <Button
              onClick={handleRescore}
              disabled={isRescoring || (hasUnsavedChanges && !isSaving)}
              variant="outline"
              className="flex items-center gap-2"
            >
              <Brain className="h-4 w-4" />
              {isRescoring ? "Analyzing..." : "Re-Score Resume"}
            </Button>

            <Button onClick={handleCopy} variant="outline" className="flex items-center gap-2">
              <Copy className="h-4 w-4" />
              Copy to Clipboard
            </Button>

            <Button onClick={handleDownload} variant="outline" className="flex items-center gap-2">
              <Download className="h-4 w-4" />
              Download
            </Button>
          </div>
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Resume Stats
                {resume.version > 1 && (
                  <Badge variant="outline" className="ml-2 bg-amber-50">
                    Version {resume.version}
                  </Badge>
                )}
              </CardTitle>
              <CardDescription>Performance metrics for your resume</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Tailoring Mode</div>
                  <div className="font-medium">
                    {resume.tailoringMode ? getTailoringModeDisplay(resume.tailoringMode) : "Standard"}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">ATS Score</div>
                  <div className="font-medium flex items-center">
                    <Badge
                      variant={resume.atsScore && resume.atsScore >= 95 ? "default" : "outline"}
                      className={cn(
                        "mr-2",
                        resume.wasManuallyEdited && !showScoreChanges && "bg-gray-100 text-gray-500 line-through",
                      )}
                    >
                      {resume.atsScore || "N/A"}%
                    </Badge>

                    {showScoreChanges && newScores.atsScore !== null && (
                      <Badge variant={newScores.atsScore >= 95 ? "default" : "outline"} className="mr-2 bg-green-50">
                        {newScores.atsScore}%
                      </Badge>
                    )}

                    {resume.wasManuallyEdited && !showScoreChanges && (
                      <span className="text-xs text-amber-600 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Needs re-scoring
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Job Description Match</div>
                  <div className="font-medium flex items-center">
                    <Badge
                      variant={resume.jdScore && resume.jdScore >= 95 ? "default" : "outline"}
                      className={cn(
                        "mr-2",
                        resume.wasManuallyEdited && !showScoreChanges && "bg-gray-100 text-gray-500 line-through",
                      )}
                    >
                      {resume.jdScore || "N/A"}%
                    </Badge>

                    {showScoreChanges && newScores.jdScore !== null && (
                      <Badge variant={newScores.jdScore >= 95 ? "default" : "outline"} className="mr-2 bg-green-50">
                        {newScores.jdScore}%
                      </Badge>
                    )}

                    {resume.wasManuallyEdited && !showScoreChanges && (
                      <span className="text-xs text-amber-600 flex items-center">
                        <AlertTriangle className="h-3 w-3 mr-1" /> Needs re-scoring
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4">
                  <AlertDialog>
                    <AlertDialogTrigger asChild>
                      <Button variant="outline" className="w-full flex items-center gap-2" disabled={hasUnsavedChanges}>
                        <ArrowLeft className="h-4 w-4" />
                        Return to Resume
                      </Button>
                    </AlertDialogTrigger>
                    <AlertDialogContent>
                      <AlertDialogHeader>
                        <AlertDialogTitle>Unsaved Changes</AlertDialogTitle>
                        <AlertDialogDescription>
                          You have unsaved changes. Would you like to save before leaving?
                        </AlertDialogDescription>
                      </AlertDialogHeader>
                      <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                          onClick={() => {
                            router.push(`/resume/${resumeId}`)
                          }}
                        >
                          Discard Changes
                        </AlertDialogAction>
                        <AlertDialogAction
                          onClick={async () => {
                            await handleSave()
                            router.push(`/resume/${resumeId}`)
                          }}
                        >
                          Save & Exit
                        </AlertDialogAction>
                      </AlertDialogFooter>
                    </AlertDialogContent>
                  </AlertDialog>
                </div>

                {resume.tailoringAttempts && resume.tailoringAttempts.length > 0 && (
                  <div className="mt-6 space-y-4">
                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-medium mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        ATS Feedback
                      </h4>
                      <div className="text-xs text-gray-600">
                        {resume.tailoringAttempts[0].atsFeedback || "No detailed ATS feedback available."}
                      </div>
                    </div>

                    <div className="p-4 bg-gray-50 rounded-lg border">
                      <h4 className="font-medium mb-2 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-2 text-green-500" />
                        Job Description Alignment
                      </h4>
                      <div className="text-xs text-gray-600">
                        {resume.tailoringAttempts[0].jdFeedback || "No detailed JD feedback available."}
                      </div>
                    </div>
                  </div>
                )}

                {resume.wasManuallyEdited && !showScoreChanges && (
                  <div className="mt-6 p-4 bg-amber-50 rounded-lg border border-amber-200">
                    <h4 className="font-medium mb-2 flex items-center text-amber-800">
                      <AlertTriangle className="h-4 w-4 mr-2" />
                      Manual Edit Notice
                    </h4>
                    <p className="text-xs text-amber-700">
                      This resume has been manually edited. The scores shown may no longer be accurate. Click
                      &quot;Re-Score Resume&quot; to get updated scores based on your edits.
                    </p>
                  </div>
                )}

                {showScoreChanges && (
                  <div className="mt-6 p-4 bg-green-50 rounded-lg border border-green-200">
                    <h4 className="font-medium mb-2 flex items-center text-green-800">
                      <CheckCircle className="h-4 w-4 mr-2" />
                      Score Updated
                    </h4>
                    <p className="text-xs text-green-700">
                      Your resume has been re-scored based on your edits. The new scores reflect the current content of
                      your resume.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
