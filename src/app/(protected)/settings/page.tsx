'use client'

import React, { useActionState, useState, useEffect, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { 
  KeyRound, 
  Trash2, 
  UserX, 
  Moon, 
  Sun, 
  Settings, 
  Loader2, 
  AlertCircle, 
  CheckCircle,
  ShieldCheck,
  UserCheck
} from 'lucide-react'
import { changePasswordAction, deactivateAccountAction, deleteAccountAction } from '@/app/actions/settings'
import { Input } from '@/components/ui/input'
import { Card, CardHeader, CardTitle, CardContent, CardDescription } from '@/components/ui/card'
import { ConfirmationDialog } from '@/components/ui/dialog'

export default function SettingsPage() {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [state, formAction, isPasswordPending] = useActionState(changePasswordAction, { success: false })
  
  // Dialog states
  const [deactivateConfirmOpen, setDeactivateConfirmOpen] = useState(false)
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false)
  
  // Theme state
  const [theme, setTheme] = useState<'light' | 'dark'>('light')

  useEffect(() => {
    // Detect system theme or existing class
    const isDark = document.documentElement.classList.contains('dark')
    setTheme(isDark ? 'dark' : 'light')
  }, [])

  const toggleTheme = () => {
    const nextTheme = theme === 'light' ? 'dark' : 'light'
    setTheme(nextTheme)
    
    if (nextTheme === 'dark') {
      document.documentElement.classList.add('dark')
      localStorage.setItem('theme', 'dark')
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.setItem('theme', 'light')
    }
  }

  const handleDeactivate = () => {
    startTransition(async () => {
      const res = await deactivateAccountAction()
      if (res.success) {
        setDeactivateConfirmOpen(false)
        router.push('/login')
        router.refresh()
      } else {
        alert(res.error || 'Failed to deactivate account.')
      }
    })
  }

  const handleDelete = () => {
    startTransition(async () => {
      const res = await deleteAccountAction()
      if (res.success) {
        setDeleteConfirmOpen(false)
        router.push('/login')
        router.refresh()
      } else {
        alert(res.error || 'Failed to delete account.')
      }
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      <div>
        <h1 className="text-3xl font-extrabold tracking-tight text-zinc-950 dark:text-zinc-50">Settings</h1>
        <p className="text-zinc-500 dark:text-zinc-400 mt-1 text-sm">
          Manage your account security, appearance, and privacy guidelines
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        
        {/* Left Side: Navigation Links & Theme Toggler */}
        <div className="md:col-span-1 space-y-6">
          <Card>
            <CardContent className="p-6 space-y-6">
              
              {/* Profile Shortcut */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-450">Profile Settings</h4>
                <Link
                  href="/profile/edit"
                  className="flex items-center justify-between p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors text-sm font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <UserCheck className="w-4 h-4 text-indigo-500" />
                    Configure Visibility & Card
                  </span>
                </Link>
              </div>

              {/* Theme Settings */}
              <div className="space-y-3 pt-6 border-t border-zinc-100 dark:border-zinc-850">
                <h4 className="text-xs font-bold uppercase tracking-wider text-zinc-450">Appearance</h4>
                <button
                  onClick={toggleTheme}
                  className="w-full flex items-center justify-between p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-850 bg-white dark:bg-zinc-900 hover:bg-zinc-50 dark:hover:bg-zinc-800/40 transition-colors text-sm font-semibold"
                >
                  <span className="flex items-center gap-2">
                    {theme === 'light' ? (
                      <>
                        <Sun className="w-4 h-4 text-amber-500" />
                        Light Mode Active
                      </>
                    ) : (
                      <>
                        <Moon className="w-4 h-4 text-indigo-400" />
                        Dark Mode Active
                      </>
                    )}
                  </span>
                  <span className="text-xs font-bold text-indigo-600 dark:text-indigo-400">Toggle</span>
                </button>
              </div>

            </CardContent>
          </Card>

          {/* Privacy & Rules agreement reference */}
          <Card>
            <CardContent className="p-6 space-y-4">
              <h3 className="font-bold text-xs uppercase tracking-wider text-zinc-400">Community Rules</h3>
              <div className="space-y-3 text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                <p>
                  ClassSpace is a respectful student showcase environment. By continuing to use the platform, you agree to:
                </p>
                <ul className="list-disc pl-4 space-y-1">
                  <li>Not post offensive biographies or about text.</li>
                  <li>Upload only school-appropriate project screenshots.</li>
                  <li>Respect classmate visibility settings and boundaries.</li>
                  <li>Not attempt role escalation or access other classrooms.</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Side: Password Reset & Account Deletion */}
        <div className="md:col-span-2 space-y-8">
          
          {/* Change Password Card */}
          <Card>
            <CardHeader>
              <div className="flex items-center gap-2 text-zinc-900 dark:text-white">
                <KeyRound className="w-5 h-5 text-indigo-500" />
                <CardTitle>Change Password</CardTitle>
              </div>
              <CardDescription>Keep your account secure with a strong password</CardDescription>
            </CardHeader>
            <CardContent>
              {state.error && (
                <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/50 text-rose-600 dark:text-rose-400 text-xs flex gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0" />
                  <span>{state.error}</span>
                </div>
              )}

              {state.success && (
                <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs flex gap-2">
                  <CheckCircle className="w-4 h-4 shrink-0" />
                  <span>{state.message}</span>
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

                <div className="flex justify-end pt-2">
                  <button
                    type="submit"
                    disabled={isPasswordPending}
                    className="py-2 px-4 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-750 rounded-xl transition-all shadow-md shadow-indigo-650/10 flex items-center gap-1.5 disabled:opacity-50"
                  >
                    {isPasswordPending ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        Updating...
                      </>
                    ) : (
                      'Update Password'
                    )}
                  </button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* Destructive Actions Card */}
          <Card className="border-rose-100 dark:border-rose-950/30">
            <CardHeader>
              <div className="flex items-center gap-2 text-rose-600 dark:text-rose-455">
                <Trash2 className="w-5 h-5" />
                <CardTitle>Danger Zone</CardTitle>
              </div>
              <CardDescription>Deactivate or permanently remove your student account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6 pt-2">
              
              {/* Deactivate account */}
              <div className="flex items-center justify-between gap-4 flex-wrap pb-6 border-b border-zinc-100 dark:border-zinc-850">
                <div className="space-y-0.5">
                  <span className="block font-semibold text-sm text-zinc-900 dark:text-white">Deactivate Account</span>
                  <span className="block text-xs text-zinc-400">Temp lock your access and hide your card in directory. Admins can restore you.</span>
                </div>
                <button
                  onClick={() => setDeactivateConfirmOpen(true)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-650 dark:text-zinc-350 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:text-zinc-800 transition-colors"
                >
                  <UserX className="w-4 h-4 text-zinc-550" />
                  Deactivate Account
                </button>
              </div>

              {/* Delete account */}
              <div className="flex items-center justify-between gap-4 flex-wrap pt-2">
                <div className="space-y-0.5">
                  <span className="block font-semibold text-sm text-rose-600 dark:text-rose-450">Delete Account Permanently</span>
                  <span className="block text-xs text-zinc-400">Permanently delete your profile details, links, and all showcase projects. This is irreversible.</span>
                </div>
                <button
                  onClick={() => setDeleteConfirmOpen(true)}
                  disabled={isPending}
                  className="inline-flex items-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl text-white bg-rose-600 hover:bg-rose-700 transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete Account
                </button>
              </div>

            </CardContent>
          </Card>

        </div>

      </div>

      {/* Deactivate Account Confirmation Overlay */}
      <ConfirmationDialog
        isOpen={deactivateConfirmOpen}
        title="Deactivate Account?"
        description="Are you sure you want to deactivate your ClassSpace account? This will hide your card in the student directory, lock your logins, and log you out. A classroom supervisor can reactivate your account later."
        confirmText={isPending ? 'Deactivating...' : 'Deactivate'}
        cancelText="Cancel"
        isDestructive={false}
        onConfirm={handleDeactivate}
        onCancel={() => setDeactivateConfirmOpen(false)}
      />

      {/* Delete Account Confirmation Overlay */}
      <ConfirmationDialog
        isOpen={deleteConfirmOpen}
        title="Permanently Delete Account?"
        description="WARNING: This will permanently delete your login credentials, your profile showcase details, and all your projects. This action is completely irreversible. Are you absolutely sure?"
        confirmText={isPending ? 'Deleting...' : 'Delete Permanently'}
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmOpen(false)}
      />
    </div>
  )
}
