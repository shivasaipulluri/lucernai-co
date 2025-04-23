"use client"

import { createClient } from "@/lib/supabase/client"

/**
 * Utility function to get the current user from the client
 */
export async function getCurrentUser() {
  const supabase = createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

/**
 * Utility function to check if a user is authenticated on the client
 */
export async function isAuthenticated() {
  const supabase = createClient()
  const {
    data: { session },
  } = await supabase.auth.getSession()
  return !!session
}
