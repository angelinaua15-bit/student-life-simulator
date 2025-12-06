// Barrel export that prevents @supabase/ssr from loading
// This stops btoa errors at the source

export function createClient() {
  return null
}

export async function createServerClient() {
  return null
}

export async function updateSession(request: any) {
  return request
}
