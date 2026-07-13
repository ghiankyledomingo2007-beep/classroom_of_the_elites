import React from 'react'
import { Loader2 } from 'lucide-react'

export default function Loading() {
  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col items-center justify-center p-6">
      <div className="flex flex-col items-center gap-4 text-center">
        <Loader2 className="w-10 h-10 animate-spin text-rose-650 dark:text-rose-400" />
        <div>
          <h3 className="font-bold text-zinc-900 dark:text-white">Loading ClassSpace</h3>
          <p className="text-xs text-zinc-400 mt-1">Retrieving classroom directory details...</p>
        </div>
      </div>
    </div>
  )
}
