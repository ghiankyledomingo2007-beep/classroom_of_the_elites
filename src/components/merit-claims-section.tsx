'use client'

import React, { useState, useTransition } from 'react'
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from '@/components/ui/card'
import { submitMeritClaim } from '@/app/actions/merit'
import { Sparkles, Loader2, CheckCircle2, XCircle, AlertCircle, Plus, Send } from 'lucide-react'

interface MeritClaim {
  id: string
  title: string
  description: string | null
  points_requested: number
  status: string
  created_at: string
}

export function MeritClaimsSection({ initialClaims }: { initialClaims: MeritClaim[] }) {
  const [claims, setClaims] = useState<MeritClaim[]>(initialClaims)
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [pointsRequested, setPointsRequested] = useState(100)
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setSuccess(false)

    if (!title.trim()) {
      setError('Please provide a title for your claim.')
      return
    }

    startTransition(async () => {
      const res = await submitMeritClaim({
        title,
        description,
        pointsRequested,
      })

      if (res.success) {
        setSuccess(true)
        setTitle('')
        setDescription('')
        setPointsRequested(100)
        setIsFormOpen(false)
        
        // Add locally to list
        const newClaim: MeritClaim = {
          id: Math.random().toString(),
          title,
          description: description || null,
          points_requested: pointsRequested,
          status: 'pending',
          created_at: new Date().toISOString()
        }
        setClaims(prev => [newClaim, ...prev])
      } else {
        setError(res.error || 'Failed to submit merit claim.')
      }
    })
  }

  return (
    <div className="space-y-6">
      <Card className="border-rose-500/20 dark:border-rose-500/30 bg-gradient-to-b from-rose-50/50 to-white dark:from-zinc-900 dark:to-zinc-950">
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-rose-700 dark:text-rose-400 font-mono">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>Merit Claim Ledger</span>
              </CardTitle>
              <CardDescription className="text-xs">
                Request points for classroom contributions
              </CardDescription>
            </div>
            {!isFormOpen && (
              <button
                onClick={() => setIsFormOpen(true)}
                className="inline-flex items-center gap-1 px-3 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg transition-all"
              >
                <Plus className="w-3.5 h-3.5" />
                Claim Merit
              </button>
            )}
          </div>
        </CardHeader>
        <CardContent className="pt-0 space-y-4">
          {isFormOpen && (
            <form onSubmit={handleSubmit} className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-900 space-y-4 animate-in slide-in-from-top-4 duration-200">
              <h3 className="text-xs font-bold font-mono text-zinc-400 uppercase tracking-wider">
                New Merit Point Request
              </h3>
              
              {error && (
                <div className="p-3 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400">Contribution Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="e.g., Aligned dashboard UI styling"
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400">Description (Context)</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Provide additional details or link to project..."
                  rows={2}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500 resize-none"
                />
              </div>

              <div className="space-y-1">
                <label className="block text-xs font-semibold text-zinc-650 dark:text-zinc-400">Points Requested</label>
                <select
                  value={pointsRequested}
                  onChange={(e) => setPointsRequested(Number(e.target.value))}
                  className="w-full px-3 py-2 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-50 text-sm focus:outline-none focus:ring-1 focus:ring-rose-500"
                >
                  <option value={50}>50 CP (Minor contribution)</option>
                  <option value={100}>100 CP (Standard showcase/project)</option>
                  <option value={200}>200 CP (Major classroom utility)</option>
                  <option value={500}>500 CP (Exceptional classroom achievement)</option>
                </select>
              </div>

              <div className="flex gap-2 justify-end pt-1">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-3 py-1.5 text-xs font-semibold text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-white bg-rose-600 hover:bg-rose-700 rounded-lg disabled:opacity-50"
                >
                  {isPending ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                  Submit Claim
                </button>
              </div>
            </form>
          )}

          {claims.length > 0 ? (
            <div className="space-y-2.5 max-h-60 overflow-y-auto pr-1">
              {claims.map((claim) => (
                <div key={claim.id} className="p-3 rounded-xl bg-white dark:bg-zinc-900 border border-zinc-200/60 dark:border-zinc-800/80 flex items-center justify-between gap-3">
                  <div className="min-w-0">
                    <span className="block font-semibold text-xs text-zinc-900 dark:text-white truncate">
                      {claim.title}
                    </span>
                    <span className="block text-[10px] text-zinc-400 font-medium mt-0.5">
                      {new Date(claim.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} &bull; Requested {claim.points_requested} CP
                    </span>
                  </div>
                  <div>
                    {claim.status === 'pending' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-amber-500/10 border border-amber-500/20 text-amber-500 uppercase tracking-wider">
                        Pending
                      </span>
                    )}
                    {claim.status === 'approved' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-emerald-500/10 border border-emerald-500/20 text-emerald-500 uppercase tracking-wider inline-flex items-center gap-0.5">
                        <CheckCircle2 className="w-2.5 h-2.5" /> Approved
                      </span>
                    )}
                    {claim.status === 'rejected' && (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-rose-500/10 border border-rose-500/20 text-rose-500 uppercase tracking-wider inline-flex items-center gap-0.5">
                        <XCircle className="w-2.5 h-2.5" /> Rejected
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6 text-xs text-zinc-400 dark:text-zinc-500">
              No merit requests submitted yet.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
