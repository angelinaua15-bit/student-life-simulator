// Game now works fully with localStorage, no server-side session management needed

import type { NextRequest } from "next/server"

export async function middleware(request: NextRequest) {
  // No middleware needed - game uses client-side localStorage only
  // All auth and game state managed in browser
  return
}

export const config = {
  matcher: [],
}
