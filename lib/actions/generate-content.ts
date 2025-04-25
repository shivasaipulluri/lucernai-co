"use server"

import { debugLog, errorLog, previewContent } from "@/lib/utils/debug-utils"
import { createHash } from "crypto"

// Add at the top of the file, after imports
// Simple in-memory cache for content generation
const contentCache = new Map<string, { timestamp: number; result: { success: boolean; text: string } }>()
const CACHE_TTL = 1000 * 60 * 60 // 1 hour cache TTL

// AI provider configuration
const AI_PROVIDERS = {
  gemini: {
    baseUrl: "https://generativelanguage.googleapis.com/v1beta",
    models: {
      default: "gemini-1.5-flash",
      pro: "gemini-1.5-pro",
    },
    apiKeyEnv: "GOOGLE_AI_API_KEY",
  },
  mistral: {
    baseUrl: "https://api.mistral.ai/v1",
    models: {
      default: "mistral-medium",
      pro: "mistral-large-latest",
    },
    apiKeyEnv: "MISTRAL_API_KEY",
  },
  openrouter: {
    baseUrl: "https://openrouter.ai/api/v1",
    models: {
      default: "anthropic/claude-3-haiku",
      pro: "anthropic/claude-3-opus",
    },
    apiKeyEnv: "OPENROUTER_API_KEY",
  },
} as const

type ProviderKey = keyof typeof AI_PROVIDERS

