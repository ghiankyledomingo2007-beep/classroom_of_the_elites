'use client'

import React, { useState, useActionState, useEffect } from 'react'
import { Flag, X, Loader2, AlertTriangle, CheckCircle } from 'lucide-react'
import { submitReportAction } from '@/app/actions/reports'
import { Input, Textarea } from '@/components/ui/input'

export function ReportButton({ reportedProfileId, reportedName }: { reportedProfileId: string, reportedName: string }) {
  const [isOpen, setIsOpen] = useState(false)
  const [state, formAction, isPending] = useActionState(submitReportAction, { success: false })

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        setIsOpen(false)
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [state.success])

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="inline-flex items-center gap-2 px-3.5 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:text-rose-600 dark:hover:text-rose-400 hover:border-rose-200 dark:hover:border-rose-950 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 transition-all"
      >
        <Flag className="w-3.5 h-3.5" />
        Report Profile
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Overlay */}
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => !isPending && setIsOpen(false)}
          />

          {/* Modal box */}
          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-md w-full p-6 shadow-xl relative z-10 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start mb-4">
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-455">
                <AlertTriangle className="w-5 h-5" />
                <h3 className="text-lg font-bold text-zinc-900 dark:text-white">Report Inappropriate Content</h3>
              </div>
              <button 
                onClick={() => !isPending && setIsOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                disabled={isPending}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed mb-4">
              You are flagging the profile of <strong>{reportedName}</strong>. Reports are sent directly to the classroom administrator for review.
            </p>

            {state.error && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200/50 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>{state.error}</span>
              </div>
            )}

            {state.success && (
              <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200/50 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs flex gap-2">
                <CheckCircle className="w-4 h-4 shrink-0" />
                <span>{state.message}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <input type="hidden" name="reportedProfileId" value={reportedProfileId} />

              <Input
                label="Reason for report"
                id="reason"
                name="reason"
                placeholder="e.g. Inappropriate biography text"
                required
                disabled={isPending || state.success}
              />

              <Textarea
                label="Additional details"
                id="details"
                name="details"
                placeholder="Please describe exactly what is inappropriate or violating community rules..."
                rows={4}
                required
                disabled={isPending || state.success}
              />

              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || state.success}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    'Submit Report'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
