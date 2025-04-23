import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import type { Database } from "@/lib/supabase/database.types"

export async function createClient() {
  const cookieStore = await cookies()

  return createServerClient<Database>(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll().map((cookie) => ({
            name: cookie.name,
            value: cookie.value,
          }))
        },
        setAll(cookies) {
          cookies.forEach(({ name, value, options }) => {
            try {
              cookieStore.set({
                name,
                value,
                ...options,
              })
            } catch (error) {
              // This happens when attempting to set cookies in a Server Component
              // We can safely ignore this error
            }
          })
        },
      },
      auth: {
        flowType: "pkce",
        persistSession: true,
        detectSessionInUrl: true,
        autoRefreshToken: true,
      },
    },
  )
}
