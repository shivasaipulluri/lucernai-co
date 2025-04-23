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
    "sb:token",
    "sb-provider-token",
    "sb-refresh-token-nonce",
  ]

  for (const cookieName of possibleAuthCookies) {
    try {
      cookieStore.delete({ name: cookieName, path: "/" })
    } catch (e) {
      // Ignore errors if cookie doesn't exist
    }
  }
}
