"use client"

import { useState, useContext } from "react"
import { ResumeContext } from "@/context/resume-context"
import { SectionEditor } from "./section-editor"
import { Button } from "@/components/ui/button"
import { PlusCircle, ChevronDown, Sparkles } from "lucide-react"
import { AddSectionDialog } from "./add-section-dialog"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { StyleEditor } from "./style-editor"
import { JobTargetEditor } from "./job-target-editor"
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ResumeSection } from "@/types/resume"

export function ResumeEditor() {
  const { resumeData, activeSection, setActiveSection, reorderSections } = useContext(ResumeContext)

  const [showAddSection, setShowAddSection] = useState(false)
  const [activeTab, setActiveTab] = useState<string>("sections")

  const handleDragEnd = (result: any) => {
    if (!result.destination) return

    const { source, destination } = result
    reorderSections(source.index, destination.index)
  }

  const visibleSections = resumeData.sections
    .filter((section: ResumeSection) => section.isVisible)
    .sort((a: ResumeSection, b: ResumeSection) => a.order - b.order)

  const orderedSections = resumeData.sections.sort((a, b) => a.order - b.order)

  return (
    <div className="h-full overflow-y-auto scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-700 scrollbar-track-transparent">
      <motion.div
        className="p-4"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center">
            <div className="w-1.5 h-8 bg-primary rounded-full mr-3 hidden md:block"></div>
            <h2 className="text-2xl font-serif font-bold dark:text-white bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
              Resume Editor
            </h2>
          </div>
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group">
            <div className="absolute -inset-1 bg-gradient-to-r from-accent/30 to-primary/30 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
            <Button
              onClick={() => setShowAddSection(true)}
              variant="outline"
              className="relative border-accent text-accent hover:bg-accent/10 transition-colors"
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Section
            </Button>
          </motion.div>
        </div>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-3 w-full mb-4 p-1 bg-gray-100/80 dark:bg-gray-800/80 rounded-xl">
            <TabsTrigger
              value="sections"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
            >
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                Content
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="style"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
            >
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="3"></circle>
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path>
                </svg>
                Style
              </span>
            </TabsTrigger>
            <TabsTrigger
              value="job-target"
              className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700 data-[state=active]:text-primary data-[state=active]:shadow-sm rounded-lg transition-all duration-300"
            >
              <span className="flex items-center">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4 mr-1.5"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <circle cx="12" cy="12" r="6"></circle>
                  <circle cx="12" cy="12" r="2"></circle>
                </svg>
                Job Target
              </span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="sections" className="mt-0 space-y-6">
            <AnimatePresence>
              {orderedSections.map((section, index) => (
                <motion.div
                  key={section.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, height: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                  className="group"
                >
                  <Collapsible
                    className={cn(
                      "border rounded-lg overflow-hidden transition-all duration-300",
                      activeSection === section.id
                        ? "border-accent shadow-md ring-2 ring-accent/20"
                        : "border-gray-200 dark:border-gray-700 hover:border-accent/40 group-hover:shadow-sm",
                    )}
                  >
                    <CollapsibleTrigger className="flex items-center justify-between w-full p-4 bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors">
                      <div className="flex items-center">
                        {section.isVisible ? (
                          <span className="w-2 h-2 rounded-full bg-accent mr-2"></span>
                        ) : (
                          <span className="w-2 h-2 rounded-full bg-gray-300 dark:bg-gray-600 mr-2"></span>
                        )}
                        <span className="font-medium">{section.title}</span>
                        {!section.isVisible && (
                          <span className="ml-2 text-xs bg-gray-100 dark:bg-gray-800 text-gray-500 dark:text-gray-400 px-2 py-0.5 rounded">
                            Hidden
                          </span>
                        )}
                      </div>
                      <div className="flex items-center">
                        {/* Empty section indicator */}
                        {(typeof section.content === "string" && section.content.trim() === "") ||
                        (Array.isArray(section.content) && section.content.length === 0) ? (
                          <span className="mr-3 text-xs bg-amber-50 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2 py-0.5 rounded-full flex items-center">
                            <Sparkles className="h-3 w-3 mr-1" />
                            Add content
                          </span>
                        ) : null}
                        <ChevronDown className="h-5 w-5 text-gray-500 transition-transform ui-open:rotate-180" />
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="p-0">
                      <div className="p-4 border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900">
                        <SectionEditor sectionId={section.id} />
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                </motion.div>
              ))}
            </AnimatePresence>

            {orderedSections.length === 0 && (
              <motion.div
                className="flex items-center justify-center p-12 border-2 border-dashed border-gray-300 dark:border-gray-700 rounded-lg bg-gray-50/50 dark:bg-gray-900/50"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="text-center">
                  <div className="relative w-20 h-20 mx-auto mb-4">
                    <motion.div
                      className="absolute inset-0 bg-accent/10 rounded-full"
                      animate={{
                        scale: [1, 1.1, 1],
                        opacity: [0.5, 0.8, 0.5],
                      }}
                      transition={{
                        duration: 3,
                        repeat: Number.POSITIVE_INFINITY,
                        repeatType: "reverse",
                      }}
                    />
                    <Sparkles className="h-12 w-12 text-accent mx-auto relative z-10" />
                  </div>
                  <h3 className="text-lg font-medium text-gray-700 dark:text-gray-300 mb-2">Let's tell your story!</h3>
                  <p className="text-gray-500 dark:text-gray-400 mb-4">Add sections to build your perfect resume</p>
                  <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="inline-block">
                    <Button
                      onClick={() => setShowAddSection(true)}
                      variant="default"
                      className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white"
                    >
                      <PlusCircle className="mr-2 h-4 w-4" />
                      Add Your First Section
                    </Button>
                  </motion.div>
                </div>
              </motion.div>
            )}
          </TabsContent>

          <TabsContent value="style" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <StyleEditor />
            </motion.div>
          </TabsContent>

          <TabsContent value="job-target" className="mt-0">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.3 }}
              className="bg-white dark:bg-gray-900 p-6 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm"
            >
              <JobTargetEditor />
            </motion.div>
          </TabsContent>
        </Tabs>
      </motion.div>

      <AddSectionDialog open={showAddSection} onOpenChange={setShowAddSection} />
    </div>
  )
}
