import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ""
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ""

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Supabase credentials not configured")
    // Return a mock client that won't crash
    return null as any
  }

  return createBrowserClient(supabaseUrl, supabaseAnonKey)
}
