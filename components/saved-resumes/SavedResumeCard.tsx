"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Download, Eye, Edit, Copy, Trash2, Pencil, Tag, Calendar, Clock } from "lucide-react"
import type { Resume } from "@/lib/types"
import { Tooltip, TooltipContent, TooltipTrigger, TooltipProvider } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { renameResume, deleteResume } from "@/lib/actions/saved-resume-actions"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface Props {
  resume: Resume
  onPreview: (r: Resume) => void
  index: number
}

export default function SavedResumeCard({ resume, onPreview, index }: Props) {
  const router = useRouter()
  const [isRenameDialogOpen, setIsRenameDialogOpen] = useState(false)
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false)
  const [newLabel, setNewLabel] = useState(resume.label || "")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isHovered, setIsHovered] = useState(false)

  const handleRename = async () => {
    if (!newLabel.trim()) return

    setIsSubmitting(true)
    try {
      await renameResume(resume.id, resume.userId, newLabel)
      setIsRenameDialogOpen(false)
    } catch (error) {
      console.error("Error renaming resume:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleDelete = async () => {
    setIsSubmitting(true)
    try {
      await deleteResume(resume.id, resume.userId)
      setIsDeleteDialogOpen(false)
    } catch (error) {
      console.error("Error deleting resume:", error)
    } finally {
      setIsSubmitting(false)
    }
  }

  // Format date to be more readable
  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    })
  }

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        <Card
          className={cn(
            "overflow-hidden transition-all duration-300 ease-in-out border-muted/40",
            "hover:shadow-lg hover:border-accent/30",
            isHovered ? "transform scale-[1.02]" : "",
          )}
          onMouseEnter={() => setIsHovered(true)}
          onMouseLeave={() => setIsHovered(false)}
        >
          <div className="h-2 bg-gradient-to-r from-primary via-secondary to-accent"></div>
          <CardContent className="p-6">
            <div className="flex justify-between items-start mb-4">
              <div>
                <h3 className="text-xl font-serif font-medium group flex items-center gap-2">
                  <span className="text-primary">{resume.label || "Untitled Resume"}</span>
                  {isHovered && (
                    <motion.span
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="text-accent"
                    >
                      ✨
                    </motion.span>
                  )}
                </h3>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-2">
                  <Calendar className="w-3 h-3" />
                  <span>Created: {formatDate(resume.createdAt)}</span>
                </div>
                <div className="flex items-center gap-2 text-sm text-muted-foreground mt-1">
                  <Clock className="w-3 h-3" />
                  <span>Updated: {formatDate(resume.updatedAt)}</span>
                </div>
              </div>
              <div className="flex gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsRenameDialogOpen(true)}
                  className="h-8 w-8 p-0 hover:bg-accent/10 hover:text-accent transition-colors"
                >
                  <Pencil className="w-4 h-4" />
                  <span className="sr-only">Rename</span>
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setIsDeleteDialogOpen(true)}
                  className="h-8 w-8 p-0 hover:bg-destructive/10 hover:text-destructive transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  <span className="sr-only">Delete</span>
                </Button>
              </div>
            </div>

            {resume.jobTitle && (
              <div className="mb-4 flex items-center gap-2">
                <Tag className="w-4 h-4 text-accent" />
                <span className="text-sm font-medium">{resume.jobTitle}</span>
              </div>
            )}

            {/* Fixed action buttons layout */}
            <div className="grid grid-cols-2 gap-2 mt-6 sm:flex sm:flex-wrap">
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onPreview(resume)}
                      className="w-full sm:w-auto rounded-full hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-colors"
                    >
                      <Eye className="w-4 h-4 mr-1.5" />
                      <span>Preview</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>View resume content</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/resume/${resume.id}/edit`)}
                      className="w-full sm:w-auto rounded-full hover:bg-secondary/10 hover:text-secondary hover:border-secondary/30 transition-colors"
                    >
                      <Edit className="w-4 h-4 mr-1.5" />
                      <span>Edit</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Make changes to this resume</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        navigator.clipboard.writeText(resume.resumeText)
                        // Could add a toast notification here
                      }}
                      className="w-full sm:w-auto rounded-full hover:bg-primary/10 hover:text-primary hover:border-primary/30 transition-colors"
                    >
                      <Copy className="w-4 h-4 mr-1.5" />
                      <span>Copy</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Copy to clipboard</TooltipContent>
                </Tooltip>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => downloadResume(resume)}
                      className="w-full sm:w-auto rounded-full hover:bg-accent/10 hover:text-accent hover:border-accent/30 transition-colors"
                    >
                      <Download className="w-4 h-4 mr-1.5" />
                      <span>Download</span>
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download as text file</TooltipContent>
                </Tooltip>
              </TooltipProvider>
            </div>
          </CardContent>
        </Card>
      </motion.div>

      {/* Rename Dialog */}
      <Dialog open={isRenameDialogOpen} onOpenChange={setIsRenameDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Pencil className="w-5 h-5 text-accent" />
              <span>Rename Resume</span>
            </DialogTitle>
            <DialogDescription>Give your resume a descriptive name to easily identify it later.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                id="name"
                value={newLabel}
                onChange={(e) => setNewLabel(e.target.value)}
                placeholder="e.g., Amazon Software Engineer Resume"
                className="col-span-3 focus-visible:ring-accent"
                autoFocus
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsRenameDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button
              onClick={handleRename}
              disabled={!newLabel.trim() || isSubmitting}
              className="bg-accent hover:bg-accent/90 text-primary"
            >
              {isSubmitting ? "Saving..." : "Save"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-destructive">
              <Trash2 className="w-5 h-5" />
              <span>Delete Resume</span>
            </DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this resume? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDeleteDialogOpen(false)} disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="destructive" onClick={handleDelete} disabled={isSubmitting}>
              {isSubmitting ? "Deleting..." : "Delete"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}

function downloadResume(resume: Resume) {
  const blob = new Blob([resume.resumeText], { type: "text/plain" })
  const url = URL.createObjectURL(blob)
  const link = document.createElement("a")
  link.href = url
  link.download = `${resume.label || "resume"}.txt`
  link.click()
}
