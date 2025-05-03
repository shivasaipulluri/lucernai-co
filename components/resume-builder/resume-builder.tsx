"use client"

import { useState, useEffect } from "react"
import { ResumeEditor } from "./resume-editor"
import { ResumePreview } from "./resume-preview"
import { ResumeToolbar } from "./resume-toolbar"
import { ResumeContext } from "@/context/resume-context"
import { useResumeState } from "@/hooks/use-resume-state"
import { useToast } from "@/components/ui/use-toast"
import { Toaster } from "@/components/ui/toaster"
import { ThemeProvider } from "@/components/theme-provider"
import { LoadingScreen } from "./loading-screen"
import { WelcomeModal } from "./welcome-modal"
import { Analytics } from "@/components/analytics"
import { Button } from "@/components/ui/button"
import { Edit, Eye } from "lucide-react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface ResumeBuilderProps {
  userId: string
}

export function ResumeBuilder({ userId }: ResumeBuilderProps) {
  const resumeState = useResumeState(userId)
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(true)
  const [showWelcome, setShowWelcome] = useState(false)
  const [showPreviewOnMobile, setShowPreviewOnMobile] = useState(false)
  const [scrolled, setScrolled] = useState(false)

  // Handle scroll events
  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  // Simulate loading and check if it's the user's first visit
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false)

      // Check if this is the first visit
      const hasVisitedBefore = localStorage.getItem("hasVisitedResumeMaker")
      if (!hasVisitedBefore) {
        setShowWelcome(true)
        localStorage.setItem("hasVisitedResumeMaker", "true")
      }
    }, 1500)

    return () => clearTimeout(timer)
  }, [])

  // Auto-save functionality
  useEffect(() => {
    const autoSaveInterval = setInterval(() => {
      if (resumeState.isDirty) {
        resumeState.saveResume()
        toast({
          title: "Auto-saved",
          description: "Your resume has been automatically saved",
          duration: 2000,
        })
      }
    }, 30000) // Auto-save every 30 seconds if there are changes

    return () => clearInterval(autoSaveInterval)
  }, [resumeState, toast])

  const handleSave = () => {
    resumeState.saveResume()
    toast({
      title: "Resume Saved",
      description: "Your resume has been saved successfully",
      duration: 2000,
    })
  }

  if (isLoading) {
    return <LoadingScreen />
  }

  // Calculate completion percentage
  const totalSections = resumeState.resumeData.sections.length
  const completedSections = resumeState.resumeData.sections.filter((section) => {
    if (typeof section.content === "string") {
      return section.content.trim().length > 0
    }
    return section.content.length > 0
  }).length

  const completionPercentage = Math.round((completedSections / totalSections) * 100)

  return (
    <ThemeProvider>
      <ResumeContext.Provider value={resumeState}>
        {/* Full-screen container with flex layout - no padding, margin, or max-width */}
        <div className="w-full h-screen flex flex-col overflow-hidden bg-gradient-to-br from-gray-50 to-white dark:from-gray-900 dark:to-gray-950">
          {/* Main Toolbar */}
          <motion.div
            className={cn(
              "z-50 border-b bg-white/95 backdrop-blur-sm dark:bg-gray-950/95 transition-all duration-300 sticky top-0",
              scrolled ? "shadow-md" : "",
            )}
            initial={{ y: -10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ duration: 0.3 }}
          >
            <ResumeToolbar />
          </motion.div>

          {/* Main content area - Horizontal Flex Layout */}
          <div className="flex flex-1 overflow-hidden">
            {/* Editor - fixed width on desktop, full width on mobile when active */}
            <motion.div
              className={cn(
                "lg:w-[30%] lg:min-w-[300px] lg:max-w-[500px] flex-shrink-0 overflow-y-auto border-r border-gray-100 dark:border-gray-800",
                showPreviewOnMobile ? "hidden" : "w-full",
                "lg:block",
              )}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5 }}
            >
              <ResumeEditor />
            </motion.div>

            {/* Preview - flex-grow to take remaining space, full width on mobile when active */}
            <motion.div
              className={cn("flex-grow min-w-0 overflow-hidden", showPreviewOnMobile ? "w-full" : "hidden", "lg:block")}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <ResumePreview />
            </motion.div>
          </div>

          {/* Mobile toggle buttons */}
          <div className="lg:hidden fixed bottom-4 left-1/2 transform -translate-x-1/2 z-40 flex space-x-4 bg-white dark:bg-gray-800 shadow-lg rounded-full p-2">
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
              <Button
                onClick={() => setShowPreviewOnMobile(false)}
                variant={!showPreviewOnMobile ? "default" : "outline"}
                size="sm"
                className={cn("rounded-full px-4", !showPreviewOnMobile ? "bg-primary text-white" : "")}
              >
                <Edit className="h-4 w-4 mr-2" />
                Edit
              </Button>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3, delay: 0.1 }}
            >
              <Button
                onClick={() => setShowPreviewOnMobile(true)}
                variant={showPreviewOnMobile ? "default" : "outline"}
                size="sm"
                className={cn("rounded-full px-4", showPreviewOnMobile ? "bg-primary text-white" : "")}
              >
                <Eye className="h-4 w-4 mr-2" />
                Preview
              </Button>
            </motion.div>
          </div>

          {/* Completion indicator */}
          <motion.div
            className="fixed bottom-20 right-4 lg:bottom-4 z-40"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 1, type: "spring" }}
          >
            <div className="relative h-16 w-16 flex items-center justify-center group">
              <svg className="h-16 w-16 transform -rotate-90 transition-all duration-500">
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  className="text-gray-200 dark:text-gray-700"
                />
                <circle
                  cx="32"
                  cy="32"
                  r="28"
                  stroke="currentColor"
                  strokeWidth="4"
                  fill="transparent"
                  strokeDasharray={28 * 2 * Math.PI}
                  strokeDashoffset={28 * 2 * Math.PI * (1 - completionPercentage / 100)}
                  className={`text-[#e3c27e] transition-all duration-1000 ${
                    completionPercentage === 100 ? "animate-pulse" : ""
                  }`}
                />
              </svg>
              <div className="absolute inset-0 flex items-center justify-center">
                <span
                  className={`text-sm font-medium transition-all duration-300 ${
                    completionPercentage === 100 ? "scale-110 text-[#e3c27e] font-bold" : ""
                  }`}
                >
                  {completionPercentage}%
                </span>
              </div>
              {completionPercentage === 100 && (
                <motion.div
                  className="absolute inset-0"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ duration: 0.5 }}
                >
                  <span className="absolute -top-8 left-1/2 transform -translate-x-1/2 whitespace-nowrap bg-[#e3c27e]/20 text-[#e3c27e] px-2 py-1 rounded-full text-xs font-medium opacity-0 group-hover:opacity-100 transition-opacity">
                    Resume Complete!
                  </span>
                </motion.div>
              )}
            </div>
          </motion.div>

          {/* Progress Badge */}
          <motion.div
            className="fixed top-20 right-4 z-40 hidden lg:block"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.5, duration: 0.5 }}
          >
            <div
              className={`px-3 py-1.5 rounded-full text-xs font-medium flex items-center gap-1.5 ${
                completionPercentage < 30
                  ? "bg-amber-100 text-amber-800"
                  : completionPercentage < 70
                    ? "bg-blue-100 text-blue-800"
                    : "bg-green-100 text-green-800"
              }`}
            >
              <span
                className={`w-2 h-2 rounded-full ${
                  completionPercentage < 30
                    ? "bg-amber-500"
                    : completionPercentage < 70
                      ? "bg-blue-500"
                      : "bg-green-500"
                } animate-pulse`}
              ></span>
              {completionPercentage < 30
                ? "Getting Started"
                : completionPercentage < 70
                  ? "Making Progress"
                  : completionPercentage === 100
                    ? "Ready to Apply!"
                    : "Almost There!"}
            </div>
          </motion.div>

          <Analytics />
          <Toaster />
          {showWelcome && <WelcomeModal onClose={() => setShowWelcome(false)} />}
        </div>
      </ResumeContext.Provider>
    </ThemeProvider>
  )
}
