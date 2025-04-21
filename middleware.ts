import { NextResponse } from "next/server"
import type { NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"
import type { CookieOptions } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

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
    },
  )

  // Get the user - this will revalidate the auth token
  const {
    data: { user },
  } = await supabase.auth.getUser()

  // Auth routes handling
  const isAuthRoute = pathname.startsWith("/auth")
  const isCallbackRoute = pathname.startsWith("/auth/callback") || pathname.startsWith("/auth/confirm")

  // If on auth page but already logged in, redirect to resume lab
  if (isAuthRoute && !isCallbackRoute && user) {
    return NextResponse.redirect(new URL("/resume/lab", request.url))
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
    const redirectUrl = new URL("/auth", request.url)
    redirectUrl.searchParams.set("redirectTo", pathname)
    return NextResponse.redirect(redirectUrl)
  }

  // Redirect legacy /dashboard to /resume/lab
  if (pathname === "/dashboard") {
    return NextResponse.redirect(new URL("/resume/lab", request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
}
