'use client'

import React, { useEffect } from 'react'
import { AlertCircle, RotateCcw } from 'lucide-react'

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled app error:', error)
  }, [error])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-6 lg:px-8 animate-in fade-in duration-300">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center text-center">
        <div className="w-16 h-16 bg-rose-50 dark:bg-rose-950/20 rounded-full flex items-center justify-center text-rose-605 dark:text-rose-400 mb-6 border border-rose-100 dark:border-rose-900/50">
          <AlertCircle className="w-8 h-8" />
        </div>

        <h2 className="text-2xl font-extrabold text-zinc-900 dark:text-white tracking-tight leading-tight">
          Something went wrong!
        </h2>
        <p className="mt-4 text-sm text-zinc-500 dark:text-zinc-400 max-w-sm leading-relaxed">
          An unexpected error occurred while loading this page. If this continues, please contact your administrator.
        </p>

        <div className="mt-8">
          <button
            onClick={() => reset()}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-650/15"
          >
            <RotateCcw className="w-4 h-4" />
            Try Again
          </button>
        </div>
      </div>
    </div>
  )
}
