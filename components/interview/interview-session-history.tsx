"use client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { formatDistanceToNow } from "date-fns"
import { Brain, Code, Briefcase, PuzzleIcon as PuzzlePiece, Clock, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface InterviewSessionHistoryProps {
  sessions: any[]
  onSessionSelect: (id: string) => void
}

export function InterviewSessionHistory({ sessions, onSessionSelect }: InterviewSessionHistoryProps) {
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

  return (
    <div className="space-y-6">
      <h2 className="text-2xl font-serif">Interview Session History</h2>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="p-8 text-center">
            <h3 className="text-xl font-medium mb-2">No Interview Sessions Yet</h3>
            <p className="text-gray-500 mb-6">
              You haven't created any interview practice sessions yet. Generate questions to start practicing.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {sessions.map((session) => (
            <Card key={session.id} className="hover:shadow-md transition-shadow">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg line-clamp-2">{session.jobDescription.substring(0, 100)}...</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {session.selectedTypes.map((type: string) => (
                    <Badge key={type} variant="outline" className={cn("flex items-center gap-1", getTypeColor(type))}>
                      {getTypeIcon(type)}
                      {type}
                    </Badge>
                  ))}
                </div>

                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock className="h-3 w-3 mr-1" />
                    {formatDistanceToNow(new Date(session.createdAt), { addSuffix: true })}
                  </div>
                  <div>{Array.isArray(session.questions) && <span>{session.questions.length} questions</span>}</div>
                </div>

                <Button
                  onClick={() => onSessionSelect(session.id)}
                  className="w-full flex items-center justify-center gap-2"
                >
                  Continue Session
                  <ArrowRight className="h-4 w-4" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
