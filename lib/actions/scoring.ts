"use server"

export async function calculateScoresWithGPT(
  originalResume: string,
  tailoredResume: string,
  jobDescription: string,
): Promise<{
  ats_score: number
  jd_score: number
  ats_feedback?: string
  jd_feedback?: string
}> {
  try {
    const scoringPrompt = `
You are an expert resume evaluator with deep knowledge of ATS systems and hiring processes.

ORIGINAL RESUME:
${originalResume.substring(0, 2000)}...

TAILORED RESUME:
${tailoredResume.substring(0, 2000)}...

JOB DESCRIPTION:
${jobDescription.substring(0, 1000)}...

TASK:
Evaluate the tailored resume on two dimensions:
1. ATS SCORE (0-100): How well will this resume perform in Applicant Tracking Systems? Consider keyword matching, formatting, and standard ATS compatibility factors.
2. JD SCORE (0-100): How well does this resume align with the specific job description? Consider skills matching, experience relevance, and qualification alignment.

For each score, provide detailed feedback explaining the strengths and areas for improvement.

RESPONSE FORMAT:
Provide your evaluation as a JSON object with this exact format:
{
"ats_score": [score between 0-100],
"jd_score": [score between 0-100],
"ats_feedback": "[detailed explanation of ATS score with specific strengths and weaknesses]",
"jd_feedback": "[detailed explanation of JD score with specific strengths and weaknesses]"
}
`

    // Call Mixtral model for scoring
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-medium",
        messages: [{ role: "user", content: scoringPrompt }],
        temperature: 0.1,
        response_format: { type: "json_object" },
      }),
    })

    if (!response.ok) {
      throw new Error(`Mistral API error: ${response.statusText}`)
    }

    const data = await response.json()
    const content = data.choices[0].message.content
    const scores = JSON.parse(content)

    return {
      ats_score: Math.min(Math.max(Math.round(scores.ats_score), 0), 100),
      jd_score: Math.min(Math.max(Math.round(scores.jd_score), 0), 100),
      ats_feedback: scores.ats_feedback,
      jd_feedback: scores.jd_feedback,
    }
  } catch (error) {
    console.error("Error calculating scores:", error)
    return {
      ats_score: 75,
      jd_score: 75,
      ats_feedback: "Unable to generate detailed ATS feedback due to an error.",
      jd_feedback: "Unable to generate detailed job description feedback due to an error.",
    } // Fallback scores
  }
}
