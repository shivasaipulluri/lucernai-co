"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import {
  InfoIcon,
  Hash,
  ListChecks,
  GraduationCap,
  BarChart,
  Briefcase,
  Sparkles,
  Code,
  HeartHandshake,
  Award,
  CheckCircle2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

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
  const [activeTab, setActiveTab] = useState("keywords")
  const [animateKeywords, setAnimateKeywords] = useState(false)

  useEffect(() => {
    if (analysis && activeTab === "keywords") {
      setAnimateKeywords(true)
      const timer = setTimeout(() => setAnimateKeywords(false), 1000)
      return () => clearTimeout(timer)
    }
  }, [analysis, activeTab])

  if (isLoading) {
    return (
      <Card className={cn("animate-pulse shadow-lg border-0 bg-gradient-to-br from-blue-50 to-white", className)}>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center gap-2">
            <div className="h-5 w-40 bg-blue-200 rounded-full"></div>
          </CardTitle>
          <CardDescription>
            <div className="h-4 w-60 bg-blue-100 rounded-full"></div>
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="h-4 w-full bg-blue-100 rounded-full"></div>
            <div className="h-4 w-full bg-blue-100 rounded-full"></div>
            <div className="h-4 w-3/4 bg-blue-100 rounded-full"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (!analysis) {
    return null
  }

  const renderKeywordBadges = (keywords: string[], limit?: number, category?: string) => {
    const displayKeywords = limit ? keywords.slice(0, limit) : keywords
    const remaining = limit && keywords.length > limit ? keywords.length - limit : 0

    let badgeStyle = "text-blue-700 border-blue-200 transition-all duration-300 shadow-sm"

    if (category === "technical") {
      badgeStyle = "bg-purple-100 text-purple-700 border-purple-200 transition-all duration-300 shadow-sm"
    } else if (category === "soft") {
      badgeStyle = "bg-emerald-100 text-emerald-700 border-emerald-200 transition-all duration-300 shadow-sm"
    } else if (category === "certifications") {
      badgeStyle = "bg-amber-100 text-amber-700 border-amber-200 transition-all duration-300 shadow-sm"
    } else {
      badgeStyle = "bg-blue-100 text-blue-700 border-blue-200 transition-all duration-300 shadow-sm"
    }

    return (
      <div className="flex flex-wrap gap-2 mt-2">
        {displayKeywords.map((keyword, index) => (
          <motion.div
            key={index}
            initial={animateKeywords ? { scale: 0.8, opacity: 0 } : false}
            animate={animateKeywords ? { scale: 1, opacity: 1 } : false}
            transition={{ duration: 0.3, delay: index * 0.05 }}
          >
            <Badge
              variant="outline"
              className={cn("px-3 py-1 rounded-full text-sm font-medium whitespace-nowrap", badgeStyle)}
            >
              {keyword}
            </Badge>
          </motion.div>
        ))}
        {remaining > 0 && (
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <Badge
                  variant="outline"
                  className="bg-gray-100 text-gray-700 hover:bg-gray-200 transition-colors duration-300 rounded-full px-3 py-1"
                >
                  +{remaining} more
                </Badge>
              </TooltipTrigger>
              <TooltipContent className="bg-white border border-gray-200 shadow-xl p-3 rounded-lg">
                <div className="max-w-xs flex flex-wrap gap-2">
                  {keywords.slice(limit).map((keyword, index) => (
                    <Badge key={index} variant="outline" className={badgeStyle}>
                      {keyword}
                    </Badge>
                  ))}
                </div>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        )}
      </div>
    )
  }

  const renderListItem = (text: string, index: number) => (
    <motion.li
      key={index}
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3, delay: index * 0.05 }}
      className="flex items-start gap-2 mb-3"
    >
      <CheckCircle2 className="h-5 w-5 text-emerald-500 mt-0.5 flex-shrink-0" />
      <span className="text-gray-700">{text}</span>
    </motion.li>
  )

  return (
    <Card className={cn("overflow-hidden border shadow-md bg-white", className)}>
      <CardHeader className="pb-2 bg-blue-600 text-white">
        <CardTitle className="text-xl flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Briefcase className="h-5 w-5" />
            Job Analysis
          </div>
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger>
                <InfoIcon className="h-4 w-4 text-blue-100 hover:text-white transition-colors" />
              </TooltipTrigger>
              <TooltipContent
                side="left"
                className="bg-white text-gray-800 border border-gray-200 shadow-xl p-3 rounded-lg max-w-xs"
              >
                <p>AI-powered analysis of the job description to help with tailoring your resume for maximum impact</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>
        </CardTitle>
        <CardDescription className="text-blue-100">
          Intelligent insights extracted from the job description
        </CardDescription>
      </CardHeader>
      <CardContent className="pt-4 px-4 pb-6">
        <Card className="mb-6 overflow-hidden border shadow-sm bg-blue-500 text-white">
          <CardContent className="p-4">
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="h-4 w-4 text-yellow-300" />
              <CardTitle className="text-base font-medium">Job Description Intelligence</CardTitle>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-6 mt-2">
              <div className="flex items-center gap-2">
                <div className="bg-blue-700 text-white px-3 py-1 rounded-md">{analysis.role}</div>
              </div>
              <div className="text-sm">
                <span className="text-blue-100">Seniority:</span>{" "}
                <span className="font-medium text-white">{analysis.seniority}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="w-full overflow-x-auto pb-2">
          <Tabs defaultValue="keywords" value={activeTab} onValueChange={setActiveTab} className="mt-4 w-full">
            <TabsList className="mb-6 w-full bg-gray-100 p-1 rounded-lg h-auto flex flex-wrap">
              <TabsTrigger
                value="keywords"
                className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md rounded-md transition-all duration-300 px-3 py-2"
                onClick={() => setActiveTab("keywords")}
              >
                <Hash className="h-4 w-4" />
                Keywords
              </TabsTrigger>
              <TabsTrigger
                value="responsibilities"
                className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md rounded-md transition-all duration-300 px-3 py-2"
                onClick={() => setActiveTab("responsibilities")}
              >
                <ListChecks className="h-4 w-4" />
                Responsibilities
              </TabsTrigger>
              <TabsTrigger
                value="qualifications"
                className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md rounded-md transition-all duration-300 px-3 py-2"
                onClick={() => setActiveTab("qualifications")}
              >
                <GraduationCap className="h-4 w-4" />
                Qualifications
              </TabsTrigger>
              <TabsTrigger
                value="categories"
                className="flex items-center gap-1.5 data-[state=active]:bg-white data-[state=active]:text-blue-700 data-[state=active]:shadow-md rounded-md transition-all duration-300 px-3 py-2"
                onClick={() => setActiveTab("categories")}
              >
                <BarChart className="h-4 w-4" />
                Categories
              </TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3 }}
                className="min-h-[300px]"
              >
                <TabsContent value="keywords" className="space-y-4 mt-2">
                  <div>
                    <h3 className="text-base font-medium mb-3 flex items-center gap-2 text-blue-800">
                      <Hash className="h-5 w-5 text-blue-600" />
                      Key Skills & Keywords
                    </h3>
                    {renderKeywordBadges(analysis.keywords)}
                  </div>
                </TabsContent>

                <TabsContent value="responsibilities" className="space-y-4 mt-2">
                  <div>
                    <h3 className="text-base font-medium mb-3 flex items-center gap-2 text-blue-800">
                      <ListChecks className="h-5 w-5 text-blue-600" />
                      Key Responsibilities
                    </h3>
                    <ul className="text-sm space-y-1 list-none pl-0">
                      {analysis.responsibilities.map((resp, index) => renderListItem(resp, index))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="qualifications" className="space-y-4 mt-2">
                  <div>
                    <h3 className="text-base font-medium mb-3 flex items-center gap-2 text-blue-800">
                      <GraduationCap className="h-5 w-5 text-blue-600" />
                      Required Qualifications
                    </h3>
                    <ul className="text-sm space-y-1 list-none pl-0">
                      {analysis.qualifications.map((qual, index) => renderListItem(qual, index))}
                    </ul>
                  </div>
                </TabsContent>

                <TabsContent value="categories" className="mt-2">
                  <div>
                    <h3 className="text-base font-medium mb-4 flex items-center gap-2 text-blue-800">
                      <BarChart className="h-5 w-5 text-blue-600" />
                      Skill Categories
                    </h3>

                    <div className="grid grid-cols-1 gap-6">
                      {/* Technical Skills */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-purple-100 p-3">
                          <h4 className="text-sm font-medium flex items-center gap-2 text-purple-800">
                            <Code className="h-4 w-4 text-purple-600" />
                            Technical Skills
                          </h4>
                        </div>
                        <div className="p-4 bg-white">
                          {analysis.categories.technical.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {analysis.categories.technical.map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-purple-100 text-purple-700 border-purple-200 px-3 py-1 rounded-full text-sm font-medium"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No technical skills mentioned</p>
                          )}
                        </div>
                      </div>

                      {/* Soft Skills */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-emerald-100 p-3">
                          <h4 className="text-sm font-medium flex items-center gap-2 text-emerald-800">
                            <HeartHandshake className="h-4 w-4 text-emerald-600" />
                            Soft Skills
                          </h4>
                        </div>
                        <div className="p-4 bg-white">
                          {analysis.categories.soft.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {analysis.categories.soft.map((skill, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-emerald-100 text-emerald-700 border-emerald-200 px-3 py-1 rounded-full text-sm font-medium"
                                >
                                  {skill}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No soft skills mentioned</p>
                          )}
                        </div>
                      </div>

                      {/* Certifications */}
                      <div className="border rounded-lg overflow-hidden">
                        <div className="bg-amber-100 p-3">
                          <h4 className="text-sm font-medium flex items-center gap-2 text-amber-800">
                            <Award className="h-4 w-4 text-amber-600" />
                            Certifications
                          </h4>
                        </div>
                        <div className="p-4 bg-white">
                          {analysis.categories.certifications.length > 0 ? (
                            <div className="flex flex-wrap gap-2">
                              {analysis.categories.certifications.map((cert, index) => (
                                <Badge
                                  key={index}
                                  variant="outline"
                                  className="bg-amber-100 text-amber-700 border-amber-200 px-3 py-1 rounded-full text-sm font-medium"
                                >
                                  {cert}
                                </Badge>
                              ))}
                            </div>
                          ) : (
                            <p className="text-sm text-gray-500 italic">No specific certifications mentioned</p>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              </motion.div>
            </AnimatePresence>
          </Tabs>
        </div>
      </CardContent>
    </Card>
  )
}
