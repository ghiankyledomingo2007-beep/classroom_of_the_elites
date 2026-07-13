import React from 'react'
import { cookies } from 'next/headers'
import { Trophy, Award, Sparkles, TrendingUp, ShieldCheck, Star, Zap } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { DEMO_CLASSMATES } from '@/lib/guest-data'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export default async function LeaderboardPage() {
  const cookieStore = await cookies()
  const isGuestCookie = cookieStore.get('classspace_guest')?.value === 'true'
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()

  let classmates: any[] = DEMO_CLASSMATES.map((c, i) => ({
    ...c,
    classroom: {
      section_name: i < 3 ? 'Section A' : i < 6 ? 'Section B' : 'Section C'
    }
  }))

  if (user && !isGuestCookie) {
    const { data } = await supabase
      .from('profiles')
      .select('*, classroom:classrooms(section_name)')
      .eq('status', 'approved')

    if (data && data.length > 0) {
      classmates = data.map(c => ({
        ...c,
        points: c.points ?? 500,
        tier: c.tier ?? 'Class C • Regular',
        student_id_code: c.student_id_code ?? `ANHS-${c.id.slice(0, 4).toUpperCase()}`
      }))
    }
  }

  // Aggregate points by section
  const sectionPointsMap: Record<string, number> = {}
  classmates.forEach(p => {
    const secName = p.classroom?.section_name || 'Section C'
    sectionPointsMap[secName] = (sectionPointsMap[secName] || 0) + (p.points || 500)
  })

  const sectionStandings = Object.entries(sectionPointsMap)
    .map(([name, points]) => ({ name, points }))
    .sort((a, b) => b.points - a.points)

  // Sort classmates by points descending
  const sortedClassmates = [...classmates].sort((a, b) => (b.points || 0) - (a.points || 0))
  const topThree = sortedClassmates.slice(0, 3)
  const restClassmates = sortedClassmates.slice(3)

  const rankColors = [
    'from-amber-400 to-yellow-600 text-amber-950 border-amber-300 dark:border-amber-500/50 shadow-amber-500/20', // Gold
    'from-zinc-300 to-slate-400 text-zinc-900 border-zinc-300 dark:border-zinc-500/50 shadow-zinc-400/10', // Silver
    'from-amber-700 to-orange-800 text-amber-100 border-amber-600/50 shadow-orange-900/20', // Bronze
  ]

  const rankBadges = ['#1 • S-RANK', '#2 • A-RANK', '#3 • B-RANK']

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      {/* Header section with COTE aesthetic */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-zinc-900 via-zinc-950 to-black p-8 border border-rose-500/30 dark:border-rose-500/40 shadow-2xl">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-rose-600/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-72 h-72 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold tracking-wider uppercase mb-3">
              <Zap className="w-3.5 h-3.5 text-rose-500" />
              COTE • CLASSROOM DIRECTORY
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-mono">
              Classroom Student Showcase
            </h1>
            <p className="text-zinc-400 mt-2 text-sm max-w-xl leading-relaxed">
              Inspired by <span className="text-rose-400 font-semibold">Classroom of the Elite</span>. Discover classmates, explore portfolios, and celebrate student projects.
            </p>
          </div>

          <div className="flex items-center gap-3 bg-zinc-900/80 border border-zinc-800 px-5 py-3.5 rounded-2xl backdrop-blur-md">
            <Trophy className="w-8 h-8 text-amber-400 shrink-0" />
            <div>
              <div className="text-xs font-mono text-zinc-400 uppercase">Total Class Pool</div>
              <div className="text-2xl font-extrabold font-mono text-amber-400 tracking-tight">
                {sortedClassmates.reduce((acc, curr) => acc + (curr.points || 0), 0).toLocaleString()} CP
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Section Standings Scoreboard */}
      <div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4 font-mono">
          <TrendingUp className="w-5 h-5 text-rose-500" />
          <span>Active Section Standings</span>
        </h2>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {sectionStandings.map((section, idx) => {
            const placeColors = [
              'bg-gradient-to-br from-rose-500/10 to-rose-500/0 border-rose-500/35 ring-1 ring-rose-500/10',
              'bg-gradient-to-br from-zinc-500/10 to-zinc-500/0 border-zinc-700/50',
              'bg-gradient-to-br from-amber-700/10 to-amber-700/0 border-amber-800/40',
              'bg-zinc-900/40 border-zinc-900/60'
            ]
            const bgClass = placeColors[idx] || placeColors[3]
            const textClass = idx === 0 ? 'text-rose-400' : 'text-zinc-400 dark:text-zinc-350'
            return (
              <Card key={section.name} className={`${bgClass} overflow-hidden shadow-md`}>
                <CardContent className="p-4 flex flex-col justify-between h-full">
                  <div>
                    <span className="text-[10px] font-mono text-zinc-400 uppercase tracking-widest block mb-1">
                      Rank #{idx + 1}
                    </span>
                    <span className={`text-base font-bold font-mono tracking-tight ${textClass} block`}>
                      {section.name}
                    </span>
                  </div>
                  <div className="mt-4">
                    <span className="text-xl font-extrabold font-mono text-white tracking-tight">
                      {section.points.toLocaleString()}
                    </span>
                    <span className="text-[10px] font-mono text-zinc-400 ml-1">CP</span>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      </div>

      {/* Podium Top 3 Identity Cards */}
      <div>
        <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-amber-500" />
          <span>Classroom Elite Podium</span>
        </h2>

        <div className="grid md:grid-cols-3 gap-6">
          {topThree.map((student, idx) => (
            <div
              key={student.id}
              className={`relative overflow-hidden rounded-2xl bg-white dark:bg-zinc-900 border p-6 shadow-xl transition-all duration-300 hover:-translate-y-1 ${
                idx === 0
                  ? 'border-amber-400/60 dark:border-amber-500/50 shadow-amber-500/10'
                  : 'border-zinc-200 dark:border-zinc-800'
              }`}
            >
              {/* Top gradient accent */}
              <div
                className={`absolute top-0 left-0 right-0 h-2 bg-gradient-to-r ${rankColors[idx]}`}
              />

              <div className="flex items-center justify-between mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-bold bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                  <Award className="w-3.5 h-3.5 text-amber-500" />
                  {rankBadges[idx]}
                </span>
                <span className="font-mono text-xs text-zinc-400">
                  {student.student_id_code || `ANHS-010${idx + 1}`}
                </span>
              </div>

              <div className="flex items-center gap-4 my-4">
                <img
                  src={student.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                  alt={student.full_name}
                  className="w-14 h-14 rounded-2xl object-cover border-2 border-zinc-200 dark:border-zinc-700 shadow-md"
                />
                <div className="overflow-hidden">
                  <h3 className="font-bold text-base text-zinc-900 dark:text-white truncate">
                    {student.full_name}
                  </h3>
                  <p className="text-xs font-medium text-rose-600 dark:text-rose-400">
                    {student.tier || 'Class A • Elite'}
                  </p>
                </div>
              </div>

              <div className="mt-4 pt-4 border-t border-zinc-100 dark:border-zinc-800/80 flex items-center justify-between">
                <span className="text-xs text-zinc-500 dark:text-zinc-400">Merit Balance</span>
                <span className="font-mono text-xl font-extrabold text-amber-600 dark:text-amber-400">
                  {(student.points || 0).toLocaleString()} <span className="text-xs font-normal">CP</span>
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Main Ranking Table + S-System Explanation */}
      <div className="grid lg:grid-cols-3 gap-8">
        {/* Leaderboard Table (Spans 2 cols) */}
        <Card className="lg:col-span-2 border-zinc-200/80 dark:border-zinc-800 shadow-sm">
          <CardHeader>
            <CardTitle className="text-lg font-bold flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-rose-600 dark:text-rose-400" />
              <span>Full Classroom Rankings</span>
            </CardTitle>
            <CardDescription>
              All classmates showcased and ranked by active portfolio contributions
            </CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <div className="divide-y divide-zinc-100 dark:divide-zinc-800/60">
              {sortedClassmates.map((student, idx) => (
                <div
                  key={student.id}
                  className="px-6 py-4 flex items-center justify-between hover:bg-zinc-50/80 dark:hover:bg-zinc-800/40 transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <span className="w-8 text-center font-mono font-bold text-sm text-zinc-400">
                      #{idx + 1}
                    </span>
                    <img
                      src={student.avatar_url || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80'}
                      alt={student.full_name}
                      className="w-10 h-10 rounded-xl object-cover border border-zinc-200 dark:border-zinc-700"
                    />
                    <div>
                      <div className="font-semibold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                        <span>{student.full_name}</span>
                        {idx < 3 && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 font-bold">
                            TOP {idx + 1}
                          </span>
                        )}
                      </div>
                      <div className="text-xs text-zinc-500 dark:text-zinc-400">
                        {student.tier || 'Class C • Regular'}
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <div className="font-mono text-base font-bold text-zinc-900 dark:text-white">
                      {(student.points || 0).toLocaleString()} <span className="text-xs font-normal text-amber-600 dark:text-amber-400">CP</span>
                    </div>
                    <div className="text-[11px] font-mono text-zinc-400">
                      {student.student_id_code || `ANHS-010${idx + 1}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Classroom Showcase Info Card */}
        <div className="space-y-6">
          <Card className="border-rose-500/20 dark:border-rose-500/30 bg-gradient-to-b from-rose-50/50 to-white dark:from-zinc-900 dark:to-zinc-950">
            <CardHeader>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-rose-700 dark:text-rose-400">
                <Sparkles className="w-5 h-5" />
                <span>About Classroom Directory</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Student Discovery & Showcase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4 text-sm">
              <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">Project Showcases</div>
                  <div className="text-xs text-zinc-500">Publish your web apps, demos, and code</div>
                </div>
              </div>

              <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">Student Portfolios</div>
                  <div className="text-xs text-zinc-500">Share skills, interests, and bio</div>
                </div>
              </div>

              <div className="flex items-start justify-between gap-3 p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800">
                <div>
                  <div className="font-semibold text-zinc-900 dark:text-zinc-100">Classmate Network</div>
                  <div className="text-xs text-zinc-500">Connect with peers across sections</div>
                </div>
              </div>

              <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/20 text-xs text-rose-800 dark:text-rose-300 leading-relaxed">
                <strong>Note:</strong> Keep your student portfolio updated so classmates and teachers can easily explore your featured projects!
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
