"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"

interface SignOutButtonProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function SignOutButton({ variant = "ghost", size = "sm", className = "" }: SignOutButtonProps) {
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const handleSignOut = async () => {
    setIsLoading(true)

    try {
      // Show toast first
      toast({
        title: "Signing out",
        description: "You are being signed out...",
      })

      // Clear any auth-related cookies manually first
      document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
      document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"

      // Call the sign-out API route
      fetch("/api/auth/signout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      }).catch((err) => {
        console.error("Error calling signout API:", err)
      })

      // Force immediate navigation to home page
      console.log("Redirecting to home page...")

      // Use setTimeout to ensure this runs after the current execution context
      setTimeout(() => {
        window.location.replace("/")
      }, 100)
    } catch (error) {
      console.error("Error signing out:", error)
      setIsLoading(false)

      toast({
        title: "Error",
        description: "There was a problem signing out. Please try again.",
        variant: "destructive",
      })
    }
  }

  return (
    <Button
      type="button"
      variant={variant}
      size={size}
      className={className}
      onClick={handleSignOut}
      disabled={isLoading}
    >
      {isLoading ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <LogOut className="h-4 w-4 mr-2" />}
      Sign Out
    </Button>
  )
}
