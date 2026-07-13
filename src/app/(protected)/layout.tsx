import React from 'react'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { Sparkles } from 'lucide-react'
import { Navigation } from '@/components/navigation'

export default async function ProtectedLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const cookieStore = await cookies()
  const isGuest = cookieStore.get('classspace_guest')?.value === 'true'

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col md:flex-row text-zinc-900 dark:text-zinc-100">
      {/* Sidebar Navigation */}
      <Navigation />

      {/* Main content area */}
      <main className="flex-1 md:ml-64 flex flex-col min-h-screen overflow-x-hidden">
        {isGuest && (
          <div className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-4 py-2.5 text-xs sm:text-sm font-medium flex items-center justify-between shadow-sm z-40">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 shrink-0 animate-pulse" />
              <span>You are exploring ClassSpace in <strong>Guest Demo Mode</strong>. Feel free to browse around!</span>
            </div>
            <Link
              href="/api/guest?action=exit&redirect=/"
              className="px-3 py-1 bg-white/15 hover:bg-white/25 rounded-lg text-xs font-semibold transition-colors shrink-0"
            >
              Exit Guest Mode
            </Link>
          </div>
        )}
        <div className="p-6 md:p-10 pt-20 md:pt-10 max-w-6xl mx-auto w-full flex-1">
          {children}
        </div>
      </main>
    </div>
  )
}

