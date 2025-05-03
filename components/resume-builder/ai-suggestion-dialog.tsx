"use client"

import { useContext, useState, useCallback } from "react"
import { ResumeContext } from "@/context/resume-context"
import type { ResumeSectionType, ResumeSection } from "@/types/resume"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Loader2, Sparkles } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface AISuggestionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  sectionId: string
  sectionType: ResumeSectionType
  sectionTitle: string
}

export function AISuggestionDialog({
  open,
  onOpenChange,
  sectionId,
  sectionType,
  sectionTitle,
}: AISuggestionDialogProps) {
  const { resumeData, updateSection, aiSuggest } = useContext(ResumeContext)
  const { toast } = useToast()

  const getDefaultPrompt = useCallback(
    (type: ResumeSectionType): string => {
      switch (type) {
        case "summary":
          return "Generate a professional summary that highlights my skills and experience as a software engineer with 5 years of experience."
        case "experience":
          return "Suggest bullet points for my role as a Senior Software Engineer at Tech Solutions Inc., focusing on leadership and technical achievements."
        case "skills":
          return "Generate a comprehensive list of technical skills for a full-stack developer, including programming languages, frameworks, and tools."
        case "education":
          return "Help me describe my Computer Science degree from University of Technology, including relevant coursework and achievements."
        default:
          return `Suggest content for my ${sectionTitle} section.`
      }
    },
    [sectionTitle],
  )

  const [prompt, setPrompt] = useState(getDefaultPrompt(sectionType))
  const [suggestion, setSuggestion] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)

  const handleGenerateSuggestion = async () => {
    if (!prompt.trim()) {
      toast({
        title: "Prompt Required",
        description: "Please enter a prompt for the AI suggestion",
        variant: "destructive",
      })
      return
    }

    setIsGenerating(true)

    try {
      const result = await aiSuggest(sectionId, prompt)
      setSuggestion(result)
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "There was an error generating the suggestion. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  const handleApplySuggestion = () => {
    if (!suggestion.trim()) return

    const section = resumeData.sections.find((s: ResumeSection) => s.id === sectionId)
    if (!section) return

    if (typeof section.content === "string") {
      updateSection(sectionId, { content: suggestion })
    } else if (section.content.length > 0) {
      // For array content, we'll need to update the items
      // This is a simplified approach - in a real app, you might want to
      // parse the suggestion more intelligently
      const firstItem = section.content[0]
      const updatedContent = [...section.content]
      updatedContent[0] = {
        ...firstItem,
        description: suggestion,
        bullets: suggestion.split("\n").filter((line) => line.trim().length > 0),
      }

      updateSection(sectionId, { content: updatedContent })
    }

    toast({
      title: "Suggestion Applied",
      description: "The AI suggestion has been applied to your resume",
    })

    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>AI Suggestions for {sectionTitle}</DialogTitle>
          <DialogDescription>Describe what you want the AI to generate for this section.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="ai-prompt">Your Prompt</Label>
            <Textarea
              id="ai-prompt"
              placeholder="e.g., Generate a professional summary highlighting my experience in software development..."
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              className="min-h-[100px]"
            />
          </div>

          <Button onClick={handleGenerateSuggestion} disabled={isGenerating || !prompt.trim()} className="w-full">
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                Generating...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-2" />
                Generate Suggestion
              </>
            )}
          </Button>

          {suggestion && (
            <div className="space-y-2 mt-4">
              <Label htmlFor="ai-suggestion">AI Suggestion</Label>
              <Textarea
                id="ai-suggestion"
                value={suggestion}
                onChange={(e) => setSuggestion(e.target.value)}
                className="min-h-[200px]"
              />
            </div>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleApplySuggestion} disabled={!suggestion.trim()}>
            Apply Suggestion
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
