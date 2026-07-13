export interface Profile {
  id: string
  classroom_id: string | null
  role: string // 'student' | 'admin'
  status: string // 'pending' | 'approved' | 'rejected' | 'deactivated'
}

export function isAdmin(profile: Profile | null): boolean {
  return profile?.role === 'admin'
}

export function isApproved(profile: Profile | null): boolean {
  // Admins are implicitly approved to access their classroom resources
  return profile?.status === 'approved' || profile?.role === 'admin'
}

export function canAccessClassroom(userProfile: Profile | null, targetClassroomId: string): boolean {
  if (!userProfile) return false
  if (userProfile.classroom_id !== targetClassroomId) return false
  return userProfile.role === 'admin' || userProfile.status === 'approved'
}

export function canEditProfile(userProfile: Profile | null, targetProfileId: string): boolean {
  if (!userProfile) return false
  if (userProfile.id === targetProfileId) return true
  return userProfile.role === 'admin'
}

export function canManageProject(userProfile: Profile | null, projectOwnerId: string): boolean {
  if (!userProfile) return false
  if (userProfile.id === projectOwnerId) return true
  return userProfile.role === 'admin'
}

export function canManageAnnouncements(userProfile: Profile | null): boolean {
  return userProfile?.role === 'admin'
}

export function canManageReports(userProfile: Profile | null): boolean {
  return userProfile?.role === 'admin'
}
