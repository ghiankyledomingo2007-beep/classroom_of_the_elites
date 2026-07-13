'use client'

import React, { useActionState } from 'react'
import Link from 'next/link'
import { GraduationCap, Loader2, AlertCircle, CheckCircle, ArrowLeft } from 'lucide-react'
import { forgotPasswordAction } from '@/app/actions/auth'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

export default function ForgotPasswordPage() {
  const [state, formAction, isPending] = useActionState(forgotPasswordAction, { success: false })

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center gap-3 mb-6">
          <div className="p-2.5 rounded-2xl bg-indigo-600 text-white shadow-md shadow-indigo-600/10">
            <GraduationCap className="w-8 h-8" />
          </div>
          <span className="font-extrabold text-2xl tracking-tight text-zinc-900 dark:text-white">ClassSpace</span>
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader>
            <CardTitle>Reset Password</CardTitle>
            <CardDescription>We'll send a password recovery link to your email</CardDescription>
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
                <span>{state.message}</span>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <Input
                label="Email address"
                id="email"
                name="email"
                type="email"
                placeholder="you@school.edu"
                required
              />

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 px-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Sending link...
                  </>
                ) : (
                  'Send Recovery Link'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-450 dark:hover:text-zinc-300 transition-colors"
              >
                <ArrowLeft className="w-4 h-4" />
                Back to Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
