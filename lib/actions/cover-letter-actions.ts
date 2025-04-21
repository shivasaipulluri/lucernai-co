"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { generateContent } from "@/lib/actions/generate-content"
import { compileCoverLetterPrompt } from "@/utils/ai/cover-letter-prompt"

interface GenerateCoverLetterResult {
  success: boolean
  error?: string
  data?: {
    content: string
  }
}

interface SaveCoverLetterResult {
  success: boolean
  error?: string
  data?: {
    id: string
  }
}

/**
 * Generate a cover letter based on a resume and job description
 */
export async function generateCoverLetter(
  resumeId: string,
  jobDescription: string,
  tone = "professional",
): Promise<GenerateCoverLetterResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Get the resume
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: user.id,
      },
    })

    if (!resume) {
      return { success: false, error: "Resume not found" }
    }

    if (!resume.modifiedResume) {
      return { success: false, error: "Resume has not been tailored yet" }
    }

    // Compile the cover letter prompt
    const prompt = compileCoverLetterPrompt({
      resumeText: resume.modifiedResume,
      jobDescription,
      tone,
    })

    // Generate the cover letter using Gemini
    const { success, text } = await generateContent(
      "", // API key from env
      prompt,
      "gemini-1.5-flash",
      0.7, // Higher temperature for more creative output
    )

    if (!success || !text) {
      return { success: false, error: "Failed to generate cover letter" }
    }

    // Clean the generated text
    const cleanedText = cleanCoverLetterOutput(text)

    return {
      success: true,
      data: {
        content: cleanedText,
      },
    }
  } catch (error) {
    console.error("Error generating cover letter:", error)
    return { success: false, error: "Failed to generate cover letter" }
  }
}

/**
 * Save a cover letter to the database
 */
export async function saveCoverLetter(
  resumeId: string,
  jobDescription: string,
  content: string,
  tone = "professional",
): Promise<SaveCoverLetterResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Check if the resume exists and belongs to the user
    const resume = await prisma.resume.findUnique({
      where: {
        id: resumeId,
        userId: user.id,
      },
    })

    if (!resume) {
      return { success: false, error: "Resume not found" }
    }

    // Check if a cover letter already exists for this resume
    const existingCoverLetter = await prisma.coverLetter.findFirst({
      where: {
        userId: user.id,
        resumeId,
      },
    })

    let coverLetter

    if (existingCoverLetter) {
      // Update the existing cover letter
      coverLetter = await prisma.coverLetter.update({
        where: {
          id: existingCoverLetter.id,
        },
        data: {
          jobDescription,
          content,
          tone,
          version: existingCoverLetter.version + 1,
        },
      })
    } else {
      // Create a new cover letter
      coverLetter = await prisma.coverLetter.create({
        data: {
          userId: user.id,
          resumeId,
          jobDescription,
          content,
          tone,
          version: 1,
        },
      })
    }

    // Safely revalidate paths
    // We'll avoid calling revalidatePath during render
    console.log(`Cover letter saved with ID: ${coverLetter.id}`)
    // Client will handle refresh

    return {
      success: true,
      data: {
        id: coverLetter.id,
      },
    }
  } catch (error) {
    console.error("Error saving cover letter:", error)
    return { success: false, error: "Failed to save cover letter" }
  }
}

/**
 * Clean the cover letter output to remove any unwanted formatting or text
 */
function cleanCoverLetterOutput(text: string): string {
  if (!text) return ""

  // Remove any markdown formatting that might have been added
  let cleaned = text.replace(/```(letter|text|markdown|plaintext|)?\n?/g, "").replace(/```$/g, "")

  // Remove any "Here's your cover letter" or similar prefixes
  cleaned = cleaned.replace(/^(Here('s| is)|I('ve| have) (created|written|drafted)).*?(cover letter)[\s\S].*?\n+/i, "")

  // Remove any explanations at the end
  cleaned = cleaned.replace(/\n+.*?(I hope|This cover letter|Feel free)[\s\S].*?$/i, "")

  // Remove any trailing whitespace
  cleaned = cleaned.trim()

  return cleaned
}
