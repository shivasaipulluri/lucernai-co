"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { signOut } from "@/lib/actions/auth-actions"

interface DirectSignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function DirectSignOutButton({ variant = "ghost", size = "sm", className = "" }: DirectSignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleSignOut = async () => {
    setIsLoading(true)

    // Clear cookies first
    document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
    document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"

    // Force navigation to home page
    window.location.href = "/"
  }

  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant={variant}
        size={size}
        className={className}
        disabled={isLoading}
        onClick={handleSignOut}
      >
        {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
        Sign Out
      </Button>
    </form>
  )
}
