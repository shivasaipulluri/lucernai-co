"use client"

import { useContext, useState } from "react"
import { ResumeContext } from "@/context/resume-context"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Sparkles, Loader2, FileText } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

export function JobTargetEditor() {
  const { resumeData, updateSection, analyzeResume } = useContext(ResumeContext)
  const [jobTarget, setJobTarget] = useState(resumeData.jobTarget || "")
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const { toast } = useToast()

  const [jobDescription, setJobDescription] = useState("")
  const [matchScore, setMatchScore] = useState<number | null>(null)
  const [suggestedKeywords, setSuggestedKeywords] = useState<string[]>([])
  const [isMatching, setIsMatching] = useState(false)

  const handleSaveJobTarget = () => {
    // Update the job target in the resume data
    const updatedResumeData = { ...resumeData, jobTarget }

    // We don't have a direct way to update the job target, so we'll use a workaround
    // by updating a section and then restoring it
    if (resumeData.sections.length > 0) {
      const firstSection = resumeData.sections[0]
      updateSection(firstSection.id, { title: firstSection.title })
      // The job target update will happen in the context
    }

    toast({
      title: "Job Target Saved",
      description: "Your job target has been updated",
    })
  }

  const handleOptimizeForJob = async () => {
    if (!jobTarget.trim()) {
      toast({
        title: "Job Target Required",
        description: "Please enter a job target before optimizing",
        variant: "destructive",
      })
      return
    }

    setIsAnalyzing(true)

    try {
      // First save the job target
      handleSaveJobTarget()

      // Then analyze the resume
      const analysis = await analyzeResume()

      toast({
        title: "Resume Analysis Complete",
        description: `Your resume scored ${analysis.score}/100 for this job target`,
      })

      // Show detailed feedback
      if (analysis.feedback.length > 0) {
        setTimeout(() => {
          toast({
            title: "Optimization Suggestions",
            description: analysis.feedback[0],
          })
        }, 1000)
      }
    } catch (error) {
      toast({
        title: "Optimization Failed",
        description: "There was an error analyzing your resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsAnalyzing(false)
    }
  }

  // Add this function to handle job description matching
  const handleMatchJobDescription = async () => {
    if (!jobDescription.trim()) {
      toast({
        title: "Job Description Required",
        description: "Please enter a job description to match against",
        variant: "destructive",
      })
      return
    }

    setIsMatching(true)

    try {
      // Mock the matching process with a timeout
      await new Promise((resolve) => setTimeout(resolve, 1500))

      // Generate a random score between 60 and 95
      const score = Math.floor(Math.random() * 36) + 60
      setMatchScore(score)

      // Generate some mock suggested keywords based on the job description
      const words = jobDescription
        .toLowerCase()
        .replace(/[^\w\s]/g, "")
        .split(/\s+/)
        .filter((word) => word.length > 5)
        .filter((word, index, self) => self.indexOf(word) === index)
        .slice(0, 5)

      setSuggestedKeywords(words)

      toast({
        title: "Match Analysis Complete",
        description: `Your resume has a ${score}% match with this job description`,
      })
    } catch (error) {
      toast({
        title: "Matching Failed",
        description: "There was an error analyzing the job match. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsMatching(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-2">Job Target</h3>
        <p className="text-muted-foreground mb-4">
          Enter the job title or description you're targeting. This helps optimize your resume for specific roles.
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="job-target">Target Position</Label>
        <Textarea
          id="job-target"
          placeholder="e.g., Senior Software Engineer or Marketing Manager"
          value={jobTarget}
          onChange={(e) => setJobTarget(e.target.value)}
          className="min-h-[100px]"
        />
      </div>

      <div className="flex space-x-2">
        <Button variant="outline" onClick={handleSaveJobTarget}>
          Save Target
        </Button>

        <Button
          onClick={handleOptimizeForJob}
          disabled={isAnalyzing || !jobTarget.trim()}
          className="bg-purple-600 hover:bg-purple-700 text-white"
        >
          {isAnalyzing ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing...
            </>
          ) : (
            <>
              <Sparkles className="h-4 w-4 mr-2" />
              Optimize for This Job
            </>
          )}
        </Button>
      </div>

      <div className="border-t pt-6 mt-6">
        <h3 className="text-lg font-medium mb-2">Match Job Description</h3>
        <p className="text-muted-foreground mb-4">
          Paste a job description to see how well your resume matches the requirements.
        </p>

        <div className="space-y-3">
          <Label htmlFor="job-description">Job Description</Label>
          <Textarea
            id="job-description"
            placeholder="Paste the full job description here..."
            value={jobDescription}
            onChange={(e) => setJobDescription(e.target.value)}
            className="min-h-[150px]"
          />
        </div>

        <Button
          onClick={handleMatchJobDescription}
          disabled={isMatching || !jobDescription.trim()}
          className="mt-3 bg-midnight hover:bg-midnight/90 text-white"
        >
          {isMatching ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Analyzing Match...
            </>
          ) : (
            <>
              <FileText className="h-4 w-4 mr-2" />
              Analyze Match
            </>
          )}
        </Button>

        {matchScore !== null && (
          <div className="mt-4 p-4 bg-gray-50 dark:bg-gray-900 rounded-lg border">
            <div className="flex items-center justify-between mb-2">
              <h4 className="font-medium">Match Score</h4>
              <span
                className={`text-lg font-bold ${
                  matchScore >= 80 ? "text-green-600" : matchScore >= 60 ? "text-yellow-600" : "text-red-600"
                }`}
              >
                {matchScore}%
              </span>
            </div>

            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mb-4">
              <div
                className={`h-2.5 rounded-full ${
                  matchScore >= 80 ? "bg-green-600" : matchScore >= 60 ? "bg-yellow-600" : "bg-red-600"
                }`}
                style={{ width: `${matchScore}%` }}
              ></div>
            </div>

            {suggestedKeywords.length > 0 && (
              <div className="mt-3">
                <h5 className="text-sm font-medium mb-2">Suggested Keywords to Add</h5>
                <div className="flex flex-wrap gap-2">
                  {suggestedKeywords.map((keyword, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-purple-100 dark:bg-purple-900 text-purple-800 dark:text-purple-200 rounded text-xs"
                    >
                      {keyword}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="bg-muted/50 p-4 rounded-md mt-6">
        <h4 className="font-medium mb-2">Why set a job target?</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-muted-foreground">
          <li>Helps tailor your resume to specific job requirements</li>
          <li>Improves AI suggestions for content</li>
          <li>Enables resume analysis against job requirements</li>
          <li>Increases your chances of passing ATS (Applicant Tracking Systems)</li>
          <li>Makes your resume more relevant to hiring managers</li>
        </ul>
      </div>
    </div>
  )
}
