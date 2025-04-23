"use client"

import type React from "react"
import { createContext, useContext, useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { SupabaseClient, User } from "@supabase/supabase-js"
import type { Database } from "@/lib/supabase/database.types"
import { useRouter } from "next/navigation"

type SupabaseContext = {
  supabase: SupabaseClient<Database>
  user: User | null
}

const Context = createContext<SupabaseContext | undefined>(undefined)

export default function SupabaseProvider({
  children,
  initialUser,
}: {
  children: React.ReactNode
  initialUser: User | null
}) {
  const [supabase] = useState(() => createClient())
  const [user, setUser] = useState<User | null>(initialUser)
  const router = useRouter()

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      console.log("Auth state change event:", event)

      if (event === "SIGNED_OUT") {
        // Delete any server-side cookies
        fetch("/api/auth/signout", {
          method: "POST",
          credentials: "include",
        })

        // Reset user state
        setUser(null)

        // Refresh the page to ensure clean state
        router.refresh()
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setUser(session?.user ?? null)
        router.refresh()
      } else if (event === "USER_UPDATED") {
        setUser(session?.user ?? null)
      }
    })

    // Handle initial session error gracefully
    const checkSession = async () => {
      try {
        const { data, error } = await supabase.auth.getSession()
        if (error) {
          console.warn("Session check error (handled gracefully):", error.message)

          // If there's a refresh token error, clear the session
          if (error.message.includes("Refresh Token Not Found")) {
            console.log("Clearing invalid session")
            await supabase.auth.signOut()
            setUser(null)
          }
        }
      } catch (err) {
        console.warn("Unexpected session check error:", err)
      }
    }

    checkSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return <Context.Provider value={{ supabase, user }}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}
