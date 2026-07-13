import React from 'react'
import Link from 'next/link'
import { GraduationCap, ShieldCheck, UserCheck, FolderHeart, Sparkles } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 text-zinc-900 dark:text-zinc-100 flex flex-col">
      {/* COTE Header */}
      <header className="border-b border-rose-900/30 bg-[#0a0a0a]/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center">
            <img
              src="/cote-logo.svg"
              alt="Classroom of the Elite"
              className="h-9 w-auto object-contain drop-shadow-[0_4px_16px_rgba(200,16,46,0.4)]"
            />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-sm font-semibold text-zinc-300 hover:text-white transition-colors font-mono"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="px-4 py-2 text-sm font-semibold bg-[#c8102e] hover:bg-[#a4003e] text-white rounded-xl shadow-md shadow-[#c8102e]/25 transition-all font-mono"
            >
              Join Classroom
            </Link>
          </div>
        </div>
      </header>

      {/* COTE Hero Section */}
      <main className="flex-1 bg-[#0a0a0a] relative overflow-hidden">
        {/* Glow background effects matching cote-app */}
        <div className="absolute top-10 left-1/4 w-96 h-96 bg-[#c8102e]/15 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-1/3 right-1/4 w-96 h-96 bg-[#e5007f]/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-10 left-1/3 w-80 h-80 bg-[#c9a94e]/10 rounded-full blur-3xl pointer-events-none" />

        <section className="py-20 md:py-32 px-6 max-w-5xl mx-auto text-center relative z-10">
          <div className="flex justify-center mb-8">
            <img
              src="/cote-logo.svg"
              alt="Classroom of the Elite"
              className="w-80 md:w-96 h-auto object-contain drop-shadow-[0_14px_28px_rgba(200,16,46,0.45)]"
            />
          </div>

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs font-mono font-bold tracking-wider uppercase mb-6">
            <Sparkles className="w-3.5 h-3.5 text-amber-400" />
            ADVANCED NURTURING HIGH SCHOOL • S-SYSTEM SHOWCASE
          </div>
          <h1 className="text-4xl md:text-6xl font-extrabold text-white tracking-tight leading-tight max-w-3xl mx-auto font-mono">
            In this classroom, every point counts.
          </h1>
          <p className="mt-6 text-lg md:text-xl text-zinc-400 max-w-2xl mx-auto leading-relaxed">
            ClassSpace is a secure COTE-inspired student directory, portfolio showcase, and merit point economy where classmates earn Class Points (CP) and compete in rankings.
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/api/guest?action=enter&redirect=/dashboard"
              className="px-6 py-3.5 text-base font-semibold bg-[#c8102e] hover:bg-[#a4003e] text-white rounded-xl shadow-lg shadow-[#c8102e]/30 transition-all hover:-translate-y-0.5 flex items-center gap-2 font-mono"
            >
              <Sparkles className="w-5 h-5 shrink-0 text-amber-300" />
              Explore as Guest (Demo)
            </Link>
            <Link
              href="/register"
              className="px-6 py-3.5 text-base font-semibold bg-zinc-900 border border-rose-500/30 text-zinc-200 rounded-xl hover:bg-zinc-800 transition-all hover:-translate-y-0.5 font-mono"
            >
              Join Classroom
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 text-base font-semibold bg-transparent border border-zinc-700 text-zinc-300 rounded-xl hover:bg-zinc-900 transition-all hover:-translate-y-0.5 font-mono"
            >
              Join Classroom
            </Link>
            <Link
              href="/login"
              className="px-6 py-3.5 text-base font-semibold bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-all hover:-translate-y-0.5"
            >
              Sign In
            </Link>
          </div>
        </section>

        {/* Value Proposition / Features Grid */}
        <section className="bg-white dark:bg-zinc-900/50 border-t border-b border-zinc-200/50 dark:border-zinc-800/50 py-20 px-6">
          <div className="max-w-6xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-extrabold text-zinc-900 dark:text-white text-center tracking-tight mb-12">
              Designed with Privacy and Students in Mind
            </h2>
            <div className="grid md:grid-cols-3 gap-8">
              {/* Feature 1 */}
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-250/30 dark:border-zinc-800/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Strict Classroom Privacy</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Only students with a valid, secure classroom invitation code can register. Student directories and portfolios are invisible to the public.
                </p>
              </div>

              {/* Feature 2 */}
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-250/30 dark:border-zinc-800/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <FolderHeart className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Showcase Projects</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Build custom profile card pages, list favorite subjects, log skills, interests, and share links to personal, school, or team projects.
                </p>
              </div>

              {/* Feature 3 */}
              <div className="p-6 rounded-2xl bg-zinc-50 dark:bg-zinc-900 border border-zinc-250/30 dark:border-zinc-800/80 shadow-sm">
                <div className="w-10 h-10 rounded-xl bg-indigo-50 dark:bg-indigo-950 text-indigo-600 dark:text-indigo-400 flex items-center justify-center mb-4">
                  <UserCheck className="w-6 h-6" />
                </div>
                <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Active Moderation</h3>
                <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed">
                  Classroom administrators manage invitation codes, approve pending students, publish announcements, and review flags/reports.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Privacy Note */}
        <section className="py-20 px-6 text-center max-w-3xl mx-auto">
          <div className="p-8 rounded-2xl bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800">
            <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Safety & Security Compliance</h3>
            <p className="mt-3 text-sm text-zinc-650 dark:text-zinc-400 leading-relaxed">
              We understand the sensitivity of student information. No search engine indexing is allowed, email addresses are protected by default, and students control which optional details are shared with classmates.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-zinc-200 dark:border-zinc-800 py-8 px-6 text-center text-xs text-zinc-500 dark:text-zinc-400">
        <p>&copy; {new Date().getFullYear()} ClassSpace. All rights reserved.</p>
      </footer>
    </div>
  )
}
