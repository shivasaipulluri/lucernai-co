"use client"

import { useState } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { BookmarkPlus, BookmarkCheck, Brain, Code, Briefcase, PuzzleIcon as PuzzlePiece } from "lucide-react"
import type { InterviewQuestion, InterviewAnswer } from "@/lib/actions/interview-actions"
import { cn } from "@/lib/utils"

interface InterviewQuestionListProps {
  questions: InterviewQuestion[]
  answers: InterviewAnswer[]
  needsReview: number[]
  onAnswerChange: (questionId: number, answer: string) => void
  onNeedsReviewToggle: (questionId: number) => void
}

export function InterviewQuestionList({
  questions,
  answers,
  needsReview,
  onAnswerChange,
  onNeedsReviewToggle,
}: InterviewQuestionListProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])

  // Get the icon for a question type
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "Behavioral":
        return <Brain className="h-4 w-4 text-blue-500" />
      case "Technical":
        return <Code className="h-4 w-4 text-green-500" />
      case "Role-Specific":
        return <Briefcase className="h-4 w-4 text-purple-500" />
      case "Case-Based":
        return <PuzzlePiece className="h-4 w-4 text-amber-500" />
      default:
        return <Brain className="h-4 w-4 text-blue-500" />
    }
  }

  // Get the color for a question type
  const getTypeColor = (type: string) => {
    switch (type) {
      case "Behavioral":
        return "bg-blue-50 text-blue-700 border-blue-200"
      case "Technical":
        return "bg-green-50 text-green-700 border-green-200"
      case "Role-Specific":
        return "bg-purple-50 text-purple-700 border-purple-200"
      case "Case-Based":
        return "bg-amber-50 text-amber-700 border-amber-200"
      default:
        return "bg-gray-50 text-gray-700 border-gray-200"
    }
  }

  // Get the answer for a question
  const getAnswer = (questionId: number) => {
    const answer = answers.find((a) => a.questionId === questionId)
    return answer ? answer.answer : ""
  }

  // Check if a question needs review
  const needsReviewCheck = (questionId: number) => {
    return needsReview.includes(questionId)
  }

  // Handle accordion state change
  const handleAccordionChange = (value: string[]) => {
    setExpandedItems(value)
  }

  return (
    <Accordion type="multiple" value={expandedItems} onValueChange={handleAccordionChange} className="space-y-4">
      {questions.map((question) => (
        <AccordionItem
          key={question.id}
          value={`question-${question.id}`}
          className={cn(
            "border rounded-lg overflow-hidden",
            needsReviewCheck(question.id) && "border-amber-300 shadow-sm",
          )}
        >
          <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-gray-50">
            <div className="flex items-center justify-between w-full text-left">
              <div className="flex items-center gap-2">
                {getTypeIcon(question.type)}
                <span className="font-medium">{question.question}</span>
              </div>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className={cn("ml-2", getTypeColor(question.type))}>
                  {question.type}
                </Badge>
                {needsReviewCheck(question.id) && (
                  <Badge variant="outline" className="bg-amber-50 text-amber-700 border-amber-200">
                    Review
                  </Badge>
                )}
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="px-4 py-3 border-t">
            <div className="space-y-4">
              <Textarea
                placeholder="Type your answer here..."
                value={getAnswer(question.id)}
                onChange={(e) => onAnswerChange(question.id, e.target.value)}
                className="min-h-[150px]"
              />
              <div className="flex justify-between items-center">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onNeedsReviewToggle(question.id)}
                  className={cn(
                    "flex items-center gap-1",
                    needsReviewCheck(question.id) && "bg-amber-50 text-amber-700 border-amber-200",
                  )}
                >
                  {needsReviewCheck(question.id) ? (
                    <>
                      <BookmarkCheck className="h-4 w-4" />
                      Remove from Review
                    </>
                  ) : (
                    <>
                      <BookmarkPlus className="h-4 w-4" />
                      Mark for Review
                    </>
                  )}
                </Button>
                <div className="text-xs text-gray-500">
                  {getAnswer(question.id).length > 0 ? (
                    <span>Answer: {getAnswer(question.id).length} characters</span>
                  ) : (
                    <span>No answer yet</span>
                  )}
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
