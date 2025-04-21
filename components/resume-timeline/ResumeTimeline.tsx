"use client"

import { useState } from "react"
import { Resume } from "@/lib/types"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { Eye, X, ArrowLeft, FileText } from "lucide-react"
import { Tooltip, TooltipProvider, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"
import Link from "next/link"
import { Card, CardContent } from "@/components/ui/card"

interface Props {
  versions: Resume[]
}

export default function ResumeTimeline({ versions }: Props) {
  const [selected, setSelected] = useState<Resume | null>(null)

  return (
    <div className="container-wide py-12">
      <div className="mb-10 flex justify-between items-center">
        <h1 className="text-4xl font-serif text-black">Resume Timeline</h1>
        <Button variant="outline" asChild>
          <Link href="/resume/lab">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Resume Lab
          </Link>
        </Button>
      </div>

      {versions.length === 0 ? (
        <Card className="bg-muted/30 border-dashed">
          <CardContent className="py-16 text-center text-muted-foreground">
            <FileText className="mx-auto mb-4 h-10 w-10 text-muted" />
            <p className="text-lg font-medium">No tailored versions yet</p>
            <p className="text-sm mt-1">Start tailoring to visualize your resume’s evolution.</p>
          </CardContent>
        </Card>
      ) : (
        <div className="relative space-y-10 border-l-2 pl-6 border-dashed border-gray-300">
          {versions.map((version, index) => (
            <motion.div
              key={version.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="relative group"
            >
              <div className="absolute -left-[22px] top-2 bg-gold border-4 border-background h-4 w-4 rounded-full shadow group-hover:scale-110 transition" />
              <div className="bg-muted/10 rounded-xl p-4 border hover:shadow-md transition">
                <div className="flex justify-between items-center">
                  <div>
                    <h2 className="font-semibold text-xl">Version {version.version}</h2>
                    <p className="text-sm text-muted-foreground mt-1">
                      ATS: {version.atsScore ?? 0}% | JD: {version.jdScore ?? 0}%
                    </p>
                  </div>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button variant="ghost" onClick={() => setSelected(version)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Preview
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Preview version {version.version}</p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
                <p className="text-sm mt-3 text-muted-foreground line-clamp-2 italic">
                  {version.jobDescription?.slice(0, 80) || "No job description"}
                </p>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selected && (
          <motion.div
            key="modal"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              exit={{ scale: 0.9 }}
              transition={{ duration: 0.3 }}
              className="bg-background rounded-xl max-w-3xl w-full mx-4 p-6 shadow-xl border relative"
            >
              <button
                onClick={() => setSelected(null)}
                className="absolute top-3 right-3 text-muted-foreground hover:text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-semibold mb-2">Version {selected.version}</h2>
              <p className="text-sm text-muted-foreground mb-4">
                ATS: {selected.atsScore ?? 0}% | JD: {selected.jdScore ?? 0}%
              </p>
              <pre className="whitespace-pre-wrap text-sm text-muted-foreground bg-muted/50 p-4 rounded overflow-y-auto max-h-[60vh]">
                {selected.modifiedResume || "No tailored content available."}
              </pre>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
