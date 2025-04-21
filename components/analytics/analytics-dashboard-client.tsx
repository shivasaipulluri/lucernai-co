"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"
import type { AnalyticsData, TimeRange } from "@/lib/types"
import { getAnalyticsData, updateAnalyticsPreferences } from "@/lib/actions/analytics-actions"
import { ResumeStatsSection } from "./resume-stats-section"
import { ResumeIterationTrends } from "./resume-iteration-trends"
import { CoverLetterInsights } from "./cover-letter-insights"
import { LinkedInInsights } from "./linkedin-insights"
import { TopPerformingResumes } from "./top-performing-resumes"
import { InfoIcon as InfoCircle, Calendar, Download, LinkIcon, Mail } from "lucide-react"
import { TailoringModeChart } from "./tailoring-mode-chart"
import { GoldenRuleChart } from "./golden-rule-chart"
import { ToneDistributionChart } from "./tone-distribution-chart"
import { EmptyAnalyticsState } from "./empty-analytics-state"
import {
  exportAnalyticsSummary,
  generateShareableLink,
  emailAnalyticsSummary,
} from "@/lib/actions/analytics-export-actions"
import { Button } from "@/components/ui/button"
import { useToast } from "@/components/ui/use-toast"

interface AnalyticsDashboardClientProps {
  initialData: AnalyticsData
  userId: string
}

