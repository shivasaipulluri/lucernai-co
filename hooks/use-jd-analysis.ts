"use client"

import { useState, useCallback, useRef } from "react"

// Define the analysis interface
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

// Define the return type of the hook
export interface UseJDAnalysisResult {
  analyze: (jobDescription: string, resumeId?: string) => Promise<JDAnalysis | null>
  analysis: JDAnalysis | null
  isAnalyzing: boolean
  error: string | null
}

export function useJDAnalysis(): UseJDAnalysisResult {
  const [analysis, setAnalysis] = useState<JDAnalysis | null>(null)
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const abortControllerRef = useRef<AbortController | null>(null)
  const lastAnalysisTimeRef = useRef<number>(0)
  const analysisInProgressRef = useRef<boolean>(false)
  const lastAnalyzedTextRef = useRef<string>("")

  const analyze = useCallback(
    async (jobDescription: string, resumeId?: string): Promise<JDAnalysis | null> => {
      // Don't analyze if text is too short
      if (!jobDescription || jobDescription.trim().length < 100) {
        return null
      }

      // Don't analyze if we're already analyzing
      if (analysisInProgressRef.current) {
        return null
      }

      // Don't analyze if the text hasn't changed significantly
      if (lastAnalyzedTextRef.current === jobDescription) {
        return analysis
      }

      // Implement cooldown to prevent rapid successive calls
      const now = Date.now()
      const timeSinceLastAnalysis = now - lastAnalysisTimeRef.current
      if (timeSinceLastAnalysis < 5000) {
        // 5 second cooldown
        return null
      }

      // Cancel any in-flight requests
      if (abortControllerRef.current) {
        abortControllerRef.current.abort()
      }

      // Create a new abort controller
      abortControllerRef.current = new AbortController()
      const signal = abortControllerRef.current.signal

      setIsAnalyzing(true)
      analysisInProgressRef.current = true
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
          signal,
        })

        if (!response.ok) {
          throw new Error(`Analysis failed: ${response.status}`)
        }

        const result = await response.json()

        if (!result.success) {
          throw new Error(result.error || "Analysis failed")
        }

        setAnalysis(result.data)
        lastAnalysisTimeRef.current = Date.now()
        lastAnalyzedTextRef.current = jobDescription
        return result.data
      } catch (err: any) {
        // Only set error if it's not an abort error
        if (err.name !== "AbortError") {
          console.error("Error analyzing job description:", err)
          setError(err.message || "Failed to analyze job description")
        }
        return null
      } finally {
        setIsAnalyzing(false)
        analysisInProgressRef.current = false
      }
    },
    [analysis],
  )

  return {
    analysis,
    isAnalyzing,
    error,
    analyze,
  }
}
