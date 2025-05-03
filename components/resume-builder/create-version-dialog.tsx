"use client"

import { useContext, useState } from "react"
import { ResumeContext } from "@/context/resume-context"
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
import { useToast } from "@/components/ui/use-toast"

interface CreateVersionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function CreateVersionDialog({ open, onOpenChange }: CreateVersionDialogProps) {
  const { createVersion } = useContext(ResumeContext)
  const { toast } = useToast()
  const [versionName, setVersionName] = useState("")

  const handleCreateVersion = () => {
    if (!versionName.trim()) {
      toast({
        title: "Version Name Required",
        description: "Please enter a name for your new version",
        variant: "destructive",
      })
      return
    }

    createVersion(versionName)

    toast({
      title: "Version Created",
      description: `New version "${versionName}" has been created`,
    })

    setVersionName("")
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Create New Version</DialogTitle>
          <DialogDescription>Create a new version of your resume for a different job or purpose.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="version-name">Version Name</Label>
            <Input
              id="version-name"
              placeholder="e.g., Software Engineer Version, Marketing Role, etc."
              value={versionName}
              onChange={(e) => setVersionName(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleCreateVersion}>Create Version</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
