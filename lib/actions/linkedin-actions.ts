"use server"

import { createClient } from "@/lib/supabase/server"
import { prisma } from "@/lib/prisma"
import { generateContent } from "@/lib/actions/generate-content"
import { compileLinkedInPrompt } from "@/utils/ai/linkedin-prompt"

interface GenerateLinkedInResult {
  success: boolean
  error?: string
  data?: {
    optimizedAbout: string
  }
}

interface SaveLinkedInResult {
  success: boolean
  error?: string
  data?: {
    id: string
  }
}

/**
 * Generate an optimized LinkedIn About section based on the original About and job description
 */
export async function generateLinkedInAbout(
  originalAbout: string,
  jobDescription: string,
  tone = "professional",
): Promise<GenerateLinkedInResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Compile the LinkedIn prompt
    const prompt = compileLinkedInPrompt({
      originalAbout,
      jobDescription,
      tone,
    })

    // Generate the optimized LinkedIn About using Gemini
    const { success, text } = await generateContent(
      "", // API key from env
      prompt,
      "gemini-1.5-flash",
      0.7, // Higher temperature for more creative output
    )

    if (!success || !text) {
      return { success: false, error: "Failed to generate LinkedIn About" }
    }

    // Clean the generated text
    const cleanedText = cleanLinkedInOutput(text)

    return {
      success: true,
      data: {
        optimizedAbout: cleanedText,
      },
    }
  } catch (error) {
    console.error("Error generating LinkedIn About:", error)
    return { success: false, error: "Failed to generate LinkedIn About" }
  }
}

/**
 * Save a LinkedIn optimization to the database
 */
export async function saveLinkedInOptimization(
  originalAbout: string,
  jobDescription: string,
  optimizedAbout: string,
  tone = "professional",
): Promise<SaveLinkedInResult> {
  try {
    const supabase = await createClient()
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Not authenticated" }
    }

    // Create a new LinkedIn optimization
    const linkedInOptimization = await prisma.linkedInOptimization.create({
      data: {
        userId: user.id,
        originalAbout,
        jobDescription,
        optimizedAbout,
        tone,
      },
    })

    // Safely revalidate paths
    // We'll avoid calling revalidatePath during render
    console.log(`LinkedIn optimization saved with ID: ${linkedInOptimization.id}`)
    // Client will handle refresh

    return {
      success: true,
      data: {
        id: linkedInOptimization.id,
      },
    }
  } catch (error) {
    console.error("Error saving LinkedIn optimization:", error)
    return { success: false, error: "Failed to save LinkedIn optimization" }
  }
}

/**
 * Clean the LinkedIn output to remove any unwanted formatting or text
 */
function cleanLinkedInOutput(text: string): string {
  if (!text) return ""

  // Remove any markdown formatting that might have been added
  let cleaned = text.replace(/```(linkedin|text|markdown|plaintext|)?\n?/g, "").replace(/```$/g, "")

  // Remove any "Here's your LinkedIn About" or similar prefixes
  cleaned = cleaned.replace(/^(Here('s| is)|I('ve| have) (created|written|drafted)).*?(LinkedIn|About).*?\n+/i, "")

  // Remove any explanations at the end
  cleaned = cleaned.replace(/\n+.*?(I hope|This LinkedIn|Feel free)[\s\S].*?$/i, "")

  // Remove any trailing whitespace
  cleaned = cleaned.trim()

  return cleaned
}
