'use server'

import { createClient } from '@/lib/supabase/server'
import { projectSchema } from '@/lib/validation/schemas'
import { revalidatePath } from 'next/cache'

export type ProjectState = {
  success: boolean
  error?: string
  message?: string
}

export async function createProjectAction(prevState: any, data: any): Promise<ProjectState> {
  const supabase = await createClient()

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized. Please sign in.' }
  }

  // Fetch user profile status
  const { data: profile } = await supabase
    .from('profiles')
    .select('status, username')
    .eq('id', user.id)
    .single()

  if (!profile || profile.status !== 'approved') {
    return { success: false, error: 'Only approved students can manage projects.' }
  }

  // 2. Validate input schema
  const result = projectSchema.safeParse(data)
  if (!result.success) {
    const errorMsg = result.error.issues.map((e) => e.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const fields = result.data

  // 3. Create Project
  const { error } = await supabase
    .from('projects')
    .insert({
      profile_id: user.id,
      title: fields.title,
      description: fields.description,
      technologies: fields.technologies,
      github_url: fields.githubUrl || null,
      live_url: fields.liveUrl || null,
      project_date: fields.projectDate || null,
      is_visible: fields.isVisible
    })

  if (error) {
    console.error('Project creation error:', error)
    return { success: false, error: error.message || 'Failed to create project.' }
  }

  // 3b. Automatically file a pending merit claim for sharing a project!
  try {
    await supabase
      .from('merit_claims')
      .insert({
        profile_id: user.id,
        title: `Shared Project: ${fields.title}`,
        description: `Automatically filed claim for publishing a new project. technologies: ${fields.technologies.join(', ')}`,
        points_requested: 100,
        link_url: fields.liveUrl || fields.githubUrl || null,
        status: 'pending'
      })
  } catch (meritErr) {
    console.error('Auto merit claim generation failed:', meritErr)
  }

  // 4. Revalidate cache
  revalidatePath('/projects')
  revalidatePath(`/profile/${profile.username}`)

  return { success: true, message: 'Project created successfully!' }
}

export async function updateProjectAction(
  prevState: any,
  payload: { projectId: string; data: any }
): Promise<ProjectState> {
  const { projectId, data } = payload
  const supabase = await createClient()

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized. Please sign in.' }
  }

  // Fetch viewer role & username
  const { data: profile } = await supabase
    .from('profiles')
    .select('role, username')
    .eq('id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Student profile not found.' }

  // 2. Validate input schema
  const result = projectSchema.safeParse(data)
  if (!result.success) {
    const errorMsg = result.error.issues.map((e) => e.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const fields = result.data

  // 3. Check ownership / permission
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('profile_id')
    .eq('id', projectId)
    .single()

  if (fetchError || !project) {
    return { success: false, error: 'Project not found.' }
  }

  if (project.profile_id !== user.id && profile.role !== 'admin') {
    return { success: false, error: 'You do not have permission to edit this project.' }
  }

  // 4. Perform Update
  const { error } = await supabase
    .from('projects')
    .update({
      title: fields.title,
      description: fields.description,
      technologies: fields.technologies,
      github_url: fields.githubUrl || null,
      live_url: fields.liveUrl || null,
      project_date: fields.projectDate || null,
      is_visible: fields.isVisible
    })
    .eq('id', projectId)

  if (error) {
    console.error('Project update error:', error)
    return { success: false, error: error.message || 'Failed to update project.' }
  }

  // 5. Revalidate cache
  revalidatePath('/projects')
  // Revalidate target profile as well (fetch username of project owner)
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', project.profile_id)
    .single()
  
  if (ownerProfile) {
    revalidatePath(`/profile/${ownerProfile.username}`)
  }

  return { success: true, message: 'Project updated successfully!' }
}

export async function deleteProjectAction(projectId: string): Promise<{ success: boolean; error?: string }> {
  const supabase = await createClient()

  // 1. Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { success: false, error: 'Unauthorized' }

  // Fetch viewer role
  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile) return { success: false, error: 'Profile not found' }

  // 2. Fetch project
  const { data: project, error: fetchError } = await supabase
    .from('projects')
    .select('profile_id')
    .eq('id', projectId)
    .single()

  if (fetchError || !project) return { success: false, error: 'Project not found' }

  // 3. Verify authorization
  if (project.profile_id !== user.id && profile.role !== 'admin') {
    return { success: false, error: 'Unauthorized to delete this project.' }
  }

  // 4. Perform Delete
  const { error } = await supabase
    .from('projects')
    .delete()
    .eq('id', projectId)

  if (error) {
    console.error('Project deletion error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/projects')
  const { data: ownerProfile } = await supabase
    .from('profiles')
    .select('username')
    .eq('id', project.profile_id)
    .single()
  
  if (ownerProfile) {
    revalidatePath(`/profile/${ownerProfile.username}`)
  }

  return { success: true }
}
