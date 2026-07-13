import { describe, it, expect } from 'vitest'
import {
  urlSchema,
  githubUrlSchema,
  registerSchema,
  profileEditSchema,
  projectSchema,
} from '../lib/validation/schemas'
import {
  calculateProfileCompletion,
} from '../lib/profile-completion'
import {
  isAdmin,
  isApproved,
  canAccessClassroom,
  canEditProfile,
  canManageProject,
} from '../lib/permissions'
import {
  hashInvitationCode,
  verifyInvitationCode,
} from '../lib/invitation'

describe('ClassSpace Tests', () => {
  describe('URL Validation', () => {
    it('should validate https:// URLs', () => {
      expect(urlSchema.safeParse('https://example.com').success).toBe(true)
      expect(urlSchema.safeParse('http://example.com').success).toBe(false)
      expect(urlSchema.safeParse('invalid-url').success).toBe(false)
      expect(urlSchema.safeParse('').success).toBe(true)
      expect(urlSchema.safeParse(undefined).success).toBe(true)
    })

    it('should validate GitHub URLs specifically', () => {
      expect(githubUrlSchema.safeParse('https://github.com/octocat').success).toBe(true)
      expect(githubUrlSchema.safeParse('https://gitlab.com/octocat').success).toBe(false)
      expect(githubUrlSchema.safeParse('http://github.com/octocat').success).toBe(false)
      expect(githubUrlSchema.safeParse('').success).toBe(true)
      expect(githubUrlSchema.safeParse(undefined).success).toBe(true)
    })
  })

  describe('Form Validation Schemas', () => {
    it('should validate registration fields', () => {
      const validReg = {
        fullName: 'Jane Doe',
        email: 'jane@school.edu',
        password: 'password123',
        confirmPassword: 'password123',
        invitationCode: 'CLASS2026',
        rulesAgreement: true,
      }
      expect(registerSchema.safeParse(validReg).success).toBe(true)

      const mismatchReg = { ...validReg, confirmPassword: 'password456' }
      expect(registerSchema.safeParse(mismatchReg).success).toBe(false)

      const shortPassReg = { ...validReg, password: '123', confirmPassword: '123' }
      expect(registerSchema.safeParse(shortPassReg).success).toBe(false)
    })

    it('should validate project fields', () => {
      const validProject = {
        title: 'Portfolio Website',
        description: 'My awesome student portfolio website showing skills.',
        githubUrl: 'https://github.com/student/portfolio',
        liveUrl: 'https://student-portfolio.vercel.app',
        technologies: ['React', 'Tailwind', 'Next.js'],
        projectDate: '2026-07-12',
        isVisible: true,
      }
      expect(projectSchema.safeParse(validProject).success).toBe(true)

      const invalidProject = { ...validProject, description: 'short' } // min 10
      expect(projectSchema.safeParse(invalidProject).success).toBe(false)
    })
  })

  describe('Profile Completion Calculation', () => {
    it('should calculate 0% for empty profile', () => {
      const result = calculateProfileCompletion(null, false)
      expect(result.percentage).toBe(0)
      expect(result.recommendations.length).toBe(7)
    })

    it('should calculate 100% for complete profile', () => {
      const completeProfile = {
        avatar_url: 'https://supabase.co/storage/v1/object/public/avatars/jane.png',
        bio: 'Aspiring software developer in 11th grade.',
        interests: ['Coding', 'Robotics'],
        skills: ['JavaScript', 'HTML/CSS'],
        favorite_subjects: ['Math', 'Computer Science'],
        github_url: 'https://github.com/jane',
      }
      const result = calculateProfileCompletion(completeProfile, true)
      expect(result.percentage).toBe(100)
      expect(result.recommendations.length).toBe(0)
    })

    it('should calculate partial scores', () => {
      const partialProfile = {
        bio: 'Hello world',
        skills: ['TypeScript'],
      }
      const result = calculateProfileCompletion(partialProfile, false)
      // bio (15) + skills (15) = 30%
      expect(result.percentage).toBe(30)
      expect(result.recommendations).toContain('Upload a profile picture')
      expect(result.recommendations).toContain('Add at least one project to showcase your work')
    })
  })

  describe('Permission Helpers', () => {
    const adminUser = { id: 'admin-id', classroom_id: 'class-1', role: 'admin', status: 'approved' }
    const studentUser = { id: 'student-id', classroom_id: 'class-1', role: 'student', status: 'approved' }
    const pendingUser = { id: 'pending-id', classroom_id: 'class-1', role: 'student', status: 'pending' }
    const otherStudent = { id: 'other-id', classroom_id: 'class-2', role: 'student', status: 'approved' }

    it('should identify admin roles', () => {
      expect(isAdmin(adminUser)).toBe(true)
      expect(isAdmin(studentUser)).toBe(false)
    })

    it('should identify approved statuses', () => {
      expect(isApproved(studentUser)).toBe(true)
      expect(isApproved(pendingUser)).toBe(false)
      expect(isApproved(adminUser)).toBe(true) // admins are always approved
    })

    it('should control profile editing', () => {
      // Students can edit their own profiles
      expect(canEditProfile(studentUser, 'student-id')).toBe(true)
      // Students cannot edit other profiles
      expect(canEditProfile(studentUser, 'other-id')).toBe(false)
      // Admins can edit student profiles in their classroom
      expect(canEditProfile(adminUser, 'student-id')).toBe(true)
    })

    it('should control project management', () => {
      // Students can edit their own projects
      expect(canManageProject(studentUser, 'student-id')).toBe(true)
      // Students cannot edit other students' projects
      expect(canManageProject(studentUser, 'other-id')).toBe(false)
      // Admins can manage student projects
      expect(canManageProject(adminUser, 'student-id')).toBe(true)
    })
  })

  describe('Invitation Code Verification', () => {
    it('should securely hash and verify invitation codes', () => {
      process.env.INVITATION_CODE_SALT = 'test-salt-for-testing'
      const code = 'SECRETCODE2026'
      const hashed = hashInvitationCode(code)
      expect(hashed).not.toBe(code)
      expect(verifyInvitationCode(code, hashed)).toBe(true)
      expect(verifyInvitationCode('WRONGCODE', hashed)).toBe(false)
    })
  })
})
