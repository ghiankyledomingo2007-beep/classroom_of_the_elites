import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { EditProfileForm } from '@/components/edit-profile-form'

import { cookies } from 'next/headers'
import { DEMO_GUEST_PROFILE } from '@/lib/guest-data'

export default async function EditProfilePage() {
  const cookieStore = await cookies()
  const isGuestCookie = cookieStore.get('classspace_guest')?.value === 'true'
  const supabase = await createClient()

  // 1. Get current authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  let profile: any = DEMO_GUEST_PROFILE

  if (user && !isGuestCookie) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (data) {
      profile = data
    }
  } else if (!isGuestCookie && !user) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">Edit Profile</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
          Customize your student showcase card, skills, and links
        </p>
      </div>

      <EditProfileForm initialProfile={profile} />
    </div>
  )
}
