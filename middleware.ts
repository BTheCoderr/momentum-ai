import { createServerClient } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  // Completely bypass auth in development - allow all routes
  if (process.env.NODE_ENV === 'development') {
    console.log('🔧 Development mode: allowing access to', req.nextUrl.pathname);
    return NextResponse.next()
  }

  // Production auth logic
  let res = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        get(name: string) {
          return req.cookies.get(name)?.value
        },
        set(name: string, value: string, options: any) {
          res.cookies.set({
            name,
            value,
            ...options,
          })
        },
        remove(name: string, options: any) {
          res.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  const {
    data: { user },
  } = await supabase.auth.getUser()

  // If user is not signed in and is trying to access protected routes, redirect to auth
  if (!user && req.nextUrl.pathname.startsWith('/dashboard')) {
    return NextResponse.redirect(new URL('/auth', req.url))
  }

  // If user is signed in and trying to access auth page, redirect to dashboard
  if (user && req.nextUrl.pathname === '/auth') {
    return NextResponse.redirect(new URL('/dashboard', req.url))
  }

  return res
}

export const config = {
  matcher: [
    // Match all paths except static files and API routes
    '/((?!_next/static|_next/image|favicon.ico|api|images).*)',
  ],
} 