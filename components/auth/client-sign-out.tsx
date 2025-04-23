"use client"

import type React from "react"

import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { useSupabase } from "@/lib/supabase/provider"
import type { ButtonProps } from "@/components/ui/button"

export function ClientSignOutButton({ children, ...props }: ButtonProps & { children?: React.ReactNode }) {
  const router = useRouter()
  const { supabase } = useSupabase()

  const handleSignOut = async () => {
    // Clear cookies on the client side
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
    document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"

    // Sign out from Supabase
    await supabase.auth.signOut()

    // Redirect to home page
    router.push("/")
    router.refresh()
  }

  return (
    <Button onClick={handleSignOut} {...props}>
      {children || "Sign Out"}
    </Button>
  )
}
