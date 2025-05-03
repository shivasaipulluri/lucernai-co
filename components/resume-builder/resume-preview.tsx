"use client"

import { useContext, useEffect, useState, useRef } from "react"
import { ResumeContext } from "@/context/resume-context"
import { Button } from "@/components/ui/button"
import { Download, Printer, Copy, Check, FileText, FileCode, FileIcon as FilePdf, Share2, Search } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { useToast } from "@/components/ui/use-toast"
import { ResumeDocument } from "./resume-document"
import { ResumeAnalysisDialog } from "./resume-analysis-dialog"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import type { ResumeSection, ResumeItem } from "@/types/resume"

export function ResumePreview() {
  const { resumeData, exportToPdf, exportToWord, exportToText } = useContext(ResumeContext)
  const previewRef = useRef<HTMLDivElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const { toast } = useToast()
  const [copied, setCopied] = useState(false)
  const [isExporting, setIsExporting] = useState(false)
  const [exportType, setExportType] = useState<string | null>(null)
  const [showAnalysis, setShowAnalysis] = useState(false)
  const [previewScale, setPreviewScale] = useState(1)
  const [highlightedSection, setHighlightedSection] = useState<string | null>(null)

  // Handle window resize to adjust preview scale
  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current || !previewRef.current) return

      const containerWidth = containerRef.current.clientWidth
      const containerHeight = containerRef.current.clientHeight

      // A4 aspect ratio is 1:1.414 (width:height)
      const a4Width = 210 * 3.78 // Convert mm to px (approximate)
      const a4Height = 297 * 3.78

      // Calculate scale based on container dimensions with some padding
      const widthScale = (containerWidth - 40) / a4Width
      const heightScale = (containerHeight - 40) / a4Height

      // Use the smaller scale to ensure the entire document fits
      const scale = Math.min(widthScale, heightScale, 1)

      setPreviewScale(scale)
    }

    handleResize()

    // Add resize observer for more accurate resizing
    const resizeObserver = new ResizeObserver(handleResize)
    if (containerRef.current) {
      resizeObserver.observe(containerRef.current)
    }

    window.addEventListener("resize", handleResize)
    return () => {
      window.removeEventListener("resize", handleResize)
      resizeObserver.disconnect()
    }
  }, [])

  // Monitor changes to resumeData to highlight updated sections
  useEffect(() => {
    const sections = resumeData.sections
    const lastUpdatedSection = sections[sections.length - 1]?.id

    if (lastUpdatedSection) {
      setHighlightedSection(lastUpdatedSection)
      setTimeout(() => setHighlightedSection(null), 2000)
    }
  }, [resumeData])

  const handleExport = async (type: "pdf" | "docx" | "txt") => {
    setIsExporting(true)
    setExportType(type)

    try {
      let dataUrl = ""
      let filename: string

      if (type === "pdf") {
        const pdfResult = await exportToPdf()
        dataUrl = typeof pdfResult === "string" ? pdfResult : ""
        filename = `${resumeData.title.replace(/\s+/g, "_")}.pdf`
      } else if (type === "docx") {
        const docxResult = await exportToWord()
        dataUrl = typeof docxResult === "string" ? docxResult : ""
        filename = `${resumeData.title.replace(/\s+/g, "_")}.docx`
      } else {
        const textResult = exportToText()
        dataUrl = typeof textResult === "string" ? textResult : ""
        filename = `${resumeData.title.replace(/\s+/g, "_")}.txt`
      }

      if (!dataUrl) {
        throw new Error(`Failed to generate ${type} file`)
      }

      // Create a link and trigger download
      const link = document.createElement("a")
      link.href = dataUrl
      link.download = filename
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)

      toast({
        title: "Export Successful",
        description: `Your resume has been exported as ${type.toUpperCase()}`,
      })
    } catch (error) {
      console.error("Export error:", error)
      toast({
        title: "Export Failed",
        description: "There was an error exporting your resume. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
      setExportType(null)
    }
  }

  const handleCopyToClipboard = async () => {
    try {
      // Convert resume data to plain text
      const sections = resumeData.sections
        .filter((section: ResumeSection) => section.isVisible)
        .sort((a: ResumeSection, b: ResumeSection) => a.order - b.order)

      let text = `${resumeData.title}\n\n`

      sections.forEach((section: ResumeSection) => {
        text += `${section.title}\n`

        if (typeof section.content === "string") {
          text += `${section.content}\n\n`
        } else {
          section.content.forEach((item: ResumeItem) => {
            text += `${item.title}`
            if (item.organization) text += ` - ${item.organization}`
            text += "\n"

            if (item.startDate) {
              const endDate = item.current ? "Present" : item.endDate
              text += `${item.startDate} - ${endDate}`
            }

            if (item.location) {
              if (item.startDate) text += " | "
              text += item.location
            }

            if (item.startDate || item.location) text += "\n"

            if (item.description) text += `${item.description}\n`

            if (item.bullets && item.bullets.length > 0) {
              item.bullets.forEach((bullet: string) => {
                text += `• ${bullet}\n`
              })
            }

            text += "\n"
          })
        }
      })

      await navigator.clipboard.writeText(text)
      setCopied(true)

      toast({
        title: "Copied to Clipboard",
        description: "Your resume has been copied to the clipboard",
      })

      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Copy Failed",
        description: "There was an error copying your resume. Please try again.",
        variant: "destructive",
      })
    }
  }

  const handlePrint = () => {
    window.print()
  }

  return (
    <div className="flex flex-col h-full w-full">
      {/* Preview Header */}
      <motion.div
        className="flex justify-between items-center p-4 bg-white/95 dark:bg-gray-950/95 backdrop-blur-sm sticky top-0 z-10 border-b border-gray-200 dark:border-gray-800"
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h3 className="font-medium text-primary dark:text-white flex items-center">
          <FileText className="h-4 w-4 mr-2 text-accent" />
          <span className="bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">Preview</span>
        </h3>
        <div className="flex items-center space-x-2">
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAnalysis(true)}
              className="border-gray-200 hover:border-accent hover:text-accent transition-colors"
            >
              <FileText className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Analyze</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handlePrint}
              className="border-gray-200 hover:border-accent hover:text-accent transition-colors"
            >
              <Printer className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Print</span>
            </Button>
          </motion.div>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyToClipboard}
              disabled={copied}
              className="border-gray-200 hover:border-accent hover:text-accent transition-colors"
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-1 text-green-500" />
                  <span className="hidden sm:inline">Copied</span>
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-1" />
                  <span className="hidden sm:inline">Copy</span>
                </>
              )}
            </Button>
          </motion.div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-primary/20 to-primary/10 rounded-lg blur opacity-0 group-hover:opacity-100 transition duration-500"></div>
                <Button
                  variant="default"
                  size="sm"
                  disabled={isExporting}
                  className="relative bg-primary hover:bg-primary/90 text-white"
                >
                  {isExporting ? (
                    <>
                      <div className="animate-spin mr-1 h-4 w-4 border-2 border-current border-t-transparent rounded-full" />
                      <span className="hidden sm:inline">Exporting...</span>
                    </>
                  ) : (
                    <>
                      <Download className="h-4 w-4 mr-1" />
                      <span className="hidden sm:inline">Export</span>
                    </>
                  )}
                </Button>
              </motion.div>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="border border-gray-200 shadow-md">
              <DropdownMenuItem onClick={() => handleExport("pdf")} className="hover:bg-gray-50 cursor-pointer">
                <FilePdf className="h-4 w-4 mr-2 text-red-500" />
                Export as PDF
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("docx")} className="hover:bg-gray-50 cursor-pointer">
                <FileText className="h-4 w-4 mr-2 text-blue-500" />
                Export as Word
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleExport("txt")} className="hover:bg-gray-50 cursor-pointer">
                <FileCode className="h-4 w-4 mr-2 text-gray-500" />
                Export as Text
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} className="hidden sm:block">
            <Button
              variant="ghost"
              size="sm"
              className="border-gray-200 hover:border-accent hover:text-accent transition-colors"
            >
              <Share2 className="h-4 w-4 mr-1" />
              <span className="hidden sm:inline">Share</span>
            </Button>
          </motion.div>
        </div>
      </motion.div>

      {/* Preview Content - Full height with centered document */}
      <div ref={containerRef} className="flex-1 flex items-center justify-center overflow-auto">
        <div className="absolute inset-0 pointer-events-none flex items-center justify-center z-10 opacity-0 hover:opacity-100 transition-opacity duration-300">
          <Search className="h-12 w-12 text-accent/30" />
          <span className="text-accent/30 text-lg ml-2">Click to zoom in</span>
        </div>

        <motion.div
          ref={previewRef}
          className="bg-white dark:bg-gray-900 shadow-lg print:shadow-none cursor-zoom-in"
          style={{
            width: "210mm", // A4 width
            height: "297mm", // A4 height
            transform: `scale(${previewScale})`,
            transformOrigin: "center center",
            position: "relative",
          }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <ResumeDocument resumeData={resumeData} highlightedSection={highlightedSection} />

          {/* Confetti effect when resume is complete */}
          {resumeData.sections.filter((s) => s.isVisible).length > 0 &&
            resumeData.sections.every(
              (s) =>
                (typeof s.content === "string" && s.content.trim().length > 0) ||
                (Array.isArray(s.content) && s.content.length > 0),
            ) && (
              <motion.div
                className="absolute inset-0 pointer-events-none overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.5 }}
              >
                <div className="absolute top-0 left-1/4 w-2 h-2 bg-accent rounded-full animate-fall-slow"></div>
                <div className="absolute top-0 left-1/2 w-3 h-3 bg-primary rounded-full animate-fall-medium"></div>
                <div className="absolute top-0 left-3/4 w-2 h-2 bg-accent rounded-full animate-fall-fast"></div>
                <div className="absolute top-0 left-1/3 w-2 h-2 bg-primary rounded-full animate-fall-slow-2"></div>
                <div className="absolute top-0 left-2/3 w-3 h-3 bg-accent rounded-full animate-fall-medium-2"></div>
              </motion.div>
            )}

          {/* Page overflow warning */}
          <div
            className={cn(
              "absolute bottom-4 right-4 bg-red-50 text-red-800 dark:bg-red-900 dark:text-red-200 px-3 py-2 rounded-md text-sm flex items-center gap-2 opacity-0 transition-opacity duration-300 shadow-sm",
              resumeData.sections.filter((s) => s.isVisible).length > 5 ? "opacity-100" : "opacity-0",
            )}
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            Content may overflow to page 2
          </div>
        </motion.div>
      </div>

      <ResumeAnalysisDialog open={showAnalysis} onOpenChange={setShowAnalysis} />
    </div>
  )
}
