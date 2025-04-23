"use server"

import { cookies } from "next/headers"

export async function cleanupAuthTokens() {
  const cookieStore = await cookies()
  const possibleAuthCookies = [
    "sb-access-token",
    "sb-refresh-token",
    "supabase-auth-token",
    "__session",
    "sb-provider-token",
  ]

  for (const cookieName of possibleAuthCookies) {
    try {
      cookieStore.delete(cookieName)
      console.log(`Auth cleanup: Deleted cookie ${cookieName}`)
    } catch (e) {
      // Ignore errors if cookie doesn't exist
    }
  }

  return { success: true }
}
