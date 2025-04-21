"use server"

import { retry } from "@/lib/utils/retry-utils"

interface ScoringResult {
  atsScore: number
  jdScore: number
  atsFeedback?: string
  jdFeedback?: string
  error?: string
}

/**
 * Calls the Mixtral API to score a resume against a job description
 * Returns ATS compatibility and JD alignment scores
 */
export async function callMixtralForScoring(
  resume: string,
  jobDescription: string,
  attemptNumber = 1,
): Promise<ScoringResult> {
  try {
    const apiKey = process.env.MISTRAL_API_KEY

    if (!apiKey) {
      throw new Error("MISTRAL_API_KEY is not defined in environment variables")
    }

    // Construct a detailed scoring prompt
    const scoringPrompt = `
You are an expert resume evaluator with deep knowledge of Applicant Tracking Systems (ATS) and hiring processes.

TASK:
Evaluate the provided resume against the job description on two dimensions:
1. ATS SCORE (0-100): How well will this resume perform in Applicant Tracking Systems?
2. JD SCORE (0-100): How well does this resume align with the specific job description?

RESUME:
${resume.substring(0, 3000)}${resume.length > 3000 ? "..." : ""}

JOB DESCRIPTION:
${jobDescription.substring(0, 1500)}${jobDescription.length > 1500 ? "..." : ""}

SCORING CRITERIA:

For ATS Score:
- Keyword matching with job description
- Proper formatting and structure
- Use of industry-standard terminology
- Absence of complex formatting that might confuse ATS
- Appropriate use of section headers

For JD Score:
- Alignment of skills and experiences with job requirements
- Demonstration of relevant achievements
- Matching of qualifications and education requirements
- Addressing specific responsibilities mentioned in the JD
- Overall relevance to the position

RESPONSE FORMAT:
Provide your evaluation as a JSON object with this exact format:
{
 "ats_score": [score between 0-100],
 "jd_score": [score between 0-100],
 "ats_feedback": "[brief explanation of ATS score]",
 "jd_feedback": "[brief explanation of JD score]"
}
`

    // Call Mixtral API with retry logic
    const response = await retry(
      async () => {
        const apiResponse = await fetch("https://api.mistral.ai/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${apiKey}`,
          },
          body: JSON.stringify({
            model: "mistral-medium",
            messages: [{ role: "user", content: scoringPrompt }],
            temperature: 0.1,
            response_format: { type: "json_object" },
          }),
        })

        if (!apiResponse.ok) {
          const errorData = await apiResponse.json().catch(() => ({}))
          throw new Error(
            `Mixtral API error (${apiResponse.status}): ${
              errorData.error?.message || apiResponse.statusText || "Unknown error"
            }`,
          )
        }

        return apiResponse.json()
      },
      {
        retries: 1,
        delay: 1000,
        onRetry: (error) => {
          console.warn(`Retry attempt for Mixtral scoring due to: ${error.message}`)
        },
      },
    )

    // Parse the response
    const content = response.choices[0].message.content
    let scores: { ats_score: number; jd_score: number; ats_feedback?: string; jd_feedback?: string }

    try {
      scores = JSON.parse(content)
    } catch (error) {
      console.error("Failed to parse Mixtral response:", content)
      throw new Error("Invalid JSON response from Mixtral API")
    }

    // Validate and normalize scores
    const atsScore = Math.min(Math.max(Math.round(scores.ats_score), 0), 100)
    const jdScore = Math.min(Math.max(Math.round(scores.jd_score), 0), 100)

    // Log successful scoring
    console.log(`[SCORING] Attempt #${attemptNumber} - Mixtral scores: ATS=${atsScore}, JD=${jdScore}`)

    return {
      atsScore,
      jdScore,
      atsFeedback: scores.ats_feedback,
      jdFeedback: scores.jd_feedback,
    }
  } catch (error: any) {
    console.error(`[SCORING ERROR] Mixtral scoring failed:`, error)

    // Return default scores with error information
    return {
      atsScore: 60,
      jdScore: 60,
      error: `Scoring failed: ${error.message}`,
    }
  }
}
