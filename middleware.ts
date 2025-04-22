import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { CookieOptions } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  const origin = request.nextUrl.origin

  // Check if this is a sign-out request
  const isSignOutRequest = pathname === "/api/auth/signout" || request.nextUrl.searchParams.has("signout")

  // Create a response object that we'll use to handle redirects
  const response = NextResponse.next()

  // Create a Supabase client specifically for this middleware request
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet: { name: string; value: string; options?: CookieOptions }[]) {
          cookiesToSet.forEach(({ name, value, options }) => {
            response.cookies.set(name, value, options)
          })
        },
      },
      auth: {
        detectSessionInUrl: true,
        flowType: "pkce",
      },
    },
  )

  try {
    // If this is a sign-out request, handle it specially
    if (isSignOutRequest) {
      // Clear auth cookies
      response.cookies.delete("sb-access-token")
      response.cookies.delete("sb-refresh-token")

      // Redirect to home page using the request's origin
      return NextResponse.redirect(new URL("/", origin))
    }

    // Get the user - using getUser() instead of getSession() for better security
    const {
      data: { user },
      error: userError,
    } = await supabase.auth.getUser()

    // Auth routes handling
    const isAuthRoute = pathname.startsWith("/auth")
    const isCallbackRoute = pathname.startsWith("/auth/callback") || pathname.startsWith("/auth/confirm")

    // If on auth page but already logged in, redirect to resume lab
    if (isAuthRoute && !isCallbackRoute && user) {
      return NextResponse.redirect(new URL("/resume/lab", origin))
    }

    // If on protected route but not logged in, redirect to auth page
    const isProtectedRoute =
      pathname.startsWith("/resume/lab") ||
      pathname.startsWith("/saved-resumes") ||
      pathname.startsWith("/resume-timeline") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/analytics") ||
      pathname.startsWith("/cover-letter") ||
      pathname.startsWith("/linkedin") ||
      pathname.startsWith("/templates") ||
      pathname.startsWith("/interview")

    if (isProtectedRoute && !user) {
      const redirectUrl = new URL("/auth", origin)
      redirectUrl.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    // Redirect legacy /dashboard to /resume/lab
    if (pathname === "/dashboard") {
      return NextResponse.redirect(new URL("/resume/lab", origin))
    }

    return response
  } catch (error) {
    // Only log unexpected errors
    console.error("Unexpected error in middleware:", error)

    // If there's an error, we'll check if the user is trying to access a protected route
    const isProtectedRoute =
      pathname.startsWith("/resume/lab") ||
      pathname.startsWith("/saved-resumes") ||
      pathname.startsWith("/resume-timeline") ||
      pathname.startsWith("/profile") ||
      pathname.startsWith("/analytics") ||
      pathname.startsWith("/cover-letter") ||
      pathname.startsWith("/linkedin") ||
      pathname.startsWith("/templates") ||
      pathname.startsWith("/interview")

    // If it's a protected route, redirect to auth
    if (isProtectedRoute) {
      const redirectUrl = new URL("/auth", origin)
      redirectUrl.searchParams.set("redirectTo", pathname)
      return NextResponse.redirect(redirectUrl)
    }

    return response
  }
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
