import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'

export async function updateSession(request: NextRequest) {
  let supabaseResponse = NextResponse.next({
    request,
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          supabaseResponse = NextResponse.next({
            request,
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options)
          )
        },
      },
    }
  )

  // IMPORTANT: Get user from Supabase auth
  const { data: { user } } = await supabase.auth.getUser()

  // Get user profile if authenticated to check status and role
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('status, role')
      .eq('id', user.id)
      .single()
    profile = data
  }

  const path = request.nextUrl.pathname

  // Static assets and internal next paths should not be blocked
  if (
    path.startsWith('/_next') ||
    path.startsWith('/api') ||
    path.startsWith('/favicon.ico') ||
    path.includes('.')
  ) {
    return supabaseResponse
  }

  // Public paths
  const isPublicPath =
    path === '/' ||
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password')

  // Auth pages like login and register should redirect logged in users to dashboard
  if (user && (path.startsWith('/login') || path.startsWith('/register'))) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Protected paths: redirect anonymous users to login
  if (!user && !isPublicPath) {
    const url = request.nextUrl.clone()
    url.pathname = '/login'
    return NextResponse.redirect(url)
  }

  // Enforce account status and role policies for authenticated users
  if (user && profile) {
    const status = profile.status
    const role = profile.role

    // Deactivated or rejected users go to /rejected-deactivated
    if ((status === 'rejected' || status === 'deactivated') && path !== '/rejected-deactivated') {
      const url = request.nextUrl.clone()
      url.pathname = '/rejected-deactivated'
      return NextResponse.redirect(url)
    }

    // Pending users go to /pending
    if (status === 'pending' && path !== '/pending' && path !== '/rejected-deactivated') {
      const url = request.nextUrl.clone()
      url.pathname = '/pending'
      return NextResponse.redirect(url)
    }

    // Approved users trying to access pending or rejected pages redirect to dashboard
    if (status === 'approved' && (path === '/pending' || path === '/rejected-deactivated')) {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }

    // Admin paths protection
    if (path.startsWith('/admin') && role !== 'admin') {
      const url = request.nextUrl.clone()
      url.pathname = '/dashboard'
      return NextResponse.redirect(url)
    }
  } else if (user && !profile && !isPublicPath && path !== '/pending' && path !== '/rejected-deactivated') {
    // If authenticated but profile doesn't exist yet, it's a pending edge-case (let them hit /pending)
    const url = request.nextUrl.clone()
    url.pathname = '/pending'
    return NextResponse.redirect(url)
  }

  return supabaseResponse
}
