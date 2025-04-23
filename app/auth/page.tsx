import { Suspense } from "react"
import { AuthForm } from "@/components/auth/auth-form"
import { LucernaSunIcon } from "@/components/lucerna-sun-icon"
import { Skeleton } from "@/components/ui/skeleton"
import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export const metadata = {
  title: "Sign In | Lucerna AI",
  description: "Sign in or create an account to use Lucerna AI",
}

interface AuthPageProps {
  searchParams: {
    redirectTo?: string
    error?: string
    message?: string
    signup?: string
  }
}

export default async function AuthPage({ searchParams }: AuthPageProps) {
  // Check if user is already authenticated using getUser() for security
  const supabase = await createClient()

  // Use getSession instead of getUser on the auth page to avoid the "Auth session missing!" error
  const {
    data: { session },
  } = await supabase.auth.getSession()

  // Log authentication status without error
  console.log("Auth page - Session check:", session ? "Session exists" : "No session")

  // Extract query parameters
  const params = await searchParams;
  const redirectTo = params.redirectTo || "/resume/lab"
  const errorMsg =  params.error
  const message =  params.message
  const isSignUp =  params.signup === "true"


  // If authenticated, redirect to the intended destination or resume lab
  if (session) {
    console.log("Auth page - User is authenticated, redirecting to:", redirectTo)
    redirect(redirectTo)
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

      {errorMsg && (
        <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400 rounded-md max-w-md animate-in fade-in-50 duration-300">
          <p className="font-medium">Authentication Error</p>
          <p className="text-sm">{errorMsg}</p>
        </div>
      )}

      {message && (
        <div className="mb-4 p-4 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400 rounded-md max-w-md animate-in fade-in-50 duration-300">
          <p>{message}</p>
        </div>
      )}

      <Suspense fallback={<AuthFormSkeleton />}>
        <AuthForm redirectTo={redirectTo} isSignUp={isSignUp} />
      </Suspense>
    </div>
  )
}

function AuthFormSkeleton() {
  return (
    <div className="w-full max-w-md bg-white dark:bg-gray-800 p-8 rounded-lg shadow-md">
      <Skeleton className="h-8 w-3/4 mb-6" />
      <Skeleton className="h-4 w-full mb-8" />
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-10 w-full mb-4" />
      <Skeleton className="h-10 w-full mb-6" />
      <Skeleton className="h-4 w-full mb-4" />
      <Skeleton className="h-10 w-full" />
    </div>
  )
}
