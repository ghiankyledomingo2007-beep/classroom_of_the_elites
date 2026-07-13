'use server'

import { createClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function submitMeritClaim(formData: {
  title: string
  description: string
  pointsRequested: number
  linkUrl?: string
}) {
  const supabase = await createClient()

  // Get current authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  // Insert claim
  const { error } = await supabase.from('merit_claims').insert({
    profile_id: user.id,
    title: formData.title,
    description: formData.description,
    points_requested: formData.pointsRequested,
    link_url: formData.linkUrl || null,
    status: 'pending'
  })

  if (error) {
    console.error('Failed to submit merit claim:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/leaderboard')
  return { success: true }
}

export async function getStudentMeritClaims() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  const { data, error } = await supabase
    .from('merit_claims')
    .select('*')
    .eq('profile_id', user.id)
    .order('created_at', { ascending: false })

  if (error) {
    console.error('Failed to fetch student merit claims:', error)
    return []
  }

  return data
}

export async function getPendingMeritClaims() {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return []

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') return []

  const { data, error } = await supabase
    .from('merit_claims')
    .select('*, profile:profiles(full_name, avatar_url, nickname)')
    .eq('status', 'pending')
    .order('created_at', { ascending: true })

  if (error) {
    console.error('Failed to fetch pending merit claims:', error)
    return []
  }

  return data
}

export async function resolveMeritClaim(claimId: string, status: 'approved' | 'rejected') {
  const supabase = await createClient()

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Authentication required' }
  }

  // Check if admin
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (profile?.role !== 'admin') {
    return { success: false, error: 'Unauthorized. Admin access required.' }
  }

  const { error } = await supabase
    .from('merit_claims')
    .update({ status })
    .eq('id', claimId)

  if (error) {
    console.error('Failed to resolve merit claim:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath('/leaderboard')
  revalidatePath('/admin')
  return { success: true }
}
