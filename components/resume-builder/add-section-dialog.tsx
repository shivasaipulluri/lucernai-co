"use client"

import { useContext, useState } from "react"
import { ResumeContext } from "@/context/resume-context"
import { v4 as uuidv4 } from "uuid"
import type { ResumeSectionType } from "@/types/resume"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AddSectionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function AddSectionDialog({ open, onOpenChange }: AddSectionDialogProps) {
  const { addSection } = useContext(ResumeContext)
  const [sectionType, setSectionType] = useState<ResumeSectionType>("custom")
  const [sectionTitle, setSectionTitle] = useState("")

  const handleAddSection = () => {
    const title = sectionTitle.trim() || getSectionDefaultTitle(sectionType)

    addSection({
      id: uuidv4(),
      type: sectionType,
      title,
      content: getSectionDefaultContent(sectionType),
      isVisible: true,
      order: 999, // Will be reordered when added
    })

    // Reset form
    setSectionType("custom")
    setSectionTitle("")
    onOpenChange(false)
  }

  const getSectionDefaultTitle = (type: ResumeSectionType): string => {
    const titles: Record<ResumeSectionType, string> = {
      contact: "Contact Information",
      summary: "Professional Summary",
      experience: "Work Experience",
      education: "Education",
      skills: "Skills",
      projects: "Projects",
      certifications: "Certifications",
      awards: "Awards & Honors",
      languages: "Languages",
      interests: "Interests",
      references: "References",
      custom: "Custom Section",
    }

    return titles[type]
  }

  const getSectionDefaultContent = (type: ResumeSectionType): string | any[] => {
    switch (type) {
      case "contact":
      case "summary":
      case "skills":
      case "languages":
      case "interests":
      case "references":
      case "custom":
        return ""
      case "experience":
      case "education":
      case "projects":
      case "certifications":
      case "awards":
        return [
          {
            id: uuidv4(),
            title: "New Item",
            description: "",
            bullets: [""],
          },
        ]
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Add New Section</DialogTitle>
          <DialogDescription>Choose a section type and customize its title.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="section-type">Section Type</Label>
            <Select value={sectionType} onValueChange={(value) => setSectionType(value as ResumeSectionType)}>
              <SelectTrigger id="section-type">
                <SelectValue placeholder="Select section type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="summary">Professional Summary</SelectItem>
                <SelectItem value="experience">Work Experience</SelectItem>
                <SelectItem value="education">Education</SelectItem>
                <SelectItem value="skills">Skills</SelectItem>
                <SelectItem value="projects">Projects</SelectItem>
                <SelectItem value="certifications">Certifications</SelectItem>
                <SelectItem value="awards">Awards & Honors</SelectItem>
                <SelectItem value="languages">Languages</SelectItem>
                <SelectItem value="interests">Interests</SelectItem>
                <SelectItem value="references">References</SelectItem>
                <SelectItem value="contact">Contact Information</SelectItem>
                <SelectItem value="custom">Custom Section</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="section-title">Section Title (Optional)</Label>
            <Input
              id="section-title"
              placeholder={getSectionDefaultTitle(sectionType)}
              value={sectionTitle}
              onChange={(e) => setSectionTitle(e.target.value)}
            />
            <p className="text-xs text-muted-foreground">Leave blank to use the default title for this section type.</p>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleAddSection}>Add Section</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
