'use client'

import React, { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Loader2, AlertCircle } from 'lucide-react'
import { signInAction } from '@/app/actions/auth'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

export default function LoginPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(signInAction, { success: false })

  useEffect(() => {
    if (state.success) {
      router.push('/dashboard')
      router.refresh()
    }
  }, [state.success, router])

  return (
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 flex flex-col justify-center py-12 px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md flex flex-col items-center">
        <Link href="/" className="flex items-center justify-center mb-8">
          <img
            src="/cote-logo.svg"
            alt="Classroom of the Elite"
            className="h-12 w-auto object-contain drop-shadow-[0_4px_16px_rgba(200,16,46,0.4)]"
          />
        </Link>
      </div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md">
        <Card>
          <CardHeader className="text-center">
            <CardTitle>Welcome Back</CardTitle>
            <CardDescription>Sign in to access your classroom directory</CardDescription>
          </CardHeader>
          
          <CardContent>
            {state.error && (
              <div className="mb-4 p-3.5 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 flex gap-2 text-sm items-start">
                <AlertCircle className="w-5 h-5 shrink-0 mt-0.5" />
                <span>{state.error}</span>
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
                autoComplete="email"
              />

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label htmlFor="password" className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Password
                  </label>
                  <Link
                    href="/forgot-password"
                    className="text-xs font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
                  >
                    Forgot password?
                  </Link>
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                  className="w-full px-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-sm"
                />
              </div>

              <button
                type="submit"
                disabled={isPending}
                className="w-full py-3 px-4 font-semibold text-white bg-[#c8102e] hover:bg-[#a4003e] active:bg-[#880b20] rounded-xl transition-all shadow-md shadow-[#c8102e]/20 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed font-mono"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  'Sign In'
                )}
              </button>
            </form>

            <div className="mt-4 pt-4 border-t border-zinc-200 dark:border-zinc-800">
              <Link
                href="/api/guest?action=enter&redirect=/dashboard"
                className="w-full py-2.5 px-4 font-semibold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/50 rounded-xl transition-all border border-emerald-200 dark:border-emerald-800/60 flex items-center justify-center gap-2 text-sm"
              >
                <span>✨ Explore as Guest (Demo Mode)</span>
              </Link>
            </div>

            <div className="mt-4 text-center text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">New to ClassSpace? </span>
              <Link
                href="/register"
                className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                Join with invite code
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
