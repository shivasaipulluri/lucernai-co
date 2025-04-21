"use client"

import { useState } from "react"
import { Resume } from "@/lib/types"
import SavedResumeCard from "./SavedResumeCard"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"

export default function SavedResumesClient({ resumes }: { resumes: Resume[] }) {
  const [previewing, setPreviewing] = useState<Resume | null>(null)

  return (
    <div className="container py-12 space-y-8">
      <h1 className="text-3xl font-serif mb-6">Saved Resumes</h1>

      {resumes.length === 0 ? (
        <p className="text-muted-foreground">No saved resumes yet. You can save them from the Resume Lab.</p>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {resumes.map((resume) => (
            <SavedResumeCard key={resume.id} resume={resume} onPreview={() => setPreviewing(resume)} />
          ))}
        </div>
      )}

      <Dialog open={!!previewing} onOpenChange={() => setPreviewing(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{previewing?.label || "Resume Preview"}</DialogTitle>
          </DialogHeader>
          <pre className="whitespace-pre-wrap text-sm mt-4">{previewing?.modifiedResume}</pre>
        </DialogContent>
      </Dialog>
    </div>
  )
}
