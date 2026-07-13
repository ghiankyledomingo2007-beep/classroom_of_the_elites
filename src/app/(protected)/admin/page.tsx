import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { AdminManager } from '@/components/admin-manager'
import { getPendingMeritClaims } from '@/app/actions/merit'

import { cookies } from 'next/headers'
import { DEMO_CLASSMATES, DEMO_ANNOUNCEMENTS } from '@/lib/guest-data'

export default async function AdminPage() {
  const cookieStore = await cookies()
  const isGuestCookie = cookieStore.get('classspace_guest')?.value === 'true'
  const supabase = await createClient()

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  let classroom: any = {
    id: 'class-demo-101',
    name: 'CS 401: Advanced Software Engineering',
    created_at: new Date().toISOString()
  }
  let profiles: any[] = [
    ...DEMO_CLASSMATES,
    {
      id: 'pending-student-1',
      full_name: 'David Vance',
      email: 'david@classspace.edu',
      status: 'pending',
      role: 'student',
      classroom_id: 'class-demo-101',
      created_at: new Date().toISOString(),
    }
  ]
  let reports: any[] = []
  let announcements: any[] = DEMO_ANNOUNCEMENTS
  let pendingClaims: any[] = []

  if (user && !isGuestCookie) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('role, classroom_id')
      .eq('id', user.id)
      .single()

    if (profile && profile.role === 'admin') {
      const { data: cls } = await supabase
        .from('classrooms')
        .select('*')
        .eq('id', profile.classroom_id)
        .single()
      if (cls) classroom = cls

      const { data: profs } = await supabase
        .from('profiles')
        .select('*')
        .eq('classroom_id', profile.classroom_id)
        .order('full_name', { ascending: true })
      if (profs) profiles = profs

      const { data: reps } = await supabase
        .from('reports')
        .select(`
          *,
          reporter:profiles!reports_reporter_id_fkey(full_name, username),
          reported:profiles!reports_reported_profile_id_fkey(full_name, username, avatar_url)
        `)
        .eq('classroom_id', profile.classroom_id)
        .order('created_at', { ascending: false })
      if (reps) reports = reps

      const { data: anns } = await supabase
        .from('announcements')
        .select('*, author:profiles(full_name)')
        .eq('classroom_id', profile.classroom_id)
        .order('created_at', { ascending: false })
      if (anns) announcements = anns

      pendingClaims = await getPendingMeritClaims()
    } else {
      return redirect('/dashboard')
    }
  } else if (!isGuestCookie && !user) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">Admin Console</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
          Manage students, moderate profile content, resolve flags, and configure classroom settings
        </p>
      </div>

      <AdminManager
        classroom={classroom}
        profiles={profiles || []}
        reports={reports || []}
        announcements={announcements || []}
        currentUserId={user?.id || 'guest-user-101'}
        initialPendingClaims={pendingClaims}
      />
    </div>
  )
}
