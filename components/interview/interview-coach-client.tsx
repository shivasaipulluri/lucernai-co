"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import {
  AlertCircle,
  Brain,
  Code,
  Briefcase,
  PuzzleIcon as PuzzlePiece,
  Clock,
  Download,
  Copy,
  RefreshCw,
  ArrowLeft,
  Save,
} from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"
import {
  generateInterviewQuestions,
  saveInterviewAnswers,
  updateNeedsReview,
  getInterviewSession,
  type InterviewType,
  type InterviewQuestion,
  type InterviewAnswer,
} from "@/lib/actions/interview-actions"
import { InterviewQuestionList } from "./interview-question-list"
import { InterviewSessionSidebar } from "./interview-session-sidebar"
import { InterviewSessionHistory } from "./interview-session-history"
import { cn } from "@/lib/utils"

// Motivational quotes for loading state
const MOTIVATIONAL_QUOTES = [
  "The only way to do great work is to love what you do. — Steve Jobs",
  "Success is not final, failure is not fatal: It is the courage to continue that counts. — Winston Churchill",
  "Believe you can and you're halfway there. — Theodore Roosevelt",
  "The future belongs to those who believe in the beauty of their dreams. — Eleanor Roosevelt",
  "Don't watch the clock; do what it does. Keep going. — Sam Levenson",
  "The best way to predict the future is to create it. — Abraham Lincoln",
  "Your time is limited, don't waste it living someone else's life. — Steve Jobs",
  "The only limit to our realization of tomorrow is our doubts of today. — Franklin D. Roosevelt",
  "It always seems impossible until it's done. — Nelson Mandela",
  "The secret of getting ahead is getting started. — Mark Twain",
]

interface InterviewCoachClientProps {
  initialSessionId?: string
  recentSessions?: any[]
}

