"use client"

import { useContext, useState, useEffect } from "react"
import { ResumeContext } from "@/context/resume-context"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Loader2, CheckCircle, AlertCircle, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface ResumeAnalysisDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function ResumeAnalysisDialog({ open, onOpenChange }: ResumeAnalysisDialogProps) {
  const { resumeData, analyzeResume } = useContext(ResumeContext)
  const { toast } = useToast()

  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [score, setScore] = useState(0)
  const [feedback, setFeedback] = useState<string[]>([])
  const [analysisComplete, setAnalysisComplete] = useState(false)

  // Reset state when dialog opens
  useEffect(() => {
    if (open) {
      setIsAnalyzing(false)
      setScore(0)
      setFeedback([])
      setAnalysisComplete(false)

      // Auto-start analysis when dialog opens
      handleAnalyze()
    }
  }, [open])

  const handleAnalyze = async () => {
    setIsAnalyzing(true)

    try {
      const result = await analyzeResume()

      // Animate the score counting up
      let currentScore = 0
      const targetScore = result.score
      const interval = setInterval(() => {
        currentScore += 1
        setScore(currentScore)

        if (currentScore >= targetScore) {
          clearInterval(interval)
        }
      }, 20)

      setFeedback(result.feedback)
      setAnalysisComplete(true)
    } catch (error) {
      toast({
        title: "Analysis Failed",
        description: "There was an error analyzing your resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  const getScoreColor = () => {
    if (score >= 90) return "text-green-500"
    if (score >= 70) return "text-amber-500"
    return "text-red-500"
  }

  const getProgressColor = () => {
    if (score >= 90) return "bg-green-500"
    if (score >= 70) return "bg-amber-500"
    return "bg-red-500"
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Resume Analysis</DialogTitle>
          <DialogDescription>
            {resumeData.jobTarget ? (
              <>
                Analyzing your resume for: <span className="font-medium">{resumeData.jobTarget}</span>
              </>
            ) : (
              "Analyzing your resume for general effectiveness"
            )}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {isAnalyzing ? (
            <div className="text-center py-8">
              <Loader2 className="h-12 w-12 animate-spin mx-auto mb-4 text-primary" />
              <h3 className="text-lg font-medium">Analyzing Your Resume</h3>
              <p className="text-muted-foreground">
                Our AI is reviewing your resume for structure, content, and effectiveness...
              </p>
            </div>
          ) : analysisComplete ? (
            <div className="space-y-6">
              <div className="text-center">
                <div className="relative inline-block">
                  <div className={`text-6xl font-bold ${getScoreColor()}`}>{score}</div>
                  <div className="text-xl font-medium text-muted-foreground">out of 100</div>
                </div>

                <div className="mt-4">
                  <Progress value={score} className={`h-2 ${getProgressColor()}`} />
                </div>

                <div className="mt-4 flex justify-center">
                  {score >= 90 ? (
                    <div className="flex items-center text-green-500">
                      <CheckCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Excellent Resume!</span>
                    </div>
                  ) : score >= 70 ? (
                    <div className="flex items-center text-amber-500">
                      <Sparkles className="h-5 w-5 mr-2" />
                      <span className="font-medium">Good Resume with Room for Improvement</span>
                    </div>
                  ) : (
                    <div className="flex items-center text-red-500">
                      <AlertCircle className="h-5 w-5 mr-2" />
                      <span className="font-medium">Needs Significant Improvement</span>
                    </div>
                  )}
                </div>
              </div>

              <div className="space-y-4">
                <h4 className="font-medium text-lg">Feedback & Suggestions</h4>
                <ul className="space-y-2">
                  {feedback.map((item, index) => (
                    <li key={index} className="flex items-start">
                      <Sparkles className="h-5 w-5 mr-2 text-primary flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            <div className="text-center py-8">
              <Button onClick={handleAnalyze}>
                <Sparkles className="h-4 w-4 mr-2" />
                Start Analysis
              </Button>
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {analysisComplete && (
            <Button onClick={handleAnalyze}>
              <Sparkles className="h-4 w-4 mr-2" />
              Re-Analyze
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
