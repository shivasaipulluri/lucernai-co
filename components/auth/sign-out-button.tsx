"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { LogOut, Loader2 } from "lucide-react"
import { signOut } from "@/lib/actions/auth-actions"
import { useToast } from "@/hooks/use-toast"

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
    console.log("SignOutButton: Sign out initiated")

    try {
      // Show toast before redirecting
      toast({
        title: "Signing out",
        description: "You are being signed out...",
      })

      // Use the server action directly - this should trigger the redirect
      await signOut()

      // If we somehow get here (we shouldn't because of the redirect),
      // force a hard refresh to the home page using the current origin
      console.log("SignOutButton: Server action completed without redirect, forcing navigation")
      window.location.href = "/"
    } catch (error) {
      console.error("SignOutButton: Error signing out:", error)
      setIsLoading(false)

      toast({
        title: "You are Leaving Me",
        description: "I Miss You Here..! (From Lucerna)",
        variant: "destructive",
      })

      // Even if there's an error, try to redirect to home
      window.location.href = "/"
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
