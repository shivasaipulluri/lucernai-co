"use client"

import { useState } from "react"
import type { Resume } from "@/lib/types"
import SavedResumeCard from "./SavedResumeCard"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { PlusCircle, FileText, Search, SortAsc, SortDesc, Filter } from "lucide-react"
import { useRouter } from "next/navigation"
import { motion } from "framer-motion"
import { Input } from "@/components/ui/input"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"

export default function SavedResumesClient({ resumes: initialResumes }: { resumes: Resume[] }) {
  const [previewing, setPreviewing] = useState<Resume | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest" | "alphabetical">("newest")
  const router = useRouter()

  // Filter and sort resumes
  const filteredResumes = initialResumes
    .filter(
      (resume) =>
        resume.label?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resume.jobTitle?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        resume.resumeText.toLowerCase().includes(searchQuery.toLowerCase()),
    )
    .sort((a, b) => {
      if (sortOrder === "newest") {
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
      } else if (sortOrder === "oldest") {
        return new Date(a.updatedAt).getTime() - new Date(b.updatedAt).getTime()
      } else {
        // Alphabetical
        const labelA = a.label || "Untitled Resume"
        const labelB = b.label || "Untitled Resume"
        return labelA.localeCompare(labelB)
      }
    })

  return (
    <div className="container py-12 space-y-8">
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="text-center space-y-4"
      >
        <h1 className="text-4xl font-serif font-bold text-primary">
          Your Resume Collection
          <span className="text-accent ml-2">✨</span>
        </h1>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Manage your tailored resumes for different job applications. Customize, edit, and track your resume versions.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="flex flex-col md:flex-row justify-between items-center gap-4 bg-muted/30 p-4 rounded-xl border border-muted"
      >
        <div className="relative w-full md:w-auto flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
          <Input
            placeholder="Search your resumes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10 bg-white focus-visible:ring-accent"
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="outline" className="flex items-center gap-2">
                {sortOrder === "newest" ? (
                  <SortDesc className="h-4 w-4" />
                ) : sortOrder === "oldest" ? (
                  <SortAsc className="h-4 w-4" />
                ) : (
                  <Filter className="h-4 w-4" />
                )}
                <span>{sortOrder === "newest" ? "Newest" : sortOrder === "oldest" ? "Oldest" : "A-Z"}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setSortOrder("newest")}>
                <SortDesc className="mr-2 h-4 w-4" />
                <span>Newest first</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("oldest")}>
                <SortAsc className="mr-2 h-4 w-4" />
                <span>Oldest first</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setSortOrder("alphabetical")}>
                <Filter className="mr-2 h-4 w-4" />
                <span>Alphabetical</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          <Button
            onClick={() => router.push("/resume/lab")}
            className="bg-accent hover:bg-accent/90 text-primary flex items-center gap-2"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Create New Resume</span>
          </Button>
        </div>
      </motion.div>

      {filteredResumes.length === 0 ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="text-center py-16 space-y-6"
        >
          <div className="flex justify-center">
            <div className="relative">
              <FileText className="h-24 w-24 text-muted-foreground" />
              <motion.div
                animate={{
                  scale: [1, 1.1, 1],
                  rotate: [0, 5, 0, -5, 0],
                }}
                transition={{
                  duration: 3,
                  repeat: Number.POSITIVE_INFINITY,
                  repeatType: "reverse",
                }}
                className="absolute -top-2 -right-2 text-3xl"
              >
                📝
              </motion.div>
            </div>
          </div>
          <h3 className="text-2xl font-serif font-medium text-primary">
            {searchQuery ? "No matching resumes found" : "No saved resumes yet"}
          </h3>
          <p className="text-muted-foreground max-w-md mx-auto">
            {searchQuery
              ? `Try adjusting your search query or create a new resume.`
              : `Create and save resumes from the Resume Lab. Each resume can be named for specific companies or positions.`}
          </p>
          <Button onClick={() => router.push("/resume/lab")} className="mt-4 bg-accent hover:bg-accent/90 text-primary">
            Go to Resume Lab
          </Button>
        </motion.div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
          {filteredResumes.map((resume, index) => (
            <SavedResumeCard key={resume.id} resume={resume} onPreview={() => setPreviewing(resume)} index={index} />
          ))}
        </div>
      )}

      <Dialog open={!!previewing} onOpenChange={() => setPreviewing(null)}>
        <DialogContent className="max-w-3xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <span className="text-accent">✨</span>
              <span>{previewing?.label || "Resume Preview"}</span>
            </DialogTitle>
          </DialogHeader>
          <div className="mt-4 p-6 bg-muted/20 rounded-md border border-muted">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {previewing?.modifiedResume || previewing?.resumeText}
            </pre>
          </div>
          <div className="flex justify-end mt-4">
            <Button
              onClick={() => {
                if (previewing) {
                  router.push(`/resume/${previewing.id}/edit`)
                }
              }}
              className="bg-secondary hover:bg-secondary/90 text-white"
            >
              Edit this Resume
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}