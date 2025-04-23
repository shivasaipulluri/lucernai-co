"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { LogOut, KeyRound, ShieldCheck, AlertTriangle } from "lucide-react"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
const supabase = createClient()


interface SessionSecurityCardProps {
  profile: any
}

export function SessionSecurityCard({ profile }: SessionSecurityCardProps) {
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isResettingPassword, setIsResettingPassword] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true)

    try {
      await supabase.auth.signOut()
      router.push("/")
      router.refresh()
    } catch (error: any) {
      toast({
        title: "Error signing out",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsSigningOut(false)
    }
  }

  // Handle reset password
  const handleResetPassword = async () => {
    setIsResettingPassword(true)

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(profile.email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      toast({
        title: "Password reset email sent",
        description: "Check your email for a password reset link",
      })
    } catch (error: any) {
      toast({
        title: "Error resetting password",
        description: error.message,
        variant: "destructive",
      })
    } finally {
      setIsResettingPassword(false)
    }
  }

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Session & Security</CardTitle>
          <CardDescription>Manage your session and security settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-col md:flex-row gap-4">
            <Button variant="outline" className="flex-1" onClick={handleResetPassword} disabled={isResettingPassword}>
              <KeyRound className="h-4 w-4 mr-2" />
              {isResettingPassword ? "Sending Email..." : "Reset Password"}
            </Button>

            <Button variant="destructive" className="flex-1" onClick={handleSignOut} disabled={isSigningOut}>
              <LogOut className="h-4 w-4 mr-2" />
              {isSigningOut ? "Signing Out..." : "Sign Out"}
            </Button>
          </div>

          <Alert className="bg-blue-50 border-blue-200">
            <ShieldCheck className="h-4 w-4 text-blue-500" />
            <AlertDescription className="text-blue-700">
              All your data is stored securely in your private Supabase workspace.
            </AlertDescription>
          </Alert>

          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Signing out will end your current session on this device.</AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle>Data & Privacy</CardTitle>
          <CardDescription>Manage your data and privacy settings.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h3 className="text-sm font-medium">Data Storage</h3>
            <p className="text-sm text-gray-600">
              Your resumes, cover letters, and other content are stored securely in our database. We do not
              share your data with third parties.
            </p>
          </div>

          <div className="space-y-2">
            <h3 className="text-sm font-medium">AI Processing</h3>
            <p className="text-sm text-gray-600">
              Lucerna AI uses Different AI Models to process your content. Your data is not stored by these
              services after processing is complete.
            </p>
          </div>

          <div className="flex flex-col md:flex-row gap-4 mt-4">
            <Button variant="outline" className="flex-1">
              Download My Data
            </Button>

            <Button variant="outline" className="flex-1 text-red-600 hover:text-red-700 hover:bg-red-50">
              Delete Account
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
