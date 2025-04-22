import type React from "react"
import type { Metadata } from "next"
import "./globals.css"
import { NavBar } from "@/components/nav-bar"
import { Footer } from "@/components/footer"
import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/toaster"
import SupabaseProvider from "@/lib/supabase/provider"
import { createClient } from "@/lib/supabase/server"
import { Inter, Playfair_Display } from "next/font/google"
import { CookieConsent } from "@/components/cookie-consent"
import { defaultMetadata } from "./seo-metadata"
import { HomePageStructuredData, ResumeServiceStructuredData } from "@/components/structured-data"

// Configure the Inter font with all needed weights
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
})

// Configure the Playfair Display font with all needed weights
const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-serif",
  weight: ["400", "500", "600", "700"],
  display: "swap",
})

export const metadata: Metadata = defaultMetadata

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <HomePageStructuredData />
        <ResumeServiceStructuredData />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans bg-background`}>
        <SupabaseProvider initialUser={user}>
          <ThemeProvider attribute="class" defaultTheme="light" enableSystem disableTransitionOnChange>
            <div className="flex min-h-screen flex-col">
              <NavBar />
              <main className="flex-1">{children}</main>
              <Footer />
            </div>
            <CookieConsent />
            <Toaster />
          </ThemeProvider>
        </SupabaseProvider>
      </body>
    </html>
  )
}
