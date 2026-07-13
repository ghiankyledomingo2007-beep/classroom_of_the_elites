'use server'

import { createClient } from '@/lib/supabase/server'
import { reportSchema } from '@/lib/validation/schemas'
import { revalidatePath } from 'next/cache'

export type ReportState = {
  success: boolean
  error?: string
  message?: string
}

export async function submitReportAction(prevState: any, formData: FormData): Promise<ReportState> {
  const rawFields = {
    reportedProfileId: formData.get('reportedProfileId') as string,
    reason: formData.get('reason') as string,
    details: formData.get('details') as string
  }

  // 1. Validate inputs
  const result = reportSchema.safeParse(rawFields)
  if (!result.success) {
    const errorMsg = result.error.issues.map((e) => e.message).join(', ')
    return { success: false, error: errorMsg }
  }

  const { reportedProfileId, reason, details } = result.data

  const supabase = await createClient()

  // 2. Get current reporter details
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    return { success: false, error: 'Unauthorized. Please sign in.' }
  }

  // Fetch reporter profile to get classroom_id
  const { data: reporterProfile } = await supabase
    .from('profiles')
    .select('classroom_id, status')
    .eq('id', user.id)
    .single()

  if (!reporterProfile || reporterProfile.status !== 'approved') {
    return { success: false, error: 'Only approved students can submit reports.' }
  }

  // 3. Create Report Entry
  const { error } = await supabase
    .from('reports')
    .insert({
      classroom_id: reporterProfile.classroom_id,
      reporter_id: user.id,
      reported_profile_id: reportedProfileId,
      reason,
      details,
      status: 'open'
    })

  if (error) {
    console.error('Failed to create report:', error)
    return { success: false, error: error.message || 'Failed to submit report. Please try again.' }
  }

  return { success: true, message: 'Report submitted successfully. Administrators will review it shortly.' }
}
