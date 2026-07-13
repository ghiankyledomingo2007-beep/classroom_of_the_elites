'use client'

import React, { useState, useTransition, useActionState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  Users, 
  UserCheck, 
  Clock, 
  ShieldAlert, 
  Megaphone, 
  Settings, 
  Check, 
  X, 
  Trash2, 
  Pin,
  RefreshCw, 
  Loader2,
  AlertTriangle,
  UserX,
  MessageSquareOff,
  Sparkles
} from 'lucide-react'
import { announcementSchema } from '@/lib/validation/schemas'
import { 
  approveStudentAction, 
  changeStudentStatusAction, 
  moderateProfileContentAction, 
  resolveReportAction, 
  createAnnouncementAction, 
  deleteAnnouncementAction,
  updateClassroomSettingsAction,
  regenerateInvitationCodeAction
} from '@/app/actions/admin'
import { resolveMeritClaim } from '@/app/actions/merit'
import { Input, Textarea } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge, StatusBadge } from '@/components/ui/badge'

export interface AdminManagerProps {
  classroom: {
    id: string
    name: string
    school_name: string
    school_year: string
    section_name: string
    invitation_code_hash: string
  }
  profiles: any[]
  reports: any[]
  announcements: any[]
  currentUserId: string
  initialPendingClaims?: any[]
}

