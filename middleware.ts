import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

export async function middleware(request: NextRequest) {
  // No auth middleware needed - game uses localStorage only
  // Just pass through all requests
  return NextResponse.next()
}

export const config = {
  matcher: [],
}
