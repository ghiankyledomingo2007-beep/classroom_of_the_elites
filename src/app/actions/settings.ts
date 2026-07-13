'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export type SettingsState = {
  success: boolean
  error?: string
  message?: string
}

export async function changePasswordAction(prevState: any, formData: FormData): Promise<SettingsState> {
  const password = formData.get('password') as string
  const confirmPassword = formData.get('confirmPassword') as string

  if (!password || password.length < 8) {
    return { success: false, error: 'Password must be at least 8 characters long.' }
  }

  if (password !== confirmPassword) {
    return { success: false, error: 'Passwords do not match.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.updateUser({
    password: password
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: 'Password updated successfully!' }
}

export async function deactivateAccountAction(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // 2. Set profile status to deactivated
  const { error } = await supabase
    .from('profiles')
    .update({ status: 'deactivated' })
    .eq('id', user.id)

  if (error) {
    console.error('Account deactivation error:', error)
    return { success: false, error: error.message }
  }

  // 3. Sign out the user
  await supabase.auth.signOut()

  return { success: true }
}

export async function deleteAccountAction(): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // 2. Delete profile row (Cascade deletes projects, announcements, and reports)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .delete()
    .eq('id', user.id)

  if (profileError) {
    console.error('Profile deletion error:', profileError)
    return { success: false, error: profileError.message }
  }

  // 3. Delete auth user (using admin client to delete the actual credential)
  const { error: authError } = await supabaseAdmin.auth.admin.deleteUser(user.id)
  if (authError) {
    console.error('Auth deletion error:', authError)
    return { success: false, error: authError.message }
  }

  // 4. Sign out the session
  await supabase.auth.signOut()

  return { success: true }
}
