"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { Button } from "@/components/ui/button"
import { InfoIcon, ChevronDown, ChevronUp, Briefcase, BarChart, ListChecks, GraduationCap, Hash } from "lucide-react"
import { cn } from "@/lib/utils"

interface JDAnalysisDisplayProps {
  analysis: {
    role: string
    seniority: string
    responsibilities: string[]
    qualifications: string[]
    keywords: string[]
    categories: {
      technical: string[]
      soft: string[]
      certifications: string[]
    }
  } | null
  isLoading?: boolean
  className?: string
  compact?: boolean
}

export function JDAnalysisDisplay({
  analysis,
  isLoading = false,
  className = "",
  compact = false,
}: JDAnalysisDisplayProps) {
  const [isOpen, setIsOpen] = useState(!compact)

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-5 w-40 bg-gray-200 rounded"></div>
          </CardTitle>
          <CardDescription>
            <div className="h-4 w-60 bg-gray-200 rounded"></div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-full bg-gray-200 rounded"></div>
            <div className="h-4 w-3/4 bg-gray-200 rounded"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return null
  }

  const renderKeywordBadges = (keywords: string[], limit?: number) => {
    const displayKeywords = limit ? keywords.slice(0, limit) : keywords
    const remaining = limit && keywords.length > limit ? keywords.length - limit : 0

    return (
      <div className="flex flex-wrap gap-2">
        {displayKeywords.map((keyword, index) => (
          <Badge key={index} variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
            {keyword}
          </Badge>
        ))}
        {remaining > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge variant="outline" className="bg-gray-100 text-gray-700">
                  +{remaining} more
                </Badge>
              </TooltipTrigger>
              <TooltipContent>
                <div className="max-w-xs">{keywords.slice(limit).join(", ")}</div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    )
  }

  if (compact) {
    return (
      <Collapsible open={isOpen} onOpenChange={setIsOpen} className={cn("border rounded-lg", className)}>
        <div className="p-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5 text-primary" />
            <div>
              <h3 className="font-medium">{analysis.role}</h3>
              <p className="text-sm text-gray-500">{analysis.seniority}</p>
            </div>
          </div>
          <CollapsibleTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0">
              {isOpen ? <ChevronUp className="h-4 w-4" /> : <ChevronDown className="h-4 w-4" />}
            </Button>
          </CollapsibleTrigger>
        </div>
        <CollapsibleContent>
          <div className="px-4 pb-4 pt-0">
            <div className="space-y-4">
              <div>
                <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                  <Hash className="h-3.5 w-3.5 text-gray-500" />
                  Key Skills
                </h4>
                {renderKeywordBadges(analysis.keywords, 8)}
              </div>

              <div>
                <h4 className="text-sm font-medium mb-1 flex items-center gap-1">
                  <ListChecks className="h-3.5 w-3.5 text-gray-500" />
                  Top Responsibilities
                </h4>
                <ul className="text-sm text-gray-600 space-y-1 list-disc list-inside">
                  {analysis.responsibilities.slice(0, 3).map((resp, index) => (
                    <li key={index}>{resp}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </CollapsibleContent>
      </Collapsible>
    )
  }

  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="text-lg flex items-center gap-2">
          Job Description Intelligence
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-gray-400" />
              </TooltipTrigger>
              <TooltipContent>
                <p className="max-w-xs">
                  AI-powered analysis of the job description to help with tailoring your resume
                </p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription>
          Detected role: <span className="font-medium">{analysis.role}</span> ({analysis.seniority})
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="keywords">
          <TabsList className="mb-4">
            <TabsTrigger value="keywords" className="flex items-center gap-1">
              <Hash className="h-3.5 w-3.5" />
              Keywords
            </TabsTrigger>
            <TabsTrigger value="responsibilities" className="flex items-center gap-1">
              <ListChecks className="h-3.5 w-3.5" />
              Responsibilities
            </TabsTrigger>
            <TabsTrigger value="qualifications" className="flex items-center gap-1">
              <GraduationCap className="h-3.5 w-3.5" />
              Qualifications
            </TabsTrigger>
            <TabsTrigger value="categories" className="flex items-center gap-1">
              <BarChart className="h-3.5 w-3.5" />
              Categories
            </TabsTrigger>
          </TabsList>

          <TabsContent value="keywords" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Key Skills & Keywords</h3>
              {renderKeywordBadges(analysis.keywords)}
            </div>
          </TabsContent>

          <TabsContent value="responsibilities" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Key Responsibilities</h3>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                {analysis.responsibilities.map((resp, index) => (
                  <li key={index}>{resp}</li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="qualifications" className="space-y-4">
            <div>
              <h3 className="text-sm font-medium mb-2">Required Qualifications</h3>
              <ul className="text-sm text-gray-600 space-y-2 list-disc list-inside">
                {analysis.qualifications.map((qual, index) => (
                  <li key={index}>{qual}</li>
                ))}
              </ul>
            </div>
          </TabsContent>

          <TabsContent value="categories" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Technical Skills</h3>
                {renderKeywordBadges(analysis.categories.technical)}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Soft Skills</h3>
                {renderKeywordBadges(analysis.categories.soft)}
              </div>
              <div className="space-y-2">
                <h3 className="text-sm font-medium">Certifications</h3>
                {analysis.categories.certifications.length > 0 ? (
                  renderKeywordBadges(analysis.categories.certifications)
                ) : (
                  <p className="text-sm text-gray-500">No specific certifications mentioned</p>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
