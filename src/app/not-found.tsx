import React from 'react'
import Link from 'next/link'
import { GraduationCap, FileQuestion } from 'lucide-react'

export default function NotFound() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center text-center">
        <Link href="/" className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
            <GraduationCap className="w-8 h-8" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-zinc-900 dark:text-white">ClassSpace</span>
        </Link>

        <div className="w-16 h-16 bg-zinc-100 dark:bg-zinc-900 rounded-full flex items-center justify-center text-zinc-450 dark:text-zinc-400 mb-6 border border-zinc-200 dark:border-zinc-800">
          <FileQuestion className="w-8 h-8" />
        </div>

        <h2 className="text-3xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
          Page Not Found
        </h2>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
          Sorry, we couldn't find the page you are looking for. It might have been deleted, renamed, or is restricted.
        </p>

        <div className="mt-8 flex gap-3">
          <Link
            href="/dashboard"
            className="px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-755 rounded-xl transition-all shadow-sm shadow-indigo-650/15"
          >
            Go to Dashboard
          </Link>
          <Link
            href="/"
            className="px-5 py-2.5 text-sm font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-all"
          >
            Go to Home
          </Link>
        </div>
      </div>
    </div>
  )
}
