import type { InterviewType } from "@/lib/actions/interview-actions"

interface InterviewPromptParams {
  jobDescription: string
  selectedTypes: InterviewType[]
}

/**
 * Compiles a prompt for generating interview questions
 */
export function compileInterviewPrompt({ jobDescription, selectedTypes }: InterviewPromptParams): string {
  // Create the selected types section
  const typesSection = ["Behavioral", "Technical", "Role-Specific", "Case-Based"]
    .map((type) => {
      const isSelected = selectedTypes.includes(type as InterviewType)
      return `[${isSelected ? "✓" : " "}] ${type}`
    })
    .join("\n")

  // Build the prompt
  const prompt = `You are a professional interview coach with expertise in preparing candidates for job interviews.

TASK:
Generate 3 interview questions per selected category below, based on the job description.

SELECTED CATEGORIES:
${typesSection}

JOB DESCRIPTION:
${jobDescription}

QUESTION GUIDELINES:
- Behavioral: Ask about past experiences that demonstrate specific skills or traits mentioned in the job description.
- Technical: Focus on technical skills, tools, or methodologies mentioned in the job description.
- Role-Specific: Ask about domain knowledge, industry experience, or specific responsibilities mentioned in the job description.
- Case-Based: Present realistic scenarios or problems that might be encountered in this role.

Make questions specific to the job description, not generic. Each question should be challenging but fair.

OUTPUT FORMAT:
Return as JSON array of objects with "type" and "question" fields:
[
 { "type": "Behavioral", "question": "Tell me about a time you..." },
 { "type": "Technical", "question": "How would you implement..." },
 { "type": "Role-Specific", "question": "What strategies would you use to..." },
 { "type": "Case-Based", "question": "Imagine you're faced with..." }
]

Ensure the output is valid JSON that can be parsed directly.`

  return prompt
}
