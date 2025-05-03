"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { ContentPreviewModal } from "./content-preview-modal"
import { Search } from "lucide-react"
import type { ResumeData, ResumeItem } from "@/types/resume"

interface ResumeDocumentProps {
  resumeData: ResumeData
  highlightedSection?: string | null
}

export function ResumeDocument({ resumeData, highlightedSection }: ResumeDocumentProps) {
  const { sections, style } = resumeData
  const [previewOpen, setPreviewOpen] = useState(false)
  const [isHovering, setIsHovering] = useState(false)

  // Sort sections by order and filter out invisible ones
  const visibleSections = sections.filter((section) => section.isVisible).sort((a, b) => a.order - b.order)

  // Style mappings - update these to use more professional styling
  const fontFamilyClass =
    {
      Inter: "font-sans",
      Georgia: "font-serif",
      Roboto: "font-sans",
      Merriweather: "font-serif",
      Montserrat: "font-sans",
    }[style.fontFamily] || "font-sans"

  const fontSizeClass =
    {
      small: "text-sm",
      medium: "text-base",
      large: "text-lg",
    }[style.fontSize] || "text-base"

  const lineHeightClass = {
    tight: "leading-tight",
    normal: "leading-normal",
    relaxed: "leading-relaxed",
  }[style.lineHeight || "normal"]

  // Update color classes to use Lucerna branding
  const colorClass =
    {
      blue: "text-primary",
      green: "text-green-600",
      purple: "text-purple-700",
      red: "text-red-600",
      gray: "text-gray-700",
      gold: "text-[#e3c27e]",
    }[style.color] || "text-[#e3c27e]"

  const spacingClass =
    {
      compact: "space-y-2",
      normal: "space-y-3",
      spacious: "space-y-5",
    }[style.spacing] || "space-y-3"

  const themeClass =
    {
      light: "bg-white text-gray-900",
      dark: "bg-gray-900 text-white",
      professional: "bg-white text-gray-900",
      creative: "bg-white text-gray-900",
      minimal: "bg-white text-gray-900",
    }[style.theme] || "bg-white text-gray-900"

  const headingStyleClass = {
    normal: "",
    uppercase: "uppercase",
    capitalize: "capitalize",
  }[style.headingStyle || "normal"]

  const headingSizeClass = {
    small: "text-base",
    medium: "text-lg",
    large: "text-xl",
  }[style.headingSize || "medium"]

  const dividerStyleClass = {
    line: "border-b",
    dots: "border-dotted border-b",
    none: "",
  }[style.dividerStyle || "line"]

  const bulletStyleClass = {
    disc: "list-disc",
    circle: "list-circle",
    square: "list-square",
  }[style.bulletStyle || "disc"]

  const nameStyleClass = {
    normal: "",
    uppercase: "uppercase",
    bold: "font-bold",
  }[style.nameStyle || "normal"]

  const nameSizeClass = {
    small: "text-2xl",
    medium: "text-3xl",
    large: "text-4xl",
  }[style.nameSize || "medium"]

  const headerAlignmentClass = {
    left: "text-left",
    center: "text-center",
    right: "text-right",
  }[style.headerAlignment || "center"]

  const dateAlignmentClass = {
    left: "justify-start",
    right: "justify-end",
    inline: "justify-start",
  }[style.dateAlignment || "right"]

  // Format date helper
  const formatDate = (dateString?: string) => {
    if (!dateString) return ""
    if (dateString === "Present") return "Present"

    try {
      const [year, month] = dateString.split("-")
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)

      const format = style.dateFormat || "MMM YYYY"

      if (format === "MM/YYYY") {
        return `${(date.getMonth() + 1).toString().padStart(2, "0")}/${date.getFullYear()}`
      } else if (format === "YYYY-MM") {
        return `${date.getFullYear()}-${(date.getMonth() + 1).toString().padStart(2, "0")}`
      } else {
        return date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
      }
    } catch (e) {
      return dateString
    }
  }

  // Handle click to show full resume preview
  const handleResumeClick = () => {
    setPreviewOpen(true)
  }

  // Render contact section with appropriate layout
  const renderContactSection = (section: any) => {
    const contactLayout = style.contactLayout || "inline"

    if (contactLayout === "stacked") {
      return (
        <div className="flex flex-col gap-2">
          {typeof section.content === "string" ? (
            <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">{section.content}</div>
          ) : (
            <div className="space-y-2">
              {section.content.map((item: any) => (
                <div key={item.id} className="flex flex-col">
                  <div className="font-medium">{item.title}</div>
                  <div className="text-sm text-gray-600">{item.description}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    } else if (contactLayout === "minimal") {
      return (
        <div className="text-sm text-gray-600 flex flex-wrap gap-x-4 gap-y-1 justify-center">
          {typeof section.content === "string" ? (
            <div>{section.content}</div>
          ) : (
            section.content.map((item: any) => <div key={item.id}>{item.title}</div>)
          )}
        </div>
      )
    } else {
      // Default inline layout
      return (
        <div className="flex flex-wrap gap-x-4 gap-y-2 justify-center">
          {typeof section.content === "string" ? (
            <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">{section.content}</div>
          ) : (
            section.content.map((item: any) => (
              <div key={item.id} className="flex items-center">
                {style.showContactIcons && <span className="mr-1 text-accent">•</span>}
                <span>{item.title}</span>
              </div>
            ))
          )}
        </div>
      )
    }
  }

  // Render skills section with appropriate style
  const renderSkillsSection = (section: any) => {
    const displayStyle = style.skillsDisplayStyle || "badges"

    if (displayStyle === "bars") {
      return (
        <div className="space-y-3">
          {typeof section.content === "string" ? (
            <div className="whitespace-pre-line">{section.content}</div>
          ) : (
            section.content.map((item: any) => (
              <div key={item.id} className="space-y-1">
                <div className="flex justify-between">
                  <span className="font-medium">{item.title}</span>
                  {style.showSkillLevel && <span className="text-sm text-gray-600">Advanced</span>}
                </div>
                <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                  <div
                    className={`h-full ${colorClass} bg-current opacity-80 rounded-full`}
                    style={{ width: "75%" }}
                  ></div>
                </div>
              </div>
            ))
          )}
        </div>
      )
    } else {
      // Default badges layout
      return (
        <div className="flex flex-wrap gap-2">
          {typeof section.content === "string" ? (
            <div className="whitespace-pre-line">{section.content}</div>
          ) : (
            section.content.map((item: any) => (
              <span
                key={item.id}
                className={`px-3 py-1 rounded-full text-sm ${colorClass} bg-current bg-opacity-10 border border-current`}
              >
                <span className="text-inherit mix-blend-darken dark:mix-blend-screen">{item.title}</span>
              </span>
            ))
          )}
        </div>
      )
    }
  }

  // Update the return statement with improved styling
  return (
    <>
      <div
        className={`p-8 ${themeClass} ${fontFamilyClass} ${fontSizeClass} ${lineHeightClass} ${spacingClass} relative h-full w-full cursor-zoom-in group`}
        onClick={handleResumeClick}
        onMouseEnter={() => setIsHovering(true)}
        onMouseLeave={() => setIsHovering(false)}
      >
        {/* Magnifying glass overlay */}
        <div
          className={`absolute inset-0 bg-black/5 flex items-center justify-center transition-opacity duration-200 ${isHovering ? "opacity-100" : "opacity-0"} pointer-events-none`}
        >
          <div className="bg-white/90 dark:bg-gray-800/90 p-3 rounded-full shadow-lg flex flex-col items-center">
            <Search className="h-8 w-8 text-[#e3c27e] mb-1" />
            <span className="text-xs font-medium">Click to preview</span>
          </div>
        </div>

        <div className="absolute left-6 top-0 bottom-0 w-px bg-gray-200 dark:bg-gray-700 opacity-50"></div>
        <motion.h1
          className={`${nameSizeClass} font-bold ${headerAlignmentClass} mb-8 ${nameStyleClass} tracking-wide ${colorClass} relative`}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5 }}
        >
          <span className="relative inline-block">
            {resumeData.title}
            <span className="absolute -bottom-2 left-0 right-0 h-0.5 bg-gradient-to-r from-transparent via-[#e3c27e]/50 to-transparent"></span>
          </span>
        </motion.h1>

        {visibleSections.map((section) => (
          <motion.div
            key={section.id}
            className={cn(
              "mb-4 transition-all duration-300 ease-in-out",
              highlightedSection === section.id ? "animate-pulse-subtle" : "",
              section.type === "contact" ? headerAlignmentClass : "",
            )}
            data-section-id={section.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
          >
            <h2
              className={`${headingSizeClass} font-semibold mb-3 pb-1 ${dividerStyleClass} ${colorClass} border-gray-200 flex items-center ${headingStyleClass}`}
            >
              <span className="relative flex items-center">
                <span className="w-1.5 h-1.5 rounded-full bg-[#e3c27e] mr-2 opacity-80"></span>
                {section.title}
                {highlightedSection === section.id && (
                  <motion.span
                    className="absolute -right-3 -top-3 h-2 w-2 rounded-full bg-[#e3c27e]"
                    initial={{ scale: 0 }}
                    animate={{ scale: [0, 1.5, 1] }}
                    transition={{ duration: 0.5 }}
                  />
                )}
              </span>
            </h2>

            {section.type === "contact" ? (
              renderContactSection(section)
            ) : section.type === "skills" || section.type === "languages" ? (
              renderSkillsSection(section)
            ) : typeof section.content === "string" ? (
              <div className="whitespace-pre-line text-gray-700 dark:text-gray-300">{section.content}</div>
            ) : (
              <div className="space-y-3">
                {section.content.map((item: ResumeItem) => (
                  <motion.div
                    key={item.id}
                    className={`mb-3 ${style.showDividers ? "pb-3 border-b border-gray-100" : ""}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ duration: 0.3 }}
                  >
                    <div className="flex justify-between items-start">
                      <h3 className="font-semibold text-gray-800 dark:text-gray-200">
                        {item.title}
                        {item.organization && (
                          <span className="font-medium ml-1 text-gray-700 dark:text-gray-300">
                            - {item.organization}
                          </span>
                        )}
                      </h3>

                      {(item.startDate || item.location) && (
                        <div className={`text-sm text-gray-600 dark:text-gray-400 italic flex ${dateAlignmentClass}`}>
                          {item.startDate && (
                            <span>
                              {formatDate(item.startDate)} - {item.current ? "Present" : formatDate(item.endDate)}
                            </span>
                          )}
                          {item.startDate && item.location && " | "}
                          {item.location && <span>{item.location}</span>}
                        </div>
                      )}
                    </div>

                    {item.description && style.showResponsibilities !== false && (
                      <p className="mt-1 text-gray-700 dark:text-gray-300 text-sm leading-relaxed">
                        {item.description}
                      </p>
                    )}

                    {item.bullets && item.bullets.length > 0 && (
                      <ul className={`mt-2 space-y-1.5 text-gray-700 dark:text-gray-300 pl-1 ${bulletStyleClass}`}>
                        {item.bullets.map((bullet, idx) => (
                          <li key={idx} className="flex items-start text-sm leading-relaxed">
                            <span className="text-[#e3c27e] mr-2 mt-1">•</span>
                            <span>{bullet}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </motion.div>
                ))}
              </div>
            )}
          </motion.div>
        ))}

        {/* Page break indicator at 1050px from top (approximate A4 first page height) */}
        <div
          className="absolute left-0 right-0 border-t-2 border-dashed border-gray-300 dark:border-gray-700"
          style={{ top: "1050px" }}
        >
          <div className="bg-amber-50 text-amber-800 dark:bg-amber-900 dark:text-amber-200 text-xs px-2 py-1 rounded absolute right-0 -top-6 shadow-sm">
            Page 1 end
          </div>
        </div>

        {/* Footer if enabled */}
        {style.includeFooter && (
          <div className={`absolute bottom-4 left-0 right-0 px-8 ${headerAlignmentClass} text-sm text-gray-500`}>
            <div className={`${style.footerStyle === "minimal" ? "flex justify-center gap-4" : "space-y-1"}`}>
              {style.showContactInFooter && <div>Email: example@email.com | Phone: (123) 456-7890</div>}
              {style.showSocialLinks && <div>LinkedIn: linkedin.com/in/username | GitHub: github.com/username</div>}
            </div>
          </div>
        )}

        {/* Decorative elements */}
        <div className="absolute top-4 right-4 opacity-10 pointer-events-none">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="currentColor"
              className="text-[#e3c27e]"
            />
          </svg>
        </div>
        <div className="absolute bottom-4 left-4 opacity-10 pointer-events-none">
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path
              d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z"
              fill="currentColor"
              className="text-[#e3c27e]"
            />
          </svg>
        </div>

        {/* Photo if enabled */}
        {style.includePhoto && (
          <div
            className={`absolute ${
              style.photoPosition === "left"
                ? "left-8 top-8"
                : style.photoPosition === "right"
                  ? "right-8 top-8"
                  : "left-1/2 transform -translate-x-1/2 top-8"
            }`}
          >
            <div
              className={`
              ${style.photoSize === "small" ? "w-16 h-16" : style.photoSize === "large" ? "w-24 h-24" : "w-20 h-20"} 
              ${
                style.photoShape === "circle"
                  ? "rounded-full"
                  : style.photoShape === "square"
                    ? "rounded-none"
                    : "rounded-md"
              }
              bg-gray-200 overflow-hidden
            `}
            >
              <div
                className="w-full h-full"
                style={{
                  backgroundImage: `url(/placeholder.svg?height=100&width=100&query=professional%20headshot)`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Subtle corner decorations */}
        <div className="absolute top-0 left-0 w-16 h-16 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-[#e3c27e]"></div>
        </div>
        <div className="absolute top-0 right-0 w-16 h-16 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-[#e3c27e]"></div>
        </div>
        <div className="absolute bottom-0 left-0 w-16 h-16 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-[#e3c27e]"></div>
        </div>
        <div className="absolute bottom-0 right-0 w-16 h-16 overflow-hidden opacity-10 pointer-events-none">
          <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-[#e3c27e]"></div>
        </div>
      </div>

      {/* Full Resume Preview Modal */}
      <ContentPreviewModal open={previewOpen} onOpenChange={setPreviewOpen} resumeData={resumeData} />
    </>
  )
}
