'use client'

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import {
  LayoutDashboard,
  Users,
  Megaphone,
  FolderGit2,
  Settings,
  Shield,
  LogOut,
  Menu,
  X,
  User,
  GraduationCap,
  Trophy
} from 'lucide-react'
import { createClient } from '@/lib/supabase/client'

export interface NavigationProps {
  userRole?: string
  userFullName?: string
  userAvatarUrl?: string | null
}

export function Navigation({
  userRole: initialRole,
  userFullName: initialName,
  userAvatarUrl: initialAvatar
}: NavigationProps) {
  const pathname = usePathname()
  const router = useRouter()
  const supabase = createClient()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  
  const [profile, setProfile] = useState<{
    role: string
    full_name: string
    avatar_url: string | null
  } | null>(null)

  useEffect(() => {
    // If props are passed, use them, otherwise fetch them dynamically
    if (initialRole && initialName) {
      setProfile({
        role: initialRole,
        full_name: initialName,
        avatar_url: initialAvatar || null,
      })
      return
    }

    async function loadProfile() {
      const { data: { user } } = await supabase.auth.getUser()
      if (!user) {
        setProfile({
          role: 'admin',
          full_name: 'Alex Rivera (Guest)',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        })
        return
      }
      
      const { data } = await supabase
        .from('profiles')
        .select('role, full_name, avatar_url')
        .eq('id', user.id)
        .single()
      
      if (data) {
        setProfile(data)
      } else {
        setProfile({
          role: 'admin',
          full_name: 'Alex Rivera (Guest)',
          avatar_url: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80',
        })
      }
    }
    loadProfile()
  }, [initialRole, initialName, initialAvatar])

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/api/guest?action=exit&redirect=/')
    router.refresh()
  }

  const links = [
    { href: '/dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { href: '/directory', label: 'Class Directory', icon: Users },
    { href: '/leaderboard', label: 'Merit Leaderboard', icon: Trophy },
    { href: '/announcements', label: 'Announcements', icon: Megaphone },
    { href: '/projects', label: 'My Projects', icon: FolderGit2 },
    { href: '/settings', label: 'Settings', icon: Settings },
  ]

  // Add admin link if user is admin
  if (profile?.role === 'admin') {
    links.push({ href: '/admin', label: 'Admin Control', icon: Shield })
  }

  const isActive = (href: string) => pathname === href

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className="hidden md:flex flex-col w-64 bg-zinc-900 text-zinc-300 h-screen fixed left-0 top-0 border-r border-zinc-800">
        {/* Logo / Header */}
        <div className="p-6 border-b border-zinc-800/80 flex items-center">
          <Link href="/dashboard" className="flex items-center">
            <img
              src="/cote-logo.svg"
              alt="Classroom of the Elite"
              className="h-8 w-auto object-contain drop-shadow-[0_4px_12px_rgba(200,16,46,0.35)]"
            />
          </Link>
        </div>

        {/* Navigation Links */}
        <nav className="flex-1 px-4 py-6 space-y-1.5">
          {links.map((link) => {
            const Icon = link.icon
            const active = isActive(link.href)
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3.5 px-4 py-3.5 rounded-xl text-sm font-semibold transition-all ${
                  active
                    ? 'bg-[#c8102e] text-white shadow-lg shadow-[#c8102e]/25 border border-rose-500/30'
                    : 'text-zinc-400 hover:bg-zinc-800/50 hover:text-zinc-100'
                }`}
              >
                <Icon className="w-5 h-5 shrink-0" />
                {link.label}
              </Link>
            )
          })}
        </nav>

        {/* User profile / Logout */}
        <div className="p-4 border-t border-zinc-800 space-y-3">
          {profile && (
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-zinc-800/40 border border-zinc-800/50">
              {profile.avatar_url ? (
                <img
                  src={profile.avatar_url}
                  alt={profile.full_name}
                  className="w-9 h-9 rounded-full object-cover border border-zinc-700"
                />
              ) : (
                <div className="w-9 h-9 rounded-full bg-zinc-800 flex items-center justify-center border border-zinc-700">
                  <User className="w-4 h-4 text-zinc-400" />
                </div>
              )}
              <div className="flex-1 min-w-0">
                <span className="block text-sm font-semibold text-white truncate leading-tight">
                  {profile.full_name}
                </span>
                <span className="block text-[10px] text-zinc-500 font-medium uppercase tracking-wider">
                  {profile.role}
                </span>
              </div>
            </div>
          )}

          <button
            onClick={handleSignOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-sm font-semibold text-zinc-400 hover:bg-rose-950/20 hover:text-rose-400 transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Mobile Header */}
      <header className="md:hidden flex items-center justify-between px-6 py-4 bg-zinc-900 border-b border-zinc-800 text-white fixed top-0 left-0 right-0 z-40">
        <Link href="/dashboard" className="flex items-center">
          <img
            src="/cote-logo.svg"
            alt="Classroom of the Elite"
            className="h-7 w-auto object-contain"
          />
        </Link>
        <button
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="p-1.5 rounded-lg bg-zinc-800 border border-zinc-700"
        >
          {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </header>

      {/* Mobile Navigation Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden fixed inset-0 z-30 pt-16 bg-zinc-950/95 backdrop-blur-md animate-in fade-in duration-200">
          <nav className="px-6 py-8 space-y-2">
            {links.map((link) => {
              const Icon = link.icon
              const active = isActive(link.href)
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={`flex items-center gap-4 px-4 py-4 rounded-xl text-base font-bold transition-all ${
                    active
                      ? 'bg-[#c8102e] text-white shadow-lg shadow-[#c8102e]/20'
                      : 'text-zinc-400 hover:bg-zinc-900 hover:text-zinc-200'
                  }`}
                >
                  <Icon className="w-6 h-6" />
                  {link.label}
                </Link>
              )
            })}
            <button
              onClick={() => {
                setMobileMenuOpen(false)
                handleSignOut()
              }}
              className="w-full flex items-center gap-4 px-4 py-4 rounded-xl text-base font-bold text-zinc-400 hover:bg-rose-950/30 hover:text-rose-400 transition-colors mt-8"
            >
              <LogOut className="w-6 h-6" />
              Sign Out
            </button>
          </nav>
        </div>
      )}
    </>
  )
}
export default Navigation
