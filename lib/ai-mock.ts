// This is a mock implementation of the AI SDK for development purposes
// Replace with the actual implementation when you have the AI SDK installed

export const generateText = async ({ prompt, model, system, temperature, maxTokens }: any) => {
    console.log("AI generation request:", { prompt, model, system, temperature, maxTokens })
  
    // Simulate a delay
    await new Promise((resolve) => setTimeout(resolve, 1000))
  
    // Return a mock response
    return {
      text:
        `This is a mock AI response for prompt: "${prompt.substring(0, 50)}..."\n\n` +
        `Here are some bullet points:\n` +
        `• First accomplishment with metrics\n` +
        `• Second major responsibility\n` +
        `• Third key achievement\n` +
        `• Technical skill demonstration`,
    }
  }
  
  export const openai = (model: string) => {
    return {
      model,
      provider: "openai-mock",
    }
  }
  