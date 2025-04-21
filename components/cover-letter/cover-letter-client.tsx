"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Copy, Download, Save, Sparkles, Clock } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"
import { generateCoverLetter, saveCoverLetter } from "@/lib/actions/cover-letter-actions"
import { formatDistanceToNow } from "date-fns"
import { useJDAnalysis } from "@/hooks/use-jd-analysis"
import { JDAnalysisDisplay } from "@/components/intelligence/jd-analysis-display"
import { debounce } from "@/lib/utils"

interface Resume {
  id: string
  jobDescription: string
  version: number
  tailoringMode?: string
  createdAt: string | Date
}

interface CoverLetterClientProps {
  resumes: Resume[]
  initialResumeId?: string
  initialJobDescription?: string
}

export function CoverLetterClient({ resumes, initialResumeId, initialJobDescription }: CoverLetterClientProps) {
  const [selectedResumeId, setSelectedResumeId] = useState<string>(initialResumeId || "")
  const [jobDescription, setJobDescription] = useState<string>(initialJobDescription || "")
  const [tone, setTone] = useState<string>("professional")
  const [coverLetter, setCoverLetter] = useState<string>("")
  const [editedCoverLetter, setEditedCoverLetter] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("edit")
  const [savedCoverLetterId, setSavedCoverLetterId] = useState<string | null>(null)
  const { analyze, analysis, isAnalyzing, error: analysisError } = useJDAnalysis()

  const outputRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()
  const router = useRouter()

  // Get the selected resume details
  const selectedResume = resumes.find((resume) => resume.id === selectedResumeId)

  // Debounced job description analysis
  const debouncedAnalyze = debounce((text: string) => {
    if (text.trim().length > 100) {
      analyze(text)
    }
  }, 1000)

  // Trigger analysis when job description changes
  useEffect(() => {
    debouncedAnalyze(jobDescription)
  }, [jobDescription, debouncedAnalyze])

  // Auto-populate job description if a resume is selected and no job description is provided
  useEffect(() => {
    if (selectedResumeId && !jobDescription && selectedResume) {
      setJobDescription(selectedResume.jobDescription)
    }
  }, [selectedResumeId, jobDescription, selectedResume])

  // Check for unsaved changes
  useEffect(() => {
    if (coverLetter && editedCoverLetter && coverLetter !== editedCoverLetter) {
      setHasUnsavedChanges(true)
    } else {
      setHasUnsavedChanges(false)
    }
  }, [coverLetter, editedCoverLetter])

  // Handle resume selection
  const handleResumeChange = (value: string) => {
    setSelectedResumeId(value)

    // If job description is empty, auto-populate it from the selected resume
    if (!jobDescription) {
      const resume = resumes.find((r) => r.id === value)
      if (resume) {
        setJobDescription(resume.jobDescription)
      }
    }
  }

  // Handle generate cover letter
  const handleGenerateCoverLetter = async () => {
    // Validate inputs
    if (!selectedResumeId) {
      setError("Please select a resume")
      return
    }

    if (!jobDescription) {
      setError("Please enter a job description")
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      const result = await generateCoverLetter(selectedResumeId, jobDescription, tone)

      if (result.success && result.data) {
        setCoverLetter(result.data.content)
        setEditedCoverLetter(result.data.content)

        // Scroll to output
        setTimeout(() => {
          if (outputRef.current) {
            outputRef.current.scrollIntoView({ behavior: "smooth" })
          }
        }, 100)

        toast({
          title: "Cover letter generated",
          description: "Your cover letter has been generated successfully.",
          duration: 3000,
        })
      } else {
        throw new Error(result.error || "Failed to generate cover letter")
      }
    } catch (error: any) {
      setError(error.message)
      toast({
        title: "Generation failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle save cover letter
  const handleSaveCoverLetter = async () => {
    if (!coverLetter) return

    setIsSaving(true)

    try {
      const result = await saveCoverLetter(selectedResumeId, jobDescription, editedCoverLetter, tone)

      if (result.success && result.data) {
        setSavedCoverLetterId(result.data.id)
        setHasUnsavedChanges(false)

        toast({
          title: "Cover letter saved",
          description: "Your cover letter has been saved successfully.",
          duration: 3000,
        })
      } else {
        throw new Error(result.error || "Failed to save cover letter")
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

  // Handle copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(editedCoverLetter)
      toast({
        title: "Copied to clipboard",
        description: "Cover letter has been copied to your clipboard.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy cover letter to clipboard.",
        variant: "destructive",
      })
    }
  }

  // Handle download
  const handleDownload = () => {
    try {
      const blob = new Blob([editedCoverLetter], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `cover-letter-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: "Your cover letter is being downloaded.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download cover letter.",
        variant: "destructive",
      })
    }
  }

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

  return (
    <div className="container-wide py-12">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <LucernaSunIcon size={48} glowing={true} />
        </div>
        <h1 className="mb-3 font-serif">Cover Letter Generator</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Create a tailored cover letter based on your resume and the job description.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Generate Your Cover Letter</CardTitle>
              <CardDescription>
                Select a resume, enter a job description, and choose a tone to generate your cover letter.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="resume">Select Resume</Label>
                <Select value={selectedResumeId} onValueChange={handleResumeChange}>
                  <SelectTrigger id="resume">
                    <SelectValue placeholder="Choose a resume" />
                  </SelectTrigger>
                  <SelectContent>
                    {resumes.length > 0 ? (
                      resumes.map((resume) => (
                        <SelectItem key={resume.id} value={resume.id}>
                          <div className="flex flex-col">
                            <span>
                              Resume v{resume.version} ({getTailoringModeDisplay(resume.tailoringMode)})
                            </span>
                            <span className="text-xs text-gray-500">
                              Created {formatDistanceToNow(new Date(resume.createdAt), { addSuffix: true })}
                            </span>
                          </div>
                        </SelectItem>
                      ))
                    ) : (
                      <SelectItem value="none" disabled>
                        No resumes available
                      </SelectItem>
                    )}
                  </SelectContent>
                </Select>
                {selectedResume && (
                  <div className="mt-2 text-xs text-gray-500 flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    Created {formatDistanceToNow(new Date(selectedResume.createdAt), { addSuffix: true })}
                  </div>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Job Description</Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description here..."
                  className="min-h-[200px]"
                />
              </div>

              {/* JD Analysis Display */}
              {(analysis || isAnalyzing) && jobDescription.trim().length > 100 && (
                <div className="mt-2">
                  <JDAnalysisDisplay
                    analysis={analysis}
                    isLoading={isAnalyzing}
                    compact={true}
                    className="border-dashed"
                  />
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="tone">Cover Letter Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger id="tone">
                    <SelectValue placeholder="Select a tone" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="professional">
                      <div className="flex flex-col">
                        <span>Professional</span>
                        <span className="text-xs text-gray-500">Formal and business-like</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="enthusiastic">
                      <div className="flex flex-col">
                        <span>Enthusiastic</span>
                        <span className="text-xs text-gray-500">Energetic and passionate</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="confident">
                      <div className="flex flex-col">
                        <span>Confident</span>
                        <span className="text-xs text-gray-500">Assertive and self-assured</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="conversational">
                      <div className="flex flex-col">
                        <span>Conversational</span>
                        <span className="text-xs text-gray-500">Friendly and approachable</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {error && (
                <Alert variant="destructive">
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}

              <Button
                onClick={handleGenerateCoverLetter}
                disabled={isGenerating || !selectedResumeId || !jobDescription}
                className="w-full sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Generate Cover Letter
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {coverLetter && (
            <div ref={outputRef} className="animate-in fade-in duration-500">
              <Card className="mb-6">
                <CardHeader>
                  <CardTitle className="flex justify-between items-center">
                    <span>Your Cover Letter</span>
                    {savedCoverLetterId && !hasUnsavedChanges && (
                      <Badge variant="outline" className="bg-green-50 text-green-700">
                        Saved
                      </Badge>
                    )}
                    {hasUnsavedChanges && (
                      <Badge variant="outline" className="bg-amber-50 text-amber-700">
                        Unsaved Changes
                      </Badge>
                    )}
                  </CardTitle>
                  <CardDescription>
                    Edit your cover letter below. You can make changes before saving or downloading.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Tabs value={activeTab} onValueChange={setActiveTab}>
                    <TabsList className="mb-4">
                      <TabsTrigger value="edit">Edit</TabsTrigger>
                      <TabsTrigger value="preview">Preview</TabsTrigger>
                    </TabsList>

                    <TabsContent value="edit">
                      <Textarea
                        value={editedCoverLetter}
                        onChange={(e) => setEditedCoverLetter(e.target.value)}
                        className="min-h-[400px] font-mono text-sm"
                      />
                    </TabsContent>

                    <TabsContent value="preview">
                      <div className="bg-white p-6 border rounded-md min-h-[400px] whitespace-pre-wrap">
                        {editedCoverLetter}
                      </div>
                    </TabsContent>
                  </Tabs>

                  <div className="flex flex-wrap gap-3 mt-6">
                    <Button
                      onClick={handleSaveCoverLetter}
                      disabled={isSaving || !editedCoverLetter}
                      className="flex items-center gap-2"
                    >
                      <Save className="h-4 w-4" />
                      {isSaving ? "Saving..." : "Save Cover Letter"}
                    </Button>

                    <Button
                      onClick={handleCopyToClipboard}
                      variant="outline"
                      disabled={!editedCoverLetter}
                      className="flex items-center gap-2"
                    >
                      <Copy className="h-4 w-4" />
                      Copy to Clipboard
                    </Button>

                    <Button
                      onClick={handleDownload}
                      variant="outline"
                      disabled={!editedCoverLetter}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>Cover Letter Tips</CardTitle>
              <CardDescription>Best practices for effective cover letters</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Keep it concise</h3>
                <p className="text-sm text-gray-600">
                  Aim for 250-300 words. Recruiters spend an average of 7 seconds scanning a cover letter.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Address the hiring manager</h3>
                <p className="text-sm text-gray-600">
                  If possible, find the name of the hiring manager. Otherwise, "Dear Hiring Team" works well.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Show enthusiasm</h3>
                <p className="text-sm text-gray-600">
                  Express genuine interest in the role and company. Research the company beforehand.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Highlight relevant experience</h3>
                <p className="text-sm text-gray-600">
                  Focus on achievements that directly relate to the job requirements.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">End with a call to action</h3>
                <p className="text-sm text-gray-600">
                  Express interest in an interview and thank them for their consideration.
                </p>
              </div>

              <div className="pt-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium mb-2 text-blue-800">ATS Compatibility</h4>
                  <p className="text-xs text-blue-700">
                    Our cover letter generator creates ATS-friendly content that will pass through Applicant Tracking
                    Systems while maintaining a human touch.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
