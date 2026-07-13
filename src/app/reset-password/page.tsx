'use client'

import React, { useActionState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { resetPasswordAction } from '@/app/actions/auth'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

export default function ResetPasswordPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(resetPasswordAction, { success: false })

  useEffect(() => {
    if (state.success) {
      const timer = setTimeout(() => {
        router.push('/login')
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [state.success, router])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
            <GraduationCap className="w-8 h-8" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-zinc-900 dark:text-white">ClassSpace</span>
        </div>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Update Password</CardTitle>
            <CardDescription>Enter your new password below</CardDescription>
          </CardHeader>
          
          <CardContent>
            {state.error && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 flex gap-2 text-sm items-start">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{state.error}</span>
              </div>
            )}

            {state.success && (
              <div className="mb-4 p-3.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-450 flex gap-2 text-sm items-start">
                <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <div>
                  <p className="font-semibold">Password Reset Successful!</p>
                  <p className="text-xs text-emerald-650 dark:text-emerald-400 mt-0.5">
                    {state.message} Redirecting to sign in page...
                  </p>
                </div>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <Input
                label="New Password"
                id="password"
                name="password"
                type="password"
                placeholder="Min. 8 characters"
                required
              />

              <Input
                label="Confirm New Password"
                id="confirmPassword"
                name="confirmPassword"
                type="password"
                placeholder="Repeat new password"
                required
              />

              <button
                type="submit"
                disabled={isPending || state.success}
                className="w-full py-3 px-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Resetting password...
                  </>
                ) : (
                  'Reset Password'
                )}
              </button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