export function AnalyticsDashboardClient({ initialData, userId }: AnalyticsDashboardClientProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData>(initialData)
  const [timeRange, setTimeRange] = useState<TimeRange>("all")
  const [viewMode, setViewMode] = useState<"compact" | "detailed">("detailed")
  const [activeTab, setActiveTab] = useState("overview")
  const [isLoading, setIsLoading] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [isGeneratingLink, setIsGeneratingLink] = useState(false)
  const [isEmailing, setIsEmailing] = useState(false)
  const { toast } = useToast()

  // Fetch analytics data when time range changes
  useEffect(() => {
    const fetchData = async () => {
      setIsLoading(true)
      try {
        const data = await getAnalyticsData(userId, timeRange)
        setAnalyticsData(data)
      } catch (error) {
        console.error("Error fetching analytics data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchData()
  }, [timeRange, userId])

  // Update user preferences when view mode or time range changes
  useEffect(() => {
    updateAnalyticsPreferences(timeRange, viewMode).catch(console.error)
  }, [timeRange, viewMode])

  // Handle time range change
  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as TimeRange)
  }

  // Handle view mode change
  const handleViewModeChange = (checked: boolean) => {
    setViewMode(checked ? "detailed" : "compact")
  }

  // Get time range display text
  const getTimeRangeText = () => {
    switch (timeRange) {
      case "7days":
        return "Last 7 Days"
      case "30days":
        return "Last 30 Days"
      case "all":
        return "All Time"
      default:
        return "All Time"
    }
  }

  // Handle export PDF
  const handleExportPDF = async () => {
    setIsExporting(true)
    try {
      const result = await exportAnalyticsSummary(userId, timeRange, viewMode)
      if (result.success) {
        window.open(result.url, "_blank")
        toast({
          title: "Export successful",
          description: "Your analytics summary has been exported as a PDF",
        })
      } else {
        throw new Error(result.error || "Export failed")
      }
    } catch (error: any) {
      toast({
        title: "Export failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  // Handle generate shareable link
  const handleGenerateLink = async () => {
    setIsGeneratingLink(true)
    try {
      const result = await generateShareableLink(userId, timeRange)
      if (result.success) {
        await navigator.clipboard.writeText(result.url)
        toast({
          title: "Link copied to clipboard",
          description: "Shareable link has been copied to your clipboard",
        })
      } else {
        throw new Error(result.error || "Failed to generate link")
      }
    } catch (error: any) {
      toast({
        title: "Link generation failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsGeneratingLink(false)
    }
  }

  // Handle email to self
  const handleEmailToSelf = async () => {
    setIsEmailing(true)
    try {
      const result = await emailAnalyticsSummary(userId, timeRange, viewMode)
      if (result.success) {
        toast({
          title: "Email sent",
          description: "Analytics summary has been emailed to you",
        })
      } else {
        throw new Error(result.error || "Failed to send email")
      }
    } catch (error: any) {
      toast({
        title: "Email failed",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsEmailing(false)
    }
  }

  return (
    <div className="container-wide py-12">
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <LucernaSunIcon size={32} glowing={true} />
            <h1 className="text-3xl font-serif">Analytics Dashboard</h1>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-gray-500" />
              <Select value={timeRange} onValueChange={handleTimeRangeChange}>
                <SelectTrigger className="w-[140px]">
                  <SelectValue placeholder="Time Range" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7days">Last 7 Days</SelectItem>
                  <SelectItem value="30days">Last 30 Days</SelectItem>
                  <SelectItem value="all">All Time</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="view-mode" className="text-sm text-gray-500">
                Detailed View
              </Label>
              <Switch id="view-mode" checked={viewMode === "detailed"} onCheckedChange={handleViewModeChange} />
            </div>
          </div>
        </div>
        <p className="text-gray-600 mt-2">
          Track your resume performance and optimization metrics for {getTimeRangeText().toLowerCase()}.
        </p>
      </div>

      {!analyticsData.hasData ? (
        <EmptyAnalyticsState />
      ) : (
        <>
          <div className="flex justify-end mb-4 gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleExportPDF}
              disabled={isExporting}
              className="flex items-center gap-1"
            >
              <Download className="h-4 w-4" />
              {isExporting ? "Exporting..." : "Export PDF"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleGenerateLink}
              disabled={isGeneratingLink}
              className="flex items-center gap-1"
            >
              <LinkIcon className="h-4 w-4" />
              {isGeneratingLink ? "Generating..." : "Copy Link"}
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleEmailToSelf}
              disabled={isEmailing}
              className="flex items-center gap-1"
            >
              <Mail className="h-4 w-4" />
              {isEmailing ? "Sending..." : "Email to Self"}
            </Button>
          </div>

          <Tabs defaultValue="overview" value={activeTab} onValueChange={setActiveTab}>
            <TabsList className="mb-6">
              <TabsTrigger value="overview">Overview</TabsTrigger>
              <TabsTrigger value="resumes">Resumes</TabsTrigger>
              <TabsTrigger value="cover-letters">Cover Letters</TabsTrigger>
              <TabsTrigger value="linkedin">LinkedIn</TabsTrigger>
            </TabsList>

            <TabsContent value="overview" className="space-y-6">
              <ResumeStatsSection data={analyticsData.resumeStats} isLoading={isLoading} viewMode={viewMode} />

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Resume Iteration Trends
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Shows how your resume scores change across versions</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ResumeIterationTrends data={analyticsData.resumeIterationTrends} isLoading={isLoading} />
                  </CardContent>
                </Card>

                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      Tailoring Mode Usage
                      <TooltipProvider>
                        <Tooltip>
                          <TooltipTrigger>
                            <InfoCircle className="h-4 w-4 text-gray-400" />
                          </TooltipTrigger>
                          <TooltipContent>
                            <p className="max-w-xs">Distribution of tailoring modes used across your resumes</p>
                          </TooltipContent>
                        </Tooltip>
                      </TooltipProvider>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    {analyticsData.tailoringModeUsage.length > 0 ? (
                      <div className="h-[300px]">
                        <TailoringModeChart data={analyticsData.tailoringModeUsage} isLoading={isLoading} />
                      </div>
                    ) : (
                      <div className="flex items-center justify-center h-[300px] text-gray-400">
                        No tailoring mode data available
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <CoverLetterInsights data={analyticsData.coverLetterStats} isLoading={isLoading} viewMode={viewMode} />
                <LinkedInInsights data={analyticsData.linkedInStats} isLoading={isLoading} viewMode={viewMode} />
              </div>

              {viewMode === "detailed" && (
                <TopPerformingResumes data={analyticsData.topPerformingResumes} isLoading={isLoading} />
              )}
            </TabsContent>

            <TabsContent value="resumes">
              <div className="space-y-6">
                <ResumeStatsSection data={analyticsData.resumeStats} isLoading={isLoading} viewMode="detailed" />

                <Card>
                  <CardHeader>
                    <CardTitle>Resume Iteration Trends</CardTitle>
                    <CardDescription>How your resume scores change across versions</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[400px]">
                      <ResumeIterationTrends
                        data={analyticsData.resumeIterationTrends}
                        isLoading={isLoading}
                        showLegend={true}
                      />
                    </div>
                  </CardContent>
                </Card>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tailoring Mode Usage</CardTitle>
                      <CardDescription>Distribution of tailoring modes used</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <TailoringModeChart
                          data={analyticsData.tailoringModeUsage}
                          isLoading={isLoading}
                          showLabels={true}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Golden Rule Compliance</CardTitle>
                      <CardDescription>Resumes passing all quality rules</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <GoldenRuleChart data={analyticsData.goldenRuleStats} isLoading={isLoading} />
                      </div>
                    </CardContent>
                  </Card>
                </div>

                <TopPerformingResumes data={analyticsData.topPerformingResumes} isLoading={isLoading} />
              </div>
            </TabsContent>

            <TabsContent value="cover-letters">
              <div className="space-y-6">
                <CoverLetterInsights data={analyticsData.coverLetterStats} isLoading={isLoading} viewMode="detailed" />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Tone Distribution</CardTitle>
                      <CardDescription>Cover letter tones used</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="h-[300px]">
                        <ToneDistributionChart
                          data={analyticsData.coverLetterStats.toneBreakdown}
                          isLoading={isLoading}
                        />
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Word Count Analysis</CardTitle>
                      <CardDescription>Word count distribution across cover letters</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-col items-center justify-center h-[300px]">
                        <div className="text-5xl font-bold text-primary mb-2">
                          {analyticsData.coverLetterStats.avgWordCount}
                        </div>
                        <div className="text-sm text-gray-500">Average words per cover letter</div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="linkedin">
              <LinkedInInsights data={analyticsData.linkedInStats} isLoading={isLoading} viewMode="detailed" />
            </TabsContent>
          </Tabs>
        </>
      )}
    </div>
  )
}
