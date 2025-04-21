/**
 * Utility for consistent debug logging
 */
export function debugLog(component: string, message: string, data?: any) {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0]
    const logMessage = `[${timestamp}][${component}] ${message}`
  
    if (data) {
      console.log(logMessage, data)
    } else {
      console.log(logMessage)
    }
  }
  
  /**
   * Utility for consistent error logging
   */
  export function errorLog(component: string, message: string, error?: any) {
    const timestamp = new Date().toISOString().split("T")[1].split(".")[0]
    const logMessage = `[${timestamp}][${component}] ERROR: ${message}`
  
    if (error) {
      console.error(logMessage, error)
    } else {
      console.error(logMessage)
    }
  }
  
  /**
   * Utility to safely preview content (handles null/undefined and truncates long content)
   */
  export function previewContent(content: string | null | undefined, maxLength = 50): string {
    if (!content) return "null or empty"
    if (content.length <= maxLength) return content
    return `${content.substring(0, maxLength)}...`
  }
  