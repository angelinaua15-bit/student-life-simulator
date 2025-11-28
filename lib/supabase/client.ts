import { createBrowserClient } from "@supabase/ssr"

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  // Return null immediately if credentials are missing - don't try to create client
  if (!supabaseUrl || !supabaseAnonKey) {
    return null
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey)
  } catch (error) {
    console.warn("[v0] Failed to create Supabase client")
    return null
  }
}
