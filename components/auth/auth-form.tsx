"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { FcGoogle } from "react-icons/fc"
import { createClient } from "@/lib/supabase/client"
import { useToast } from "@/components/ui/use-toast"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { motion, AnimatePresence } from "framer-motion"
import { z } from "zod"

// Form validation schemas
const emailSchema = z.string().email("Please enter a valid email address")
const passwordSchema = z.string().min(6, "Password must be at least 6 characters")

interface AuthFormProps {
  redirectTo: string
  isSignUp?: boolean
}

export function AuthForm({ redirectTo, isSignUp = false }: AuthFormProps) {
  // State
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [resendingEmail, setResendingEmail] = useState(false)
  const [activeTab, setActiveTab] = useState<"signin" | "signup">(isSignUp ? "signup" : "signin")
  const [formError, setFormError] = useState<string | null>(null)
  const [formSuccess, setFormSuccess] = useState<string | null>(null)
  const [isEmailUnconfirmed, setIsEmailUnconfirmed] = useState(false)
  const [unconfirmedEmail, setUnconfirmedEmail] = useState("")
  const [fieldErrors, setFieldErrors] = useState<{
    email?: string
    password?: string
    confirmPassword?: string
  }>({})

  // Hooks
  const router = useRouter()
  const searchParams = useSearchParams()
  const { toast } = useToast()
  const supabase = createClient()

  // Check for error in URL
  useEffect(() => {
    const error = searchParams.get("error")
    const errorCode = searchParams.get("error_code")
    const errorDescription = searchParams.get("error_description")

    if (error) {
      let errorMessage = decodeURIComponent(errorDescription || error)

      // Handle specific error codes
      if (errorCode === "otp_expired") {
        errorMessage = "Your email confirmation link has expired. Please request a new one below."
        setActiveTab("signin")
        setIsEmailUnconfirmed(true)
      }

      setFormError(errorMessage)
      toast({
        title: "Authentication Error",
        description: errorMessage,
        variant: "destructive",
      })
    }
  }, [searchParams, toast])

  // Form validation
  const validateForm = () => {
    const errors: typeof fieldErrors = {}
    let isValid = true

    try {
      emailSchema.parse(email)
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.email = error.errors[0].message
        isValid = false
      }
    }

    try {
      passwordSchema.parse(password)
    } catch (error) {
      if (error instanceof z.ZodError) {
        errors.password = error.errors[0].message
        isValid = false
      }
    }

    if (activeTab === "signup" && password !== confirmPassword) {
      errors.confirmPassword = "Passwords do not match"
      isValid = false
    }

    setFieldErrors(errors)
    return isValid
  }

  // Reset form fields
  const resetForm = () => {
    setEmail("")
    setPassword("")
    setConfirmPassword("")
    setFieldErrors({})
  }

  // Handle email/password auth
  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    // Reset errors and success messages
    setFormError(null)
    setFormSuccess(null)
    setIsEmailUnconfirmed(false)

    if (!validateForm()) return

    setIsLoading(true)

    try {
      if (activeTab === "signup") {
        const { error } = await supabase.auth.signUp({
          email,
          password,
          options: {
            emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
          },
        })

        if (error) throw error

        // Show success message
        setFormSuccess("Verification email sent! Please check your inbox to complete registration.")
        setUnconfirmedEmail(email)

        // Switch to sign in tab and reset form
        setActiveTab("signin")
        resetForm()

        toast({
          title: "Verification email sent",
          description: "Please check your email to verify your account",
          duration: 5000,
        })
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) {
          // Check for unconfirmed email error
          if (error.message.includes("Email not confirmed")) {
            setIsEmailUnconfirmed(true)
            setUnconfirmedEmail(email)
            throw new Error(
              "Email not confirmed. Please check your inbox for the verification email or request a new one.",
            )
          }
          throw error
        }

        toast({
          title: "Signed in successfully",
          description: "Welcome back to Lucerna AI",
          duration: 3000,
        })

        router.refresh()
        router.push(redirectTo)
      }
    } catch (error: any) {
      console.error("Authentication error:", error)
      setFormError(error.message || "Authentication failed. Please try again.")

      toast({
        title: "Authentication error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle resending confirmation email
  const handleResendConfirmation = async () => {
    setResendingEmail(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const emailToUse = unconfirmedEmail || email

      if (!emailToUse) {
        throw new Error("Please enter your email address")
      }

      const { error } = await supabase.auth.resend({
        type: "signup",
        email: emailToUse,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        },
      })

      if (error) throw error

      setFormSuccess(`Verification email resent to ${emailToUse}. Please check your inbox.`)

      toast({
        title: "Verification email resent",
        description: "Please check your inbox to verify your account",
        duration: 5000,
      })
    } catch (error: any) {
      console.error("Error resending confirmation email:", error)
      setFormError(error.message || "Failed to resend verification email. Please try again.")

      toast({
        title: "Error",
        description: error.message || "Failed to resend verification email. Please try again.",
        variant: "destructive",
      })
    } finally {
      setResendingEmail(false)
    }
  }

  // Handle Google auth
  const handleGoogleAuth = async () => {
    setIsLoading(true)
    setFormError(null)
    setFormSuccess(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        },
      })

      if (error) throw error
    } catch (error: any) {
      console.error("Google auth error:", error)
      setFormError(error.message || "Failed to sign in with Google. Please try again.")

      toast({
        title: "Authentication error",
        description: error.message || "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Handle tab change
  const handleTabChange = (value: string) => {
    setActiveTab(value as "signin" | "signup")
    setFormError(null)
    setFormSuccess(null)
    setIsEmailUnconfirmed(false)
    resetForm()
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Lucerna AI</CardTitle>
          <CardDescription>Sign in or create an account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={handleTabChange}>
            <TabsList className="grid w-full grid-cols-2 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {formError && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm">
                    {formError}
                  </div>
                )}

                {formSuccess && (
                  <div className="mb-4 p-3 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md text-sm">
                    {formSuccess}
                  </div>
                )}

                {isEmailUnconfirmed && (
                  <div className="mb-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-md">
                    <h4 className="font-medium text-yellow-800 dark:text-yellow-300 mb-2">Email not confirmed</h4>
                    <p className="text-sm text-yellow-700 dark:text-yellow-400 mb-3">
                      Please check your inbox for the verification email or request a new one.
                    </p>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendConfirmation}
                      disabled={resendingEmail}
                      className="w-full"
                    >
                      {resendingEmail ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Resending...
                        </>
                      ) : (
                        "Resend verification email"
                      )}
                    </Button>
                  </div>
                )}

                {activeTab === "signin" && (
                  <form onSubmit={handleEmailPasswordAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-signin">Email</Label>
                      <Input
                        id="email-signin"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className={fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                        required
                      />
                      {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password-signin">Password</Label>
                        <Link href="/auth/reset-password" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </Link>
                      </div>
                      <Input
                        id="password-signin"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className={fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                        required
                      />
                      {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Signing in...
                        </>
                      ) : (
                        "Sign In"
                      )}
                    </Button>
                  </form>
                )}

                {activeTab === "signup" && (
                  <form onSubmit={handleEmailPasswordAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-signup">Email</Label>
                      <Input
                        id="email-signup"
                        type="email"
                        placeholder="m@example.com"
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        disabled={isLoading}
                        className={fieldErrors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                        required
                      />
                      {fieldErrors.email && <p className="text-xs text-red-500">{fieldErrors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup">Password</Label>
                      <Input
                        id="password-signup"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className={fieldErrors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                        required
                      />
                      {fieldErrors.password && <p className="text-xs text-red-500">{fieldErrors.password}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="confirm-password">Confirm Password</Label>
                      <Input
                        id="confirm-password"
                        type="password"
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        disabled={isLoading}
                        className={fieldErrors.confirmPassword ? "border-red-500 focus-visible:ring-red-500" : ""}
                        required
                      />
                      {fieldErrors.confirmPassword && (
                        <p className="text-xs text-red-500">{fieldErrors.confirmPassword}</p>
                      )}
                    </div>
                    <Button type="submit" className="w-full" disabled={isLoading}>
                      {isLoading ? (
                        <>
                          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                )}
              </motion.div>
            </AnimatePresence>

            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300 dark:border-gray-700"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="bg-white dark:bg-gray-800 px-2 text-gray-500 dark:text-gray-400">
                  Or continue with
                </span>
              </div>
            </div>

            <Button variant="outline" type="button" className="w-full" onClick={handleGoogleAuth} disabled={isLoading}>
              {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <FcGoogle className="mr-2 h-5 w-5" />}
              Google
            </Button>

            <p className="mt-4 text-center text-sm text-gray-500 dark:text-gray-400">
              {activeTab === "signin" ? "Don't have an account? " : "Already have an account? "}
              <button
                type="button"
                className="text-primary hover:underline"
                onClick={() => handleTabChange(activeTab === "signin" ? "signup" : "signin")}
              >
                {activeTab === "signin" ? "Sign up" : "Sign in"}
              </button>
            </p>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
