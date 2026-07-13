import React from 'react'
import { redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'
import { ProjectsList } from '@/components/projects-list'

import { cookies } from 'next/headers'
import { DEMO_PROJECTS, DEMO_GUEST_USER } from '@/lib/guest-data'

export default async function ProjectsPage() {
  const cookieStore = await cookies()
  const isGuestCookie = cookieStore.get('classspace_guest')?.value === 'true'
  const supabase = await createClient()

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  let projects: any[] = DEMO_PROJECTS
  let userId = user?.id || DEMO_GUEST_USER.id

  if (user && !isGuestCookie) {
    const { data } = await supabase
      .from('projects')
      .select('*')
      .eq('profile_id', user.id)
      .order('project_date', { ascending: false })

    if (data) {
      projects = data
    }
  } else if (!isGuestCookie && !user) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">My Showcase Projects</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
          Create, edit, and manage projects displayed on your portfolio showcase
        </p>
      </div>

      <ProjectsList initialProjects={projects} userId={userId} />
    </div>
  )
}
