import { z } from 'zod'

const isDev = process.env.NODE_ENV === 'development'

// URL Validation helper
export const urlSchema = z.string().optional().or(z.literal('')).refine((val) => {
  if (!val) return true
  try {
    const url = new URL(val)
    if (url.protocol === 'https:') return true
    if (isDev && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) return true
    return false
  } catch {
    return false
  }
}, {
  message: 'URL must start with https:// (or http://localhost in dev)'
})

// GitHub URL Validation helper
export const githubUrlSchema = z.string().optional().or(z.literal('')).refine((val) => {
  if (!val) return true
  try {
    const url = new URL(val)
    if (!url.hostname.endsWith('github.com')) return false
    if (url.protocol === 'https:') return true
    if (isDev && (url.hostname === 'localhost' || url.hostname === '127.0.0.1')) return true
    return false
  } catch {
    return false
  }
}, {
  message: 'Must be a valid GitHub URL (github.com) starting with https://'
})

// Registration Schema
export const registerSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(50, 'Full name cannot exceed 50 characters'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(8, 'Password must be at least 8 characters'),
  confirmPassword: z.string(),
  invitationCode: z.string().min(1, 'Invitation code is required'),
  rulesAgreement: z.boolean().refine((val) => val === true, 'You must agree to the community rules')
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Passwords do not match',
  path: ['confirmPassword']
})

// Login Schema
export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters')
})

// Profile Edit Schema
export const profileEditSchema = z.object({
  fullName: z.string().min(2, 'Full name must be at least 2 characters').max(50, 'Full name cannot exceed 50 characters'),
  nickname: z.string().max(30, 'Nickname cannot exceed 30 characters').optional().or(z.literal('')),
  username: z.string().min(3, 'Username must be at least 3 characters').max(30, 'Username cannot exceed 30 characters')
    .regex(/^[a-zA-Z0-9_]+$/, 'Username can only contain letters, numbers, and underscores'),
  bio: z.string().max(160, 'Biography cannot exceed 160 characters').optional().or(z.literal('')),
  about: z.string().max(2000, 'About me section cannot exceed 2000 characters').optional().or(z.literal('')),
  birthday: z.string().optional().or(z.literal('')),
  favoriteSubjects: z.array(z.string()),
  interests: z.array(z.string()),
  hobbies: z.array(z.string()),
  skills: z.array(z.string()),
  achievements: z.array(z.string()),
  githubUrl: githubUrlSchema,
  linkedinUrl: urlSchema,
  portfolioUrl: urlSchema,
  websiteUrl: urlSchema,
  profileAccent: z.enum(['indigo', 'blue', 'violet', 'rose', 'emerald', 'orange']),
  showBirthday: z.boolean(),
  showExternalLinks: z.boolean(),
  showAchievements: z.boolean()
})

// Project Schema
export const projectSchema = z.object({
  title: z.string().min(2, 'Project title must be at least 2 characters').max(100, 'Project title cannot exceed 100 characters'),
  description: z.string().min(10, 'Description must be at least 10 characters').max(1000, 'Description cannot exceed 1000 characters'),
  githubUrl: githubUrlSchema,
  liveUrl: urlSchema,
  technologies: z.array(z.string()),
  projectDate: z.string().optional().or(z.literal('')),
  isVisible: z.boolean()
})

// Announcement Schema
export const announcementSchema = z.object({
  title: z.string().min(3, 'Title must be at least 3 characters').max(100, 'Title cannot exceed 100 characters'),
  content: z.string().min(10, 'Content must be at least 10 characters'),
  isPinned: z.boolean(),
  expiresAt: z.string().optional().or(z.literal(''))
})

// Report Schema
export const reportSchema = z.object({
  reportedProfileId: z.string().uuid(),
  reason: z.string().min(3, 'Reason must be at least 3 characters').max(100, 'Reason cannot exceed 100 characters'),
  details: z.string().min(10, 'Details must be at least 10 characters').max(2000, 'Details cannot exceed 2000 characters')
})
