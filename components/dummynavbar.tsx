"use client"

import Link from "next/link"
import { Button } from "@/components/ui/button"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { Menu, User, FileText, Clock, RotateCw } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { useSupabase } from "@/lib/supabase/provider"
import { SignOutButton } from "@/components/auth/sign-out-button"

export function NavBar() {
  const pathname = usePathname()
  const [isMenuOpen, setIsMenuOpen] = useState(false)
  const { user } = useSupabase()
  const isLoggedIn = !!user

  const isActive = (path: string) => pathname === path

  return (
    <header className="border-b bg-white">
      <div className="container-wide flex h-16 items-center justify-between">
        <div className="flex items-center">
          <Link href="/" className="flex items-center">
            <span className="text-xl font-bold text-primary">
              lucernai<span className="text-accent">.</span>
            </span>
          </Link>
        </div>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/"
            className={`text-sm font-medium transition-colors ${
              isActive("/") ? "text-primary" : "text-gray-600 hover:text-primary"
            }`}
          >
            Home
          </Link>
          {isLoggedIn && (
            <>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="text-sm font-medium transition-colors">
                    Resume Lab
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href="/resume/lab">
                      <FileText className="mr-2 h-4 w-4" />
                      Tailoring Lab
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/saved-resumes">
                      <Clock className="mr-2 h-4 w-4" />
                      Saved Resumes
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/resume-timeline/timeline">
                      <RotateCw className="mr-2 h-4 w-4" />
                      Resume Timeline
                    </Link>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
              <Link
                href="/cover-letter"
                className={`text-sm font-medium transition-colors ${
                  isActive("/cover-letter") ? "text-primary" : "text-gray-600 hover:text-primary"
                }`}
              >
                Cover Letter
              </Link>
              <Link
                href="/linkedin"
                className={`text-sm font-medium transition-colors ${
                  isActive("/linkedin") ? "text-primary" : "text-gray-600 hover:text-primary"
                }`}
              >
                LinkedIn
              </Link>
              <Link
                href="/analytics"
                className={`text-sm font-medium transition-colors ${
                  isActive("/analytics") ? "text-primary" : "text-gray-600 hover:text-primary"
                }`}
              >
                Analytics
              </Link>
              <Link
                href="/interview"
                className={`text-sm font-medium transition-colors ${
                  isActive("/interview") ? "text-primary" : "text-gray-600 hover:text-primary"
                }`}
              >
                Interview
              </Link>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                    <User className="h-5 w-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/templates">Templates</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/pricing">Pricing</Link>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <SignOutButton variant="ghost" size="sm" className="w-full justify-start p-0 h-auto font-normal" />
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
          {!isLoggedIn && (
            <Button asChild>
              <Link href="/auth">Sign In</Link>
            </Button>
          )}
        </nav>

        {/* Mobile Navigation */}
        <div className="md:hidden">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm">
                <Menu className="h-5 w-5" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-[200px]">
              <DropdownMenuItem asChild>
                <Link href="/">Home</Link>
              </DropdownMenuItem>
              {isLoggedIn && (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/dashboard">Dashboard</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/interview">Interview</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/cover-letter">Cover Letter</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/linkedin">LinkedIn</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/analytics">Analytics</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem asChild>
                    <Link href="/templates">Templates</Link>
                  </DropdownMenuItem>
                </>
              )}
              <DropdownMenuItem asChild>
                <Link href="/pricing">Pricing</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              {isLoggedIn ? (
                <>
                  <DropdownMenuItem asChild>
                    <Link href="/profile">Profile</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <SignOutButton variant="ghost" size="sm" className="w-full justify-start p-0 h-auto font-normal" />
                  </DropdownMenuItem>
                </>
              ) : (
                <DropdownMenuItem asChild>
                  <Link href="/auth">Sign In</Link>
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  )
}
