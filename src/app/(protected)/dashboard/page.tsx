import React from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { 
  GraduationCap, 
  Sparkles, 
  ArrowRight, 
  UserCheck, 
  FolderGit2, 
  Megaphone,
  Cake,
  Calendar,
  ChevronRight,
  Plus,
  Trophy
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { calculateProfileCompletion } from '@/lib/profile-completion'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { StatusBadge } from '@/components/ui/badge'

// Birthday helper to check if a date is within upcoming 30 days
function getUpcomingBirthdays(classmates: any[]) {
  const today = new Date()
  const currentMonth = today.getMonth()
  const currentDate = today.getDate()
  
  return classmates.map(c => {
    const bday = new Date(c.birthday)
    const bdayMonth = bday.getMonth()
    const bdayDate = bday.getDate()
    
    // Calculate days until next birthday
    let nextBdayYear = today.getFullYear()
    if (bdayMonth < currentMonth || (bdayMonth === currentMonth && bdayDate < currentDate)) {
      nextBdayYear += 1
    }
    
    const nextBday = new Date(nextBdayYear, bdayMonth, bdayDate)
    const diffTime = nextBday.getTime() - today.getTime()
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
    
    return {
      ...c,
      daysUntil: diffDays,
      formattedDate: bday.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
    }
  })
  .filter(c => c.daysUntil <= 30)
  .sort((a, b) => a.daysUntil - b.daysUntil)
}

import { DEMO_GUEST_PROFILE, DEMO_CLASSMATES, DEMO_ANNOUNCEMENTS, DEMO_PROJECTS } from '@/lib/guest-data'

export default async function DashboardPage() {
  const cookieStore = await cookies()
  const isGuestCookie = cookieStore.get('classspace_guest')?.value === 'true'
  const supabase = await createClient()

  // 1. Fetch Auth User
  const { data: { user } } = await supabase.auth.getUser()

  let profile: any = null
  let announcements: any[] = []
  let classmates: any[] = []
  let birthdayClassmates: any[] = []
  let projectCount = 0

  if (user && !isGuestCookie) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()
    profile = data

    if (profile) {
      const { count } = await supabase
        .from('projects')
        .select('id', { count: 'exact', head: true })
        .eq('profile_id', user.id)
      projectCount = count || 0

      const { data: annData } = await supabase
        .from('announcements')
        .select('*, author:profiles(full_name, avatar_url)')
        .eq('classroom_id', profile.classroom_id)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
        .limit(3)
      announcements = annData || []

      const { data: classData } = await supabase
        .from('profiles')
        .select('id, full_name, nickname, avatar_url, bio, username, skills, profile_accent')
        .eq('classroom_id', profile.classroom_id)
        .eq('status', 'approved')
        .neq('id', user.id)
        .order('updated_at', { ascending: false })
        .limit(3)
      classmates = classData || []

      const { data: bdayData } = await supabase
        .from('profiles')
        .select('full_name, nickname, avatar_url, birthday, username')
        .eq('classroom_id', profile.classroom_id)
        .eq('status', 'approved')
        .eq('show_birthday', true)
        .not('birthday', 'is', null)
      birthdayClassmates = bdayData || []
    }
  }

  // Fallback to Guest Demo Data if not logged in or in guest mode
  if (!profile) {
    profile = DEMO_GUEST_PROFILE
    projectCount = DEMO_PROJECTS.length
    announcements = DEMO_ANNOUNCEMENTS
    classmates = DEMO_CLASSMATES.slice(1, 4)
    birthdayClassmates = DEMO_CLASSMATES
  }

  // Calculate Profile Completion
  const { percentage, recommendations } = calculateProfileCompletion(profile, projectCount > 0)

  const upcomingBirthdays = birthdayClassmates ? getUpcomingBirthdays(birthdayClassmates) : []

  // Accent mapping for custom profiles
  const accentColors: Record<string, string> = {
    indigo: 'bg-indigo-600 text-indigo-600',
    blue: 'bg-blue-600 text-blue-600',
    violet: 'bg-violet-600 text-violet-600',
    rose: 'bg-rose-600 text-rose-600',
    emerald: 'bg-emerald-600 text-emerald-600',
    orange: 'bg-orange-600 text-orange-600',
  }

  const userAccent = accentColors[profile.profile_accent] || 'bg-rose-600'

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Welcome Hero */}
      <section className="bg-gradient-to-r from-[#120a0d] via-zinc-950 to-[#160b10] border border-rose-500/25 text-white rounded-3xl p-8 md:p-10 shadow-xl relative overflow-hidden">
        {/* Glow Effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-[#c8102e]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-60 h-60 bg-[#e5007f]/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10">
          <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            CLASSROOM PORTFOLIO SHOWCASE
          </span>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight font-mono">
            Welcome back, {profile.full_name.split(' ')[0]}!
          </h1>
          <p className="mt-3 text-zinc-400 text-sm md:text-base max-w-xl leading-relaxed">
            Explore your classmate directory, share your custom projects, and build your student portfolio showcase.
          </p>
        </div>
      </section>

      {/* COTE S-System Merit ID Banner */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-black border border-rose-500/30 p-5 shadow-lg flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-500/10 border border-rose-500/30 flex items-center justify-center text-rose-500 shrink-0">
            <Trophy className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-mono font-bold tracking-wider uppercase text-rose-400">
                S-SYSTEM MERIT PROFILE
              </span>
              <span className="text-xs font-mono px-2 py-0.5 rounded bg-zinc-800 text-zinc-300">
                {profile.student_id_code || 'ANHS-0101'}
              </span>
            </div>
            <h3 className="text-lg font-bold text-white font-mono mt-0.5">
              {profile.tier || 'Class A • Elite'}
            </h3>
          </div>
        </div>

        <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800">
          <div>
            <div className="text-[11px] font-mono uppercase text-zinc-400">Current Balance</div>
            <div className="text-xl font-extrabold font-mono text-amber-400">
              {(profile.points ?? 1450).toLocaleString()} <span className="text-xs font-normal">CP</span>
            </div>
          </div>

          <Link
            href="/leaderboard"
            className="px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-700 active:bg-rose-800 text-white font-semibold text-xs transition-all shadow-md shadow-rose-600/20 flex items-center gap-1.5 shrink-0"
          >
            <span>View Rankings</span>
            <span>→</span>
          </Link>
        </div>
      </div>

      {/* Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left / Center Column: Profile Completion and Announcements */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* Profile Completion */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Profile Completion</CardTitle>
                <CardDescription>Get your card showcase ready for your classmates</CardDescription>
              </div>
              <span className="text-2xl font-black text-rose-600 dark:text-rose-400">
                {percentage}%
              </span>
            </CardHeader>
            <CardContent>
              {/* Progress bar */}
              <div className="w-full bg-zinc-100 dark:bg-zinc-800 rounded-full h-3 mb-6 overflow-hidden">
                <div 
                  className={`h-full rounded-full transition-all duration-500 ${userAccent.split(' ')[0]}`}
                  style={{ width: `${percentage}%` }}
                />
              </div>

              {percentage < 100 ? (
                <div className="space-y-3">
                  <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-400">Next Steps:</h4>
                  <ul className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                    {recommendations.slice(0, 4).map((rec, index) => (
                      <li key={index} className="flex items-center gap-2.5 text-zinc-650 dark:text-zinc-400">
                        <span className="w-1.5 h-1.5 rounded-full bg-zinc-350 dark:bg-zinc-700 shrink-0" />
                        <span className="truncate">{rec}</span>
                      </li>
                    ))}
                  </ul>
                  <div className="pt-4 flex justify-end">
                    <Link
                      href="/profile/edit"
                      className="inline-flex items-center gap-2 text-sm font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 transition-colors"
                    >
                      Complete Profile <ArrowRight className="w-4 h-4" />
                    </Link>
                  </div>
                </div>
              ) : (
                <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-100 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-300 text-sm">
                  <Sparkles className="w-5 h-5 text-emerald-600 dark:text-emerald-400 shrink-0" />
                  <span><strong>Spectacular!</strong> Your ClassSpace profile is 100% complete and fully visible.</span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent Announcements */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-rose-500" />
                Class Announcements
              </h2>
              <Link
                href="/announcements"
                className="text-sm font-semibold text-rose-600 hover:text-rose-500 dark:text-rose-400 transition-colors inline-flex items-center gap-1"
              >
                View all <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            {announcements && announcements.length > 0 ? (
              <div className="space-y-4">
                {announcements.map((ann) => (
                  <Card key={ann.id} className={ann.is_pinned ? 'border-rose-200 dark:border-rose-950/50 ring-1 ring-rose-50/50 dark:ring-rose-950/10' : ''}>
                    <CardContent className="p-6">
                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            {ann.is_pinned && (
                              <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-50 dark:bg-rose-950/40 text-rose-700 dark:text-rose-300 rounded border border-rose-250/20">
                                Pinned
                              </span>
                            )}
                            <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-snug">
                              {ann.title}
                            </h3>
                          </div>
                          <span className="block text-xs text-zinc-400 font-medium">
                            Published by {ann.author?.full_name || 'Administrator'} &bull; {new Date(ann.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                        </div>
                      </div>
                      <p className="mt-3 text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed line-clamp-3">
                        {ann.content}
                      </p>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="p-8 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-zinc-400 dark:text-zinc-500">
                No recent announcements.
              </div>
            )}
          </section>

        </div>

        {/* Right Column: Birthdays & Featured Classmates */}
        <div className="space-y-8">
          
          {/* Quick Links Card */}
          <Card className="bg-gradient-to-b from-rose-500/5 to-rose-500/0 border-rose-500/10">
            <CardHeader>
              <CardTitle>Quick Navigation</CardTitle>
            </CardHeader>
            <CardContent className="grid grid-cols-1 gap-2 pt-0">
              <Link
                href="/profile/edit"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-850 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-sm font-semibold"
              >
                <span className="flex items-center gap-2">
                  <UserCheck className="w-4 h-4 text-rose-500" />
                  Edit Profile Card
                </span>
                <ChevronRight className="w-4 h-4 text-zinc-400" />
              </Link>

              <Link
                href="/projects"
                className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-850 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 hover:border-zinc-300 dark:hover:border-zinc-700 transition-all text-sm font-semibold"
              >
                <span className="flex items-center gap-2">
                  <FolderGit2 className="w-4 h-4 text-emerald-500" />
                  Add a New Project
                </span>
                <Plus className="w-4 h-4 text-zinc-400" />
              </Link>
            </CardContent>
          </Card>

          {/* Birthdays Section */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <Cake className="w-5 h-5 text-rose-500" />
              Upcoming Birthdays
            </h2>

            {upcomingBirthdays.length > 0 ? (
              <div className="space-y-3">
                {upcomingBirthdays.map((bday) => (
                  <Link href={`/profile/${bday.username}`} key={bday.username} className="block">
                    <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 hover:-translate-y-0.5 transition-all hover:shadow-sm">
                      <div className="flex items-center gap-3">
                        {bday.avatar_url ? (
                          <img
                            src={bday.avatar_url}
                            alt={bday.full_name}
                            className="w-10 h-10 rounded-full object-cover border border-zinc-200 dark:border-zinc-800"
                          />
                        ) : (
                          <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-250/20 text-zinc-500">
                            <span className="font-bold text-sm">
                              {bday.nickname ? bday.nickname.substring(0, 2).toUpperCase() : bday.full_name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <span className="block font-semibold text-zinc-900 dark:text-white leading-tight">
                            {bday.nickname || bday.full_name}
                          </span>
                          <span className="text-xs text-zinc-400 font-medium inline-flex items-center gap-1.5 mt-0.5">
                            <Calendar className="w-3.5 h-3.5" />
                            {bday.formattedDate}
                          </span>
                        </div>
                      </div>
                      <span className="text-xs font-bold text-rose-600 dark:text-rose-400 bg-rose-50 dark:bg-rose-950/40 px-2 py-1 rounded-lg">
                        {bday.daysUntil === 0 ? 'Today!' : bday.daysUntil === 1 ? 'Tomorrow' : `In ${bday.daysUntil} days`}
                      </span>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
                No birthdays in the next 30 days.
              </div>
            )}
          </section>

          {/* Recently Active Classmates */}
          <section className="space-y-4">
            <h2 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-zinc-50 flex items-center gap-2">
              <UserCheck className="w-5 h-5 text-rose-500" />
              Recently Active
            </h2>

            {classmates && classmates.length > 0 ? (
              <div className="space-y-3">
                {classmates.map((student) => {
                  const studentAccent = student.profile_accent || 'rose'
                  const accentColorClass = accentColors[studentAccent]?.split(' ')[1] || 'text-rose-600'
                  return (
                    <Link href={`/profile/${student.username}`} key={student.id} className="block">
                      <div className="flex items-center justify-between p-3.5 rounded-xl border border-zinc-200/60 dark:border-zinc-800/60 bg-white dark:bg-zinc-900 hover:-translate-y-0.5 transition-all hover:shadow-sm">
                        <div className="flex items-center gap-3 min-w-0">
                          {student.avatar_url ? (
                            <img
                              src={student.avatar_url}
                              alt={student.full_name}
                              className="w-10 h-10 rounded-full object-cover border border-zinc-250/20"
                            />
                          ) : (
                            <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-250/20 text-zinc-500 shrink-0">
                              <span className="font-bold text-sm">
                                {student.nickname ? student.nickname.substring(0, 2).toUpperCase() : student.full_name.substring(0, 2).toUpperCase()}
                              </span>
                            </div>
                          )}
                          <div className="min-w-0">
                            <span className="block font-semibold text-zinc-900 dark:text-white leading-tight truncate">
                              {student.full_name}
                            </span>
                            <span className="block text-[10px] text-zinc-400 font-medium truncate mt-0.5">
                              {student.bio || 'Showcasing student portfolio'}
                            </span>
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-zinc-400 shrink-0 ml-2" />
                      </div>
                    </Link>
                  )
                })}
              </div>
            ) : (
              <div className="p-6 rounded-2xl border border-dashed border-zinc-200 dark:border-zinc-800 text-center text-xs text-zinc-400 dark:text-zinc-500">
                Other classmate cards will appear here.
              </div>
            )}
          </section>

        </div>

      </div>
    </div>
  )
}
