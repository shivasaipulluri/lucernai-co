"use client"

import { useEffect, useState } from "react"
import { ResumeBuilder } from "./resume-builder"
import { LoadingScreen } from "./loading-screen"
import { useToast } from "@/components/ui/use-toast"

interface ResumeBuilderPageProps {
  userId: string
}

export default function ResumeBuilderPage({ userId }: ResumeBuilderPageProps) {
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    // Simulate loading resources
    const timer = setTimeout(() => {
      setIsLoading(false)
      toast({
        title: "Resume Builder Loaded",
        description: "Create and customize your professional resume",
      })
    }, 1000)

    return () => clearTimeout(timer)
  }, [toast])

  if (isLoading) {
    return <LoadingScreen message="Loading Resume Builder..." />
  }

  return (
    <div className="container-wide py-6">
      <h1 className="text-3xl font-bold mb-6">Resume Builder</h1>
      <p className="text-muted-foreground mb-6">
        Create a professional resume with our easy-to-use builder. Customize sections, styling, and content to create
        the perfect resume for your job applications.
      </p>
      <ResumeBuilder userId={userId} />
    </div>
  )
}
