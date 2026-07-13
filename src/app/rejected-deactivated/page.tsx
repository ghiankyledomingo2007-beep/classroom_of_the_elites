'use client'

import React from 'react'
import { useRouter } from 'next/navigation'
import { GraduationCap, ShieldAlert, LogOut } from 'lucide-react'
import { createClient } from '@/lib/supabase/client'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'

export default function RejectedDeactivatedPage() {
  const router = useRouter()
  const supabase = createClient()

  const handleSignOut = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

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
          <CardHeader className="text-center">
            <div className="mx-auto w-12 h-12 rounded-full bg-rose-50 dark:bg-rose-950/30 flex items-center justify-center text-rose-600 dark:text-rose-450 mb-4">
              <ShieldAlert className="w-6 h-6" />
            </div>
            <CardTitle>Access Restricted</CardTitle>
            <CardDescription>
              Your account has been rejected or deactivated by a classroom administrator.
            </CardDescription>
          </CardHeader>
          
          <CardContent className="space-y-4">
            <p className="text-sm text-zinc-500 dark:text-zinc-400 text-center leading-relaxed">
              If you believe this is a mistake, or if you need to reactivate your access, please contact your classroom teacher or administrator directly.
            </p>

            <div className="pt-4">
              <button
                type="button"
                onClick={handleSignOut}
                className="w-full py-2.5 px-4 font-semibold text-zinc-700 dark:text-zinc-300 border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 rounded-xl transition-all flex items-center justify-center gap-2"
              >
                <LogOut className="w-4 h-4" />
                Sign Out
              </button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
