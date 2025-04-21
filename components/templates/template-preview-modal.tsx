"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/components/ui/use-toast"
import { Check, Download, Sparkles } from "lucide-react"
import { setUserTemplate } from "@/lib/actions/template-actions"
import type { ResumeTemplate } from "@/lib/templates/resume-templates"
import Image from "next/image"

interface TemplatePreviewModalProps {
  template: ResumeTemplate
  isActive: boolean
  isPremium: boolean
  onClose: () => void
}

export function TemplatePreviewModal({ template, isActive, isPremium, onClose }: TemplatePreviewModalProps) {
  const [isSettingTemplate, setIsSettingTemplate] = useState(false)
  const [isDownloading, setIsDownloading] = useState(false)
  const { toast } = useToast()

  // Handle setting the template
  const handleSetTemplate = async () => {
    // If the template is premium and the user is not premium, show a message
    if (template.isPremium && !isPremium) {
      toast({
        title: "Premium Template",
        description: "Upgrade to Premium to use this template.",
        variant: "destructive",
      })
      return
    }

    setIsSettingTemplate(true)

    try {
      const result = await setUserTemplate(template.id)

      if (result.success) {
        toast({
          title: "Template Set",
          description: `${template.name} is now your default template.`,
        })
        onClose()
      } else {
        throw new Error(result.error || "Failed to set template")
      }
    } catch (error: any) {
      toast({
        title: "Error",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSettingTemplate(false)
    }
  }

  // Handle downloading a sample
  const handleDownloadSample = () => {
    setIsDownloading(true)

    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Sample Downloaded",
        description: "Check your downloads folder for the sample resume.",
      })
      setIsDownloading(false)
    }, 1500)
  }

  return (
    <Dialog open={true} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {template.name}
            {template.isPremium && (
              <Badge className="bg-amber-500 text-primary">
                <Sparkles className="h-3 w-3 mr-1" />
                Premium
              </Badge>
            )}
            {isActive && <Badge className="bg-green-500 text-white">Active</Badge>}
          </DialogTitle>
          <DialogDescription>{template.description}</DialogDescription>
        </DialogHeader>

        <div className="relative h-[500px] bg-gray-100 rounded-md overflow-hidden">
          {/* Premium overlay for non-premium users */}
          {template.isPremium && !isPremium && (
            <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
              <div className="bg-white p-6 rounded-lg shadow-lg text-center max-w-md">
                <Sparkles className="h-10 w-10 text-amber-500 mx-auto mb-4" />
                <h3 className="text-xl font-bold mb-2">Premium Template</h3>
                <p className="text-gray-600 mb-4">
                  Upgrade to Premium to access this template and other premium features.
                </p>
                <Button className="bg-amber-500 text-primary hover:bg-amber-400">Upgrade to Premium</Button>
              </div>
            </div>
          )}

          {/* Template preview image */}
          <Image
            src={template.preview || "/placeholder.svg"}
            alt={template.name}
            width={400}
            height={300}
            className="object-contain"
          />
        </div>

        <div className="grid grid-cols-3 gap-4 mt-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-gray-700">Font Family</h4>
            <p className="text-sm text-gray-600">{template.fontFamily}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-gray-700">Layout</h4>
            <p className="text-sm text-gray-600">{template.layout}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <h4 className="text-sm font-medium text-gray-700">Accent Color</h4>
            <div className="flex items-center gap-2">
              <div className="h-4 w-4 rounded-full" style={{ backgroundColor: template.accentColor }}></div>
              <p className="text-sm text-gray-600">{template.accentColor}</p>
            </div>
          </div>
        </div>

        <DialogFooter className="flex justify-between items-center mt-4">
          <div>
            <Button variant="outline" size="sm" onClick={handleDownloadSample} disabled={isDownloading}>
              <Download className="h-4 w-4 mr-1" />
              {isDownloading ? "Downloading..." : "Download Sample"}
            </Button>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button onClick={handleSetTemplate} disabled={isSettingTemplate || (template.isPremium && !isPremium)}>
              {isActive ? (
                <>
                  <Check className="h-4 w-4 mr-1" />
                  Active Template
                </>
              ) : (
                "Set as Default"
              )}
            </Button>
          </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
