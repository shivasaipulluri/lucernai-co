import { headers } from "next/headers"

/**
 * Gets the base URL of the application, respecting the current request context
 * This is safe to use in both server actions and API routes
 */
export async function getAppBaseUrl(): Promise<string> {
  // Try to get the host from the request headers
  try {
    const headersList = await headers()
    const host = headersList.get("host") || ""
    const protocol = headersList.get("x-forwarded-proto") || "http"

    if (host) {
      return `${protocol}://${host}`
    }
  } catch (e) {
    // Headers might not be available in all contexts
    console.warn("Could not access request headers for base URL")
  }

  // Fall back to environment variable
  if (process.env.NEXT_PUBLIC_APP_URL) {
    return process.env.NEXT_PUBLIC_APP_URL
  }

  // Last resort fallback for development only
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3000"
  }

  // If we can't determine the URL, use relative URLs
  return ""
}
