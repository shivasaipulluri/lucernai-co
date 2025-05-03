"use client"

import { useState, useEffect, useCallback, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { RefreshCw, Edit, Save, AlertTriangle, CheckCircle, History, RotateCw, Loader2 } from "lucide-react"
import type { Resume, TailoringProgress } from "@/lib/types"
import { ResumeView } from "./resume-view"
import { TailoringProgress as TailoringProgressIndicator } from "./tailoring-progress"
import { saveResumeToCollection, startTailoringAnalysis } from "@/lib/actions/tailoring-engine"
import { getTailoringProgress } from "@/lib/actions/tailoring-engine"
import { refineResume } from "@/lib/actions/refine-resume"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"
import { cn } from "@/lib/utils"
import { VersionHistory } from "./version-history"
import { debugLog, errorLog } from "@/lib/utils/debug-utils"

interface ResumeLabClientProps {
  resume: Resume
  resumeId: string
  initialProgress: TailoringProgress
  versionHistory?: Resume[]
}

export function ResumeLabClient({ resume, resumeId, initialProgress, versionHistory = [] }: ResumeLabClientProps) {
  const [isRefining, setIsRefining] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isRetrying, setIsRetrying] = useState(false)
  const [progress, setProgress] = useState<TailoringProgress>(initialProgress)
  const [isInitialTailoring, setIsInitialTailoring] = useState(!resume?.modifiedResume)
  const [showVersionHistory, setShowVersionHistory] = useState(false)
  const [debugInfo, setDebugInfo] = useState<string>("")
  const progressCheckCountRef = useRef(0)
  const progressCheckIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const completedRef = useRef(false)
  const { toast } = useToast()
  const router = useRouter()
  const [isRefreshingAfterCompletion, setIsRefreshingAfterCompletion] = useState(false)

  // Add debug logging
  const logDebug = useCallback((message: string) => {
    debugLog("CLIENT", message)
    setDebugInfo((prev) => `${prev}\n${new Date().toISOString().split("T")[1].split(".")[0]} - ${message}`)
  }, [])

  // Log initial state
  useEffect(() => {
    logDebug(
      `Initial state - modifiedResume: ${resume?.modifiedResume ? "exists" : "null"}, progress: ${progress.status}, ${progress.progress}%`,
    )

    // If we have a modifiedResume but progress is not_started, update to completed
    if (resume?.modifiedResume && progress.status === "not_started") {
      logDebug("Resume has modifiedResume but progress is not_started, updating to completed")
      setProgress({ status: "completed", progress: 100 })
    }
  }, [resume, progress, logDebug])

  // Clear interval on unmount
  useEffect(() => {
    return () => {
      if (progressCheckIntervalRef.current) {
        clearInterval(progressCheckIntervalRef.current)
        progressCheckIntervalRef.current = null
      }
    }
  }, [])

  // Set up progress checking interval
  useEffect(() => {
    if (isInitialTailoring && progress.status !== "completed" && progress.status !== "error") {
      logDebug("Setting up progress check interval")

      // Clear any existing interval
      if (progressCheckIntervalRef.current) {
        clearInterval(progressCheckIntervalRef.current)
      }

      // Set up a new interval to check progress every 5 seconds
      progressCheckIntervalRef.current = setInterval(checkProgress, 5000)

      // Do an immediate check
      checkProgress()

      return () => {
        if (progressCheckIntervalRef.current) {
          clearInterval(progressCheckIntervalRef.current)
          progressCheckIntervalRef.current = null
        }
      }
    }
  }, [isInitialTailoring, progress.status])

  // Effect to handle completed status
  useEffect(() => {
    if (progress.status === "completed" && !completedRef.current) {
      completedRef.current = true
      setIsRefreshingAfterCompletion(true) // Set loading state during refresh
      logDebug("Tailoring completed, refreshing page...")

      // Clear interval
      if (progressCheckIntervalRef.current) {
        clearInterval(progressCheckIntervalRef.current)
        progressCheckIntervalRef.current = null
      }

      // Force multiple refreshes with increasing delays to ensure we get the latest data
      router.refresh()

      // Schedule additional refreshes with increasing delays
      setTimeout(() => {
        logDebug("Performing second refresh after completion")
        router.refresh()
      }, 1000)

      setTimeout(() => {
        logDebug("Performing final refresh after completion")
        router.refresh()
        // Reset the refresh loading state after a delay to ensure data is loaded
        setTimeout(() => {
          setIsRefreshingAfterCompletion(false)
        }, 1000)
      }, 3000)
    }
  }, [progress.status, router, logDebug])

  const checkProgress = useCallback(async () => {
    // Skip if already completed or in error state
    if (progress.status === "completed" || progress.status === "error") {
      logDebug(`Skipping progress check - status is ${progress.status}`)

      // Clear interval if we're done
      if (progressCheckIntervalRef.current) {
        clearInterval(progressCheckIntervalRef.current)
        progressCheckIntervalRef.current = null
      }

      return
    }

    try {
      progressCheckCountRef.current += 1
      const checkCount = progressCheckCountRef.current
      logDebug(`Checking progress (attempt ${checkCount})...`)

      const result = await getTailoringProgress(resumeId)
      logDebug(`Progress check result: ${JSON.stringify(result)}`)

      // Only update if the status has changed or progress has increased
      if (result.status !== progress.status || result.progress > progress.progress) {
        setProgress(result)
        logDebug(`Updated progress: ${result.status}, ${result.progress}%`)

        // If status just changed to completed, trigger refresh
        if (result.status === "completed" && progress.status !== "completed") {
          logDebug("Status just changed to completed, triggering refresh")
          router.refresh()
        }
      } else {
        logDebug(`No progress change detected`)
      }

      if (result.status === "error") {
        logDebug(`Tailoring error detected`)

        // Clear interval
        if (progressCheckIntervalRef.current) {
          clearInterval(progressCheckIntervalRef.current)
          progressCheckIntervalRef.current = null
        }

        toast({
          title: "Tailoring Error",
          description: "There was an error tailoring your resume. Please try again.",
          variant: "destructive",
        })
      } else if (checkCount >= 30) {
        // Limit to 30 checks (about 5 minutes with 10-second interval)
        logDebug(`Max progress checks reached (${checkCount}), stopping`)

        // Clear interval
        if (progressCheckIntervalRef.current) {
          clearInterval(progressCheckIntervalRef.current)
          progressCheckIntervalRef.current = null
        }

        toast({
          title: "Tailoring Timeout",
          description: "The tailoring process is taking longer than expected. Please refresh the page to check status.",
          variant: "destructive",
        })
      }
    } catch (error) {
      errorLog("CLIENT", `Error checking progress: ${error}`)

      // If we've had fewer than 5 errors, continue checking
      if (progressCheckCountRef.current >= 5) {
        logDebug(`Too many errors checking progress, stopping`)

        // Clear interval
        if (progressCheckIntervalRef.current) {
          clearInterval(progressCheckIntervalRef.current)
          progressCheckIntervalRef.current = null
        }
      }
    }
  }, [resumeId, progress.status, progress.progress, router, toast, logDebug])

  // Start tailoring if needed
  useEffect(() => {
    const startTailoring = async () => {
      if (isInitialTailoring && progress.status !== "completed" && progress.status !== "error") {
        try {
          logDebug(`Starting tailoring process...`)

          // If not started or in error state, start tailoring
          if (progress.status === "not_started" || progress.status === "error") {
            logDebug(`Showing tailoring started toast`)
            toast({
              title: "Tailoring started",
              description: "Lucerna AI is tailoring your resume...",
              duration: 3000,
            })
          }

          // Start checking progress
          logDebug(`Initiating progress checking...`)
          progressCheckCountRef.current = 0
          setTimeout(checkProgress, 1000)
        } catch (error) {
          logDebug(`Error starting tailoring: ${error}`)
          console.error("Error starting tailoring:", error)
          toast({
            title: "Tailoring failed",
            description: "There was an error tailoring your resume. Please try again.",
            variant: "destructive",
          })
        }
      } else {
        logDebug(
          `No need to start tailoring - isInitialTailoring: ${isInitialTailoring}, progress.status: ${progress.status}`,
        )
      }
    }

    startTailoring()
  }, [isInitialTailoring, progress.status, toast, checkProgress, logDebug])

  const handleRefine = async () => {
    if (!resumeId || isRefining) return

    setIsRefining(true)
    logDebug(`Starting refinement for resumeId: ${resumeId}`)

    toast({
      title: "Refinement started",
      description: "Lucerna AI is creating a new, improved version of your resume...",
      duration: 3000,
    })

    try {
      const result = await refineResume(resumeId)
      logDebug(`Refinement result: ${JSON.stringify(result)}`)

      if (result.success && result.data?.id) {
        logDebug(`Refinement successful, redirecting to new resume: ${result.data.id}`)
        toast({
          title: "Refinement in progress",
          description: `Creating version ${result.data.version} of your resume...`,
          duration: 3000,
        })

        // Redirect to the new resume page
        router.push(`/resume/${result.data.id}`)
      } else {
        throw new Error(result.error || "Failed to refine resume")
      }
    } catch (error: any) {
      logDebug(`Refinement error: ${error.message}`)
      toast({
        title: "Refinement failed",
        description: error.message,
        variant: "destructive",
      })
      setIsRefining(false)
    }
  }

  const handleSave = async () => {
    if (!resumeId || isSaving) return

    setIsSaving(true)
    logDebug(`Saving resume to collection: ${resumeId}`)

    try {
      const result = await saveResumeToCollection(resumeId)
      logDebug(`Save result: ${JSON.stringify(result)}`)

      if (result.success) {
        logDebug(`Save successful`)
        toast({
          title: "Resume saved",
          description: "Your resume has been saved to your collection.",
          duration: 3000,
        })
        router.refresh()
      } else {
        throw new Error(result.error || "Failed to save resume")
      }
    } catch (error: any) {
      logDebug(`Save error: ${error.message}`)
      toast({
        title: "Save failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  // Force a retry of the tailoring process
  const handleRetryTailoring = async () => {
    logDebug(`Manual retry of tailoring requested`)
    setIsRetrying(true)

    try {
      // Reset completion flag
      completedRef.current = false

      // Call startTailoringAnalysis directly
      const result = await startTailoringAnalysis(resumeId, false)

      if (result.success) {
        logDebug(`Tailoring retry started successfully`)
        toast({
          title: "Tailoring restarted",
          description: "Lucerna AI is tailoring your resume...",
          duration: 3000,
        })

        // Reset progress state
        setProgress({ status: "started", progress: 5 })
        setIsInitialTailoring(true)

        // Reset progress check counter
        progressCheckCountRef.current = 0

        // Set up interval for checking progress
        if (progressCheckIntervalRef.current) {
          clearInterval(progressCheckIntervalRef.current)
        }

        progressCheckIntervalRef.current = setInterval(checkProgress, 5000)

        // Do an immediate check
        setTimeout(checkProgress, 1000)
      } else {
        throw new Error(result.error || "Failed to restart tailoring")
      }
    } catch (error: any) {
      logDebug(`Tailoring retry error: ${error.message}`)
      toast({
        title: "Retry failed",
        description: error.message || "Failed to restart tailoring",
        variant: "destructive",
      })
    } finally {
      setIsRetrying(false)
    }
  }

  // Determine if we're in a loading state
  const isLoading = isInitialTailoring && progress.status !== "completed" && progress.status !== "error"

  // Get the tailoring mode display name
  const getTailoringModeDisplay = (mode?: string) => {
    if (!mode) return "Standard"

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

  // Toggle version history
  const toggleVersionHistory = () => {
    setShowVersionHistory(!showVersionHistory)
  }

  return (
    <div className="container-wide py-12">
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h1 className="mb-2 font-serif">Resume Lab</h1>
          <p className="text-gray-600">View, refine, and download your tailored resume.</p>
        </div>

        {versionHistory.length > 0 && (
          <Button variant="outline" onClick={toggleVersionHistory} className="flex items-center gap-2">
            <History className="h-4 w-4" />
            {showVersionHistory ? "Hide Version History" : "Show Version History"}
          </Button>
        )}
      </div>

      {showVersionHistory && versionHistory.length > 0 && (
        <div className="mb-8">
          <VersionHistory versions={versionHistory} currentVersionId={resumeId} />
        </div>
      )}

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          {isLoading || isRefreshingAfterCompletion ? (
            <Card className="overflow-hidden">
              <CardContent className="p-8">
                <div className="flex flex-col items-center justify-center text-center">
                  <LucernaSunIcon size={48} glowing={true} className="mb-6 animate-pulse" />
                  <h2 className="text-2xl font-semibold mb-4 font-serif">
                    {isRefreshingAfterCompletion ? "Loading Your Resume..." : "Tailoring Your Resume"}
                  </h2>
                  <p className="text-gray-600 mb-8 max-w-md">
                    {isRefreshingAfterCompletion
                      ? "Your tailored resume is ready and loading..."
                      : "Lucerna AI is analyzing your resume and the job description to create a perfectly tailored version."}
                  </p>

                  <TailoringProgressIndicator
                    progress={isRefreshingAfterCompletion ? 100 : progress.progress}
                    currentAttempt={progress.currentAttempt}
                    maxAttempts={progress.maxAttempts}
                    status={isRefreshingAfterCompletion ? "loading_resume" : progress.status}
                  />

                  <div className="mt-8 text-sm text-gray-500 max-w-md">
                    <p>
                      {isRefreshingAfterCompletion
                        ? "Almost there! Loading your tailored resume..."
                        : "Our AI is making multiple passes to ensure the highest quality result. This typically takes 30-60 seconds."}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : resume?.modifiedResume && resume.modifiedResume.length > 50 ? (
            <div className="animate-in fade-in duration-500">
              <ResumeView resume={resume} />
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertTriangle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                <h3 className="text-xl font-medium mb-2">Tailoring Failed</h3>
                <p className="text-gray-500 mb-6">
                  {progress.status === "completed"
                    ? "Tailoring completed, but no valid resume content was generated."
                    : "We encountered an issue while tailoring your resume."}{" "}
                  Please try again or contact support if the problem persists.
                </p>
                <div className="space-y-2">
                  <Button
                    onClick={handleRetryTailoring}
                    className="mx-auto flex items-center gap-2"
                    disabled={isRetrying}
                  >
                    {isRetrying ? (
                      <>
                        <Loader2 className="h-4 w-4 animate-spin" />
                        Retrying...
                      </>
                    ) : (
                      <>
                        <RotateCw className="h-4 w-4" />
                        Try Again
                      </>
                    )}
                  </Button>
                  {process.env.NODE_ENV === "development" && resume?.modifiedResume && (
                    <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-md text-left">
                      <h4 className="text-sm font-medium text-red-700 mb-2">Debug: Invalid Resume Content</h4>
                      <pre className="text-xs text-red-600 whitespace-pre-wrap overflow-auto max-h-40">
                        {resume.modifiedResume || "Empty content"}
                      </pre>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Resume Stats
                {resume?.version && resume.version > 1 && (
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
                  <div className="font-medium">{getTailoringModeDisplay(resume?.tailoringMode)}</div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">ATS Score</div>
                  <div className="font-medium flex items-center">
                    <Badge
                      variant={resume?.atsScore && resume.atsScore >= 95 ? "default" : "outline"}
                      className={cn("mr-2", isLoading && "bg-gray-100 text-gray-400")}
                    >
                      {isLoading ? "Calculating..." : `${resume?.atsScore || "N/A"}%`}
                    </Badge>
                    {!isLoading && resume?.atsScore && resume.atsScore >= 95 && (
                      <span className="text-xs text-green-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> Excellent
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Job Description Match</div>
                  <div className="font-medium flex items-center">
                    <Badge
                      variant={resume?.jdScore && resume.jdScore >= 95 ? "default" : "outline"}
                      className={cn("mr-2", isLoading && "bg-gray-100 text-gray-400")}
                    >
                      {isLoading ? "Calculating..." : `${resume?.jdScore || "N/A"}%`}
                    </Badge>
                    {!isLoading && resume?.jdScore && resume.jdScore >= 95 && (
                      <span className="text-xs text-green-600 flex items-center">
                        <CheckCircle className="h-3 w-3 mr-1" /> Excellent
                      </span>
                    )}
                  </div>
                </div>

                <div>
                  <div className="text-sm font-medium text-gray-500 mb-1">Golden Rules</div>
                  <div className="font-medium flex items-center">
                    {isLoading ? (
                      <Badge variant="outline" className="bg-gray-100 text-gray-400">
                        Checking...
                      </Badge>
                    ) : resume?.goldenPassed ? (
                      <span className="text-xs text-green-600 flex items-center">
                        <CheckCircle className="h-4 w-4 mr-1" /> All rules passed
                      </span>
                    ) : (
                      <span className="text-xs text-amber-600 flex items-center">
                        <AlertTriangle className="h-4 w-4 mr-1" /> Some rules need attention
                      </span>
                    )}
                  </div>
                </div>

                <div className="pt-4 space-y-3">
                  <Button
                    onClick={handleRefine}
                    disabled={isLoading || isRefining}
                    className="w-full flex items-center justify-center"
                  >
                    {isRefining ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Creating New Version...
                      </>
                    ) : (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4" />
                        Refine Again
                      </>
                    )}
                  </Button>

                  <Button
                    onClick={handleSave}
                    disabled={isLoading || isSaving || resume?.isSaved}
                    className="w-full flex items-center justify-center"
                    variant={resume?.isSaved ? "outline" : "default"}
                  >
                    {isSaving ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Saving...
                      </>
                    ) : resume?.isSaved ? (
                      <>
                        <CheckCircle className="mr-2 h-4 w-4" />
                        Saved to Collection
                      </>
                    ) : (
                      <>
                        <Save className="mr-2 h-4 w-4" />
                        Save to Collection
                      </>
                    )}
                  </Button>

                  <Button
                    disabled={isLoading}
                    className="w-full flex items-center justify-center"
                    variant="outline"
                    asChild
                  >
                    <a href={`/resume/${resumeId}/edit`}>
                      <Edit className="mr-2 h-4 w-4" />
                      Manual Edit
                    </a>
                  </Button>
                </div>

                {resume?.tailoringAttempts && resume.tailoringAttempts.length > 0 && (
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
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
