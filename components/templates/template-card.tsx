"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useToast } from "@/components/ui/use-toast"
import { Lock, Eye, Check, Sparkles } from "lucide-react"
import { setUserTemplate } from "@/lib/actions/template-actions"
import type { ResumeTemplate } from "@/lib/templates/resume-templates"
import Image from "next/image"

interface TemplateCardProps {
  template: ResumeTemplate
  isActive: boolean
  isPremium: boolean
  onPreview: () => void
}

export function TemplateCard({ template, isActive, isPremium, onPreview }: TemplateCardProps) {
  const [isSettingTemplate, setIsSettingTemplate] = useState(false)
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

  return (
    <Card className="overflow-hidden group relative">
      <div className="relative h-64 bg-gray-100">
        {/* Premium overlay for non-premium users */}
        {template.isPremium && !isPremium && (
          <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-10">
            <Lock className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm font-medium text-gray-600">Premium Template</p>
            <Button variant="outline" size="sm" className="mt-2">
              Upgrade to Access
            </Button>
          </div>
        )}

        {/* Template preview image */}
        <div className="relative h-full w-full overflow-hidden">
          <Image
            src={template.preview || "/placeholder.svg"}
            alt={template.name}
            width={400}
            height={300}
            className="object-cover transition-transform group-hover:scale-105"
          />
        </div>

        {/* Hover overlay with actions */}
        <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
          <Button size="sm" variant="secondary" onClick={onPreview}>
            <Eye className="h-4 w-4 mr-1" />
            Preview
          </Button>
          <Button
            size="sm"
            variant={isActive ? "outline" : "default"}
            onClick={handleSetTemplate}
            disabled={isSettingTemplate || (template.isPremium && !isPremium)}
          >
            {isActive ? (
              <>
                <Check className="h-4 w-4 mr-1" />
                Active
              </>
            ) : (
              "Use Template"
            )}
          </Button>
        </div>

        {/* Active badge */}
        {isActive && (
          <div className="absolute top-2 right-2 z-20">
            <Badge className="bg-green-500 text-white">Active</Badge>
          </div>
        )}

        {/* Premium badge */}
        {template.isPremium && (
          <div className="absolute top-2 left-2 z-20">
            <TooltipProvider>
              <Tooltip>
                <TooltipTrigger asChild>
                  <Badge className="bg-amber-500 text-primary">
                    <Sparkles className="h-3 w-3 mr-1" />
                    Premium
                  </Badge>
                </TooltipTrigger>
                <TooltipContent>
                  <p className="text-sm">Available with Premium subscription</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </div>
        )}
      </div>

      <CardContent className="p-4">
        <div className="flex justify-between items-center">
          <div>
            <h3 className="font-medium">{template.name}</h3>
            <p className="text-xs text-gray-500">{template.layout} layout</p>
          </div>
          <div
            className="h-4 w-4 rounded-full"
            style={{ backgroundColor: template.accentColor }}
            title="Accent color"
          ></div>
        </div>
      </CardContent>
    </Card>
  )
}
