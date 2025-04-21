"use client"

import { useState } from "react"

interface JDAnalysis {
  id?: string
  role: string
  seniority: string
  responsibilities: string[]
  qualifications: string[]
  keywords: string[]
  categories: {
    technical: string[]
    soft: string[]
    certifications: string[]
  }
}

interface UseJDAnalysisResult {
  analyze: (jobDescription: string, resumeId?: string) => Promise<JDAnalysis | null>
  analysis: JDAnalysis | null
  isAnalyzing: boolean
  error: string | null
}

export function useJDAnalysis(): UseJDAnalysisResult {
  const [analysis, setAnalysis] = useState<JDAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const analyze = async (jobDescription: string, resumeId?: string): Promise<JDAnalysis | null> => {
    if (!jobDescription.trim()) {
      setError("Job description is required")
      return null
    }

    setIsAnalyzing(true)
    setError(null)

    try {
      const response = await fetch("/api/intelligence/jd-analysis", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          jobDescription,
          resumeId,
        }),
      })

      const result = await response.json()

      if (!response.ok) {
        throw new Error(result.error || "Failed to analyze job description")
      }

      if (!result.success) {
        throw new Error(result.error || "Analysis failed")
      }

      setAnalysis(result.data)
      return result.data
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Unknown error"
      setError(errorMessage)
      return null
    } finally {
      setIsAnalyzing(false)
    }
  }

  return {
    analyze,
    analysis,
    isAnalyzing,
    error,
  }
}
