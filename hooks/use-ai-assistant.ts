"use client"

import { useState } from "react"
// Try to import the real AI SDK, fall back to mock if not available
let generateText: any
let openai: any

try {
  // Try to import the real AI SDK
  const aiModule = require("ai")
  const openaiModule = require("@ai-sdk/openai")

  generateText = aiModule.generateText
  openai = openaiModule.openai
} catch (e) {
  // Fall back to mock implementation
  console.warn("AI SDK not available, using mock implementation")
  const mockModule = require("@/lib/ai-mock")

  generateText = mockModule.generateText
  openai = mockModule.openai
}
import type { ResumeData, ResumeSectionType, ResumeAnalysis } from "@/types/resume"

export function useAIAssistant() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Generate content suggestions for a specific section
  const suggestContent = async (
    sectionType: ResumeSectionType,
    prompt: string,
    jobTarget?: string,
  ): Promise<string> => {
    setIsLoading(true)
    setError(null)

    try {
      const systemPrompt = `You are an expert resume writer with years of experience helping job seekers create compelling resumes. 
      You are helping the user improve their ${sectionType} section.
      ${jobTarget ? `They are targeting a position as: ${jobTarget}` : ""}
      Provide concise, professional content that highlights their strengths and achievements.
      Focus on quantifiable achievements and skills relevant to their target role.
      Use action verbs and industry-specific keywords.
      Keep your response brief and directly usable in a resume.`

      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: prompt,
        temperature: 0.7,
        maxTokens: 500,
      })

      return text
    } catch (err) {
      setError("Failed to generate suggestion. Please try again.")
      console.error("AI suggestion error:", err)
      return ""
    } finally {
      setIsLoading(false)
    }
  }

  // Analyze the entire resume and provide feedback
  const analyzeResume = async (resumeData: ResumeData): Promise<ResumeAnalysis> => {
    setIsLoading(true)
    setError(null)

    try {
      // Convert resume data to plain text for analysis
      const resumeText = resumeDataToText(resumeData)

      const systemPrompt = `You are an expert resume reviewer with years of experience in HR and recruitment.
      Analyze the provided resume and give constructive feedback.
      Focus on structure, content, impact statements, and overall effectiveness.
      If a job target is provided, assess how well the resume aligns with that role.
      Provide a numerical score from 0-100 and specific improvement suggestions.`

      const jobTarget = resumeData.jobTarget
        ? `The user is targeting a position as: ${resumeData.jobTarget}`
        : "No specific job target provided."

      const { text } = await generateText({
        model: openai("gpt-4o"),
        system: systemPrompt,
        prompt: `${jobTarget}\n\nHere is the resume to analyze:\n\n${resumeText}`,
        temperature: 0.3,
        maxTokens: 1000,
      })

      // Parse the AI response to extract score and feedback
      const analysis = parseAnalysisResponse(text)
      return analysis
    } catch (err) {
      setError("Failed to analyze resume. Please try again.")
      console.error("Resume analysis error:", err)
      return { score: 0, feedback: ["Analysis failed. Please try again."] }
    } finally {
      setIsLoading(false)
    }
  }

  // Helper function to convert resume data to plain text
  const resumeDataToText = (resumeData: ResumeData): string => {
    let text = `${resumeData.title}\n\n`

    resumeData.sections
      .filter((section) => section.isVisible)
      .sort((a, b) => a.order - b.order)
      .forEach((section) => {
        text += `${section.title}\n`

        if (typeof section.content === "string") {
          text += `${section.content}\n\n`
        } else {
          section.content.forEach((item) => {
            text += `${item.title} - ${item.organization || ""}\n`
            if (item.startDate) {
              const endDateText = item.current ? "Present" : item.endDate
              text += `${formatDate(item.startDate)} - ${formatDate(endDateText || "")}\n`
            }
            if (item.location) {
              text += `${item.location}\n`
            }
            text += `${item.description}\n`
            if (item.bullets && item.bullets.length > 0) {
              item.bullets.forEach((bullet) => {
                text += `• ${bullet}\n`
              })
            }
            text += "\n"
          })
        }
      })

    return text
  }

  // Helper function to format dates
  const formatDate = (dateString: string): string => {
    if (!dateString) return ""
    if (dateString === "Present") return "Present"

    try {
      const [year, month] = dateString.split("-")
      const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
      return date.toLocaleDateString("en-US", { year: "numeric", month: "short" })
    } catch (e) {
      return dateString
    }
  }

  // Helper function to parse the AI analysis response
  const parseAnalysisResponse = (response: string): ResumeAnalysis => {
    try {
      // Extract score - look for patterns like "Score: 85/100" or "85 out of 100"
      const scoreRegex = /(\d{1,3})(?:\/|\s*out of\s*)100/i
      const scoreMatch = response.match(scoreRegex)
      const score = scoreMatch ? Number.parseInt(scoreMatch[1]) : 70 // Default to 70 if no score found

      // Extract feedback points - look for bullet points or numbered lists
      const feedbackPoints: string[] = []

      // Try to find bullet points
      const bulletRegex = /[•\-*]\s*([^\n]+)/g
      let bulletMatch
      while ((bulletMatch = bulletRegex.exec(response)) !== null) {
        feedbackPoints.push(bulletMatch[1].trim())
      }

      // If no bullet points, try to find numbered lists
      if (feedbackPoints.length === 0) {
        const numberedRegex = /\d+\.\s*([^\n]+)/g
        let numberedMatch
        while ((numberedMatch = numberedRegex.exec(response)) !== null) {
          feedbackPoints.push(numberedMatch[1].trim())
        }
      }

      // If still no structured feedback, split by paragraphs and use those
      if (feedbackPoints.length === 0) {
        const paragraphs = response.split("\n\n")
        paragraphs.forEach((p) => {
          if (p.trim().length > 20) {
            // Only use substantial paragraphs
            feedbackPoints.push(p.trim())
          }
        })
      }

      // If we still don't have feedback, use the whole response
      if (feedbackPoints.length === 0) {
        feedbackPoints.push(response.trim())
      }

      return {
        score,
        feedback: feedbackPoints,
      }
    } catch (e) {
      console.error("Error parsing analysis response:", e)
      return {
        score: 70,
        feedback: ["Analysis completed, but couldn't extract structured feedback."],
      }
    }
  }

  return {
    suggestContent,
    analyzeResume,
    isLoading,
    error,
  }
}
