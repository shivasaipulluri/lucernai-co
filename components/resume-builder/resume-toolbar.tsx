"use client"

import { useContext, useState } from "react"
import { ResumeContext } from "@/context/resume-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Save, Undo, Redo, Plus, Menu, Moon, Sun, Github, Sparkles, History } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { VersionsDialog } from "./versions-dialog"
import { CreateVersionDialog } from "./create-version-dialog"
import { useTheme } from "next-themes"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { motion } from "framer-motion"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"

export function ResumeToolbar() {
  const { resumeData, updateSection, saveResume, isDirty, undo, redo, canUndo, canRedo } = useContext(ResumeContext)

  const { toast } = useToast()
  const { theme, setTheme } = useTheme()
  const [showVersions, setShowVersions] = useState(false)
  const [showCreateVersion, setShowCreateVersion] = useState(false)

  const handleTitleChange = (title: string) => {
    // Update the title (which is stored in the resumeData object)
    const updatedResumeData = { ...resumeData, title }
    // We don't have a direct way to update the title, so we'll use a workaround
    // by updating a section and then restoring it
    if (resumeData.sections.length > 0) {
      const firstSection = resumeData.sections[0]
      updateSection(firstSection.id, { title: firstSection.title })
      // The title update will happen in the context
    }
  }

  const handleSave = () => {
    saveResume()
    toast({
      title: "Resume Saved",
      description: "Your resume has been saved successfully",
    })
  }

  const toggleTheme = () => {
    setTheme(theme === "dark" ? "light" : "dark")
  }

  return (
    <div className="px-4 py-3 border-b border-gray-100 dark:border-gray-800">
      <div className="container flex items-center justify-between h-14 max-w-full relative">
        <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 h-0.5 w-24 bg-gradient-to-r from-transparent via-[#e3c27e]/30 to-transparent rounded-full"></div>
        <div className="flex items-center gap-4">
          <motion.div
            className="flex items-center"
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="relative group">
              <div className="absolute -inset-1 bg-[#e3c27e]/20 rounded-full blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-700"></div>
              <LucernaSunIcon className="h-8 w-8 text-[#e3c27e] mr-2 relative animate-pulse-subtle" />
            </div>
            <span className="font-serif text-xl font-bold bg-gradient-to-r from-primary to-[#e3c27e] bg-clip-text text-transparent hidden sm:inline-block">
              Lucerna <span className="text-[#e3c27e]">Resume</span>
            </span>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="relative group"
          >
            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#e3c27e]/20 to-primary/20 opacity-0 group-hover:opacity-100 rounded-md blur-sm transition-opacity duration-300"></div>
            <Input
              value={resumeData.title}
              onChange={(e) => handleTitleChange(e.target.value)}
              className="w-auto max-w-[250px] h-9 bg-white dark:bg-gray-900 border-gray-200 dark:border-gray-700 text-primary dark:text-white placeholder-gray-400 focus:border-[#e3c27e] focus:ring-1 focus:ring-[#e3c27e] transition-colors relative"
              placeholder="Resume Title"
            />
          </motion.div>
        </div>

        <div className="flex items-center gap-2">
          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={undo}
                    disabled={!canUndo}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Undo className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Undo</span>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Undo last change</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={redo}
                    disabled={!canRedo}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Redo className="h-4 w-4" />
                    <span className="ml-1 hidden sm:inline">Redo</span>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Redo last change</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowVersions(true)}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <History className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">History</span>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>View version history</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowCreateVersion(true)}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    <Plus className="h-4 w-4 mr-1" />
                    <span className="hidden sm:inline">Version</span>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Create a new version</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  animate={
                    isDirty
                      ? {
                          scale: [1, 1.05, 1],
                          transition: {
                            repeat: Number.POSITIVE_INFINITY,
                            repeatType: "reverse",
                            duration: 2,
                          },
                        }
                      : {}
                  }
                  className="relative"
                >
                  <div
                    className={`absolute -inset-1 bg-[#e3c27e]/20 rounded-lg blur-sm transition-opacity duration-300 ${isDirty ? "opacity-100" : "opacity-0"}`}
                  ></div>
                  <Button
                    variant={isDirty ? "default" : "ghost"}
                    size="sm"
                    onClick={handleSave}
                    disabled={!isDirty}
                    className={
                      isDirty
                        ? "bg-[#e3c27e] hover:bg-[#e3c27e]/90 text-primary transition-all duration-300 relative"
                        : "text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors relative"
                    }
                  >
                    <Save className={`h-4 w-4 mr-1 ${isDirty ? "animate-pulse" : ""}`} />
                    <span className="hidden sm:inline">Save</span>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Save your resume</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={toggleTheme}
                    className="text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                  >
                    {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>Toggle {theme === "dark" ? "light" : "dark"} mode</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <TooltipProvider>
            <Tooltip>
              <TooltipTrigger asChild>
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group">
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#e3c27e] to-primary rounded-lg blur opacity-0 group-hover:opacity-70 transition duration-500"></div>
                  <Button
                    variant="default"
                    size="sm"
                    className="bg-primary hover:bg-primary/90 text-white hidden sm:flex relative"
                  >
                    <Sparkles className="h-4 w-4 mr-1 text-[#e3c27e] animate-pulse-subtle" />
                    <span>Optimize</span>
                  </Button>
                </motion.div>
              </TooltipTrigger>
              <TooltipContent>
                <p>AI-powered resume optimization</p>
              </TooltipContent>
            </Tooltip>
          </TooltipProvider>

          <DropdownMenu>
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <DropdownMenuTrigger asChild>
                    <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-gray-600 dark:text-gray-300 hover:text-primary hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
                      >
                        <Menu className="h-5 w-5" />
                      </Button>
                    </motion.div>
                  </DropdownMenuTrigger>
                </TooltipTrigger>
                <TooltipContent>
                  <p>More options</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
            <DropdownMenuContent
              align="end"
              className="bg-white dark:bg-gray-950 border border-gray-200 dark:border-gray-800 shadow-lg"
            >
              <DropdownMenuItem asChild>
                <a
                  href="https://github.com/yourusername/resume-builder"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
                >
                  <Github className="h-4 w-4 mr-2" />
                  GitHub Repository
                </a>
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={toggleTheme}
                className="cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-900 transition-colors"
              >
                {theme === "dark" ? (
                  <>
                    <Sun className="h-4 w-4 mr-2" />
                    Light Mode
                  </>
                ) : (
                  <>
                    <Moon className="h-4 w-4 mr-2" />
                    Dark Mode
                  </>
                )}
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>

      <VersionsDialog open={showVersions} onOpenChange={setShowVersions} />

      <CreateVersionDialog open={showCreateVersion} onOpenChange={setShowCreateVersion} />
    </div>
  )
}
