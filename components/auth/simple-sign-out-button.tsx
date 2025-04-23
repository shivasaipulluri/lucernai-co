"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function SimpleSignOutButton({ variant = "ghost", size = "sm", className = "" }: SignOutButtonProps) {
  const handleSignOut = () => {
    // Clear cookies immediately
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
    document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"

    // Force navigation to home page
    window.location.href = "/"

    // As a fallback, also call the API to ensure server-side sign-out
    fetch("/api/auth/signout", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
    }).catch(() => {
      // Ignore errors since we're already navigating away
    })
  }

  return (
    <Button type="button" variant={variant} size={size} className={className} onClick={handleSignOut}>
      <LogOut className="h-4 w-4 mr-2" />
      Sign Out
    </Button>
  )
}
