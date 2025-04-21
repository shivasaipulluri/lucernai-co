"use server"

import { generateContent } from "@/lib/actions/generate-content"

export async function testAIConnections() {
  const results = {
    gemini: { success: false, message: "" },
    mistral: { success: false, message: "" },
  }

  // Test Gemini
  try {
    const geminiResult = await generateContent(
      "",
      "Hello, can you respond with 'Gemini connection successful'?",
      "gemini-1.5-flash",
      0.5,
    )

    results.gemini = {
      success: geminiResult.success,
      message: geminiResult.success ? geminiResult.text : "Failed to connect to Gemini",
    }
  } catch (error: any) {
    results.gemini = {
      success: false,
      message: `Error: ${error.message}`,
    }
  }

  // Test Mistral
  try {
    const mistralResult = await generateContent(
      "",
      "Hello, can you respond with 'Mistral connection successful'?",
      "mistral-medium",
      0.5,
    )

    results.mistral = {
      success: mistralResult.success,
      message: mistralResult.success ? mistralResult.text : "Failed to connect to Mistral",
    }
  } catch (error: any) {
    results.mistral = {
      success: false,
      message: `Error: ${error.message}`,
    }
  }

  return results
}
