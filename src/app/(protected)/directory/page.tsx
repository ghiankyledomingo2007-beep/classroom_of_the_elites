import React from 'react'
import { createClient } from '@/lib/supabase/server'
import { DirectoryList } from '@/components/directory-list'

import { cookies } from 'next/headers'
import { DEMO_CLASSMATES, DEMO_GUEST_USER } from '@/lib/guest-data'

export default async function DirectoryPage() {
  const cookieStore = await cookies()
  const isGuestCookie = cookieStore.get('classspace_guest')?.value === 'true'
  const supabase = await createClient()

  // 1. Get current user session
  const { data: { user } } = await supabase.auth.getUser()

  let classmates: any[] = DEMO_CLASSMATES
  let currentUserId = user?.id || DEMO_GUEST_USER.id

  if (user && !isGuestCookie) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('classroom_id')
      .eq('id', user.id)
      .single()

    if (profile) {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('classroom_id', profile.classroom_id)
        .eq('status', 'approved')
        .order('full_name', { ascending: true })

      if (data && data.length > 0) {
        classmates = data
      }
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">Class Directory</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
          Browse and connect with classmates in your classroom
        </p>
      </div>

      <DirectoryList classmates={classmates} currentUserId={currentUserId} />
    </div>
  )
}
