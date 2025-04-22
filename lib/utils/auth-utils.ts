"use client"

/**
 * Utility function to clear auth state on the client side
 */
export async function clearClientAuthState() {
  try {
    // Clear any auth cookies that might be stored
    document.cookie.split(";").forEach((cookie) => {
      const [name] = cookie.trim().split("=")
      if (name.includes("sb-") || name.includes("supabase") || name.includes("auth")) {
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      }
    })

    // Clear localStorage items related to auth
    const authItems = ["supabase.auth.token", "supabase-auth-token", "sb-auth-token"]
    authItems.forEach((item) => {
      try {
        localStorage.removeItem(item)
      } catch (e) {
        // Ignore errors
      }
    })

    console.log("Client auth state cleared")
  } catch (error) {
    console.error("Error clearing client auth state:", error)
  }
}
