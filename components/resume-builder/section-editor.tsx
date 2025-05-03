"use client"

import { useContext, useState } from "react"
import { ResumeContext } from "@/context/resume-context"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Switch } from "@/components/ui/switch"
import { Trash2, Plus, Sparkles, Loader2 } from "lucide-react"
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
import { ItemEditor } from "./item-editor"
import { v4 as uuidv4 } from "uuid"
import type { ResumeItem } from "@/types/resume"
import { AISuggestionDialog } from "./ai-suggestion-dialog"
import { useToast } from "@/components/ui/use-toast"
import type { ResumeSection } from "@/types/resume"

interface SectionEditorProps {
  sectionId: string
}

export function SectionEditor({ sectionId }: SectionEditorProps) {
  const { resumeData, updateSection, removeSection, aiSuggest } = useContext(ResumeContext)

  const { toast } = useToast()
  const [isGenerating, setIsGenerating] = useState(false)
  const [showAiDialog, setShowAiDialog] = useState(false)

  const section = resumeData.sections.find((s: ResumeSection) => s.id === sectionId)

  if (!section) {
    return <div>Section not found</div>
  }

  const handleTitleChange = (title: string) => {
    updateSection(sectionId, { title })
  }

  const handleVisibilityChange = (isVisible: boolean) => {
    updateSection(sectionId, { isVisible })
  }

  const handleContentChange = (content: string) => {
    updateSection(sectionId, { content })
  }

  const handleAddItem = () => {
    if (Array.isArray(section.content)) {
      const newItem: ResumeItem = {
        id: uuidv4(),
        title: "New Item",
        description: "",
        bullets: [""],
      }

      updateSection(sectionId, {
        content: [...section.content, newItem],
      })
    }
  }

  const handleUpdateItem = (itemId: string, updatedItem: Partial<ResumeItem>) => {
    if (Array.isArray(section.content)) {
      const updatedContent = section.content.map((item: ResumeItem) =>
        item.id === itemId ? { ...item, ...updatedItem } : item,
      )

      updateSection(sectionId, { content: updatedContent })
    }
  }

  const handleRemoveItem = (itemId: string) => {
    if (Array.isArray(section.content)) {
      const updatedContent = section.content.filter((item: ResumeItem) => item.id !== itemId)
      updateSection(sectionId, { content: updatedContent })
    }
  }

  const handleQuickAiSuggest = async () => {
    setIsGenerating(true)

    try {
      let prompt = ""

      switch (section.type) {
        case "summary":
          prompt = "Generate a professional summary that highlights my skills and experience."
          break
        case "skills":
          prompt = "Suggest a comprehensive list of skills for my resume."
          break
        case "experience":
          prompt = "Suggest bullet points for my most recent work experience."
          break
        default:
          prompt = `Suggest content for my ${section.title} section.`
      }

      const suggestion = await aiSuggest(sectionId, prompt)

      if (typeof section.content === "string") {
        updateSection(sectionId, { content: suggestion })
      } else if (section.content.length > 0) {
        // For array content, update the first item's description or bullets
        const firstItem = section.content[0]
        handleUpdateItem(firstItem.id, {
          description: suggestion,
          bullets: suggestion.split("\n").filter((line) => line.trim().length > 0),
        })
      }

      toast({
        title: "AI Suggestion Applied",
        description: "The content has been updated with AI suggestions.",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to generate AI suggestion. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <div className="space-y-6 bg-white dark:bg-gray-950 p-5 rounded-lg shadow-sm border border-gray-200 dark:border-gray-800 transition-all duration-300 hover:shadow-md group relative overflow-hidden">
      <div className="absolute -right-20 -top-20 w-40 h-40 bg-accent/5 rounded-full blur-2xl transform transition-transform duration-500 group-hover:scale-150"></div>
      <div className="flex items-center justify-between relative z-10">
        <h3 className="text-lg font-medium bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent flex items-center gap-2">
          <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse-subtle"></span>
          Edit {section.title}
        </h3>
        <div className="flex items-center space-x-2 bg-gray-50 dark:bg-gray-900 px-2 py-1 rounded-full">
          <Switch
            id="section-visible"
            checked={section.isVisible}
            onCheckedChange={handleVisibilityChange}
            className="data-[state=checked]:bg-accent"
          />
          <Label htmlFor="section-visible" className="text-sm text-gray-600 dark:text-gray-400">
            {section.isVisible ? "Visible" : "Hidden"}
          </Label>
        </div>
      </div>

      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="section-title" className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Section Title
          </Label>
          <Input
            id="section-title"
            value={section.title}
            onChange={(e) => handleTitleChange(e.target.value)}
            className="border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
          />
          {typeof section.content === "string" && section.content.trim() === "" && (
            <div className="mt-2 text-xs bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 p-2 rounded-md flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <span>
                Pro tip: A compelling {section.title.toLowerCase()} helps recruiters understand your value at a glance!
              </span>
            </div>
          )}

          {Array.isArray(section.content) && section.content.length === 0 && (
            <div className="mt-2 text-xs bg-amber-50 text-amber-800 dark:bg-amber-900/30 dark:text-amber-200 p-2 rounded-md flex items-start">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-4 w-4 mr-1.5 mt-0.5 flex-shrink-0"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"></path>
                <path d="m9 12 2 2 4-4"></path>
              </svg>
              <span>
                Pro tip: Adding detailed {section.title.toLowerCase()} items significantly increases your resume's
                impact!
              </span>
            </div>
          )}
        </div>

        {typeof section.content === "string" ? (
          <div className="space-y-2">
            <Label htmlFor="section-content" className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Content
            </Label>
            <Textarea
              id="section-content"
              value={section.content}
              onChange={(e) => handleContentChange(e.target.value)}
              className="min-h-[200px] border-gray-300 focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <Label className="text-sm font-medium text-gray-700 dark:text-gray-300">Items</Label>
              <Button
                variant="outline"
                size="sm"
                onClick={handleAddItem}
                className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 border-gray-300 hover:border-accent transition-colors"
              >
                <Plus className="h-4 w-4 mr-1" />
                Add Item
              </Button>
            </div>

            {section.content.length === 0 ? (
              <div className="text-center p-6 border rounded-md bg-gray-50 dark:bg-gray-900 border-dashed border-gray-300 dark:border-gray-700">
                <p className="text-muted-foreground mb-2">No items yet</p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="bg-white hover:bg-gray-50 dark:bg-gray-900 dark:hover:bg-gray-800 border-gray-300 hover:border-accent transition-colors"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Item
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                {section.content.map((item: ResumeItem, index: number) => (
                  <ItemEditor
                    key={item.id}
                    item={item}
                    index={index}
                    onUpdate={(updatedItem) => handleUpdateItem(item.id, updatedItem)}
                    onRemove={() => handleRemoveItem(item.id)}
                  />
                ))}

                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleAddItem}
                  className="w-full py-3 border-dashed bg-gray-50 hover:bg-gray-100 dark:bg-gray-900 dark:hover:bg-gray-800 border-gray-300 hover:border-accent group-hover:border-accent/50 transition-all duration-300"
                >
                  <Plus className="h-4 w-4 mr-1" />
                  Add Another{" "}
                  {section.type === "experience" ? "Experience" : section.type === "education" ? "Education" : "Item"}
                </Button>
              </div>
            )}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between pt-4 border-t border-gray-200 dark:border-gray-800">
        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button
              variant="outline"
              size="sm"
              className="text-red-500 border-red-200 hover:bg-red-50 hover:text-red-600 hover:border-red-300 transition-colors"
            >
              <Trash2 className="h-4 w-4 mr-1" />
              Delete Section
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800">
            <AlertDialogHeader>
              <AlertDialogTitle>Are you sure?</AlertDialogTitle>
              <AlertDialogDescription>
                This will permanently delete the "{section.title}" section and all its content.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel className="border-gray-300 hover:bg-gray-50">Cancel</AlertDialogCancel>
              <AlertDialogAction
                onClick={() => removeSection(sectionId)}
                className="bg-red-500 text-white hover:bg-red-600"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>

        <div className="flex space-x-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowAiDialog(true)}
            className="border-gray-300 hover:border-accent hover:text-accent transition-colors"
          >
            <Sparkles className="h-4 w-4 mr-1 text-amber-500" />
            AI Suggestions
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={handleQuickAiSuggest}
            disabled={isGenerating}
            className="bg-gradient-to-r from-purple-600 to-purple-700 hover:from-purple-700 hover:to-purple-800 text-white relative group overflow-hidden"
          >
            <div className="absolute inset-0 bg-white/10 transform translate-y-full group-hover:translate-y-0 transition-transform duration-300"></div>
            {isGenerating ? (
              <>
                <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                <span className="relative z-10">Generating...</span>
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4 mr-1 text-amber-300 animate-pulse-subtle" />
                <span className="relative z-10">Optimize with AI</span>
              </>
            )}
          </Button>
        </div>
      </div>

      <AISuggestionDialog
        open={showAiDialog}
        onOpenChange={setShowAiDialog}
        sectionId={sectionId}
        sectionType={section.type}
        sectionTitle={section.title}
      />
    </div>
  )
}
