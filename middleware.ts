import { NextResponse, type NextRequest } from "next/server"
import { createServerClient } from "@supabase/ssr"

export async function middleware(request: NextRequest) {
  console.log("Middleware running for path:", request.nextUrl.pathname)

  // Create a response object that we can modify
  const response = NextResponse.next({
    request: {
      headers: request.headers,
    },
  })

  // Check if this is a root URL with a code parameter
  const url = new URL(request.url)
  const code = url.searchParams.get("code")
  const isRootWithCode = url.pathname === "/" && code !== null

  // If this is the root URL with a code parameter, redirect to auth callback
  if (isRootWithCode) {
    console.log("Middleware: Detected authentication code at root URL, redirecting to auth callback")
    return NextResponse.redirect(new URL(`/auth/callback?code=${code}`, request.url))
  }

  // Don't run auth checks on public routes or auth-related routes
  if (
    request.nextUrl.pathname === "/" ||
    request.nextUrl.pathname.startsWith("/auth") ||
    request.nextUrl.pathname.startsWith("/_next") ||
    request.nextUrl.pathname.startsWith("/favicon.ico")
  ) {
    console.log("Middleware: Skipping auth check for public route:", request.nextUrl.pathname)
    return response
  }

  try {
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return [...request.cookies.getAll()].map(({ name, value }) => ({
              name,
              value,
            }))
          },
          setAll(cookies) {
            cookies.forEach(({ name, value, options }) => {
              response.cookies.set({
                name,
                value,
                ...options,
              })
            })
          },
        },
      },
    )

    // Use getSession for middleware to avoid unnecessary API calls
    // We're just checking if the user is logged in, not using the user data for security-critical operations
    const {
      data: { session },
      error,
    } = await supabase.auth.getSession()

    // Handle auth errors gracefully
    if (error) {
      console.warn("Middleware auth error:", error.message)

      // If there's a refresh token error, redirect to auth page
      if (error.message.includes("Refresh Token Not Found")) {
        console.log("Middleware: Invalid refresh token, redirecting to auth page")
        const redirectUrl = new URL("/auth", request.url)
        return NextResponse.redirect(redirectUrl)
      }
    }

    // If no session and trying to access a protected route
    if (!session) {
      console.log("Middleware: No session, redirecting to auth page from:", request.nextUrl.pathname)
      const redirectUrl = new URL("/auth", request.url)
      redirectUrl.searchParams.set("redirectTo", request.nextUrl.pathname)
      return NextResponse.redirect(redirectUrl)
    }

    console.log("Middleware: Session found, allowing access to:", request.nextUrl.pathname)

    // Add a custom header to indicate that the user should be created
    // This will be picked up by the layout or page components
    if (
      session &&
      (request.nextUrl.pathname === "/resume/lab" ||
        request.nextUrl.pathname === "/dashboard" ||
        request.nextUrl.pathname.startsWith("/resume/"))
    ) {
      console.log("Middleware: Adding create-user header for protected page")
      // Add user info to headers for server components to handle user creation
      response.headers.set("x-create-user", "true")
      response.headers.set("x-user-id", session.user.id)
      response.headers.set("x-user-email", session.user.email || "")
    }
  } catch (error) {
    console.error("Error in middleware:", error)
    // On error, allow the request to proceed to avoid blocking legitimate requests
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public (public files)
     */
    "/((?!_next/static|_next/image|favicon.ico|public|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
}
