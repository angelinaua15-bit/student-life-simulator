export function createClient() {
  // Disable Supabase to avoid btoa errors with Cyrillic characters
  // The game works perfectly with localStorage only
  console.log("[v0] Supabase disabled - game runs on localStorage")
  return null

  /* Supabase is disabled to prevent btoa encoding errors with Cyrillic text
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn("[v0] Supabase credentials not found")
    return null
  }

  try {
    return createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      db: {
        schema: "public",
      },
      global: {
        headers: {
          "x-client-info": "evo-student-game",
        },
      },
    })
  } catch (error) {
    console.error("[v0] Failed to create Supabase client:", error)
    return null
  }
  */
}
