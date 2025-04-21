interface CoverLetterPromptParams {
    resumeText: string
    jobDescription: string
    tone?: string
  }
  
  /**
   * Compiles a prompt for generating a cover letter
   */
  export function compileCoverLetterPrompt({
    resumeText,
    jobDescription,
    tone = "professional",
  }: CoverLetterPromptParams): string {
    // Get tone-specific instructions
    const toneInstructions = getToneInstructions(tone)
  
    // Build the prompt
    const prompt = `You are an expert career writer with years of experience crafting compelling, ATS-compatible cover letters.
  
  TASK:
  Write a compelling, ATS-compatible cover letter based on the resume and job description below.
  
  INSTRUCTIONS:
  - Maximum 300 words
  - Address the company and role specifically
  - Highlight relevant experience from the resume that matches the job requirements
  - Keep tone ${tone} yet human
  - Use plain formatting (no markdown, no tables)
  - Include a proper greeting and closing
  - Focus on achievements and skills that directly relate to the job
  - Do not include the date or contact information
  - Structure in 3-4 paragraphs:
   1. Introduction with position and company name
   2. 1-2 paragraphs highlighting relevant experience
   3. Closing paragraph with call to action
  
  ${toneInstructions}
  
  RESUME:
  ${resumeText}
  
  JOB DESCRIPTION:
  ${jobDescription}
  
  OUTPUT FORMAT:
  Provide ONLY the cover letter text without any explanations, introductions, or commentary.
  Do not include markdown formatting, headers, or any text that is not part of the cover letter itself.
  `
  
    return prompt
  }
  
  /**
   * Get tone-specific instructions based on the selected tone
   */
  function getToneInstructions(tone: string): string {
    switch (tone) {
      case "professional":
        return `
  TONE GUIDANCE:
  - Use formal language and structure
  - Maintain a respectful, business-like tone
  - Be concise and direct
  - Use industry-standard terminology
  - Avoid overly casual expressions or slang
  - Balance confidence with humility
  `
      case "enthusiastic":
        return `
  TONE GUIDANCE:
  - Express genuine excitement about the role and company
  - Use energetic, positive language
  - Highlight passion for the industry
  - Demonstrate eagerness to contribute
  - Use slightly more dynamic language
  - Still maintain professionalism while showing enthusiasm
  `
      case "confident":
        return `
  TONE GUIDANCE:
  - Use assertive, direct language
  - Focus on achievements and concrete results
  - Use strong action verbs
  - Demonstrate expertise and authority
  - Be bold but not arrogant
  - Emphasize problem-solving abilities
  `
      case "conversational":
        return `
  TONE GUIDANCE:
  - Use a more relaxed, approachable tone
  - Write as if speaking directly to the reader
  - Use contractions (I'm, I've, etc.)
  - Be friendly while maintaining professionalism
  - Show personality while staying focused on qualifications
  - Create a sense of connection with the reader
  `
      default:
        return `
  TONE GUIDANCE:
  - Use formal language and structure
  - Maintain a respectful, business-like tone
  - Be concise and direct
  - Use industry-standard terminology
  - Avoid overly casual expressions or slang
  - Balance confidence with humility
  `
    }
  }
  