export function InterviewCoachClient({ initialSessionId, recentSessions = [] }: InterviewCoachClientProps) {
  const [activeTab, setActiveTab] = useState<string>("input")
  const [jobDescription, setJobDescription] = useState<string>("")
  const [selectedTypes, setSelectedTypes] = useState<InterviewType[]>(["Behavioral"])
  const [isGenerating, setIsGenerating] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null)
  const [questions, setQuestions] = useState<InterviewQuestion[]>([])
  const [answers, setAnswers] = useState<InterviewAnswer[]>([])
  const [needsReview, setNeedsReview] = useState<number[]>([])
  const [motivationalQuote, setMotivationalQuote] = useState<string>("")
  const [isSaving, setIsSaving] = useState<boolean>(false)
  const [timerActive, setTimerActive] = useState<boolean>(false)
  const [timerSeconds, setTimerSeconds] = useState<number>(0)
  const [showSidebar, setShowSidebar] = useState<boolean>(true)

  const { toast } = useToast()
  const router = useRouter()
  const searchParams = useSearchParams()

  // Load session if sessionId is provided
  useEffect(() => {
    if (sessionId) {
      loadSession(sessionId)
    }
  }, [sessionId])

  // Timer functionality
  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (timerActive) {
      interval = setInterval(() => {
        setTimerSeconds((prev) => prev + 1)
      }, 1000)
    } else if (interval) {
      clearInterval(interval)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [timerActive])

  // Format timer display
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`
  }

  // Load session data
  const loadSession = async (id: string) => {
    try {
      const result = await getInterviewSession(id)

      if (result.success && result.data) {
        const session = result.data
        setJobDescription(session.jobDescription)
        setSelectedTypes(session.selectedTypes as InterviewType[])
        // Parse JSON strings and cast to the correct types
        setQuestions(
          typeof session.questions === "string" ? (JSON.parse(session.questions) as InterviewQuestion[]) : [],
        )
        setAnswers(typeof session.answers === "string" ? (JSON.parse(session.answers) as InterviewAnswer[]) : [])
        setNeedsReview(typeof session.needsReview === "string" ? (JSON.parse(session.needsReview) as number[]) : [])
        setSessionId(id)
        setActiveTab("practice")
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to load interview session",
          variant: "destructive",
        })
      }
    } catch (error) {
      console.error("Error loading session:", error)
      toast({
        title: "Error",
        description: "Failed to load interview session",
        variant: "destructive",
      })
    }
  }

  // Handle job description input
  const handleJobDescriptionChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const value = e.target.value
    // Limit to 2000 characters
    if (value.length <= 2000) {
      setJobDescription(value)
    }
  }

  // Handle interview type selection
  const handleTypeChange = (type: InterviewType) => {
    setSelectedTypes((prev) => {
      if (prev.includes(type)) {
        return prev.filter((t) => t !== type)
      } else {
        return [...prev, type]
      }
    })
  }

  // Handle generate interview questions
  const handleGenerateQuestions = async () => {
    // Validate inputs
    if (!jobDescription) {
      setError("Please enter a job description")
      return
    }

    if (selectedTypes.length === 0) {
      setError("Please select at least one interview type")
      return
    }

    setError(null)
    setIsGenerating(true)

    // Set a random motivational quote
    setMotivationalQuote(MOTIVATIONAL_QUOTES[Math.floor(Math.random() * MOTIVATIONAL_QUOTES.length)])

    try {
      const result = await generateInterviewQuestions(jobDescription, selectedTypes)

      if (result.success && result.data) {
        setSessionId(result.data.sessionId)
        setQuestions(result.data.questions)
        setAnswers([])
        setNeedsReview([])
        setActiveTab("practice")

        // Update URL with session ID
        router.push(`/interview?sessionId=${result.data.sessionId}`)

        toast({
          title: "Questions generated",
          description: `Generated ${result.data.questions.length} interview questions`,
          duration: 3000,
        })

        router.refresh()
      } else {
        throw new Error(result.error || "Failed to generate interview questions")
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

  // Handle answer change
  const handleAnswerChange = (questionId: number, answer: string) => {
    setAnswers((prev) => {
      const existing = prev.findIndex((a) => a.questionId === questionId)
      if (existing !== -1) {
        const updated = [...prev]
        updated[existing] = { questionId, answer }
        return updated
      } else {
        return [...prev, { questionId, answer }]
      }
    })
  }

  // Handle needs review toggle
  const handleNeedsReviewToggle = (questionId: number) => {
    setNeedsReview((prev) => {
      if (prev.includes(questionId)) {
        return prev.filter((id) => id !== questionId)
      } else {
        return [...prev, questionId]
      }
    })
  }

  // Save answers
  const handleSaveAnswers = async () => {
    if (!sessionId) return

    setIsSaving(true)

    try {
      const saveResult = await saveInterviewAnswers(sessionId, answers)
      const reviewResult = await updateNeedsReview(sessionId, needsReview)

      if (saveResult.success && reviewResult.success) {
        toast({
          title: "Answers saved",
          description: "Your answers have been saved successfully",
          duration: 3000,
        })

        router.refresh()
      } else {
        throw new Error(saveResult.error || reviewResult.error || "Failed to save answers")
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

  // Export as text
  const handleExportAsText = () => {
    try {
      let content = `INTERVIEW PREPARATION - ${new Date().toLocaleDateString()}\n\n`
      content += `JOB DESCRIPTION:\n${jobDescription}\n\n`
      content += `QUESTIONS AND ANSWERS:\n\n`

      questions.forEach((q) => {
        content += `[${q.type}] ${q.question}\n`
        const answer = answers.find((a) => a.questionId === q.id)
        content += answer ? `Answer: ${answer.answer}\n\n` : `Answer: [Not answered yet]\n\n`
      })

      const blob = new Blob([content], { type: "text/plain" })
      const url = URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `interview-prep-${new Date().toISOString().split("T")[0]}.txt`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Export successful",
        description: "Your interview preparation has been exported as a text file",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Export failed",
        description: "Failed to export interview preparation",
        variant: "destructive",
      })
    }
  }

  // Copy to clipboard
  const handleCopyToClipboard = async () => {
    try {
      let content = `INTERVIEW PREPARATION - ${new Date().toLocaleDateString()}\n\n`
      content += `JOB DESCRIPTION:\n${jobDescription}\n\n`
      content += `QUESTIONS AND ANSWERS:\n\n`

      questions.forEach((q) => {
        content += `[${q.type}] ${q.question}\n`
        const answer = answers.find((a) => a.questionId === q.id)
        content += answer ? `Answer: ${answer.answer}\n\n` : `Answer: [Not answered yet]\n\n`
      })

      await navigator.clipboard.writeText(content)

      toast({
        title: "Copied to clipboard",
        description: "Your interview preparation has been copied to the clipboard",
        duration: 3000,
      })
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy interview preparation to clipboard",
        variant: "destructive",
      })
    }
  }

  // Regenerate questions
  const handleRegenerateQuestions = async () => {
    if (answers.length > 0) {
      const confirmed = window.confirm(
        "Regenerating questions will delete your current answers. Are you sure you want to continue?",
      )
      if (!confirmed) return
    }

    setSessionId(null)
    setQuestions([])
    setAnswers([])
    setNeedsReview([])
    setActiveTab("input")
    router.push("/interview")

    handleGenerateQuestions()
  }

  // Get question count by type
  const getQuestionCountByType = (type: InterviewType) => {
    return questions.filter((q) => q.type === type).length
  }

  // Get total questions answered
  const getTotalQuestionsAnswered = () => {
    return answers.length
  }

  // Get total questions that need review
  const getTotalQuestionsNeedingReview = () => {
    return needsReview.length
  }

  return (
    <div className="container-wide py-12">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <LucernaSunIcon size={48} glowing={true} />
        </div>
        <h1 className="mb-3 font-serif">Interview Coach</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Practice answering interview questions tailored to your target role.
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="mb-6">
          <TabsTrigger value="input">Job Description</TabsTrigger>
          <TabsTrigger value="practice" disabled={!sessionId}>
            Practice Interview
          </TabsTrigger>
          <TabsTrigger value="history">Session History</TabsTrigger>
        </TabsList>

        <TabsContent value="input">
          <Card>
            <CardHeader>
              <CardTitle>Interview Question Generator</CardTitle>
              <CardDescription>
                Paste the job description and select the types of interview questions to generate.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="jobDescription" className="text-sm font-medium text-gray-700 mb-1">
                  Job Description
                </Label>
                <Textarea
                  id="jobDescription"
                  value={jobDescription}
                  onChange={handleJobDescriptionChange}
                  placeholder="Paste the job description here..."
                  className="min-h-[200px]"
                />
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Used to generate relevant interview questions</span>
                  <span
                    className={cn(
                      jobDescription.length > 1800 && "text-amber-600",
                      jobDescription.length > 1950 && "text-red-600",
                    )}
                  >
                    {jobDescription.length}/2000 characters
                  </span>
                </div>
              </div>

              <div className="space-y-3">
                <Label className="text-sm font-medium text-gray-700 mb-3">Interview Question Types</Label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="behavioral"
                      checked={selectedTypes.includes("Behavioral")}
                      onCheckedChange={() => handleTypeChange("Behavioral")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="behavioral" className="font-medium flex items-center">
                        <Brain className="h-4 w-4 mr-2 text-primary" />
                        Behavioral
                      </Label>
                      <p className="text-sm text-gray-500">
                        Questions about past experiences and how you handled specific situations
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="technical"
                      checked={selectedTypes.includes("Technical")}
                      onCheckedChange={() => handleTypeChange("Technical")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="technical" className="font-medium flex items-center">
                        <Code className="h-4 w-4 mr-2 text-primary" />
                        Technical
                      </Label>
                      <p className="text-sm text-gray-500">
                        Questions about technical skills, tools, and methodologies
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="roleSpecific"
                      checked={selectedTypes.includes("Role-Specific")}
                      onCheckedChange={() => handleTypeChange("Role-Specific")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="roleSpecific" className="font-medium flex items-center">
                        <Briefcase className="h-4 w-4 mr-2 text-primary" />
                        Role-Specific
                      </Label>
                      <p className="text-sm text-gray-500">
                        Questions about domain knowledge and specific responsibilities
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start space-x-2">
                    <Checkbox
                      id="caseBased"
                      checked={selectedTypes.includes("Case-Based")}
                      onCheckedChange={() => handleTypeChange("Case-Based")}
                    />
                    <div className="grid gap-1.5 leading-none">
                      <Label htmlFor="caseBased" className="font-medium flex items-center">
                        <PuzzlePiece className="h-4 w-4 mr-2 text-primary" />
                        Case/Scenario-Based
                      </Label>
                      <p className="text-sm text-gray-500">
                        Hypothetical scenarios or problems you might encounter in the role
                      </p>
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

              <Button
                onClick={handleGenerateQuestions}
                disabled={isGenerating || !jobDescription || selectedTypes.length === 0}
                className="w-full sm:w-auto"
              >
                {isGenerating ? (
                  <>
                    <span className="animate-spin mr-2">⏳</span>
                    Generating Questions...
                  </>
                ) : (
                  <>Generate Interview Questions</>
                )}
              </Button>

              {isGenerating && (
                <div className="text-center p-6 animate-pulse">
                  <p className="text-gray-600 italic">{motivationalQuote}</p>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="practice">
          {sessionId && questions.length > 0 ? (
            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
              <div className={cn("lg:col-span-3", !showSidebar && "lg:col-span-4")}>
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-2xl font-serif">Practice Session</h2>
                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setTimerActive(!timerActive)}
                      className={cn(
                        "flex items-center gap-1",
                        timerActive && "bg-primary text-white hover:bg-primary/90",
                      )}
                    >
                      <Clock className="h-4 w-4" />
                      {timerActive ? formatTime(timerSeconds) : "Start Timer"}
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setShowSidebar(!showSidebar)}
                      className="lg:hidden"
                    >
                      {showSidebar ? "Hide Sidebar" : "Show Sidebar"}
                    </Button>
                  </div>
                </div>

                <InterviewQuestionList
                  questions={questions}
                  answers={answers}
                  needsReview={needsReview}
                  onAnswerChange={handleAnswerChange}
                  onNeedsReviewToggle={handleNeedsReviewToggle}
                />

                <div className="flex flex-wrap gap-3 mt-6">
                  <Button
                    onClick={handleSaveAnswers}
                    disabled={isSaving || answers.length === 0}
                    className="flex items-center gap-2"
                  >
                    <Save className="h-4 w-4" />
                    {isSaving ? "Saving..." : "Save Answers"}
                  </Button>

                  <Button onClick={handleExportAsText} variant="outline" className="flex items-center gap-2">
                    <Download className="h-4 w-4" />
                    Export as Text
                  </Button>

                  <Button onClick={handleCopyToClipboard} variant="outline" className="flex items-center gap-2">
                    <Copy className="h-4 w-4" />
                    Copy to Clipboard
                  </Button>

                  <Button onClick={handleRegenerateQuestions} variant="outline" className="flex items-center gap-2">
                    <RefreshCw className="h-4 w-4" />
                    Regenerate Questions
                  </Button>
                </div>
              </div>

              {showSidebar && (
                <div className="lg:col-span-1">
                  <InterviewSessionSidebar
                    jobDescription={jobDescription}
                    questionCounts={{
                      Behavioral: getQuestionCountByType("Behavioral"),
                      Technical: getQuestionCountByType("Technical"),
                      "Role-Specific": getQuestionCountByType("Role-Specific"),
                      "Case-Based": getQuestionCountByType("Case-Based"),
                    }}
                    totalAnswered={getTotalQuestionsAnswered()}
                    totalNeedingReview={getTotalQuestionsNeedingReview()}
                    totalQuestions={questions.length}
                    onTimerToggle={() => setTimerActive(!timerActive)}
                    timerActive={timerActive}
                    timerSeconds={timerSeconds}
                  />
                </div>
              )}
            </div>
          ) : (
            <Card>
              <CardContent className="p-8 text-center">
                <AlertCircle className="w-12 h-12 mx-auto mb-4 text-amber-500" />
                <h3 className="text-xl font-medium mb-2">No Active Session</h3>
                <p className="text-gray-500 mb-6">
                  You don't have an active interview session. Generate questions to start practicing.
                </p>
                <Button onClick={() => setActiveTab("input")}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back to Question Generator
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>

        <TabsContent value="history">
          <InterviewSessionHistory
            sessions={recentSessions}
            onSessionSelect={(id) => {
              loadSession(id)
            }}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
