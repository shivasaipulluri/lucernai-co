"use client"

import type React from "react"

import { useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/components/ui/use-toast"
import { createClient } from "@/lib/supabase/client"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"
import { Loader2 } from "lucide-react"
import { z } from "zod"
import { motion } from "framer-motion"

// Form validation schemas
const emailSchema = z.string().email("Please enter a valid email address")
const passwordSchema = z.string().min(6, "Password must be at least 6 characters")

export default function ResetPasswordPage() {
  // State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resetSent, setResetSent] = useState(false)
  const [errors, setErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
    general?: string
  }>({})

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClient()

  // Check if we have a hash in the URL (for password reset)
  const hasResetToken = searchParams.has("token_hash")

  // Form validation
  const validateForm = () => {
    const newErrors: typeof errors = {}

    if (!hasResetToken) {
      try {
        emailSchema.parse(email)
      } catch (error) {
        if (error instanceof z.ZodError) {
          newErrors.email = error.errors[0].message
        }
      }
    } else {
      try {
        passwordSchema.parse(password)
      } catch (error) {
        if (error instanceof z.ZodError) {
          newErrors.password = error.errors[0].message
        }
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = "Passwords do not match"
      }
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle request password reset
  const handleRequestReset = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/reset-password`,
      })

      if (error) throw error

      setResetSent(true)
      toast({
        title: "Password reset email sent",
        description: "Check your email for a password reset link",
        duration: 5000,
      })
    } catch (error: any) {
      console.error("Password reset error:", error)
      setErrors({
        general: error.message || "Failed to send password reset email. Please try again.",
      })

      toast({
        title: "Reset error",
        description: error.message || "Failed to send password reset email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle set new password
  const handleSetNewPassword = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.updateUser({
        password,
      })

      if (error) throw error

      toast({
        title: "Password updated",
        description: "Your password has been updated successfully",
        duration: 5000,
      })

      // Redirect to dashboard after successful password reset
      router.push("/dashboard")
    } catch (error: any) {
      console.error("Password update error:", error)
      setErrors({
        general: error.message || "Failed to update password. Please try again.",
      })

      toast({
        title: "Update error",
        description: error.message || "Failed to update password. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-white to-gray-50 dark:from-gray-950 dark:to-gray-900 p-4">
      <div className="mb-8 flex flex-col items-center">
        <LucernaSunIcon size={48} glowing={true} className="mb-4" />
        <h1 className="text-3xl font-bold text-primary dark:text-white mb-1">
          lucernai<span className="text-accent">.</span>
        </h1>
        <p className="text-gray-600 dark:text-gray-400">Illuminate your career journey</p>
      </div>

      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>{hasResetToken ? "Set New Password" : "Reset Password"}</CardTitle>
            <CardDescription>
              {hasResetToken ? "Enter your new password below" : "Enter your email to receive a password reset link"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {errors.general && (
              <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm">
                {errors.general}
              </div>
            )}

            {resetSent ? (
              <div className="text-center py-4">
                <p className="mb-4 text-green-600 dark:text-green-400">Password reset email sent! Check your inbox.</p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setResetSent(false)
                    setEmail("")
                  }}
                >
                  Try a different email
                </Button>
              </div>
            ) : hasResetToken ? (
              <form onSubmit={handleSetNewPassword} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="new-password">New Password</Label>
                  <Input
                    id="new-password"
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                    required
                  />
                  {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirm Password</Label>
                  <Input
                    id="confirm-password"
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className={errors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                    required
                  />
                  {errors.confirmPassword && <p className="text-xs text-red-500">{errors.confirmPassword}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Updating password...
                    </>
                  ) : (
                    "Update Password"
                  )}
                </Button>
              </form>
            ) : (
              <form onSubmit={handleRequestReset} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="m@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                    required
                  />
                  {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                </div>
                <Button type="submit" className="w-full" disabled={isLoading}>
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Sending reset link...
                    </>
                  ) : (
                    "Send Reset Link"
                  )}
                </Button>
                <p className="text-center text-sm text-gray-500 dark:text-gray-400">
                  Remember your password?{" "}
                  <a href="/auth" className="text-primary hover:underline">
                    Sign in
                  </a>
                </p>
              </form>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  )
}
