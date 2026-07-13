'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { registerSchema, loginSchema } from '@/lib/validation/schemas'
import { hashInvitationCode } from '@/lib/invitation'
import { redirect } from 'next/navigation'

export type AuthState = {
  success: boolean
  error?: string
  message?: string
}

export async function signUpAction(prevState: any, formData: FormData): Promise<AuthState> {
  const rawFields = {
    fullName: formData.get('fullName') as string,
    email: formData.get('email') as string,
    password: formData.get('password') as string,
    confirmPassword: formData.get('confirmPassword') as string,
    invitationCode: formData.get('invitationCode') as string,
    rulesAgreement: formData.get('rulesAgreement') === 'on'
  }

  // 1. Validate Form Input
  const result = registerSchema.safeParse(rawFields)
  if (!result.success) {
    const errorMsg = result.error.issues.map((e) => e.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const { fullName, email, password, invitationCode } = result.data

  // 2. Instantiate clients
  const supabase = await createClient()
  const supabaseAdmin = createAdminClient()

  // 3. Verify Invitation Code
  const hashedCode = hashInvitationCode(invitationCode)
  const { data: classroom, error: classroomError } = await supabaseAdmin
    .from('classrooms')
    .select('id')
    .eq('invitation_code_hash', hashedCode)
    .single()

  if (classroomError || !classroom) {
    return { success: false, error: 'Invalid classroom invitation code.' }
  }

  // 4. Sign Up the User via Supabase Auth
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: {
        full_name: fullName
      }
    }
  })

  if (authError) {
    return { success: false, error: authError.message }
  }

  if (!authData.user) {
    return { success: false, error: 'Registration failed. Please try again.' }
  }

  // 5. Generate a unique username
  const emailPrefix = email.split('@')[0].replace(/[^a-zA-Z0-9_]/g, '')
  const randomSuffix = Math.random().toString(36).substring(2, 6)
  const uniqueUsername = `${emailPrefix}_${randomSuffix}`

  // 6. Create Profile Row (using admin client to write to public.profiles)
  const { error: profileError } = await supabaseAdmin
    .from('profiles')
    .insert({
      id: authData.user.id,
      classroom_id: classroom.id,
      email,
      full_name: fullName,
      username: uniqueUsername,
      role: 'student',
      status: 'pending' // Account status initially pending
    })

  if (profileError) {
    console.error('Profile creation error:', profileError)
    // Clean up created user in auth if profile creation fails
    await supabaseAdmin.auth.admin.deleteUser(authData.user.id)
    return { success: false, error: 'Failed to create student profile. Please try again.' }
  }

  return { 
    success: true, 
    message: 'Registration successful! Your account is pending administrator approval.' 
  }
}

export async function signInAction(prevState: any, formData: FormData): Promise<AuthState> {
  const rawFields = {
    email: formData.get('email') as string,
    password: formData.get('password') as string
  }

  const result = loginSchema.safeParse(rawFields)
  if (!result.success) {
    const errorMsg = result.error.issues.map((e) => e.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const { email, password } = result.data
  const supabase = await createClient()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true }
}

export async function signOutAction(): Promise<void> {
  const supabase = await createClient()
  await supabase.auth.signOut()
  redirect('/login')
}

export async function forgotPasswordAction(prevState: any, formData: FormData): Promise<AuthState> {
  const email = formData.get('email') as string
  if (!email || !email.includes('@')) {
    return { success: false, error: 'Please enter a valid email address.' }
  }

  const supabase = await createClient()
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${process.env.NEXT_PUBLIC_APP_URL}/reset-password`
  })

  if (error) {
    return { success: false, error: error.message }
  }

  return { success: true, message: 'Password reset link sent to your email.' }
}

export async function resetPasswordAction(prevState: any, formData: FormData): Promise<AuthState> {
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

  return { success: true, message: 'Your password has been successfully reset.' }
}
