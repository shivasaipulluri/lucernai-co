"use client"

import { useState, useEffect } from "react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Textarea } from "@/components/ui/textarea"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  BookmarkPlus,
  BookmarkCheck,
  Brain,
  Code,
  Briefcase,
  PuzzleIcon as PuzzlePiece,
  Mic,
  MicOff,
} from "lucide-react"
import type { InterviewQuestion, InterviewAnswer } from "@/lib/actions/interview-actions"
import { cn } from "@/lib/utils"

interface InterviewQuestionListProps {
  questions: InterviewQuestion[]
  answers: InterviewAnswer[]
  needsReview: number[]
  onAnswerChange: (questionId: number, answer: string) => void
  onNeedsReviewToggle: (questionId: number) => void
}

// Declare SpeechRecognition interface
declare global {
  interface Window {
    SpeechRecognition: any
    webkitSpeechRecognition: any
  }
}

export function InterviewQuestionList({
  questions,
  answers,
  needsReview,
  onAnswerChange,
  onNeedsReviewToggle,
}: InterviewQuestionListProps) {
  const [expandedItems, setExpandedItems] = useState<string[]>([])
  const [isRecording, setIsRecording] = useState<boolean>(false)
  const [activeQuestionId, setActiveQuestionId] = useState<number | null>(null)
  const [recognition, setRecognition] = useState<any>(null)
  const [isRecognitionSupported, setIsRecognitionSupported] = useState<boolean>(true)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== "undefined") {
      // Check if the browser supports SpeechRecognition
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition

      if (SpeechRecognition) {
        const recognitionInstance = new SpeechRecognition()
        recognitionInstance.continuous = true
        recognitionInstance.interimResults = true
        recognitionInstance.lang = "en-US"

        recognitionInstance.onresult = (event: any) => {
          if (activeQuestionId) {
            const transcript = Array.from(event.results)
              .map((result: any) => result[0].transcript)
              .join("")

            // Get the current answer
            const currentAnswer = getAnswer(activeQuestionId)

            // Update with the new transcript
            onAnswerChange(activeQuestionId, currentAnswer + " " + transcript)
          }
        }

        recognitionInstance.onerror = (event: { error: any }) => {
          console.error("Speech recognition error", event.error)
          setIsRecording(false)
        }

        recognitionInstance.onend = () => {
          setIsRecording(false)
        }

        setRecognition(recognitionInstance)
      } else {
        setIsRecognitionSupported(false)
      }
    }

    // Cleanup
    return () => {
      if (recognition) {
        recognition.stop()
      }
    }
  }, [activeQuestionId])

  // Toggle speech recognition
  const toggleRecording = (questionId: number) => {
    if (!recognition) return

    if (isRecording && activeQuestionId === questionId) {
      recognition.stop()
      setIsRecording(false)
      setActiveQuestionId(null)
    } else {
      // Stop any existing recording
      if (isRecording) {
        recognition.stop()
      }

      // Start new recording for this question
      setActiveQuestionId(questionId)
      recognition.start()
      setIsRecording(true)
    }
  }

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
            isRecording && activeQuestionId === question.id && "border-red-300 shadow-md",
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
                {isRecording && activeQuestionId === question.id && (
                  <Badge variant="outline" className="bg-red-50 text-red-700 border-red-200 animate-pulse">
                    Recording
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
                className={cn(
                  "min-h-[150px]",
                  isRecording && activeQuestionId === question.id && "border-red-300 shadow-sm",
                )}
              />
              <div className="flex justify-between items-center">
                <div className="flex gap-2">
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

                  {isRecognitionSupported && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => toggleRecording(question.id)}
                      className={cn(
                        "flex items-center gap-1",
                        isRecording && activeQuestionId === question.id && "bg-red-50 text-red-700 border-red-200",
                      )}
                    >
                      {isRecording && activeQuestionId === question.id ? (
                        <>
                          <MicOff className="h-4 w-4" />
                          Stop Recording
                        </>
                      ) : (
                        <>
                          <Mic className="h-4 w-4" />
                          Record Answer
                        </>
                      )}
                    </Button>
                  )}
                </div>

                <div className="text-xs text-gray-500">
                  {getAnswer(question.id).length > 0 ? (
                    <span>Answer: {getAnswer(question.id).length} characters</span>
                  ) : (
                    <span>No answer yet</span>
                  )}
                </div>
              </div>

              {!isRecognitionSupported && (
                <div className="text-xs text-amber-600 mt-2">
                  Voice recording is not supported in your browser. Please use Chrome, Edge, or Safari for this feature.
                </div>
              )}

              {isRecording && activeQuestionId === question.id && (
                <div className="text-sm text-red-600 mt-2 flex items-center gap-2">
                  <span className="inline-block h-2 w-2 bg-red-600 rounded-full animate-pulse"></span>
                  Recording in progress... Speak clearly into your microphone.
                </div>
              )}
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
