import { NextResponse } from "next/server"
import { testPromptCompilation } from "@/lib/ai/test-prompt-compilation"
import type { TailoringMode } from "@/lib/ai/compile-tailoring-prompt"

export async function GET(request: Request) {
  // Get the mode from the query parameters
  const { searchParams } = new URL(request.url)
  const mode = (searchParams.get("mode") as TailoringMode) || "personalized"
  const withFeedback = searchParams.get("feedback") === "true"

  try {
    // Test the prompt compilation
    const result = await testPromptCompilation(mode, withFeedback)

    return NextResponse.json(result)
  } catch (error) {
    console.error("Error testing prompt compilation:", error)
    return NextResponse.json({ error: "Failed to test prompt compilation" }, { status: 500 })
  }
}
