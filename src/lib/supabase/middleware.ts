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

  // Get current session user
  let { data: { user } } = await supabase.auth.getUser()

  // Auto-login as admin if no session exists to bypass login wall completely
  if (!user) {
    try {
      const { data: signInData } = await supabase.auth.signInWithPassword({
        email: 'admin@oakridge.edu',
        password: 'password123',
      })
      if (signInData?.user) {
        user = signInData.user
      }
    } catch (error) {
      console.error('Auto login failed:', error)
    }
  }

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

  // Auto-redirect public/auth pages to dashboard since user is auto-logged in
  if (
    path === '/' ||
    path.startsWith('/login') ||
    path.startsWith('/register') ||
    path.startsWith('/forgot-password') ||
    path.startsWith('/reset-password')
  ) {
    const url = request.nextUrl.clone()
    url.pathname = '/dashboard'
    return NextResponse.redirect(url)
  }

  // Approved users trying to access pending or rejected pages redirect to dashboard
  if (user && profile) {
    const status = profile.status
    if ((status === 'rejected' || status === 'deactivated') && path !== '/rejected-deactivated') {
      const url = request.nextUrl.clone()
      url.pathname = '/rejected-deactivated'
      return NextResponse.redirect(url)
    }

    if (status === 'pending' && path !== '/pending' && path !== '/rejected-deactivated') {
      const url = request.nextUrl.clone()
      url.pathname = '/pending'
      return NextResponse.redirect(url)
    }
  }

  return supabaseResponse
}
