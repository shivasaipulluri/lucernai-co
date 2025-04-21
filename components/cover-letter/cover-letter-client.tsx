"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { generateCoverLetter, saveCoverLetter } from "@/lib/actions/cover-letter-actions"
import { useToast } from "@/hooks/use-toast"
import { useJDAnalysis } from "@/hooks/use-jd-analysis"
import { JDAnalysisDisplay } from "@/components/intelligence/jd-analysis-display"
import { Loader2, Save, Download, Copy, CheckCircle2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { debounce } from "lodash"

// Define types for the component props
interface Resume {
  id: string
  title?: string
  createdAt: Date | string
  version?: number
  tailoringMode?: string
}

interface CoverLetterClientProps {
  resumes: Resume[]
  userId: string
}

export default function CoverLetterClient({ resumes, userId }: CoverLetterClientProps) {
  const { toast } = useToast()
  const router = useRouter()
  const [selectedResume, setSelectedResume] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [companyName, setCompanyName] = useState("")
  const [jobTitle, setJobTitle] = useState("")
  const [coverLetter, setCoverLetter] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [isCopied, setIsCopied] = useState(false)
  const [tone, setTone] = useState("professional")
  const [format, setFormat] = useState("standard")
  const [length, setLength] = useState("medium")
  const [activeTab, setActiveTab] = useState("editor")

  const { analysis, isAnalyzing, error, analyze } = useJDAnalysis()
  const analysisTimeoutRef = useRef<NodeJS.Timeout | null>(null)

  // Fix: Use a proper debounced function with useCallback to prevent recreation on every render
  const debouncedAnalyze = useCallback(
    debounce((jd: string) => {
      if (jd.trim().length > 100) {
        analyze(jd)
      }
    }, 1000),
    [analyze],
  )

  // Fix: Only trigger analysis when jobDescription changes, not when debouncedAnalyze changes
  useEffect(() => {
    // Clear any existing timeout
    if (analysisTimeoutRef.current) {
      clearTimeout(analysisTimeoutRef.current)
    }

    // Only analyze if job description is long enough
    if (jobDescription.trim().length > 100) {
      // Set a timeout to prevent rapid successive calls
      analysisTimeoutRef.current = setTimeout(() => {
        debouncedAnalyze(jobDescription)
      }, 500)
    }

    // Cleanup function
    return () => {
      if (analysisTimeoutRef.current) {
        clearTimeout(analysisTimeoutRef.current)
      }
    }
  }, [jobDescription, debouncedAnalyze])

  const handleGenerate = async () => {
    if (!selectedResume) {
      toast({
        title: "Missing Resume",
        description: "Please select a resume to continue.",
        variant: "destructive",
      })
      return
    }

    if (!jobDescription) {
      toast({
        title: "Missing Job Description",
        description: "Please enter a job description to continue.",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)
    try {
      const result = await generateCoverLetter(selectedResume, jobDescription, tone)

      if (result.success && result.data) {
        setCoverLetter(result.data.content)
        setActiveTab("preview")
        toast({
          title: "Cover Letter Generated",
          description: "Your cover letter has been successfully generated.",
        })
      } else {
        toast({
          title: "Generation Failed",
          description: result.error || "Failed to generate cover letter. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error generating cover letter:", error)
      toast({
        title: "Generation Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleSave = async () => {
    if (!coverLetter) {
      toast({
        title: "Nothing to Save",
        description: "Please generate a cover letter first.",
        variant: "destructive",
      })
      return
    }

    setIsSaving(true)
    try {
      const result = await saveCoverLetter(selectedResume, jobDescription, coverLetter, tone)

      if (result.success) {
        toast({
          title: "Cover Letter Saved",
          description: "Your cover letter has been successfully saved.",
        })
        router.refresh()
      } else {
        toast({
          title: "Save Failed",
          description: result.error || "Failed to save cover letter. Please try again.",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error saving cover letter:", error)
      toast({
        title: "Save Error",
        description: "An unexpected error occurred. Please try again later.",
        variant: "destructive",
      })
    } finally {
      setIsSaving(false)
    }
  }

  const handleCopy = () => {
    if (!coverLetter) {
      toast({
        title: "Nothing to Copy",
        description: "Please generate a cover letter first.",
        variant: "destructive",
      })
      return
    }

    navigator.clipboard.writeText(coverLetter)
    setIsCopied(true)
    toast({
      title: "Copied to Clipboard",
      description: "Cover letter has been copied to clipboard.",
    })

    setTimeout(() => {
      setIsCopied(false)
    }, 2000)
  }

  const handleDownload = () => {
    if (!coverLetter) {
      toast({
        title: "Nothing to Download",
        description: "Please generate a cover letter first.",
        variant: "destructive",
      })
      return
    }

    const element = document.createElement("a")
    const file = new Blob([coverLetter], { type: "text/plain" })
    element.href = URL.createObjectURL(file)
    element.download = `Cover_Letter_${companyName || "Company"}_${new Date().toISOString().split("T")[0]}.txt`
    document.body.appendChild(element)
    element.click()
    document.body.removeChild(element)
  }

  return (
    <div className="container mx-auto p-4 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Cover Letter Generator</CardTitle>
              <CardDescription>
                Create a tailored cover letter based on your resume and the job description.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="editor">Editor</TabsTrigger>
                  <TabsTrigger value="preview">Preview</TabsTrigger>
                </TabsList>
                <TabsContent value="editor" className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="resume">Select Resume</Label>
                    <Select value={selectedResume} onValueChange={setSelectedResume}>
                      <SelectTrigger id="resume">
                        <SelectValue placeholder="Select a resume" />
                      </SelectTrigger>
                      <SelectContent>
                        {resumes.map((resume: Resume) => (
                          <SelectItem key={resume.id} value={resume.id}>
                            {resume.title || "Untitled Resume"}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobTitle">Job Title</Label>
                    <Input
                      id="jobTitle"
                      placeholder="e.g., Software Engineer"
                      value={jobTitle}
                      onChange={(e) => setJobTitle(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="companyName">Company Name</Label>
                    <Input
                      id="companyName"
                      placeholder="e.g., Acme Corporation"
                      value={companyName}
                      onChange={(e) => setCompanyName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="jobDescription">
                      Job Description
                      {isAnalyzing && <span className="ml-2 text-xs text-muted-foreground">Analyzing...</span>}
                    </Label>
                    <Textarea
                      id="jobDescription"
                      placeholder="Paste the job description here..."
                      className="min-h-[200px]"
                      value={jobDescription}
                      onChange={(e) => setJobDescription(e.target.value)}
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="tone">Tone</Label>
                      <Select value={tone} onValueChange={setTone}>
                        <SelectTrigger id="tone">
                          <SelectValue placeholder="Select tone" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="professional">Professional</SelectItem>
                          <SelectItem value="conversational">Conversational</SelectItem>
                          <SelectItem value="enthusiastic">Enthusiastic</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="format">Format</Label>
                      <Select value={format} onValueChange={setFormat}>
                        <SelectTrigger id="format">
                          <SelectValue placeholder="Select format" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="standard">Standard</SelectItem>
                          <SelectItem value="modern">Modern</SelectItem>
                          <SelectItem value="traditional">Traditional</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="length">Length</Label>
                      <Select value={length} onValueChange={setLength}>
                        <SelectTrigger id="length">
                          <SelectValue placeholder="Select length" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="medium">Medium</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Button
                    onClick={handleGenerate}
                    disabled={isGenerating || !selectedResume || !jobDescription}
                    className="w-full"
                  >
                    {isGenerating ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Generating...
                      </>
                    ) : (
                      "Generate Cover Letter"
                    )}
                  </Button>
                </TabsContent>

                <TabsContent value="preview" className="space-y-4">
                  {coverLetter ? (
                    <>
                      <div className="border rounded-md p-4 min-h-[400px] whitespace-pre-wrap">{coverLetter}</div>
                      <div className="flex flex-wrap gap-2">
                        <Button onClick={handleSave} disabled={isSaving}>
                          {isSaving ? (
                            <>
                              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                              Saving...
                            </>
                          ) : (
                            <>
                              <Save className="mr-2 h-4 w-4" />
                              Save
                            </>
                          )}
                        </Button>
                        <Button onClick={handleCopy} variant="outline">
                          {isCopied ? (
                            <>
                              <CheckCircle2 className="mr-2 h-4 w-4" />
                              Copied!
                            </>
                          ) : (
                            <>
                              <Copy className="mr-2 h-4 w-4" />
                              Copy
                            </>
                          )}
                        </Button>
                        <Button onClick={handleDownload} variant="outline">
                          <Download className="mr-2 h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </>
                  ) : (
                    <div className="flex flex-col items-center justify-center min-h-[400px] text-center text-muted-foreground">
                      <p>No cover letter generated yet.</p>
                      <p className="text-sm">Go to the Editor tab to generate a cover letter.</p>
                    </div>
                  )}
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Job Analysis</CardTitle>
              <CardDescription>AI-powered insights from the job description.</CardDescription>
            </CardHeader>
            <CardContent>
              {analysis ? (
                <JDAnalysisDisplay analysis={analysis} />
              ) : (
                <div className="flex flex-col items-center justify-center min-h-[200px] text-center text-muted-foreground">
                  {isAnalyzing ? (
                    <>
                      <Loader2 className="h-8 w-8 animate-spin mb-2" />
                      <p>Analyzing job description...</p>
                    </>
                  ) : (
                    <>
                      <p>No job analysis available.</p>
                      <p className="text-sm">Enter a job description to see AI-powered insights.</p>
                    </>
                  )}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
