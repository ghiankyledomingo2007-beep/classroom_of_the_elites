'use server'

import { createClient } from '@/lib/supabase/server'
import { profileEditSchema } from '@/lib/validation/schemas'
import { revalidatePath } from 'next/cache'

export type ProfileUpdateState = {
  success: boolean
  error?: string
  message?: string
}

export async function updateProfileAction(prevState: any, data: any): Promise<ProfileUpdateState> {
  const supabase = await createClient()

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized. Please sign in.' }
  }

  // 2. Validate input schema
  const result = profileEditSchema.safeParse(data)
  if (!result.success) {
    const errorMsg = result.error.issues.map((e) => e.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const fields = result.data

  // 3. Check username uniqueness
  const { data: existingUser } = await supabase
    .from('profiles')
    .select('id')
    .eq('username', fields.username)
    .neq('id', user.id)
    .maybeSingle()

  if (existingUser) {
    return { success: false, error: 'Username is already taken by another student.' }
  }

  // 4. Perform update (RLS will verify user updates only their own record)
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fields.fullName,
      nickname: fields.nickname || null,
      username: fields.username,
      bio: fields.bio || null,
      about: fields.about || null,
      birthday: fields.birthday || null,
      favorite_subjects: fields.favoriteSubjects,
      interests: fields.interests,
      hobbies: fields.hobbies,
      skills: fields.skills,
      achievements: fields.achievements,
      github_url: fields.githubUrl || null,
      linkedin_url: fields.linkedinUrl || null,
      portfolio_url: fields.portfolioUrl || null,
      website_url: fields.websiteUrl || null,
      profile_accent: fields.profileAccent,
      show_birthday: fields.showBirthday,
      show_external_links: fields.showExternalLinks,
      show_achievements: fields.showAchievements
    })
    .eq('id', user.id)

  if (error) {
    console.error('Profile update error:', error)
    return { success: false, error: error.message || 'Failed to update profile.' }
  }

  // 5. Revalidate Cache
  revalidatePath('/directory')
  revalidatePath(`/profile/${fields.username}`)

  return { success: true, message: 'Profile updated successfully!' }
}

// Separate helper action to update avatar url specifically
export async function updateAvatarAction(avatarUrl: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  const AVATAR_URL_MAX = 500
  if (typeof avatarUrl !== 'string' || avatarUrl.length > AVATAR_URL_MAX) {
    return { success: false, error: 'Invalid avatar URL' }
  }
  try {
    const parsed = new URL(avatarUrl)
    if (parsed.protocol !== 'https:' && parsed.hostname !== 'localhost' && parsed.hostname !== '127.0.0.1') {
      return { success: false, error: 'Avatar URL must use HTTPS' }
    }
  } catch {
    return { success: false, error: 'Invalid avatar URL' }
  }

  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  const { error } = await supabase
    .from('profiles')
    .update({ avatar_url: avatarUrl })
    .eq('id', user.id)

  if (error) {
    console.error('Avatar DB update error:', error)
    return { success: false, error: error.message }
  }

  return { success: true }
}
