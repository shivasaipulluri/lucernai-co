"use client"

import { useContext } from "react"
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
import { ScrollArea } from "@/components/ui/scroll-area"
import { format } from "date-fns"
import { FileText, Check } from "lucide-react"

interface VersionsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function VersionsDialog({ open, onOpenChange }: VersionsDialogProps) {
  const { versions, currentVersionId, switchVersion } = useContext(ResumeContext)

  const handleSwitchVersion = (versionId: string) => {
    switchVersion(versionId)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Resume Versions</DialogTitle>
          <DialogDescription>Select a version to load or create a new one.</DialogDescription>
        </DialogHeader>

        <ScrollArea className="h-[300px] pr-4">
          <div className="space-y-2">
            {versions.map((version) => (
              <Button
                key={version.id}
                variant={version.id === currentVersionId ? "default" : "outline"}
                className="w-full justify-start h-auto py-3"
                onClick={() => handleSwitchVersion(version.id)}
              >
                <div className="flex items-center w-full">
                  <FileText className="h-4 w-4 mr-2" />
                  <div className="flex-1 text-left">
                    <div className="font-medium">{version.name}</div>
                    <div className="text-xs text-muted-foreground">
                      Created {format(new Date(version.createdAt), "MMM d, yyyy 'at' h:mm a")}
                    </div>
                  </div>
                  {version.id === currentVersionId && <Check className="h-4 w-4 text-primary" />}
                </div>
              </Button>
            ))}

            {versions.length === 0 && (
              <div className="text-center p-4 text-muted-foreground">
                No versions found. Create a new version to get started.
              </div>
            )}
          </div>
        </ScrollArea>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
