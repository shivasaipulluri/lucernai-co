"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { generateContent } from "@/lib/actions/generate-content"
import { compileInterviewPrompt } from "@/utils/ai/interview-prompt"

export type InterviewType = "Behavioral" | "Technical" | "Role-Specific" | "Case-Based"

export interface InterviewQuestion {
  id: number
  type: InterviewType
  question: string
}

export interface InterviewAnswer {
  questionId: number
  answer: string
}

interface GenerateQuestionsResult {
  success: boolean
  error?: string
  data?: {
    sessionId: string
    questions: InterviewQuestion[]
  }
}

interface SaveAnswersResult {
  success: boolean
  error?: string
}

interface UpdateNeedsReviewResult {
  success: boolean
  error?: string
}

/**
 * Generate interview questions based on a job description and selected interview types
 */
export async function generateInterviewQuestions(
  jobDescription: string,
  selectedTypes: InterviewType[],
): Promise<GenerateQuestionsResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Compile the interview prompt
    const prompt = compileInterviewPrompt({
      jobDescription,
      selectedTypes,
    })

    // Generate the interview questions using Gemini
    const { success, text } = await generateContent(
      "", // API key from env
      prompt,
      "gemini-1.5-flash",
      0.7, // Higher temperature for more creative questions
    )

    if (!success || !text) {
      return { success: false, error: "Failed to generate interview questions" }
    }

    // Parse the generated questions
    let questions: InterviewQuestion[] = []
    try {
      // Clean the text to ensure it's valid JSON
      const cleanedText = text.replace(/```json\s?|```/g, "").trim()
      const parsedQuestions = JSON.parse(cleanedText)

      // Add IDs to the questions
      questions = parsedQuestions.map((q: any, index: number) => ({
        id: index + 1,
        type: q.type,
        question: q.question,
      }))
    } catch (error) {
      console.error("Error parsing interview questions:", error)
      return { success: false, error: "Failed to parse interview questions" }
    }

    // Create a new interview session
    const session = await prisma.interviewSession.create({
      data: {
        userId: user.id,
        jobDescription,
        selectedTypes,
        questions: JSON.stringify(questions), // Convert to JSON string
        answers: JSON.stringify([]), // Initialize as empty JSON string
        needsReview: JSON.stringify([]), // Initialize as empty JSON string
      },
    })

    // Revalidate the paths to update the UI
    // Remove direct revalidatePath calls from server actions
    // The client will handle refreshing with router.refresh()
    // revalidatePath("/interview")

    return {
      success: true,
      data: {
        sessionId: session.id,
        questions,
      },
    }
  } catch (error) {
    console.error("Error generating interview questions:", error)
    return {
      success: false,
      error: "Failed to generate interview questions",
    }
  }
}

/**
 * Save answers to interview questions
 */
export async function saveInterviewAnswers(sessionId: string, answers: InterviewAnswer[]): Promise<SaveAnswersResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if the session exists and belongs to the user
    const session = await prisma.interviewSession.findUnique({
      where: {
        id: sessionId,
        userId: user.id,
      },
    })

    if (!session) {
      return { success: false, error: "Interview session not found" }
    }

    // Update the session with the answers
    await prisma.interviewSession.update({
      where: {
        id: sessionId,
      },
      data: {
        answers: JSON.stringify(answers), // Convert to JSON string
        updatedAt: new Date(),
      },
    })

    // Revalidate the paths to update the UI
    // Remove direct revalidatePath calls from server actions
    // The client will handle refreshing with router.refresh()
    // revalidatePath("/interview")

    return { success: true }
  } catch (error) {
    console.error("Error saving interview answers:", error)
    return { success: false, error: "Failed to save interview answers" }
  }
}

/**
 * Update questions that need review
 */
export async function updateNeedsReview(sessionId: string, questionIds: number[]): Promise<UpdateNeedsReviewResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if the session exists and belongs to the user
    const session = await prisma.interviewSession.findUnique({
      where: {
        id: sessionId,
        userId: user.id,
      },
    })

    if (!session) {
      return { success: false, error: "Interview session not found" }
    }

    // Update the session with the questions that need review
    await prisma.interviewSession.update({
      where: {
        id: sessionId,
      },
      data: {
        needsReview: questionIds,
        updatedAt: new Date(),
      },
    })

    // Revalidate the paths to update the UI
    // Remove direct revalidatePath calls from server actions
    // The client will handle refreshing with router.refresh()
    // revalidatePath("/interview")

    return { success: true }
  } catch (error) {
    console.error("Error updating needs review:", error)
    return { success: false, error: "Failed to update needs review" }
  }
}

/**
 * Get interview session by ID
 */
export async function getInterviewSession(sessionId: string) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the interview session
    const session = await prisma.interviewSession.findUnique({
      where: {
        id: sessionId,
        userId: user.id,
      },
    })

    if (!session) {
      return { success: false, error: "Interview session not found" }
    }

    return {
      success: true,
      data: session,
    }
  } catch (error) {
    console.error("Error getting interview session:", error)
    return { success: false, error: "Failed to get interview session" }
  }
}

/**
 * Get recent interview sessions
 */
export async function getRecentInterviewSessions(limit = 5) {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the recent interview sessions
    const sessions = await prisma.interviewSession.findMany({
      where: {
        userId: user.id,
      },
      orderBy: {
        createdAt: "desc",
      },
      take: limit,
    })

    return {
      success: true,
      data: sessions,
    }
  } catch (error) {
    console.error("Error getting recent interview sessions:", error)
    return { success: false, error: "Failed to get recent interview sessions" }
  }
}
