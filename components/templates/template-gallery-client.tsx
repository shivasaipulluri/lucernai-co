"use client"

import { useState } from "react"
import { RESUME_TEMPLATES, type ResumeTemplate } from "@/lib/templates/resume-templates"
import { TemplateCard } from "./template-card"
import { TemplatePreviewModal } from "./template-preview-modal"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"

interface TemplateGalleryClientProps {
  currentTemplateId: string
  isPremium: boolean
}

export function TemplateGalleryClient({ currentTemplateId, isPremium }: TemplateGalleryClientProps) {
  const [selectedTemplate, setSelectedTemplate] = useState<ResumeTemplate | null>(null)
  const [activeTab, setActiveTab] = useState<string>("all")

  // Filter templates based on the active tab
  const filteredTemplates = RESUME_TEMPLATES.filter((template) => {
    if (activeTab === "all") return true
    if (activeTab === "free") return !template.isPremium
    if (activeTab === "premium") return template.isPremium
    if (activeTab === "layout") return template.layout === activeTab
    return true
  })

  // Handle template preview
  const handlePreview = (template: ResumeTemplate) => {
    setSelectedTemplate(template)
  }

  // Close the preview modal
  const handleClosePreview = () => {
    setSelectedTemplate(null)
  }

  return (
    <div className="container-wide py-12">
      <div className="mb-8 text-center">
        <div className="flex justify-center mb-4">
          <LucernaSunIcon size={48} glowing={true} />
        </div>
        <h1 className="mb-3 font-serif">Resume Templates</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Choose from our collection of ATS-friendly resume templates to showcase your professional story.
        </p>
      </div>

      <Tabs defaultValue="all" value={activeTab} onValueChange={setActiveTab} className="mb-8">
        <div className="flex justify-center">
          <TabsList>
            <TabsTrigger value="all">All Templates</TabsTrigger>
            <TabsTrigger value="free">Free</TabsTrigger>
            <TabsTrigger value="premium">Premium</TabsTrigger>
            <TabsTrigger value="classic">Classic</TabsTrigger>
            <TabsTrigger value="modern">Modern</TabsTrigger>
            <TabsTrigger value="two-column">Two Column</TabsTrigger>
          </TabsList>
        </div>
      </Tabs>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredTemplates.map((template) => (
          <TemplateCard
            key={template.id}
            template={template}
            isActive={template.id === currentTemplateId}
            isPremium={isPremium}
            onPreview={() => handlePreview(template)}
          />
        ))}
      </div>

      {selectedTemplate && (
        <TemplatePreviewModal
          template={selectedTemplate}
          isActive={selectedTemplate.id === currentTemplateId}
          isPremium={isPremium}
          onClose={handleClosePreview}
        />
      )}
    </div>
  )
}
