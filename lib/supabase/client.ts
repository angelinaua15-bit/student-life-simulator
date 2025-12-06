import type { createBrowserClient } from "@supabase/ssr"

const cachedClient: ReturnType<typeof createBrowserClient> | null = null

export function createClient() {
  // Return a mock client that does nothing - prevents btoa errors
  console.warn("[v0] Client-side Supabase is disabled. Use Server Actions instead.")

  return {
    from: () => ({
      select: () => Promise.resolve({ data: null, error: new Error("Use Server Actions") }),
      insert: () => Promise.resolve({ error: new Error("Use Server Actions") }),
      upsert: () => Promise.resolve({ error: new Error("Use Server Actions") }),
      update: () => Promise.resolve({ error: new Error("Use Server Actions") }),
      delete: () => Promise.resolve({ error: new Error("Use Server Actions") }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signUp: () => Promise.resolve({ data: { user: null }, error: new Error("Use Server Actions") }),
      signInWithPassword: () => Promise.resolve({ data: { user: null }, error: new Error("Use Server Actions") }),
      signOut: () => Promise.resolve({ error: null }),
    },
  } as any
}
