import { cookies } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { DEMO_GUEST_USER, DEMO_GUEST_PROFILE } from '@/lib/guest-data'

export async function getCurrentUserOrGuest() {
  const cookieStore = await cookies()
  const isGuestCookie = cookieStore.get('classspace_guest')?.value === 'true'

  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (user) {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single()

      if (profile) {
        return {
          user,
          profile,
          isGuest: false,
        }
      }
    }
  } catch (error) {
    // If Supabase is unreachable or not configured, fall through to Guest Mode
  }

  // If cookie is set OR if fallback is needed, return Guest Demo Profile
  return {
    user: DEMO_GUEST_USER,
    profile: DEMO_GUEST_PROFILE,
    isGuest: true,
  }
}
