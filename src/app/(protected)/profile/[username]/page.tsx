import React from 'react'
import Link from 'next/link'
import { notFound, redirect } from 'next/navigation'
import { 
  Github, 
  Linkedin, 
  Globe, 
  ExternalLink, 
  User, 
  BookOpen, 
  Award, 
  Calendar,
  Compass,
  Heart,
  Wrench,
  Pencil,
  ArrowLeft,
  FolderGit2
} from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent } from '@/components/ui/card'
import { ReportButton } from '@/components/report-button'
import { canEditProfile } from '@/lib/permissions'

interface PageProps {
  params: Promise<{ username: string }>
}

export default async function StudentProfilePage({ params }: PageProps) {
  const resolvedParams = await params
  const username = resolvedParams.username
  
  const supabase = await createClient()

  // 1. Fetch current auth user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return redirect('/login')

  // 2. Fetch current viewer's profile
  const { data: viewer } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single()

  if (!viewer) return redirect('/login')

  // 3. Fetch the target profile by username
  const { data: profile } = await supabase
    .from('profiles')
    .select('*')
    .eq('username', username)
    .maybeSingle()

  if (!profile) {
    return notFound()
  }

  // 4. Enforce privacy: students can only access profiles in their own classroom
  if (profile.classroom_id !== viewer.classroom_id) {
    return (
      <div className="p-8 text-center bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg mx-auto mt-12 shadow-sm">
        <h2 className="text-xl font-bold text-zinc-900 dark:text-white">Classroom Access Restricted</h2>
        <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
          You do not have permission to view profiles outside of your classroom directory.
        </p>
        <Link href="/directory" className="mt-6 inline-flex px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold transition-colors">
          Back to Class Directory
        </Link>
      </div>
    )
  }

  // 5. Fetch projects for this student profile
  // If the viewer has edit permissions (is owner or admin), fetch all. Otherwise, fetch visible only.
  const isOwnerOrAdmin = canEditProfile(viewer, profile.id)
  let query = supabase.from('projects').select('*').eq('profile_id', profile.id)
  if (!isOwnerOrAdmin) {
    query = query.eq('is_visible', true)
  }
  const { data: projects } = await query.order('project_date', { ascending: false })

  // Theme Accent Maps
  const accentTheme: Record<string, {
    bg: string
    border: string
    text: string
    badge: string
    gradient: string
  }> = {
    indigo: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/20',
      border: 'border-indigo-200 dark:border-indigo-900/50',
      text: 'text-indigo-650 dark:text-indigo-400',
      badge: 'secondary',
      gradient: 'from-indigo-600 to-indigo-800'
    },
    blue: {
      bg: 'bg-blue-50 dark:bg-blue-950/20',
      border: 'border-blue-200 dark:border-blue-900/50',
      text: 'text-blue-605 dark:text-blue-400',
      badge: 'info',
      gradient: 'from-blue-600 to-blue-800'
    },
    violet: {
      bg: 'bg-violet-50 dark:bg-violet-950/20',
      border: 'border-violet-200 dark:border-violet-900/50',
      text: 'text-violet-650 dark:text-violet-400',
      badge: 'secondary',
      gradient: 'from-violet-600 to-violet-800'
    },
    rose: {
      bg: 'bg-rose-50 dark:bg-rose-950/20',
      border: 'border-rose-200 dark:border-rose-900/50',
      text: 'text-rose-650 dark:text-rose-400',
      badge: 'danger',
      gradient: 'from-rose-600 to-rose-800'
    },
    emerald: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/20',
      border: 'border-emerald-200 dark:border-emerald-900/50',
      text: 'text-emerald-650 dark:text-emerald-400',
      badge: 'success',
      gradient: 'from-emerald-600 to-emerald-800'
    },
    orange: {
      bg: 'bg-orange-50 dark:bg-orange-950/20',
      border: 'border-orange-200 dark:border-orange-900/50',
      text: 'text-orange-650 dark:text-orange-400',
      badge: 'warning',
      gradient: 'from-orange-600 to-orange-850'
    }
  }

  const theme = accentTheme[profile.profile_accent] || accentTheme.indigo

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* Back button & controls */}
      <div className="flex items-center justify-between">
        <Link 
          href="/directory" 
          className="inline-flex items-center gap-2 text-sm font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-450 dark:hover:text-zinc-300 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to Directory
        </Link>

        <div className="flex items-center gap-3">
          {/* Moderation/Flagging: Hide flag button on your own profile */}
          {user.id !== profile.id && (
            <ReportButton reportedProfileId={profile.id} reportedName={profile.full_name} />
          )}

          {/* Edit Button */}
          {isOwnerOrAdmin && (
            <Link
              href={user.id === profile.id ? '/profile/edit' : `/admin?tab=students`}
              className="inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-650/10"
            >
              <Pencil className="w-4 h-4" />
              {user.id === profile.id ? 'Edit Profile' : 'Moderate Student'}
            </Link>
          )}
        </div>
      </div>

      {/* Profile Header banner */}
      <div className="relative">
        <div className={`h-40 rounded-t-3xl bg-gradient-to-r ${theme.gradient}`} />
        
        <div className="px-6 pb-6 pt-0 bg-white dark:bg-zinc-900 border-x border-b border-zinc-200/60 dark:border-zinc-800/60 rounded-b-3xl shadow-sm flex flex-col md:flex-row items-center md:items-end gap-6 relative">
          
          {/* Avatar Positioned Overlap */}
          <div className="w-32 h-32 rounded-full border-4 border-white dark:border-zinc-900 bg-zinc-100 dark:bg-zinc-850 overflow-hidden shadow-md -mt-16 z-10 shrink-0">
            {profile.avatar_url ? (
              <img
                src={profile.avatar_url}
                alt={profile.full_name}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-zinc-400">
                <User className="w-14 h-14 stroke-[1.5]" />
              </div>
            )}
          </div>

          {/* Name & Title */}
          <div className="flex-1 text-center md:text-left pt-2 md:pt-4">
            <div className="flex flex-col md:flex-row md:items-baseline gap-2 justify-center md:justify-start">
              <h1 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white leading-tight">
                {profile.full_name}
              </h1>
              {profile.nickname && (
                <span className="text-sm font-medium text-zinc-400 dark:text-zinc-500">
                  ("{profile.nickname}")
                </span>
              )}
            </div>
            <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">
              @{profile.username} &bull; Classroom Student
            </p>
          </div>

          {/* External Links */}
          {profile.show_external_links && (
            <div className="flex items-center gap-2 py-4 md:py-0 shrink-0">
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-450 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  title="GitHub"
                >
                  <Github className="w-5 h-5" />
                </a>
              )}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-450 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  title="LinkedIn"
                >
                  <Linkedin className="w-5 h-5" />
                </a>
              )}
              {profile.portfolio_url && (
                <a
                  href={profile.portfolio_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-450 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  title="Portfolio"
                >
                  <Globe className="w-5 h-5" />
                </a>
              )}
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="p-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-450 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-50 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                  title="Website"
                >
                  <ExternalLink className="w-5 h-5" />
                </a>
              )}
            </div>
          )}

        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Side: Personal Info & Optional Settings */}
        <div className="space-y-8">
          
          {/* About Me card */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-sm uppercase tracking-wider text-zinc-400">About Me</h3>
              {profile.bio ? (
                <div className="space-y-4">
                  <p className="text-sm font-semibold text-zinc-900 dark:text-white border-l-2 border-indigo-500 pl-3.5 italic">
                    "{profile.bio}"
                  </p>
                  {profile.about && (
                    <p className="text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed whitespace-pre-line">
                      {profile.about}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-400 dark:text-zinc-500 italic">No biography provided.</p>
              )}

              {/* Show Birthday option */}
              {profile.show_birthday && profile.birthday && (
                <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center gap-2.5 text-xs text-zinc-500 dark:text-zinc-400">
                  <Calendar className="w-4 h-4 text-indigo-500 shrink-0" />
                  <span>
                    Birthday: <strong>{new Date(profile.birthday).toLocaleDateString('en-US', { month: 'long', day: 'numeric' })}</strong>
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Interests, Skills, & Favorite Subjects */}
          <Card>
            <CardContent className="p-6 space-y-6">
              {/* Favorite Subjects */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 text-zinc-400">
                  <BookOpen className="w-4 h-4" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">Favorite Subjects</h4>
                </div>
                {profile.favorite_subjects && profile.favorite_subjects.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.favorite_subjects.map((sub: string) => (
                      <Badge key={sub} variant={theme.badge as any}>{sub}</Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-zinc-400 italic">None selected</span>
                )}
              </div>

              {/* Skills */}
              <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Wrench className="w-4 h-4" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">Skills & Abilities</h4>
                </div>
                {profile.skills && profile.skills.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.skills.map((skill: string) => (
                      <Badge key={skill}>{skill}</Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-zinc-400 italic">None selected</span>
                )}
              </div>

              {/* Interests */}
              <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Compass className="w-4 h-4" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">Interests</h4>
                </div>
                {profile.interests && profile.interests.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.interests.map((i: string) => (
                      <Badge key={i} variant="default">{i}</Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-zinc-400 italic">None selected</span>
                )}
              </div>

              {/* Hobbies */}
              <div className="space-y-2 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Heart className="w-4 h-4" />
                  <h4 className="font-bold text-xs uppercase tracking-wider">Hobbies</h4>
                </div>
                {profile.hobbies && profile.hobbies.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {profile.hobbies.map((h: string) => (
                      <Badge key={h} variant="default">{h}</Badge>
                    ))}
                  </div>
                ) : (
                  <span className="text-xs text-zinc-400 italic">None selected</span>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Achievements (Optional) */}
          {profile.show_achievements && (
            <Card>
              <CardContent className="p-6 space-y-4">
                <div className="flex items-center gap-2 text-zinc-400">
                  <Award className="w-4 h-4" />
                  <h3 className="font-bold text-xs uppercase tracking-wider">Achievements</h3>
                </div>
                {profile.achievements && profile.achievements.length > 0 ? (
                  <ul className="space-y-2 text-sm">
                    {profile.achievements.map((ach: string, idx: number) => (
                      <li key={idx} className="flex gap-2.5 text-zinc-650 dark:text-zinc-400 items-start">
                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 shrink-0 mt-2" />
                        <span>{ach}</span>
                      </li>
                    ))}
                  </ul>
                ) : (
                  <p className="text-xs text-zinc-400 italic">No achievements listed.</p>
                )}
              </CardContent>
            </Card>
          )}

        </div>

        {/* Right Side: Projects list */}
        <div className="lg:col-span-2 space-y-6">
          <h2 className="text-xl font-bold tracking-tight text-zinc-950 dark:text-zinc-50 flex items-center gap-2">
            <FolderGit2 className="w-5 h-5 text-indigo-500" />
            Showcase Projects
          </h2>

          {projects && projects.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {projects.map((proj) => (
                <Card key={proj.id} className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow">
                  {proj.image_url && (
                    <div className="h-44 w-full relative bg-zinc-100 dark:bg-zinc-800">
                      <img
                        src={proj.image_url}
                        alt={proj.title}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                  <CardContent className="p-6 flex-1 flex flex-col justify-between">
                    <div className="space-y-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap mb-1">
                          <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-snug">
                            {proj.title}
                          </h3>
                          {!proj.is_visible && (
                            <span className="px-1.5 py-0.5 text-[9px] font-semibold bg-zinc-100 text-zinc-500 rounded border border-zinc-200">
                              Invisible
                            </span>
                          )}
                        </div>
                        {proj.project_date && (
                          <span className="block text-xs text-zinc-400 font-medium">
                            {new Date(proj.project_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed line-clamp-4">
                        {proj.description}
                      </p>
                      {proj.technologies && proj.technologies.length > 0 && (
                        <div className="flex flex-wrap gap-1 pt-2">
                          {proj.technologies.map((t: string) => (
                            <Badge key={t} className="px-1.5 py-0.5 text-[9px]">
                              {t}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>

                    {/* External links */}
                    {(proj.github_url || proj.live_url) && (
                      <div className="flex gap-2.5 mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                        {proj.github_url && (
                          <a
                            href={proj.github_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                          >
                            <Github className="w-3.5 h-3.5" />
                            Repository
                          </a>
                        )}
                        {proj.live_url && (
                          <a
                            href={proj.live_url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex-1 flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl text-white bg-indigo-650 hover:bg-indigo-700 transition-colors"
                          >
                            <Globe className="w-3.5 h-3.5" />
                            Live Demo
                          </a>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className="p-12 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl bg-white dark:bg-zinc-900">
              <FolderGit2 className="w-10 h-10 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
              <h4 className="font-bold text-sm text-zinc-600 dark:text-zinc-400">No Showcase Projects</h4>
              <p className="text-xs text-zinc-400 mt-1">This classmate hasn't uploaded any projects yet.</p>
            </div>
          )}
        </div>

      </div>

    </div>
  )
}
