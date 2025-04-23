"use client"

export function clearAuthCookies() {
  // Clear all possible auth cookies
  const possibleAuthCookies = [
    "sb-access-token",
    "sb-refresh-token",
    "supabase-auth-token",
    "__session",
    "sb-provider-token",
    "sb:token",
    "sb-provider-token",
    "sb-refresh-token-nonce",
  ]

  const domains = ["", "localhost", window.location.hostname]
  const paths = ["/", ""]

  // Try all combinations of domains and paths
  for (const cookieName of possibleAuthCookies) {
    for (const domain of domains) {
      for (const path of paths) {
        const cookieStr = `${cookieName}=; path=${path}${domain ? `; domain=${domain}` : ""}; expires=Thu, 01 Jan 1970 00:00:00 GMT; secure;`
        document.cookie = cookieStr
      }
    }
  }

  // Also try without secure flag
  for (const cookieName of possibleAuthCookies) {
    document.cookie = `${cookieName}=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;`
  }

  console.log("Client-side auth cookies cleared")
}
