import { generateContent } from "@/lib/actions/generate-content"
import { retry } from "@/lib/utils/retry-utils"

interface JDAnalysisResult {
  success: boolean
  error?: string
  data?: {
    role: string
    seniority: string
    responsibilities: string[]
    qualifications: string[]
    keywords: string[]
    categories: {
      technical: string[]
      soft: string[]
      certifications: string[]
    }
  }
}

/**
 * Analyzes a job description using AI to extract structured information
 */
export async function analyzeJobDescription(jobDescription: string): Promise<JDAnalysisResult> {
  try {
    // Create a structured prompt for the AI
    const prompt = `
You are an expert job description analyzer with deep knowledge of various industries and roles.

TASK:
Analyze the following job description and extract structured information about the role, seniority level, responsibilities, qualifications, and keywords.

JOB DESCRIPTION:
${jobDescription}

OUTPUT FORMAT:
Return a JSON object with the following structure:
{
  "role": "Job title/role name",
  "seniority": "Entry-level/Junior/Mid-level/Senior/Lead/Manager/Director/Executive",
  "responsibilities": ["Responsibility 1", "Responsibility 2", ...],
  "qualifications": ["Qualification 1", "Qualification 2", ...],
  "keywords": ["Keyword 1", "Keyword 2", ...],
  "categories": {
    "technical": ["Technical skill 1", "Technical skill 2", ...],
    "soft": ["Soft skill 1", "Soft skill 2", ...],
    "certifications": ["Certification 1", "Certification 2", ...]
  }
}

GUIDELINES:
- For "role", extract the main job title or role name
- For "seniority", determine the level based on years of experience, responsibilities, and qualifications
- For "responsibilities", extract 3-7 key responsibilities from the job description
- For "qualifications", extract 3-7 key qualifications or requirements
- For "keywords", identify 5-10 important keywords that would be relevant for resume tailoring
- For "categories.technical", list technical skills and tools mentioned
- For "categories.soft", list soft skills and traits mentioned
- For "categories.certifications", list any certifications or formal qualifications mentioned

Ensure the output is valid JSON that can be parsed directly.
`

    // Use retry logic to handle potential failures
    const result = await retry(
      async () => {
        const { success, text } = await generateContent(
          "", // API key from env
          prompt,
          "gemini-1.5-flash",
          0.2, // Low temperature for more deterministic output
        )

        if (!success || !text) {
          throw new Error("Failed to generate analysis")
        }

        // Extract and parse the JSON response
        let jsonResponse
        try {
          // Try to parse the raw response
          jsonResponse = JSON.parse(text)
        } catch (parseError) {
          // If that fails, try to extract JSON from the text
          const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/) || text.match(/{[\s\S]*}/)

          if (jsonMatch) {
            try {
              jsonResponse = JSON.parse(jsonMatch[0].replace(/```json|```/g, "").trim())
            } catch (nestedError) {
              throw new Error("Failed to parse AI response as JSON")
            }
          } else {
            throw new Error("Failed to extract JSON from AI response")
          }
        }

        return jsonResponse
      },
      {
        retries: 2,
        delay: 1000,
        onRetry: (error) => {
          console.warn(`Retry attempt for JD analysis due to: ${error.message}`)
        },
      },
    )

    // Validate the result structure
    if (!result || typeof result !== "object") {
      throw new Error("Invalid analysis result structure")
    }

    // Ensure all required fields are present
    const requiredFields = ["role", "seniority", "responsibilities", "qualifications", "keywords", "categories"]
    for (const field of requiredFields) {
      if (!(field in result)) {
        throw new Error(`Missing required field: ${field}`)
      }
    }

    // Ensure categories has the required subfields
    const requiredCategories = ["technical", "soft", "certifications"]
    for (const category of requiredCategories) {
      if (!(category in result.categories)) {
        result.categories[category] = []
      }
    }

    // Ensure all array fields are actually arrays
    const arrayFields = [
      "responsibilities",
      "qualifications",
      "keywords",
      "categories.technical",
      "categories.soft",
      "categories.certifications",
    ]
    for (const field of arrayFields) {
      const [parent, child] = field.includes(".") ? field.split(".") : [field, null]

      if (child) {
        if (!Array.isArray(result[parent][child])) {
          result[parent][child] = []
        }
      } else {
        if (!Array.isArray(result[parent])) {
          result[parent] = []
        }
      }
    }

    return {
      success: true,
      data: {
        role: result.role,
        seniority: result.seniority,
        responsibilities: result.responsibilities,
        qualifications: result.qualifications,
        keywords: result.keywords,
        categories: result.categories,
      },
    }
  } catch (error) {
    console.error("Error analyzing job description:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    }
  }
}

/**
 * Provides a fallback analysis when AI analysis fails
 */
export function getFallbackAnalysis(jobDescription: string): JDAnalysisResult["data"] {
  // Extract potential role from the first 200 characters
  const roleMatch = jobDescription.substring(0, 200).match(/(?:for|hiring|seeking|looking for)(?: a| an)? ([^.,:;]+)/i)
  const role = roleMatch ? roleMatch[1].trim() : "Unspecified Role"

  // Determine seniority based on keywords
  let seniority = "Mid-level"
  if (jobDescription.match(/senior|lead|principal|architect|head/i)) {
    seniority = "Senior"
  } else if (jobDescription.match(/junior|entry|graduate|intern/i)) {
    seniority = "Junior"
  }

  // Extract potential keywords
  const keywordMatches = jobDescription.match(
    /\b(react|javascript|typescript|node|python|java|c\+\+|sql|aws|azure|agile|scrum|frontend|backend|fullstack|full-stack|ui|ux|design|testing|devops|cloud|data|analytics|machine learning|ai)\b/gi,
  )
  const keywords = keywordMatches ? [...new Set(keywordMatches.map((k) => k.toLowerCase()))] : []

  return {
    role,
    seniority,
    responsibilities: ["Responsibilities could not be automatically extracted"],
    qualifications: ["Qualifications could not be automatically extracted"],
    keywords: keywords.length > 0 ? keywords : ["Keywords could not be automatically extracted"],
    categories: {
      technical: keywords.filter((k) => !["agile", "scrum"].includes(k.toLowerCase())),
      soft: ["Communication", "Teamwork"],
      certifications: [],
    },
  }
}
