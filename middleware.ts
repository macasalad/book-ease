import { NextRequest, NextResponse } from 'next/server'
import { getSessionCookie } from 'better-auth/cookies'
 
export function middleware(req: NextRequest) {
  const cookie = getSessionCookie(req) // cheap — cookie-only check that doesn't call the database on each request.
  if (!cookie) {
    return NextResponse.redirect(new URL('/sign-in', req.url))
  }
  return NextResponse.next()
}
 
export const config = { matcher: ['/dashboard'] }