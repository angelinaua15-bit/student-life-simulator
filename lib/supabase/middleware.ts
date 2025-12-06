import { NextResponse, type NextRequest } from "next/server"

export async function updateSession(request: NextRequest) {
  // Supabase middleware completely disabled to prevent btoa errors
  // Game works with localStorage only, no authentication needed
  return NextResponse.next({
    request,
  })
}
