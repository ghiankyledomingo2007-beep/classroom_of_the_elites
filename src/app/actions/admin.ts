'use server'

import { createClient, createAdminClient } from '@/lib/supabase/server'
import { announcementSchema } from '@/lib/validation/schemas'
import { hashInvitationCode } from '@/lib/invitation'
import { revalidatePath } from 'next/cache'

// Helper to verify that the calling user is an admin
async function verifyAdmin() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { isAdmin: false, error: 'Unauthorized. Please log in.' }

  const { data: profile } = await supabase
    .from('profiles')
    .select('role, classroom_id')
    .eq('id', user.id)
    .single()

  if (!profile || profile.role !== 'admin') {
    return { isAdmin: false, error: 'Access denied. Administrator privileges required.' }
  }

  return { isAdmin: true, userId: user.id, classroomId: profile.classroom_id }
}

// 1. Approve or Reject Pending Student
export async function approveStudentAction(
  studentId: string,
  action: 'approve' | 'reject'
): Promise<{ success: boolean; error?: string }> {
  const adminCheck = await verifyAdmin()
  if (!adminCheck.isAdmin) return { success: false, error: adminCheck.error }

  const supabaseAdmin = createAdminClient()
  const nextStatus = action === 'approve' ? 'approved' : 'rejected'

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ status: nextStatus })
    .eq('id', studentId)
    .eq('classroom_id', adminCheck.classroomId)

  if (error) {
    console.error('Approve student error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/directory')
  return { success: true }
}

// 2. Change Student Status
export async function changeStudentStatusAction(
  studentId: string,
  status: 'approved' | 'rejected' | 'deactivated'
): Promise<{ success: boolean; error?: string }> {
  const adminCheck = await verifyAdmin()
  if (!adminCheck.isAdmin) return { success: false, error: adminCheck.error }

  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin
    .from('profiles')
    .update({ status })
    .eq('id', studentId)
    .eq('classroom_id', adminCheck.classroomId)

  if (error) {
    console.error('Change status error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/directory')
  return { success: true }
}

// 3. Moderate Student Profile Content (Clear offensive nickname, bio, about, or avatar)
export async function moderateProfileContentAction(
  studentId: string,
  options: { clearNickname?: boolean; clearBio?: boolean; clearAbout?: boolean; clearAvatar?: boolean }
): Promise<{ success: boolean; error?: string }> {
  const adminCheck = await verifyAdmin()
  if (!adminCheck.isAdmin) return { success: false, error: adminCheck.error }

  const supabaseAdmin = createAdminClient()
  const updates: any = {}

  if (options.clearNickname) updates.nickname = null
  if (options.clearBio) updates.bio = null
  if (options.clearAbout) updates.about = null
  if (options.clearAvatar) updates.avatar_url = null

  const { error } = await supabaseAdmin
    .from('profiles')
    .update(updates)
    .eq('id', studentId)
    .eq('classroom_id', adminCheck.classroomId)

  if (error) {
    console.error('Moderation update error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/directory')
  return { success: true }
}

// 4. Resolve Flagged Report
export async function resolveReportAction(
  reportId: string,
  action: 'resolved' | 'dismissed',
  adminNotes: string
): Promise<{ success: boolean; error?: string }> {
  const adminCheck = await verifyAdmin()
  if (!adminCheck.isAdmin) return { success: false, error: adminCheck.error }

  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin
    .from('reports')
    .update({
      status: action,
      admin_notes: adminNotes,
      resolved_by: adminCheck.userId,
      resolved_at: new Date().toISOString()
    })
    .eq('id', reportId)
    .eq('classroom_id', adminCheck.classroomId)

  if (error) {
    console.error('Resolve report error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}

// 5. Create Announcement
export async function createAnnouncementAction(
  prevState: any,
  data: any
): Promise<{ success: boolean; error?: string; message?: string }> {
  const adminCheck = await verifyAdmin()
  if (!adminCheck.isAdmin) return { success: false, error: adminCheck.error }

  // Validate announcement schema
  const result = announcementSchema.safeParse(data)
  if (!result.success) {
    return { success: false, error: result.error.issues.map((e) => e.message).join(', ') }
  }

  const fields = result.data
  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin
    .from('announcements')
    .insert({
      classroom_id: adminCheck.classroomId,
      author_id: adminCheck.userId,
      title: fields.title,
      content: fields.content,
      is_pinned: fields.isPinned,
      expires_at: fields.expiresAt || null
    })

  if (error) {
    console.error('Create announcement error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/announcements')
  revalidatePath('/dashboard')

  return { success: true, message: 'Announcement published successfully!' }
}

// 6. Delete Announcement
export async function deleteAnnouncementAction(announcementId: string): Promise<{ success: boolean; error?: string }> {
  const adminCheck = await verifyAdmin()
  if (!adminCheck.isAdmin) return { success: false, error: adminCheck.error }

  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin
    .from('announcements')
    .delete()
    .eq('id', announcementId)
    .eq('classroom_id', adminCheck.classroomId)

  if (error) {
    console.error('Delete announcement error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  revalidatePath('/announcements')
  revalidatePath('/dashboard')

  return { success: true }
}

// 7. Update Classroom Settings
export async function updateClassroomSettingsAction(
  prevState: any,
  data: { name: string; schoolName: string; schoolYear: string; sectionName: string }
): Promise<{ success: boolean; error?: string; message?: string }> {
  const adminCheck = await verifyAdmin()
  if (!adminCheck.isAdmin) return { success: false, error: adminCheck.error }

  if (!data.name || !data.schoolName || !data.schoolYear || !data.sectionName) {
    return { success: false, error: 'All classroom settings fields are required.' }
  }

  const supabaseAdmin = createAdminClient()

  const { error } = await supabaseAdmin
    .from('classrooms')
    .update({
      name: data.name,
      school_name: data.schoolName,
      school_year: data.schoolYear,
      section_name: data.sectionName
    })
    .eq('id', adminCheck.classroomId)

  if (error) {
    console.error('Update classroom settings error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true, message: 'Classroom settings updated successfully!' }
}

// 8. Regenerate Invitation Code (Generates a secure random code and hashes it)
export async function regenerateInvitationCodeAction(
  classroomId: string,
  newRawCode: string
): Promise<{ success: boolean; error?: string; hashedCode?: string }> {
  const adminCheck = await verifyAdmin()
  if (!adminCheck.isAdmin) return { success: false, error: adminCheck.error }

  if (classroomId !== adminCheck.classroomId) {
    return { success: false, error: 'Unauthorized classroom modification.' }
  }

  const cleanCode = newRawCode.trim().toLowerCase()
  if (cleanCode.length < 4) {
    return { success: false, error: 'Invitation code must be at least 4 characters long.' }
  }

  const supabaseAdmin = createAdminClient()
  const newHash = hashInvitationCode(cleanCode)

  const { error } = await supabaseAdmin
    .from('classrooms')
    .update({
      invitation_code_hash: newHash
    })
    .eq('id', classroomId)

  if (error) {
    console.error('Regenerate invitation code error:', error)
    return { success: false, error: error.message }
  }

  revalidatePath('/admin')
  return { success: true }
}
