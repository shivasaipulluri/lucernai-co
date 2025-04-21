"use client"

import Link from "next/link"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/components/ui/use-toast"
import { FcGoogle } from "react-icons/fc"
import { createClient } from "@/lib/supabase/client"
import { z } from "zod"
import { Loader2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"

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
  const [activeTab, setActiveTab] = useState<"signin" | "signup" | "magic">(isSignUp ? "signup" : "signin")
  const [showMagicLinkSent, setShowMagicLinkSent] = useState(false)
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

  // Set active tab based on URL param
  useEffect(() => {
    setActiveTab(isSignUp ? "signup" : "signin")
  }, [isSignUp])

  // Form validation
  const validateForm = () => {
    const newErrors: typeof errors = {}

    try {
      emailSchema.parse(email)
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.email = error.errors[0].message
      }
    }

    try {
      passwordSchema.parse(password)
    } catch (error) {
      if (error instanceof z.ZodError) {
        newErrors.password = error.errors[0].message
      }
    }

    if (activeTab === "signup" && password !== confirmPassword) {
      newErrors.confirmPassword = "Passwords do not match"
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // Handle email/password auth
  const handleEmailPasswordAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)
    setErrors({})

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

        toast({
          title: "Verification email sent",
          description: "Please check your email to verify your account",
          duration: 5000,
        })

        // Show confirmation message but don't redirect yet
        setShowMagicLinkSent(true)
      } else {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        })

        if (error) throw error

        toast({
          title: "Signed in successfully",
          description: "Welcome back to Lucerna AI",
          duration: 3000,
        })

        // Add router.refresh() before router.push to ensure session state is updated
        router.refresh()
        router.push(redirectTo)
      }
    } catch (error: any) {
      console.error("Authentication error:", error)
      setErrors({
        general: error.message || "Authentication failed. Please try again.",
      })

      toast({
        title: "Authentication error",
        description: error.message || "Authentication failed. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle magic link auth
  const handleMagicLinkAuth = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      emailSchema.parse(email)
    } catch (error) {
      if (error instanceof z.ZodError) {
        setErrors({ email: error.errors[0].message })
        return
      }
    }

    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        },
      })

      if (error) throw error

      setShowMagicLinkSent(true)
      toast({
        title: "Magic link sent",
        description: "Check your email for a sign in link",
        duration: 5000,
      })

      // No router.refresh() needed here as we're just showing a confirmation message
      // The actual auth will happen when they click the magic link in their email
    } catch (error: any) {
      console.error("Magic link error:", error)
      setErrors({
        general: error.message || "Failed to send magic link. Please try again.",
      })

      toast({
        title: "Authentication error",
        description: error.message || "Failed to send magic link. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  // Handle Google auth
  const handleGoogleAuth = async () => {
    setIsLoading(true)
    setErrors({})

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider: "google",
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirectTo=${redirectTo}`,
        },
      })

      if (error) throw error

      // No need for router.refresh() here as the OAuth flow will handle the redirect
      // and the callback route will handle the session update
    } catch (error: any) {
      console.error("Google auth error:", error)
      setErrors({
        general: error.message || "Failed to sign in with Google. Please try again.",
      })

      toast({
        title: "Authentication error",
        description: error.message || "Failed to sign in with Google. Please try again.",
        variant: "destructive",
      })
      setIsLoading(false)
    }
  }

  // Magic link sent confirmation view
  if (showMagicLinkSent) {
    return (
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Check your email</CardTitle>
            <CardDescription>
              We've sent a magic link to <strong>{email}</strong>
            </CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
              Click the link in your email to sign in. If you don't see it, check your spam folder.
            </p>
            <Button
              variant="outline"
              className="w-full"
              onClick={() => {
                setShowMagicLinkSent(false)
                setEmail("")
              }}
            >
              Use a different email
            </Button>
          </CardContent>
        </Card>
      </motion.div>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.3 }}>
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle>Welcome to Lucerna AI</CardTitle>
          <CardDescription>Sign in or create an account to get started</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={activeTab} onValueChange={(value) => setActiveTab(value as "signin" | "signup" | "magic")}>
            <TabsList className="grid w-full grid-cols-3 mb-6">
              <TabsTrigger value="signin">Sign In</TabsTrigger>
              <TabsTrigger value="signup">Sign Up</TabsTrigger>
              <TabsTrigger value="magic">Magic Link</TabsTrigger>
            </TabsList>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, x: 10 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -10 }}
                transition={{ duration: 0.2 }}
              >
                {errors.general && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md text-sm">
                    {errors.general}
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
                        className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                        required
                      />
                      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between items-center">
                        <Label htmlFor="password-signin">Password</Label>
                        <a href="/auth/reset-password" className="text-xs text-primary hover:underline">
                          Forgot password?
                        </a>
                      </div>
                      <Input
                        id="password-signin"
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        disabled={isLoading}
                        className={errors.password ? "border-red-500 focus-visible:ring-red-500" : ""}
                        required
                      />
                      {errors.password && <p className="text-xs text-red-500">{errors.password}</p>}
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
                        className={errors.email ? "border-red-500 focus-visible:ring-red-500" : ""}
                        required
                      />
                      {errors.email && <p className="text-xs text-red-500">{errors.email}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="password-signup">Password</Label>
                      <Input
                        id="password-signup"
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
                          Creating account...
                        </>
                      ) : (
                        "Create Account"
                      )}
                    </Button>
                  </form>
                )}

                {activeTab === "magic" && (
                  <form onSubmit={handleMagicLinkAuth} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="email-magic">Email</Label>
                      <Input
                        id="email-magic"
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
                          Sending...
                        </>
                      ) : (
                        "Send Magic Link"
                      )}
                    </Button>
                    <p className="text-xs text-center text-gray-500 dark:text-gray-400">
                      We'll email you a magic link for a password-free sign in.
                    </p>
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
              <Link
                href={activeTab === "signin" ? "/auth?signup=true" : "/auth"}
                className="text-primary hover:underline"
              >
                {activeTab === "signin" ? "Sign up" : "Sign in"}
              </Link>
            </p>
          </Tabs>
        </CardContent>
      </Card>
    </motion.div>
  )
}
