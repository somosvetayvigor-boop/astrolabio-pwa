import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { updateSession } from '@/utils/supabase/middleware'

export async function middleware(request: NextRequest) {
  // 1. Update Supabase session (auth)
  const response = await updateSession(request)

  // 2. Handle Subdomain/Domain routing
  const url = request.nextUrl
  const hostname = request.headers.get('host') || ''

  // Only rewrite if we are hitting the root path '/'
  if (url.pathname === '/') {
    // If accessing via www. or apex domain, rewrite to the landing page
    if (hostname === 'www.astrolabiobooks.com' || hostname === 'astrolabiobooks.com') {
      const urlClone = url.clone();
      urlClone.pathname = '/landing';
      
      // We must copy cookies/headers from updateSession response to the rewrite response
      const rewriteResponse = NextResponse.rewrite(urlClone);
      
      // Propagate cookies set by Supabase
      response.cookies.getAll().forEach(cookie => {
        rewriteResponse.cookies.set(cookie.name, cookie.value, cookie);
      });
      
      return rewriteResponse;
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * Feel free to modify this pattern to include more paths.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
