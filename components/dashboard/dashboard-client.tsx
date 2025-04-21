"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, FileText, ArrowRight, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { LanternIcon } from "@/components/lantern-icon"
import { DragDropFileUpload } from "@/components/drag-drop-file-upload"
import { submitResumeWithAnalytics } from "@/lib/actions/submit-with-analytics"
import { useJDAnalysis } from "@/hooks/use-jd-analysis"
import { JDAnalysisDisplay } from "@/components/intelligence/jd-analysis-display"
import { debounce } from "@/lib/utils"
import { debugLog, errorLog } from "@/lib/utils/debug-utils"

interface DashboardClientProps {
  hasResumes: boolean
}

export function DashboardClient({ hasResumes }: DashboardClientProps) {
  const [resumeText, setResumeText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [tailoringMode, setTailoringMode] = useState("personalized")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isProcessingFile, setIsProcessingFile] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isAnalyzingJD, setIsAnalyzingJD] = useState(false)
  const [isRedirecting, setIsRedirecting] = useState(false) // New state for tracking redirection
  const router = useRouter()
  const { toast } = useToast()
  const formRef = useRef<HTMLFormElement>(null)
  const { analyze, analysis, isAnalyzing, error: analysisError } = useJDAnalysis()
  const redirectTimeoutRef = useRef<NodeJS.Timeout | null>(null) // Ref to store timeout ID

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (redirectTimeoutRef.current) {
        clearTimeout(redirectTimeoutRef.current)
      }
    }
  }, [])

  // Debounced job description analysis
  const debouncedAnalyze = debounce((text: string) => {
    if (text.trim().length > 100) {
      setIsAnalyzingJD(true)
      analyze(text).finally(() => setIsAnalyzingJD(false))
    }
  }, 800)

  // Trigger analysis when job description changes
  useEffect(() => {
    debouncedAnalyze(jobDescription)
  }, [jobDescription])

  const handleFileProcessed = (text: string) => {
    setResumeText(text)
    // Clear any existing error when file is processed
    if (error === "Please enter your resume text") {
      setError(null)
    }
  }

  const handleFileProcessing = (isProcessing: boolean) => {
    setIsProcessingFile(isProcessing)
  }

  // Update the handleSubmit function to properly handle form submission and show progress
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setError(null)

    // Trim the text and check if it's empty
    const trimmedResumeText = resumeText.trim()
    const trimmedJobDescription = jobDescription.trim()

    if (!trimmedResumeText) {
      setError("Please enter your resume text")
      return
    }

    if (!trimmedJobDescription) {
      setError("Please enter the job description")
      return
    }

    if (!tailoringMode) {
      setError("Please select a tailoring mode")
      return
    }

    setIsSubmitting(true)
    debugLog("DASHBOARD", "Submitting resume for tailoring")

    try {
      const result = await submitResumeWithAnalytics(trimmedResumeText, trimmedJobDescription, tailoringMode)

      if (result.success && result.data?.id) {
        debugLog("DASHBOARD", `Resume submitted successfully, ID: ${result.data.id}`)

        // Show success toast
        toast({
          title: "Resume submitted successfully",
          description: "Your resume is being tailored. Redirecting to Resume Lab...",
          variant: "default",
        })

        // Set redirecting state to show loading UI
        setIsRedirecting(true)

        // Store the resume ID for redirection
        const resumeId = result.data.id

        // Add a small delay before redirecting to ensure toast is visible
        // and to give the tailoring process time to start
        redirectTimeoutRef.current = setTimeout(() => {
          debugLog("DASHBOARD", `Redirecting to resume page: ${resumeId}`)
          // Redirect to the resume page to show tailoring progress
          router.push(`/resume/${resumeId}`)
        }, 1500)
      } else {
        errorLog("DASHBOARD", `Resume submission failed: ${result.error}`)
        setError(result.error || "Failed to submit resume")
        toast({
          title: "Error",
          description: result.error || "Failed to submit resume",
          variant: "destructive",
        })
        setIsSubmitting(false)
        setIsRedirecting(false)
      }
    } catch (error) {
      errorLog("DASHBOARD", "Error submitting resume:", error)
      setError("An unexpected error occurred")
      toast({
        title: "Error",
        description: "An unexpected error occurred",
        variant: "destructive",
      })
      setIsSubmitting(false)
      setIsRedirecting(false)
    }
  }

  // Add handlers for text changes to clear errors
  const handleResumeTextChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setResumeText(e.target.value)
    if (error === "Please enter your resume text" && e.target.value.trim()) {
      setError(null)
    }
  }

  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setJobDescription(e.target.value)
    if (error === "Please enter the job description" && e.target.value.trim()) {
      setError(null)
    }
  }

  const isFormValid = resumeText.trim() && jobDescription.trim() && tailoringMode
  const isFormDisabled = isSubmitting || isProcessingFile || isRedirecting

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      {!hasResumes && (
        <div className="mb-12 text-center">
          <div className="flex justify-center mb-4">
            <LanternIcon size={48} glowing={true} />
          </div>
          <h1 className="text-4xl font-bold text-midnight mb-3 font-serif">Ready to Illuminate Your Career?</h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto">
            Upload your resume and paste a job description to get started.
          </p>
        </div>
      )}

      <Card className="bg-white shadow-md border-ash">
        <CardHeader className="border-b bg-gray-50">
          <CardTitle className="text-2xl font-serif text-midnight">Upload Your Resume</CardTitle>
          <CardDescription>
            Tailor your resume to match the job description and increase your chances of getting an interview.
          </CardDescription>
        </CardHeader>
        <CardContent className="pt-6">
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-6" action="javascript:void(0);">
            <div className="space-y-4">
              <div>
                <Label htmlFor="resume" className="text-sm font-medium text-gray-700 mb-1">
                  Your Resume
                </Label>
                <div className="bg-white rounded-lg border p-4">
                  <DragDropFileUpload
                    onFileProcessed={handleFileProcessed}
                    onFileProcessing={handleFileProcessing}
                    className="mb-4"
                    maxSizeMB={10}
                    acceptedFileTypes={[".txt", ".pdf", ".docx", ".doc"]}
                  />
                  <div className="relative">
                    <Textarea
                      id="resume"
                      placeholder="Paste your resume text here..."
                      value={resumeText}
                      onChange={handleResumeTextChange}
                      className="min-h-[250px] font-mono text-sm"
                      disabled={isFormDisabled}
                    />
                    {resumeText && !isProcessingFile && !isFormDisabled && (
                      <div className="absolute top-2 right-2">
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.preventDefault()
                            e.stopPropagation()
                            setResumeText("")
                            if (error === "Please enter your resume text") {
                              setError(null)
                            }
                          }}
                          className="h-6 px-2 text-gray-400 hover:text-gray-700"
                        >
                          Clear
                        </Button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div>
                <Label htmlFor="jobDescription" className="text-sm font-medium text-gray-700 mb-1">
                  Job Description
                </Label>
                <div className="relative">
                  <Textarea
                    id="jobDescription"
                    placeholder="Paste the job description here..."
                    value={jobDescription}
                    onChange={handleJobDescriptionChange}
                    className="min-h-[200px]"
                    disabled={isFormDisabled}
                  />
                  {jobDescription && !isFormDisabled && (
                    <div className="absolute top-2 right-2">
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={(e) => {
                          e.preventDefault()
                          e.stopPropagation()
                          setJobDescription("")
                          if (error === "Please enter the job description") {
                            setError(null)
                          }
                        }}
                        className="h-6 px-2 text-gray-400 hover:text-gray-700"
                      >
                        Clear
                      </Button>
                    </div>
                  )}
                </div>
              </div>

              {/* JD Analysis Display */}
              {(analysis || isAnalyzing || isAnalyzingJD) && jobDescription.trim().length > 100 && (
                <div className="mt-2">
                  <JDAnalysisDisplay
                    analysis={analysis}
                    isLoading={isAnalyzing || isAnalyzingJD}
                    compact={true}
                    className="border-dashed"
                  />
                </div>
              )}

              <div>
                <Label htmlFor="tailoringMode" className="text-sm font-medium text-gray-700 mb-1">
                  Tailoring Mode
                </Label>
                <Select value={tailoringMode} onValueChange={setTailoringMode} disabled={isFormDisabled}>
                  <SelectTrigger id="tailoringMode" className="w-full">
                    <SelectValue placeholder="Select a tailoring mode" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="basic">
                      <div className="flex flex-col">
                        <span className="font-medium">Basic</span>
                        <span className="text-xs text-gray-500">Light keyword optimization</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="personalized">
                      <div className="flex flex-col">
                        <span className="font-medium">Personalized</span>
                        <span className="text-xs text-gray-500">Enhanced storytelling with your voice</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="aggressive">
                      <div className="flex flex-col">
                        <span className="font-medium">Aggressive</span>
                        <span className="text-xs text-gray-500">Maximum alignment to job requirements</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
                <div className="mt-2">
                  <div className="text-xs text-gray-500 flex items-start">
                    <span className="text-amber-500 mr-1">ℹ️</span>
                    {tailoringMode === "basic" && (
                      <span>
                        Basic mode makes minimal changes, focusing on keywords while preserving your original format.
                      </span>
                    )}
                    {tailoringMode === "personalized" && (
                      <span>
                        Personalized mode enhances your resume with better phrasing while maintaining your authentic
                        voice.
                      </span>
                    )}
                    {tailoringMode === "aggressive" && (
                      <span>
                        Aggressive mode maximizes keyword matching and restructures content to align with job
                        requirements.
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {error && (
              <Alert variant="destructive">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="flex justify-center pt-2">
              <Button
                type="submit"
                disabled={isFormDisabled || !isFormValid}
                className="w-full sm:w-auto px-8 py-6 text-lg bg-midnight hover:bg-amber-500 hover:text-primary text-white transition-all hover:shadow-md hover:scale-[1.02] disabled:opacity-70 disabled:hover:scale-100 disabled:hover:shadow-none"
              >
                {isRedirecting ? (
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    <span>Redirecting to Resume Lab...</span>
                  </div>
                ) : isSubmitting ? (
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    <span>Processing...</span>
                  </div>
                ) : isProcessingFile ? (
                  <div className="flex items-center">
                    <Loader2 className="h-5 w-5 mr-2 animate-spin" />
                    <span>Processing File...</span>
                  </div>
                ) : (
                  <>
                    <FileText className="mr-2 h-5 w-5" />
                    Start Tailoring
                    <ArrowRight className="ml-2 h-5 w-5" />
                  </>
                )}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
