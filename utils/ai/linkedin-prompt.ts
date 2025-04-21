interface LinkedInPromptParams {
    originalAbout: string
    jobDescription: string
    tone?: string
  }
  
  /**
   * Compiles a prompt for generating an optimized LinkedIn About section
   */
  export function compileLinkedInPrompt({
    originalAbout,
    jobDescription,
    tone = "professional",
  }: LinkedInPromptParams): string {
    // Get tone-specific instructions
    const toneInstructions = getToneInstructions(tone)
  
    // Build the prompt
    const prompt = `You are an expert in personal branding and career storytelling.
  
  TASK: Rewrite the following LinkedIn "About" section to align more closely with the provided job description, while preserving the user's personality and voice.
  
  STYLE:
  - Tone: ${tone}
  - Concise (max 2600 characters)
  - ATS-aware, but still human
  - Use natural language, no buzzwords
  - Maintain first-person perspective
  - Preserve key achievements and experiences
  - Highlight relevant skills and qualifications for the target role
  
  ${toneInstructions}
  
  ORIGINAL ABOUT:
  ${originalAbout}
  
  JOB DESCRIPTION:
  ${jobDescription}
  
  OUTPUT FORMAT:
  Provide ONLY the optimized LinkedIn About section without any explanations, introductions, or commentary.
  Do not include markdown formatting, headers, or any text that is not part of the LinkedIn About itself.
  Ensure the output is under 2600 characters to meet LinkedIn's limit.
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
  - Express genuine excitement about your field and expertise
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
  