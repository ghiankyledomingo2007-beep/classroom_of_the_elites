'use client'

import React, { useActionState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { GraduationCap, Loader2, AlertCircle, CheckCircle } from 'lucide-react'
import { signUpAction } from '@/app/actions/auth'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

export default function RegisterPage() {
  const router = useRouter()
  const [state, formAction, isPending] = useActionState(signUpAction, { success: false })

  useEffect(() => {
    if (state.success) {
      // Small timeout to allow the user to read the success message
      const timer = setTimeout(() => {
        router.push('/pending')
        router.refresh()
      }, 3000)
      return () => clearTimeout(timer)
    }
  }, [state.success, router])

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
          <CardHeader className="text-center">
            <CardTitle>Join Classroom</CardTitle>
            <CardDescription>Enter details and your invitation code to get started</CardDescription>
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
                  <p className="font-semibold">Account Registered!</p>
                  <p className="text-xs text-emerald-650 dark:text-emerald-400 mt-0.5">{state.message}</p>
                </div>
              </div>
            )}

            <form action={formAction} className="space-y-4">
              <Input
                label="Full Name"
                id="fullName"
                name="fullName"
                placeholder="Jane Doe"
                required
                autoComplete="name"
              />

              <Input
                label="Email address"
                id="email"
                name="email"
                type="email"
                placeholder="jane@school.edu"
                required
                autoComplete="email"
              />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Password"
                  id="password"
                  name="password"
                  type="password"
                  placeholder="Min. 8 characters"
                  required
                  autoComplete="new-password"
                />

                <Input
                  label="Confirm Password"
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  placeholder="Repeat password"
                  required
                  autoComplete="new-password"
                />
              </div>

              <Input
                label="Classroom Invitation Code"
                id="invitationCode"
                name="invitationCode"
                placeholder="Provided by your teacher"
                required
              />

              <div className="flex items-start mt-2">
                <div className="flex items-center h-5">
                  <input
                    id="rulesAgreement"
                    name="rulesAgreement"
                    type="checkbox"
                    required
                    className="h-4.5 w-4.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                  />
                </div>
                <div className="ml-3 text-xs">
                  <label htmlFor="rulesAgreement" className="font-medium text-zinc-650 dark:text-zinc-400">
                    I agree to the classroom community guidelines and privacy rules.
                  </label>
                </div>
              </div>

              <button
                type="submit"
                disabled={isPending || state.success}
                className="w-full py-3 px-4 mt-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 active:bg-indigo-800 rounded-xl transition-all shadow-md shadow-indigo-600/10 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isPending ? (
                  <>
                    <Loader2 className="w-5 h-5 animate-spin" />
                    Creating account...
                  </>
                ) : (
                  'Register & Join'
                )}
              </button>
            </form>

            <div className="mt-6 text-center text-sm">
              <span className="text-zinc-500 dark:text-zinc-400">Already registered? </span>
              <Link
                href="/login"
                className="font-semibold text-indigo-600 hover:text-indigo-500 dark:text-indigo-400 dark:hover:text-indigo-300 transition-colors"
              >
                Sign In
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
