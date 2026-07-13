import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const url = new URL(request.url)
  const action = url.searchParams.get('action') || 'enter'
  const redirectTo = url.searchParams.get('redirect') || '/dashboard'
  const safeRedirects = ['/dashboard', '/login', '/']
  const finalRedirect = safeRedirects.includes(redirectTo) && !redirectTo.startsWith('http') && !redirectTo.startsWith('//')
    ? redirectTo
    : '/dashboard'

  const response = NextResponse.redirect(new URL(finalRedirect, request.url))

  if (action === 'exit') {
    response.cookies.delete('classspace_guest')
  } else {
    response.cookies.set('classspace_guest', 'true', {
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 7 days
      sameSite: 'lax',
    })
  }

  return response
}
