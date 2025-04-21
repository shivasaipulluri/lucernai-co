"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { AlertCircle, Copy, Download, Save, Sparkles, ArrowRight } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"
import { generateLinkedInAbout, saveLinkedInOptimization } from "@/lib/actions/linkedin-actions"

interface LinkedInOptimizerClientProps {
  initialJobDescription?: string
}

export function LinkedInOptimizerClient({ initialJobDescription }: LinkedInOptimizerClientProps) {
  const [originalAbout, setOriginalAbout] = useState<string>("")
  const [jobDescription, setJobDescription] = useState<string>(initialJobDescription || "")
  const [tone, setTone] = useState<string>("professional")
  const [optimizedAbout, setOptimizedAbout] = useState<string>("")
  const [editedAbout, setEditedAbout] = useState<string>("")
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState<boolean>(false)
  const [activeTab, setActiveTab] = useState<string>("edit")
  const [savedOptimizationId, setSavedOptimizationId] = useState<string | null>(null)
  const [viewMode, setViewMode] = useState<string>("after")
  const [characterCount, setCharacterCount] = useState<number>(0)

  const outputRef = useRef<HTMLDivElement>(null)
  const { toast } = useToast()

  // Clean input on paste
  const cleanLinkedInInput = (text: string): string => {
    // Remove emojis
    const emojiRegex =
      /[\u{1F600}-\u{1F64F}\u{1F300}-\u{1F5FF}\u{1F680}-\u{1F6FF}\u{1F700}-\u{1F77F}\u{1F780}-\u{1F7FF}\u{1F800}-\u{1F8FF}\u{1F900}-\u{1F9FF}\u{1FA00}-\u{1FA6F}\u{1FA70}-\u{1FAFF}\u{2600}-\u{26FF}\u{2700}-\u{27BF}]/gu
    let cleaned = text.replace(emojiRegex, "")

    // Remove excessive line breaks
    cleaned = cleaned.replace(/\n{3,}/g, "\n\n")

    // Remove special characters that might cause issues
    cleaned = cleaned.replace(/[^\w\s.,;:'"!?()-]/g, "")

    return cleaned.trim()
  }

  // Update character count
  useEffect(() => {
    setCharacterCount(editedAbout.length)
  }, [editedAbout])

  // Check for unsaved changes
  useEffect(() => {
    if (optimizedAbout && editedAbout && optimizedAbout !== editedAbout) {
      setHasUnsavedChanges(true)
    } else {
      setHasUnsavedChanges(false)
    }
  }, [optimizedAbout, editedAbout])

  // Handle LinkedIn About input
  const handleLinkedInAboutChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    setOriginalAbout(value)
  }

  // Handle paste event
  const handlePaste = (e: React.ClipboardEvent<HTMLTextAreaElement>) => {
    const pastedText = e.clipboardData.getData("text")
    const cleaned = cleanLinkedInInput(pastedText)

    // Prevent default paste behavior
    e.preventDefault()

    // Insert cleaned text at cursor position
    const target = e.target as HTMLTextAreaElement
    const start = target.selectionStart
    const end = target.selectionEnd
    const currentValue = target.value
    const newValue = currentValue.substring(0, start) + cleaned + currentValue.substring(end)

    setOriginalAbout(newValue)

    // Set cursor position after pasted text
    setTimeout(() => {
      target.selectionStart = target.selectionEnd = start + cleaned.length
    }, 0)
  }

  // Handle generate LinkedIn About
  const handleGenerateLinkedInAbout = async () => {
    // Validate inputs
    if (!originalAbout) {
      setError("Please enter your current LinkedIn About section")
      return
    }

    if (!jobDescription) {
      setError("Please enter a job description")
      return
    }

    setError(null)
    setIsGenerating(true)

    try {
      const result = await generateLinkedInAbout(originalAbout, jobDescription, tone)

      if (result.success && result.data) {
        setOptimizedAbout(result.data.optimizedAbout)
        setEditedAbout(result.data.optimizedAbout)
        setViewMode("after")

        // Scroll to output
        setTimeout(() => {
          if (outputRef.current) {
            outputRef.current.scrollIntoView({ behavior: "smooth" })
          }
        }, 100)

        toast({
          title: "LinkedIn About optimized",
          description: "Your LinkedIn About section has been optimized successfully.",
          duration: 3000,
        })
      } else {
        throw new Error(result.error || "Failed to optimize LinkedIn About")
      }
    } catch (error: any) {
      setError(error.message)
      toast({
        title: "Optimization failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  // Handle save LinkedIn optimization
  const handleSaveLinkedInOptimization = async () => {
    if (!optimizedAbout) return

    setIsSaving(true)

    try {
      const result = await saveLinkedInOptimization(originalAbout, jobDescription, editedAbout, tone)

      if (result.success && result.data) {
        setSavedOptimizationId(result.data.id)
        setHasUnsavedChanges(false)

        toast({
          title: "LinkedIn About saved",
          description: "Your optimized LinkedIn About section has been saved successfully.",
          duration: 3000,
        })
      } else {
        throw new Error(result.error || "Failed to save LinkedIn optimization")
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
      await navigator.clipboard.writeText(editedAbout)
      toast({
        title: "Copied to clipboard",
        description: "LinkedIn About has been copied to your clipboard.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy LinkedIn About to clipboard.",
        variant: "destructive",
      })
    }
  }

  // Handle download
  const handleDownload = () => {
    try {
      const blob = new Blob([editedAbout], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `linkedin-about-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Download started",
        description: "Your LinkedIn About is being downloaded.",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Download failed",
        description: "Failed to download LinkedIn About.",
        variant: "destructive",
      })
    }
  }

  // Get tone icon and color
  const getToneDetails = (toneValue: string) => {
    switch (toneValue) {
      case "professional":
        return { icon: "👔", color: "bg-blue-50 text-blue-700" }
      case "enthusiastic":
        return { icon: "✨", color: "bg-purple-50 text-purple-700" }
      case "confident":
        return { icon: "💪", color: "bg-green-50 text-green-700" }
      case "conversational":
        return { icon: "💬", color: "bg-amber-50 text-amber-700" }
      default:
        return { icon: "👔", color: "bg-blue-50 text-blue-700" }
    }
  }

  const toneDetails = getToneDetails(tone)

  return (
    <div className="container-wide py-12">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <LucernaSunIcon size={48} glowing={true} />
        </div>
        <h1 className="mb-3 font-serif">LinkedIn Profile Optimizer</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Enhance your LinkedIn "About" section to align with your target role and stand out to recruiters.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="mb-6">
            <CardHeader>
              <CardTitle>Optimize Your LinkedIn About</CardTitle>
              <CardDescription>
                Paste your current LinkedIn "About" section and the job description you're targeting.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="linkedinAbout">Current LinkedIn About Section</Label>
                <Textarea
                  id="linkedinAbout"
                  value={originalAbout}
                  onChange={handleLinkedInAboutChange}
                  onPaste={handlePaste}
                  placeholder="Paste your current LinkedIn About section here..."
                  className="min-h-[200px]"
                />
                <p className="text-xs text-gray-500">
                  Paste your current LinkedIn "About" section. We'll automatically clean up any special characters.
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="jobDescription">Target Job Description</Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={(e) => setJobDescription(e.target.value)}
                  placeholder="Paste the job description you're targeting..."
                  className="min-h-[200px]"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="tone">Tone</Label>
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
                onClick={handleGenerateLinkedInAbout}
                disabled={isGenerating || !originalAbout || !jobDescription}
                className="w-full sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Optimizing...
                  </>
                ) : (
                  <>
                    <Sparkles className="mr-2 h-5 w-5" />
                    Optimize LinkedIn About
                  </>
                )}
              </Button>
            </CardContent>
          </Card>

          {optimizedAbout && (
            <div ref={outputRef} className="animate-in fade-in duration-500">
              <Card className="mb-6">
                <CardHeader>
                  <div className="flex justify-between items-center">
                    <CardTitle className="flex items-center gap-2">
                      Your Optimized LinkedIn About
                      <Badge className={toneDetails.color}>
                        {toneDetails.icon} {tone.charAt(0).toUpperCase() + tone.slice(1)}
                      </Badge>
                    </CardTitle>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setViewMode(viewMode === "after" ? "before" : "after")}
                      >
                        {viewMode === "after" ? "Show Original" : "Show Optimized"}
                      </Button>
                    </div>
                  </div>
                  <CardDescription>
                    {viewMode === "after"
                      ? "Edit your optimized LinkedIn About below. You can make changes before saving or copying."
                      : "This is your original LinkedIn About section for comparison."}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {viewMode === "after" ? (
                    <div className="space-y-4">
                      <Tabs value={activeTab} onValueChange={setActiveTab}>
                        <TabsList className="mb-4">
                          <TabsTrigger value="edit">Edit</TabsTrigger>
                          <TabsTrigger value="preview">Preview</TabsTrigger>
                        </TabsList>

                        <TabsContent value="edit">
                          <Textarea
                            value={editedAbout}
                            onChange={(e) => setEditedAbout(e.target.value)}
                            className="min-h-[300px] font-mono text-sm"
                          />
                          <div className="flex justify-between mt-2">
                            <div className="text-xs text-gray-500">
                              {characterCount > 2600 ? (
                                <span className="text-red-500">
                                  Character count: {characterCount}/2600 (LinkedIn limit exceeded)
                                </span>
                              ) : (
                                <span>Character count: {characterCount}/2600</span>
                              )}
                            </div>
                            {hasUnsavedChanges && <div className="text-xs text-amber-600">Unsaved changes</div>}
                          </div>
                        </TabsContent>

                        <TabsContent value="preview">
                          <div className="bg-white p-6 border rounded-md min-h-[300px] whitespace-pre-wrap">
                            {editedAbout}
                          </div>
                        </TabsContent>
                      </Tabs>

                      <div className="flex flex-wrap gap-3 mt-6">
                        <Button
                          onClick={handleSaveLinkedInOptimization}
                          disabled={isSaving || !editedAbout}
                          className="flex items-center gap-2"
                        >
                          <Save className="h-4 w-4" />
                          {isSaving ? "Saving..." : "Save Optimization"}
                        </Button>

                        <Button
                          onClick={handleCopyToClipboard}
                          variant="outline"
                          disabled={!editedAbout}
                          className="flex items-center gap-2"
                        >
                          <Copy className="h-4 w-4" />
                          Copy to Clipboard
                        </Button>

                        <Button
                          onClick={handleDownload}
                          variant="outline"
                          disabled={!editedAbout}
                          className="flex items-center gap-2"
                        >
                          <Download className="h-4 w-4" />
                          Download
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-gray-50 p-6 border rounded-md min-h-[300px] whitespace-pre-wrap">
                      {originalAbout}
                    </div>
                  )}
                </CardContent>
              </Card>

              {viewMode === "after" && (
                <Card className="mb-6 border-dashed border-blue-200">
                  <CardContent className="p-4">
                    <div className="flex items-start gap-4">
                      <div className="bg-blue-50 p-2 rounded-full">
                        <ArrowRight className="h-5 w-5 text-blue-500" />
                      </div>
                      <div>
                        <h3 className="font-medium text-blue-700 mb-1">Next Steps</h3>
                        <p className="text-sm text-gray-600">
                          Copy your optimized LinkedIn About section and paste it into your LinkedIn profile. Remember
                          to review and make any final adjustments to ensure it accurately represents you.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <div>
          <Card className="sticky top-6">
            <CardHeader>
              <CardTitle>LinkedIn About Tips</CardTitle>
              <CardDescription>Best practices for an effective LinkedIn About section</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h3 className="text-sm font-medium mb-2">Start with a strong hook</h3>
                <p className="text-sm text-gray-600">
                  Begin with an attention-grabbing statement that summarizes your professional identity and value
                  proposition.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Tell your professional story</h3>
                <p className="text-sm text-gray-600">
                  Share your career journey, highlighting key achievements and the unique perspective you bring to your
                  field.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Include relevant keywords</h3>
                <p className="text-sm text-gray-600">
                  Incorporate industry-specific terms and skills that recruiters and hiring managers search for.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Showcase your achievements</h3>
                <p className="text-sm text-gray-600">
                  Highlight specific accomplishments with measurable results rather than just listing responsibilities.
                </p>
              </div>

              <div>
                <h3 className="text-sm font-medium mb-2">Add a call to action</h3>
                <p className="text-sm text-gray-600">
                  End with an invitation to connect or collaborate, making it clear how others can engage with you.
                </p>
              </div>

              <div className="pt-4">
                <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
                  <h4 className="font-medium mb-2 text-blue-800">Character Limit</h4>
                  <p className="text-xs text-blue-700">
                    LinkedIn has a 2,600 character limit for the About section. Our optimizer will help you stay within
                    this limit while maximizing impact.
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
