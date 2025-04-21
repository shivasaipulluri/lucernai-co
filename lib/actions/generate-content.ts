"use server"

import { debugLog, errorLog, previewContent } from "@/lib/utils/debug-utils"

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

    // Call the appropriate provider
    let result
    switch (provider) {
      case "gemini":
        result = await callGemini(actualApiKey, prompt, model, temperature)
        break
      case "mistral":
        result = await callMistral(actualApiKey, prompt, model, temperature)
        break
      case "openrouter":
        result = await callOpenRouter(actualApiKey, prompt, model, temperature)
        break
      default:
        throw new Error(`Unknown provider: ${provider}`)
    }

    // Validate the result
    if (!result.success) {
      errorLog("GENERATE", `Provider ${provider} returned error`)
      return result
    }

    if (!result.text || result.text.trim().length < 10) {
      errorLog("GENERATE", `Provider ${provider} returned empty or too short content`)
      return {
        success: false,
        text: `Error: ${provider} returned empty or invalid content`,
      }
    }

    debugLog("GENERATE", `Successfully generated content with ${provider}, length: ${result.text.length} chars`)
    debugLog("GENERATE", `Preview: ${previewContent(result.text, 100)}`)
    return result
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
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
  } catch (error) {
    errorLog("OPENROUTER", "Error calling OpenRouter API:", error)
    return {
      success: false,
      text: `Error calling OpenRouter API: ${error instanceof Error ? error.message : "Unknown error"}`,
    }
  }
}
