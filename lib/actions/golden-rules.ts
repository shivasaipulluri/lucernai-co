"use server"

export async function checkGoldenRules(
  tailoredResume: string,
  jobDescription: string,
): Promise<{ passed: boolean; feedback: string[]; suggestions: string[] }> {
  try {
    const goldenRulesPrompt = `
You are a resume quality assurance expert. Evaluate the tailored resume against these Golden Rules:

1. AUTHENTICITY: The resume must not contain fabricated experiences or qualifications.
2. READABILITY: The resume must be well-structured, clear, and easy to read.
3. RELEVANCE: The resume must highlight experiences and skills relevant to the job description.
4. SPECIFICITY: The resume must include specific achievements and metrics where appropriate.
5. CONSISTENCY: The resume must maintain consistent formatting and tense throughout.

TAILORED RESUME:
${tailoredResume.substring(0, 3000)}...

JOB DESCRIPTION:
${jobDescription.substring(0, 1000)}...

TASK:
Evaluate if the resume passes all Golden Rules. Provide specific feedback and suggestions for improvement.

RESPONSE FORMAT:
{
 "passed": [true/false],
 "feedback": ["specific issue 1", "specific issue 2", ...],
 "suggestions": ["specific suggestion 1", "specific suggestion 2", ...]
}
`

    // Call Mixtral model for golden rules check
    const response = await fetch("https://api.mistral.ai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.MISTRAL_API_KEY}`,
      },
      body: JSON.stringify({
        model: "mistral-medium",
        messages: [{ role: "user", content: goldenRulesPrompt }],
        temperature: 0.2,
        response_format: { type: "json_object" },
      }),
    })

    const data = await response.json()
    const content = data.choices[0].message.content
    const result = JSON.parse(content)

    return {
      passed: result.passed === true,
      feedback: Array.isArray(result.feedback) ? result.feedback : [],
      suggestions: Array.isArray(result.suggestions) ? result.suggestions : [],
    }
  } catch (error) {
    console.error("Error checking golden rules:", error)
    return {
      passed: false,
      feedback: ["Error evaluating golden rules"],
      suggestions: ["Please try again"],
    }
  }
}