// Modify the generateContent function to add better error handling and logging
export async function generateContent(
  apiKey: string,
  prompt: string,
  model = "gemini-1.5-flash",
  temperature = 0.7,
): Promise<{ success: boolean; text: string }> {
  try {
    // Generate a cache key based on the prompt and model
    const cacheKey = `${model}:${temperature}:${createHash("sha256").update(prompt).digest("hex")}`

    // Check cache first
    const cached = contentCache.get(cacheKey)
    if (cached && Date.now() - cached.timestamp < CACHE_TTL) {
      debugLog("GENERATE", `Cache hit for model: ${model}, returning cached result`)
      return cached.result
    }

    debugLog("GENERATE", `Starting content generation with model: ${model}, prompt length: ${prompt.length} chars`)

    // Input validation
    if (!prompt || prompt.trim().length < 10) {
      errorLog("GENERATE", "Invalid prompt: too short or empty")
      return { success: false, text: "Error: Invalid prompt provided" }
    }

    // Determine which provider to use based on model name
    let provider: ProviderKey = "gemini"
    if (model.startsWith("mistral")) {
      provider = "mistral"
    } else if (model.includes("claude") || model.includes("gpt")) {
      provider = "openrouter"
    }

    // Get API key from environment if not provided
    const actualApiKey = apiKey || process.env[AI_PROVIDERS[provider].apiKeyEnv]
    if (!actualApiKey) {
      errorLog("GENERATE", `No API key available for ${provider}`)
      return { success: false, text: `Error: No API key available for ${provider}` }
    }

    // Call the appropriate provider with timeout and retry logic
    let result
    const maxRetries = 2
    let retryCount = 0
    let lastError

    while (retryCount <= maxRetries) {
      try {
        // Add timeout to prevent hanging requests
        const timeoutPromise = new Promise<{ success: false; text: string }>((_, reject) =>
          setTimeout(() => reject(new Error("Request timeout")), 30000),
        )

        let providerPromise
        switch (provider) {
          case "gemini":
            providerPromise = callGemini(actualApiKey, prompt, model, temperature)
            break
          case "mistral":
            providerPromise = callMistral(actualApiKey, prompt, model, temperature)
            break
          case "openrouter":
            providerPromise = callOpenRouter(actualApiKey, prompt, model, temperature)
            break
          default:
            throw new Error(`Unknown provider: ${provider}`)
        }

        // Race between the provider call and the timeout
        result = await Promise.race([providerPromise, timeoutPromise])

        // If successful, break out of retry loop
        if (result.success) break

        // If we got an error response but not a timeout, maybe retry
        lastError = new Error(result.text)
        retryCount++

        // Wait before retrying (exponential backoff)
        if (retryCount <= maxRetries) {
          const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 8000)
          await new Promise((resolve) => setTimeout(resolve, backoffMs))
          debugLog("GENERATE", `Retrying after error (attempt ${retryCount}): ${result.text}`)
        }
      } catch (error: any) {
        lastError = error
        retryCount++

        // Wait before retrying (exponential backoff)
        if (retryCount <= maxRetries) {
          const backoffMs = Math.min(1000 * Math.pow(2, retryCount), 8000)
          await new Promise((resolve) => setTimeout(resolve, backoffMs))
          debugLog("GENERATE", `Retrying after exception (attempt ${retryCount}): ${error.message}`)
        }
      }
    }

    // If we exhausted retries without success
    if (!result || !result.success) {
      const errorMsg = lastError ? lastError.message : "Unknown error after retries"
      errorLog("GENERATE", `Failed after ${retryCount} retries: ${errorMsg}`)
      return { success: false, text: `Error after retries: ${errorMsg}` }
    }

    // Validate the result
    if (!result.text || result.text.trim().length < 10) {
      errorLog("GENERATE", `Provider ${provider} returned empty or too short content`)
      return {
        success: false,
        text: `Error: ${provider} returned empty or invalid content`,
      }
    }

    debugLog("GENERATE", `Successfully generated content with ${provider}, length: ${result.text.length} chars`)
    debugLog("GENERATE", `Preview: ${previewContent(result.text, 100)}`)

    // Cache the successful result
    contentCache.set(cacheKey, {
      timestamp: Date.now(),
      result,
    })

    return result
  } catch (error: any) {
    errorLog("GENERATE", "Error generating content:", error)
    return {
      success: false,
      text: `Error generating content: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

async function callGemini(apiKey: string, prompt: string, model: string, temperature: number) {
  try {
    debugLog("GEMINI", `Calling Gemini API with model: ${model}`)
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-goog-api-key": apiKey,
      },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature },
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.error?.message || response.statusText
      errorLog("GEMINI", `API error: ${errorMessage}`)
      throw new Error(`Gemini API error: ${errorMessage}`)
    }

    if (!data.candidates || !data.candidates[0] || !data.candidates[0].content || !data.candidates[0].content.parts) {
      errorLog("GEMINI", "Invalid response structure", data)
      throw new Error("Invalid response structure from Gemini API")
    }

    const text = data.candidates[0].content.parts[0].text
    debugLog("GEMINI", `Generated text length: ${text.length} chars`)
    return {
      success: true,
      text,
    }
  } catch (error: any) {
    errorLog("GEMINI", "Error calling Gemini API:", error)
    return {
      success: false,
      text: `Error calling Gemini API: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

async function callMistral(apiKey: string, prompt: string, model: string, temperature: number) {
  try {
    debugLog("MISTRAL", `Calling Mistral API with model: ${model}`)
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.error?.message || response.statusText
      errorLog("MISTRAL", `API error: ${errorMessage}`)
      throw new Error(`Mistral API error: ${errorMessage}`)
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      errorLog("MISTRAL", "Invalid response structure", data)
      throw new Error("Invalid response structure from Mistral API")
    }

    const text = data.choices[0].message.content
    debugLog("MISTRAL", `Generated text length: ${text.length} chars`)
    return {
      success: true,
      text,
    }
  } catch (error: any) {
    errorLog("MISTRAL", "Error calling Mistral API:", error)
    return {
      success: false,
      text: `Error calling Mistral API: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}

async function callOpenRouter(apiKey: string, prompt: string, model: string, temperature: number) {
  try {
    debugLog("OPENROUTER", `Calling OpenRouter API with model: ${model}`)
    const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model,
        messages: [{ role: "user", content: prompt }],
        temperature,
      }),
    })

    const data = await response.json()

    if (!response.ok) {
      const errorMessage = data.error?.message || response.statusText
      errorLog("OPENROUTER", `API error: ${errorMessage}`)
      throw new Error(`OpenRouter API error: ${errorMessage}`)
    }

    if (!data.choices || !data.choices[0] || !data.choices[0].message || !data.choices[0].message.content) {
      errorLog("OPENROUTER", "Invalid response structure", data)
      throw new Error("Invalid response structure from OpenRouter API")
    }

    const text = data.choices[0].message.content
    debugLog("OPENROUTER", `Generated text length: ${text.length} chars`)
    return {
      success: true,
      text,
    }
  } catch (error: any) {
    errorLog("OPENROUTER", "Error calling OpenRouter API:", error)
    return {
      success: false,
      text: `Error calling OpenRouter API: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
