import React from 'react'
import Link from 'next/link'
import { redirect } from 'next/navigation'
import { Megaphone, Pin, Calendar, User, Shield } from 'lucide-react'
import { createClient } from '@/lib/supabase/server'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

import { cookies } from 'next/headers'
import { DEMO_ANNOUNCEMENTS } from '@/lib/guest-data'

export default async function AnnouncementsPage() {
  const cookieStore = await cookies()
  const isGuestCookie = cookieStore.get('classspace_guest')?.value === 'true'
  const supabase = await createClient()

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  let announcements: any[] = DEMO_ANNOUNCEMENTS
  let isAdmin = true

  if (user && !isGuestCookie) {
    const { data: profile } = await supabase
      .from('profiles')
      .select('classroom_id, role')
      .eq('id', user.id)
      .single()

    if (profile) {
      isAdmin = profile.role === 'admin'
      const now = new Date().toISOString()
      const { data } = await supabase
        .from('announcements')
        .select('*, author:profiles(full_name, avatar_url)')
        .eq('classroom_id', profile.classroom_id)
        .or(`expires_at.is.null,expires_at.gt.${now}`)
        .order('is_pinned', { ascending: false })
        .order('created_at', { ascending: false })
      if (data) announcements = data
    }
  } else if (!isGuestCookie && !user) {
    return redirect('/login')
  }

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-start flex-wrap gap-4">
        <div>
          <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">Class Announcements</h1>
          <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
            Stay updated with the latest instructions and posts from your classroom supervisor
          </p>
        </div>

        {isAdmin && (
          <Link
            href="/admin?tab=announcements"
            className="inline-flex items-center gap-2 py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-650/10"
          >
            <Shield className="w-4 h-4" />
            Manage Announcements
          </Link>
        )}
      </div>

      {announcements && announcements.length > 0 ? (
        <div className="space-y-6">
          {announcements.map((ann) => (
            <Card 
              key={ann.id} 
              className={`transition-all ${
                ann.is_pinned 
                  ? 'border-indigo-200 dark:border-indigo-900/50 ring-1 ring-indigo-50/50 dark:ring-indigo-950/10' 
                  : ''
              }`}
            >
              <CardContent className="p-6">
                <div className="flex justify-between items-start gap-4 flex-wrap">
                  {/* Left: Title and metadata */}
                  <div className="space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      {ann.is_pinned && (
                        <Badge variant="secondary" className="gap-1 px-2 py-0.5">
                          <Pin className="w-3 h-3 rotate-45 text-indigo-600 dark:text-indigo-400" />
                          Pinned
                        </Badge>
                      )}
                      <h3 className="font-bold text-lg text-zinc-900 dark:text-white leading-snug">
                        {ann.title}
                      </h3>
                    </div>

                    <div className="flex items-center gap-3 text-xs text-zinc-450 dark:text-zinc-400 pt-0.5 flex-wrap">
                      <span className="flex items-center gap-1">
                        <User className="w-3.5 h-3.5 text-zinc-400" />
                        {ann.author?.full_name || 'Administrator'}
                      </span>
                      <span>&bull;</span>
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-zinc-400" />
                        {new Date(ann.created_at).toLocaleDateString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric'
                        })}
                      </span>
                      {ann.expires_at && (
                        <>
                          <span>&bull;</span>
                          <span className="text-amber-600 dark:text-amber-400 font-medium">
                            Active until: {new Date(ann.expires_at).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Announcement Content */}
                <div className="mt-4 text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed whitespace-pre-line border-t border-zinc-100 dark:border-zinc-800/40 pt-4">
                  {ann.content}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-16 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400 mb-4">
            <Megaphone className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">All quiet for now</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            There are no active classroom announcements at the moment. Keep an eye here for updates from your supervisor.
          </p>
        </div>
      )}
    </div>
  )
}
