"use client"

import { Button } from "@/components/ui/button"
import { LogOut } from "lucide-react"

interface HtmlSignOutFormProps {
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link"
  size?: "default" | "sm" | "lg" | "icon"
  className?: string
}

export function HtmlSignOutForm({ variant = "ghost", size = "sm", className = "" }: HtmlSignOutFormProps) {
  return (
    <form
      action="/api/auth/signout"
      method="post"
      onSubmit={(e) => {
        e.preventDefault()

        // Clear cookies immediately
        document.cookie = "sb-access-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"
        document.cookie = "sb-refresh-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT;"

        // Submit the form to handle server-side signout
        fetch("/api/auth/signout", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
        }).catch(() => {
          // Ignore errors
        })

        // Force navigation to home page
        window.location.href = "/"
      }}
    >
      <Button type="submit" variant={variant} size={size} className={className}>
        <LogOut className="h-4 w-4 mr-2" />
        Sign Out
      </Button>
    </form>
  )
}
