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
  isLoading: boolean
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
  const [isLoading, setIsLoading] = useState(true)
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
        }).finally(() => {
          // Reset user state
          setUser(null)
          // Force a hard navigation to the home page
          window.location.href = "/"
        })
      } else if (event === "SIGNED_IN" || event === "TOKEN_REFRESHED") {
        setUser(session?.user ?? null)
        router.refresh()
      } else if (event === "USER_UPDATED") {
        setUser(session?.user ?? null)
      }
    })

    // Handle initial session error gracefully
    const checkSession = async () => {
      setIsLoading(true)
      try {
        const { data, error } = await supabase.auth.getUser()
        if (error) {
          console.warn("Session check error (handled gracefully):", error.message)

          // If there's a refresh token error, clear the session
          if (error.message.includes("Refresh Token Not Found")) {
            console.log("Clearing invalid session")
            await supabase.auth.signOut()
            setUser(null)
          }
        } else {
          setUser(data.user)
        }
      } catch (err) {
        console.warn("Unexpected session check error:", err)
        setUser(null)
      } finally {
        setIsLoading(false)
      }
    }

    checkSession()

    return () => {
      subscription.unsubscribe()
    }
  }, [supabase, router])

  return <Context.Provider value={{ supabase, user, isLoading }}>{children}</Context.Provider>
}

export const useSupabase = () => {
  const context = useContext(Context)
  if (context === undefined) {
    throw new Error("useSupabase must be used inside SupabaseProvider")
  }
  return context
}
