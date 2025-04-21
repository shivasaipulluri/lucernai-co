import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"
import { BarChart3, Upload, FileText, HelpCircle } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

export function EmptyAnalyticsState() {
  return (
    <Card className="border-dashed">
      <CardContent className="flex flex-col items-center justify-center py-16 px-4 text-center">
        <div className="relative mb-6">
          <LucernaSunIcon size={64} glowing={true} className="animate-pulse-slow" />
          <div className="absolute -right-3 -top-3">
            <BarChart3 className="h-6 w-6 text-primary opacity-70" />
          </div>
        </div>

        <h2 className="text-2xl font-bold text-gray-800 mb-3 font-serif">Your Analytics Journey Begins</h2>

        <p className="text-gray-600 max-w-md mb-6">
          As you tailor resumes, generate cover letters, and optimize LinkedIn profiles, we'll illuminate your progress
          with powerful insights and trends.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 w-full max-w-2xl mb-8">
          <Card className="bg-gray-50 p-4 flex flex-col items-center text-center">
            <Upload className="h-8 w-8 text-primary mb-2" />
            <h3 className="text-sm font-medium mb-1">Upload & Tailor</h3>
            <p className="text-xs text-gray-500">Start by tailoring your first resume</p>
          </Card>

          <Card className="bg-gray-50 p-4 flex flex-col items-center text-center">
            <FileText className="h-8 w-8 text-primary mb-2" />
            <h3 className="text-sm font-medium mb-1">Create Content</h3>
            <p className="text-xs text-gray-500">Generate cover letters and optimize profiles</p>
          </Card>

          <Card className="bg-gray-50 p-4 flex flex-col items-center text-center">
            <BarChart3 className="h-8 w-8 text-primary mb-2" />
            <h3 className="text-sm font-medium mb-1">Track Progress</h3>
            <p className="text-xs text-gray-500">Watch your metrics improve over time</p>
          </Card>
        </div>

        <div className="flex flex-col sm:flex-row gap-3">
          <Button asChild>
            <Link href="/dashboard">Get Started</Link>
          </Button>

          <Dialog>
            <DialogTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                <HelpCircle className="h-4 w-4" />
                How Analytics Work
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>How Lucerna AI Analytics Work</DialogTitle>
                <DialogDescription>Understanding your performance metrics and insights</DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div>
                  <h3 className="font-medium mb-1">Resume Performance</h3>
                  <p className="text-sm text-gray-600">
                    We track ATS compatibility scores, job description alignment, and golden rule compliance across all
                    your tailored resumes.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Iteration Improvements</h3>
                  <p className="text-sm text-gray-600">
                    See how your scores improve with each version and refinement of your resume.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Content Analytics</h3>
                  <p className="text-sm text-gray-600">
                    Track metrics for cover letters and LinkedIn optimizations to understand what works best.
                  </p>
                </div>

                <div>
                  <h3 className="font-medium mb-1">Usage Patterns</h3>
                  <p className="text-sm text-gray-600">
                    Discover your most productive times and preferred tailoring modes.
                  </p>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  )
}