export function AdminManager({
  classroom,
  profiles,
  reports,
  announcements,
  currentUserId,
  initialPendingClaims = []
}: AdminManagerProps) {
  const router = useRouter()
  const searchParams = useSearchParams()
  const defaultTab = (searchParams.get('tab') as any) || 'overview'
  
  const [activeTab, setActiveTab] = useState<'overview' | 'approvals' | 'merit' | 'students' | 'reports' | 'announcements' | 'settings'>(defaultTab)
  const [pendingClaims, setPendingClaims] = useState<any[]>(initialPendingClaims)
  const [isPending, startTransition] = useTransition()

  // Custom states for moderation/report actions
  const [selectedReport, setSelectedReport] = useState<any | null>(null)
  const [adminNotes, setAdminNotes] = useState('')
  const [rawInviteCode, setRawInviteCode] = useState('')
  
  // Search states
  const [studentSearch, setStudentSearch] = useState('')

  // Announcement Form hooks
  const [annState, annFormAction, isAnnPending] = useActionState(createAnnouncementAction, { success: false })

  // Classroom settings Action hooks
  const [settingsState, settingsFormAction, isSettingsPending] = useActionState(updateClassroomSettingsAction, { success: false })

  // Summary counts
  const approvedCount = profiles.filter((p) => p.status === 'approved').length
  const pendingCount = profiles.filter((p) => p.status === 'pending').length
  const activeReportsCount = reports.filter((r) => r.status === 'open' || r.status === 'reviewing').length
  const totalAnnouncements = announcements.length

  // Filters profiles for pending approvals tab
  const pendingStudents = profiles.filter((p) => p.status === 'pending')

  // Filters profiles for student management search
  const filteredStudents = profiles.filter((p) => {
    const query = studentSearch.toLowerCase().trim()
    return !query || 
      p.full_name.toLowerCase().includes(query) || 
      (p.nickname && p.nickname.toLowerCase().includes(query)) ||
      p.username.toLowerCase().includes(query)
  })

  // Action: Approve or Reject Pending Student
  const handleApproval = (studentId: string, action: 'approve' | 'reject') => {
    startTransition(async () => {
      const res = await approveStudentAction(studentId, action)
      if (res.success) {
        router.refresh()
      } else {
        alert(res.error || 'Failed to approve student.')
      }
    })
  }

  // Action: Change status (deactivate / delete)
  const handleStatusChange = (studentId: string, status: 'approved' | 'rejected' | 'deactivated') => {
    startTransition(async () => {
      const res = await changeStudentStatusAction(studentId, status)
      if (res.success) {
        router.refresh()
      } else {
        alert(res.error || 'Failed to update student status.')
      }
    })
  }

  // Action: Content Moderation
  const handleModerate = (studentId: string, nickname: boolean, bio: boolean, about: boolean, avatar: boolean) => {
    startTransition(async () => {
      const res = await moderateProfileContentAction(studentId, {
        clearNickname: nickname,
        clearBio: bio,
        clearAbout: about,
        clearAvatar: avatar
      })
      if (res.success) {
        alert('Profile content moderated successfully!')
        router.refresh()
      } else {
        alert(res.error || 'Failed to moderate profile content.')
      }
    })
  }

  // Action: Resolve Report
  const handleResolveReport = (reportId: string, action: 'resolved' | 'dismissed') => {
    if (!adminNotes.trim()) {
      alert('Please enter administrator notes before resolving.')
      return
    }

    startTransition(async () => {
      const res = await resolveReportAction(reportId, action, adminNotes)
      if (res.success) {
        setSelectedReport(null)
        setAdminNotes('')
        router.refresh()
      } else {
        alert(res.error || 'Failed to resolve report.')
      }
    })
  }

  // Action: Delete Announcement
  const handleDeleteAnnouncement = (id: string) => {
    startTransition(async () => {
      const res = await deleteAnnouncementAction(id)
      if (res.success) {
        router.refresh()
      } else {
        alert(res.error || 'Failed to delete announcement.')
      }
    })
  }

  // Action: Change Invitation Code
  const handleUpdateInvitationCode = (e: React.FormEvent) => {
    e.preventDefault()
    if (!rawInviteCode.trim()) {
      alert('Please enter a valid code.')
      return
    }

    startTransition(async () => {
      const res = await regenerateInvitationCodeAction(classroom.id, rawInviteCode)
      if (res.success) {
        alert('Invitation code updated successfully!')
        setRawInviteCode('')
        router.refresh()
      } else {
        alert(res.error || 'Failed to update code.')
      }
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in duration-300">
      
      {/* 1. Stat cards */}
      <section className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400">
            <UserCheck className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-zinc-900 dark:text-white">{approvedCount}</span>
            <span className="text-xs text-zinc-400 font-medium">Approved Students</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/40 text-amber-600 dark:text-amber-400">
            <Clock className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-zinc-900 dark:text-white">{pendingCount}</span>
            <span className="text-xs text-zinc-400 font-medium">Pending Approvals</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-455">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-zinc-900 dark:text-white">{activeReportsCount}</span>
            <span className="text-xs text-zinc-400 font-medium">Active Flags / Reports</span>
          </div>
        </Card>

        <Card className="p-4 flex items-center gap-4">
          <div className="p-3 rounded-xl bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400">
            <Megaphone className="w-6 h-6" />
          </div>
          <div>
            <span className="block text-2xl font-bold text-zinc-900 dark:text-white">{totalAnnouncements}</span>
            <span className="text-xs text-zinc-400 font-medium">Announcements</span>
          </div>
        </Card>
      </section>

      {/* 2. Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
        {([
          { key: 'overview', label: 'Overview', icon: Users },
          { key: 'approvals', label: `Pending Approvals (${pendingCount})`, icon: Clock },
          { key: 'merit', label: `Merit Claims (${pendingClaims.length})`, icon: Sparkles },
          { key: 'students', label: 'Student Directory', icon: UserCheck },
          { key: 'reports', label: `Flags Queue (${activeReportsCount})`, icon: ShieldAlert },
          { key: 'announcements', label: 'Announcements', icon: Megaphone },
          { key: 'settings', label: 'Classroom Settings', icon: Settings }
        ] as const).map((t) => {
          const Icon = t.icon
          return (
            <button
              key={t.key}
              onClick={() => setActiveTab(t.key)}
              className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-sm transition-all ${
                activeTab === t.key
                  ? 'border-rose-600 text-rose-600 dark:text-rose-400'
                  : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
              }`}
            >
              <Icon className="w-4 h-4" />
              {t.label}
            </button>
          )
        })}
      </div>

      {/* 3. Tab contents */}
      <div className="space-y-6">
        
        {/* Tab: OVERVIEW */}
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Left: Pending Approvals list preview */}
            <div className="lg:col-span-2 space-y-6">
              <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                <Clock className="w-5 h-5 text-indigo-500" />
                Recent Registration Requests
              </h3>

              {pendingStudents.length > 0 ? (
                <div className="space-y-3">
                  {pendingStudents.slice(0, 3).map((student) => (
                    <Card key={student.id}>
                      <CardContent className="p-4 flex items-center justify-between gap-4 flex-wrap">
                        <div>
                          <span className="block font-bold text-zinc-900 dark:text-white text-sm">
                            {student.full_name}
                          </span>
                          <span className="block text-xs text-zinc-400">
                            {student.email} &bull; Registered {new Date(student.created_at).toLocaleDateString()}
                          </span>
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleApproval(student.id, 'reject')}
                            disabled={isPending}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                          >
                            Reject
                          </button>
                          <button
                            onClick={() => handleApproval(student.id, 'approve')}
                            disabled={isPending}
                            className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors flex items-center gap-1"
                          >
                            <Check className="w-3.5 h-3.5" />
                            Approve
                          </button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                  {pendingStudents.length > 3 && (
                    <button
                      onClick={() => setActiveTab('approvals')}
                      className="w-full text-center py-2.5 text-xs font-bold text-indigo-600 dark:text-indigo-400 hover:underline"
                    >
                      View all {pendingStudents.length} pending approvals
                    </button>
                  )}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 text-sm">
                  No pending registrations.
                </div>
              )}
            </div>

            {/* Right: classroom metadata & fast invite */}
            <div className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle>Class Info</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-0 text-sm">
                  <div>
                    <span className="text-xs text-zinc-400 block">Class Name</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{classroom.name}</span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block">School Year</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{classroom.school_year}</span>
                  </div>
                  <div>
                    <span className="text-xs text-zinc-400 block">Section</span>
                    <span className="font-semibold text-zinc-800 dark:text-zinc-200">{classroom.section_name}</span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        )}

        {/* Tab: APPROVALS */}
        {activeTab === 'approvals' && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Registrations</CardTitle>
              <CardDescription>Approve student accounts to grant access to the classroom showcase directory</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {pendingStudents.length > 0 ? (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400">
                      <th className="pb-3 font-semibold">Name</th>
                      <th className="pb-3 font-semibold">Email</th>
                      <th className="pb-3 font-semibold">Signup Date</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                    {pendingStudents.map((student) => (
                      <tr key={student.id} className="align-middle">
                        <td className="py-4 font-semibold text-zinc-900 dark:text-white">{student.full_name}</td>
                        <td className="py-4 text-zinc-500 dark:text-zinc-400">{student.email}</td>
                        <td className="py-4 text-zinc-450">{new Date(student.created_at).toLocaleDateString()}</td>
                        <td className="py-4 text-right">
                          <div className="flex gap-2 justify-end">
                            <button
                              onClick={() => handleApproval(student.id, 'reject')}
                              disabled={isPending}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors"
                            >
                              Reject
                            </button>
                            <button
                              onClick={() => handleApproval(student.id, 'approve')}
                              disabled={isPending}
                              className="px-3 py-1.5 text-xs font-semibold rounded-lg text-white bg-emerald-600 hover:bg-emerald-700 transition-colors inline-flex items-center gap-1"
                            >
                              <Check className="w-3.5 h-3.5" />
                              Approve
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-zinc-400 text-sm">
                  No registrations pending approval.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab: MERIT CLAIMS */}
        {activeTab === 'merit' && (
          <Card>
            <CardHeader>
              <CardTitle>Pending Merit Claims</CardTitle>
              <CardDescription>Review and approve merit requests from classmates to award points and update their classroom tier</CardDescription>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {pendingClaims.length > 0 ? (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400">
                      <th className="py-3 px-4 font-semibold font-mono">Student</th>
                      <th className="py-3 px-4 font-semibold font-mono">Claim Title</th>
                      <th className="py-3 px-4 font-semibold font-mono">Description</th>
                      <th className="py-3 px-4 font-semibold font-mono text-right">Requested</th>
                      <th className="py-3 px-4 font-semibold font-mono text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pendingClaims.map((claim) => (
                      <tr key={claim.id} className="border-b border-zinc-100 dark:border-zinc-900 hover:bg-zinc-50/50 dark:hover:bg-zinc-900/30">
                        <td className="py-4 px-4 font-medium text-zinc-900 dark:text-zinc-150">
                          <div className="flex items-center gap-2">
                            {claim.profile?.avatar_url ? (
                              <img src={claim.profile.avatar_url} alt="" className="w-7 h-7 rounded-full object-cover" />
                            ) : (
                              <div className="w-7 h-7 rounded-full bg-zinc-800 text-zinc-300 flex items-center justify-center font-bold text-xs">
                                {claim.profile?.nickname?.substring(0, 2).toUpperCase() || claim.profile?.full_name?.substring(0, 2).toUpperCase()}
                              </div>
                            )}
                            <span>{claim.profile?.nickname || claim.profile?.full_name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-4 font-semibold text-zinc-800 dark:text-zinc-205">{claim.title}</td>
                        <td className="py-4 px-4 text-zinc-500 max-w-xs truncate">{claim.description || 'No description provided'}</td>
                        <td className="py-4 px-4 font-mono font-bold text-rose-500 text-right">+{claim.points_requested} CP</td>
                        <td className="py-4 px-4">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              disabled={isPending}
                              onClick={async () => {
                                startTransition(async () => {
                                  const res = await resolveMeritClaim(claim.id, 'approved')
                                  if (res.success) {
                                    setPendingClaims(prev => prev.filter(c => c.id !== claim.id))
                                  }
                                })
                              }}
                              className="p-1 text-emerald-500 hover:bg-emerald-500/10 rounded-lg transition-colors"
                              title="Approve"
                            >
                              <Check className="w-4 h-4" />
                            </button>
                            <button
                              disabled={isPending}
                              onClick={async () => {
                                startTransition(async () => {
                                  const res = await resolveMeritClaim(claim.id, 'rejected')
                                  if (res.success) {
                                    setPendingClaims(prev => prev.filter(c => c.id !== claim.id))
                                  }
                                })
                              }}
                              className="p-1 text-rose-500 hover:bg-rose-500/10 rounded-lg transition-colors"
                              title="Reject"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-zinc-400 text-sm">
                  No pending merit requests.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab: STUDENTS */}
        {activeTab === 'students' && (
          <Card>
            <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <CardTitle>Manage Student Accounts</CardTitle>
                <CardDescription>View, deactivate, moderate, or edit student accounts in your classroom</CardDescription>
              </div>
              <div className="relative w-full sm:max-w-xs">
                <input
                  type="text"
                  value={studentSearch}
                  onChange={(e) => setStudentSearch(e.target.value)}
                  placeholder="Search students..."
                  className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 placeholder-zinc-455 text-xs"
                />
              </div>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              {filteredStudents.length > 0 ? (
                <table className="w-full text-left text-sm border-collapse">
                  <thead>
                    <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400">
                      <th className="pb-3 font-semibold">Student</th>
                      <th className="pb-3 font-semibold">Role</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Moderation Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-100 dark:divide-zinc-850">
                    {filteredStudents.map((student) => (
                      <tr key={student.id} className="align-middle">
                        <td className="py-4">
                          <span className="block font-semibold text-zinc-900 dark:text-white leading-tight">
                            {student.full_name}
                          </span>
                          <span className="block text-xs text-zinc-400">
                            @{student.username} &bull; {student.email}
                          </span>
                        </td>
                        <td className="py-4">
                          <Badge variant={student.role === 'admin' ? 'secondary' : 'default'} className="capitalize">
                            {student.role}
                          </Badge>
                        </td>
                        <td className="py-4">
                          <StatusBadge status={student.status} />
                        </td>
                        <td className="py-4 text-right">
                          <div className="flex gap-2 justify-end flex-wrap">
                            {student.id !== currentUserId && (
                              <>
                                {student.status === 'approved' ? (
                                  <button
                                    onClick={() => handleStatusChange(student.id, 'deactivated')}
                                    disabled={isPending}
                                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-650 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors inline-flex items-center gap-1"
                                    title="Deactivate Student"
                                  >
                                    <UserX className="w-3.5 h-3.5 text-zinc-400" />
                                    Deactivate
                                  </button>
                                ) : (
                                  <button
                                    onClick={() => handleStatusChange(student.id, 'approved')}
                                    disabled={isPending}
                                    className="px-2.5 py-1.5 text-xs font-semibold rounded-lg text-white bg-indigo-600 hover:bg-indigo-700 transition-colors inline-flex items-center gap-1"
                                    title="Activate/Approve Student"
                                  >
                                    <Check className="w-3.5 h-3.5" />
                                    Activate
                                  </button>
                                )}

                                {/* Content moderation shortcuts */}
                                <button
                                  onClick={() => {
                                    if(confirm('Clear this student\'s Bio and Nickname for moderation?')) {
                                      handleModerate(student.id, true, true, false, false)
                                    }
                                  }}
                                  disabled={isPending}
                                  className="px-2.5 py-1.5 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-colors inline-flex items-center gap-1"
                                  title="Clear Bio & Nickname"
                                >
                                  <MessageSquareOff className="w-3.5 h-3.5" />
                                  Moderate Content
                                </button>
                              </>
                            )}
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-zinc-400 text-sm">
                  No students found matching search filters.
                </div>
              )}
            </CardContent>
          </Card>
        )}

        {/* Tab: REPORTS */}
        {activeTab === 'reports' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* List of reports */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                <ShieldAlert className="w-5 h-5 text-indigo-500" />
                Moderation Queue
              </h3>

              {reports && reports.length > 0 ? (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <Card 
                      key={report.id}
                      className={`cursor-pointer transition-all ${
                        selectedReport?.id === report.id
                          ? 'border-indigo-500 ring-1 ring-indigo-500/10'
                          : report.status === 'open' 
                            ? 'border-rose-200 dark:border-rose-950'
                            : ''
                      }`}
                      onClick={() => setSelectedReport(report)}
                    >
                      <CardContent className="p-5 space-y-3">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <span className="block text-xs font-bold uppercase tracking-wider text-zinc-400">
                              Report #{report.id.substring(0, 8)}
                            </span>
                            <span className="block font-bold text-sm text-zinc-900 dark:text-white mt-1">
                              Reason: {report.reason}
                            </span>
                          </div>
                          <Badge variant={report.status === 'open' ? 'danger' : report.status === 'resolved' ? 'success' : 'default'}>
                            {report.status}
                          </Badge>
                        </div>
                        
                        <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                          Reported student: <strong>{report.reported?.full_name} (@{report.reported?.username})</strong>
                          <br />
                          Flagged by: {report.reporter?.full_name || 'Anonymous'} on {new Date(report.created_at).toLocaleDateString()}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 text-sm">
                  Flags queue is empty. No student reports submitted.
                </div>
              )}
            </div>

            {/* Selected report resolution panel */}
            <div className="space-y-4">
              {selectedReport ? (
                <Card className="border-indigo-500 bg-indigo-50/5">
                  <CardHeader>
                    <CardTitle>Resolve Flag</CardTitle>
                    <CardDescription>
                      Review details for report #{selectedReport.id.substring(0, 8)}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4 pt-0 text-xs leading-relaxed">
                    <div>
                      <span className="text-zinc-400 block font-bold uppercase">Details submitted:</span>
                      <p className="text-zinc-650 dark:text-zinc-350 bg-white dark:bg-zinc-950 border p-3 rounded-xl mt-1 whitespace-pre-line">
                        {selectedReport.details}
                      </p>
                    </div>

                    {selectedReport.status === 'open' || selectedReport.status === 'reviewing' ? (
                      <div className="space-y-3 pt-2">
                        <Textarea
                          label="Administrator Action Notes"
                          placeholder="e.g. Cleared biography text. Approved restoration. / Found no violation, dismissed flag."
                          rows={4}
                          value={adminNotes}
                          onChange={(e) => setAdminNotes(e.target.value)}
                        />

                        <div className="flex gap-2">
                          <button
                            onClick={() => handleResolveReport(selectedReport.id, 'dismissed')}
                            disabled={isPending}
                            className="flex-1 py-2 font-semibold border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 rounded-xl hover:bg-zinc-50 hover:text-zinc-900 transition-colors"
                          >
                            Dismiss Report
                          </button>
                          <button
                            onClick={() => handleResolveReport(selectedReport.id, 'resolved')}
                            disabled={isPending}
                            className="flex-1 py-2 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors flex items-center justify-center gap-1"
                          >
                            <Check className="w-4 h-4" />
                            Mark Resolved
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="pt-2 space-y-2">
                        <span className="text-zinc-400 block font-bold uppercase">Resolution notes:</span>
                        <p className="text-zinc-650 dark:text-zinc-350 bg-white dark:bg-zinc-950 border p-3 rounded-xl italic">
                          "{selectedReport.admin_notes || 'No notes provided.'}"
                        </p>
                        <span className="block text-[10px] text-zinc-450">
                          Resolved at: {new Date(selectedReport.resolved_at).toLocaleString()}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ) : (
                <div className="p-8 text-center border border-zinc-200 dark:border-zinc-850 bg-zinc-50 dark:bg-zinc-900/20 rounded-2xl text-xs text-zinc-400">
                  Select a report in the queue to view details and resolve flags.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: ANNOUNCEMENTS */}
        {activeTab === 'announcements' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Create Announcement Form */}
            <div className="lg:col-span-1 space-y-4">
              <Card>
                <CardHeader>
                  <CardTitle>Post Announcement</CardTitle>
                  <CardDescription>Publish a new message to the class dashboard</CardDescription>
                </CardHeader>
                <CardContent>
                  {annState.error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/50 text-rose-600 dark:text-rose-450 text-xs flex gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{annState.error}</span>
                    </div>
                  )}

                  {annState.success && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs flex gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{annState.message}</span>
                    </div>
                  )}

                  <form action={annFormAction} className="space-y-4">
                    <Input
                      label="Announcement Title"
                      id="title"
                      name="title"
                      placeholder="e.g. Science Fair Submission Rules"
                      required
                      disabled={isAnnPending}
                    />

                    <Textarea
                      label="Content"
                      id="content"
                      name="content"
                      placeholder="Write your announcement details here..."
                      rows={5}
                      required
                      disabled={isAnnPending}
                    />

                    <div className="grid grid-cols-1 gap-4">
                      <Input
                        label="Expiration Date (Optional)"
                        id="expiresAt"
                        name="expiresAt"
                        type="date"
                        disabled={isAnnPending}
                      />

                      <div className="flex items-center">
                        <label className="flex items-center gap-2 cursor-pointer mt-2">
                          <input
                            type="checkbox"
                            id="isPinned"
                            name="isPinned"
                            className="h-4.5 w-4.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                            disabled={isAnnPending}
                          />
                          <span className="text-xs font-semibold text-zinc-700 dark:text-zinc-300">
                            Pin announcement to top
                          </span>
                        </label>
                      </div>
                    </div>

                    <button
                      type="submit"
                      disabled={isAnnPending}
                      className="w-full py-2.5 px-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-md shadow-indigo-650/10 flex items-center justify-center gap-1.5 text-xs mt-4 disabled:opacity-50"
                    >
                      {isAnnPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Publishing...
                        </>
                      ) : (
                        'Publish Announcement'
                      )}
                    </button>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* List of existing Announcements */}
            <div className="lg:col-span-2 space-y-4">
              <h3 className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2">
                <Megaphone className="w-5 h-5 text-indigo-500" />
                Active Class Posts
              </h3>

              {announcements && announcements.length > 0 ? (
                <div className="space-y-4">
                  {announcements.map((ann) => (
                    <Card key={ann.id}>
                      <CardContent className="p-5">
                        <div className="flex justify-between items-start gap-4">
                          <div>
                            <div className="flex items-center gap-2 flex-wrap">
                              {ann.is_pinned && (
                                <Badge variant="secondary" className="gap-1 px-1.5 py-0.5">
                                  <Pin className="w-3.5 h-3.5 rotate-45 text-indigo-600" />
                                  Pinned
                                </Badge>
                              )}
                              <h4 className="font-bold text-base text-zinc-900 dark:text-white">
                                {ann.title}
                              </h4>
                            </div>
                            <span className="block text-[11px] text-zinc-400 mt-1">
                              By {ann.author?.full_name || 'Admin'} &bull; Published {new Date(ann.created_at).toLocaleDateString()}
                              {ann.expires_at && ` &bull; Expires ${new Date(ann.expires_at).toLocaleDateString()}`}
                            </span>
                          </div>

                          <button
                            onClick={() => {
                              if(confirm('Delete this announcement permanently?')) {
                                handleDeleteAnnouncement(ann.id)
                              }
                            }}
                            disabled={isPending}
                            className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all"
                            title="Delete Announcement"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <p className="mt-3 text-xs text-zinc-650 dark:text-zinc-400 whitespace-pre-line leading-relaxed">
                          {ann.content}
                        </p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center border border-dashed border-zinc-200 dark:border-zinc-800 rounded-2xl text-zinc-400 text-sm">
                  No classroom announcements posted yet.
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab: SETTINGS */}
        {activeTab === 'settings' && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            
            {/* Classroom Metadata form */}
            <div className="md:col-span-2">
              <Card>
                <CardHeader>
                  <CardTitle>Classroom Configurations</CardTitle>
                  <CardDescription>Update name, school, year, and section details</CardDescription>
                </CardHeader>
                <CardContent>
                  {settingsState.error && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 dark:bg-rose-950/20 border border-rose-200/50 dark:border-rose-900/50 text-rose-600 dark:text-rose-455 text-xs flex gap-2">
                      <AlertTriangle className="w-4 h-4 shrink-0" />
                      <span>{settingsState.error}</span>
                    </div>
                  )}

                  {settingsState.success && (
                    <div className="mb-4 p-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200/50 dark:border-emerald-900/50 text-emerald-600 dark:text-emerald-400 text-xs flex gap-2">
                      <Check className="w-4 h-4 shrink-0" />
                      <span>{settingsState.message}</span>
                    </div>
                  )}

                  <form 
                    onSubmit={(e) => {
                      e.preventDefault()
                      const fd = new FormData(e.currentTarget)
                      startTransition(async () => {
                        const res = await updateClassroomSettingsAction(null, {
                          name: fd.get('name') as string,
                          schoolName: fd.get('schoolName') as string,
                          schoolYear: fd.get('schoolYear') as string,
                          sectionName: fd.get('sectionName') as string
                        })
                        if (res.success) {
                          alert('Classroom settings updated!')
                          router.refresh()
                        } else {
                          alert(res.error || 'Failed to update settings.')
                        }
                      })
                    }}
                    className="space-y-4"
                  >
                    <Input
                      label="Classroom Name"
                      id="name"
                      name="name"
                      defaultValue={classroom.name}
                      required
                    />

                    <Input
                      label="School Name"
                      id="schoolName"
                      name="schoolName"
                      defaultValue={classroom.school_name}
                      required
                    />

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <Input
                        label="School Year"
                        id="schoolYear"
                        name="schoolYear"
                        defaultValue={classroom.school_year}
                        placeholder="e.g. 2025-2026"
                        required
                      />

                      <Input
                        label="Section / Grade"
                        id="sectionName"
                        name="sectionName"
                        defaultValue={classroom.section_name}
                        placeholder="e.g. 11th Grade - Section A"
                        required
                      />
                    </div>

                    <div className="flex justify-end pt-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-6">
                      <button
                        type="submit"
                        disabled={isPending}
                        className="py-2.5 px-6 font-semibold text-white bg-indigo-600 hover:bg-indigo-755 rounded-xl transition-all shadow-md shadow-indigo-650/10 flex items-center gap-1 text-xs disabled:opacity-50"
                      >
                        {isPending ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Updating...
                          </>
                        ) : (
                          'Save Classroom Settings'
                        )}
                      </button>
                    </div>
                  </form>
                </CardContent>
              </Card>
            </div>

            {/* Invitation Code manager */}
            <div className="md:col-span-1">
              <Card className="border-indigo-500/20 bg-indigo-500/[0.02]">
                <CardHeader>
                  <CardTitle>Invitation Code</CardTitle>
                  <CardDescription>Change the classroom access code to prevent unauthorized signups</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-3 bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-850 rounded-xl text-center text-xs text-zinc-400">
                    Invitation codes are securely hashed in the database. Active code verification is enforced at signup.
                  </div>

                  <form onSubmit={handleUpdateInvitationCode} className="space-y-3">
                    <Input
                      label="New Invitation Code"
                      id="newInviteCode"
                      placeholder="e.g. NEW_CODE_2026"
                      value={rawInviteCode}
                      onChange={(e) => setRawInviteCode(e.target.value)}
                      required
                    />

                    <button
                      type="submit"
                      disabled={isPending}
                      className="w-full py-2.5 px-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all flex items-center justify-center gap-1.5 text-xs disabled:opacity-50"
                    >
                      {isPending ? (
                        <>
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          Hashing & Saving...
                        </>
                      ) : (
                        'Update Code'
                      )}
                    </button>
                  </form>
                </CardContent>
              </Card>
            </div>

          </div>
        )}

      </div>

    </div>
  )
}
export default AdminManager
