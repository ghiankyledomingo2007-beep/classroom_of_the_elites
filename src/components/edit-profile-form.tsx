'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  User, 
  Link as LinkIcon, 
  BookOpen, 
  Settings, 
  Loader2, 
  CheckCircle, 
  AlertCircle,
  Sparkles
} from 'lucide-react'
import { profileEditSchema } from '@/lib/validation/schemas'
import { updateProfileAction, updateAvatarAction } from '@/app/actions/profile'
import { Input, Textarea } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { TagInput } from '@/components/ui/tag-input'
import { AvatarUploader } from '@/components/ui/avatar-uploader'

export interface ProfileData {
  id: string
  full_name: string
  nickname: string | null
  username: string
  bio: string | null
  about: string | null
  birthday: string | null
  avatar_url: string | null
  favorite_subjects: string[]
  interests: string[]
  hobbies: string[]
  skills: string[]
  achievements: string[]
  github_url: string | null
  linkedin_url: string | null
  portfolio_url: string | null
  website_url: string | null
  profile_accent: 'indigo' | 'blue' | 'violet' | 'rose' | 'emerald' | 'orange'
  show_birthday: boolean
  show_external_links: boolean
  show_achievements: boolean
}

export function EditProfileForm({ initialProfile }: { initialProfile: any }) {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState<'info' | 'links' | 'skills' | 'settings'>('info')
  const [isPending, startTransition] = useTransition()
  const [status, setStatus] = useState<{ success: boolean; message: string } | null>(null)
  const [avatarUrl, setAvatarUrl] = useState<string | null>(initialProfile.avatar_url)

  const {
    register,
    handleSubmit,
    control,
    setValue,
    watch,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(profileEditSchema),
    defaultValues: {
      fullName: initialProfile.full_name || '',
      nickname: initialProfile.nickname || '',
      username: initialProfile.username || '',
      bio: initialProfile.bio || '',
      about: initialProfile.about || '',
      birthday: initialProfile.birthday || '',
      favoriteSubjects: initialProfile.favorite_subjects || [],
      interests: initialProfile.interests || [],
      hobbies: initialProfile.hobbies || [],
      skills: initialProfile.skills || [],
      achievements: initialProfile.achievements || [],
      githubUrl: initialProfile.github_url || '',
      linkedinUrl: initialProfile.linkedin_url || '',
      portfolioUrl: initialProfile.portfolio_url || '',
      websiteUrl: initialProfile.website_url || '',
      profileAccent: initialProfile.profile_accent || 'indigo',
      showBirthday: initialProfile.show_birthday || false,
      showExternalLinks: initialProfile.show_external_links || true,
      showAchievements: initialProfile.show_achievements || true
    }
  })

  const selectedAccent = watch('profileAccent')

  const handleAvatarUpload = async (url: string) => {
    setAvatarUrl(url)
    const res = await updateAvatarAction(url)
    if (res.success) {
      setStatus({ success: true, message: 'Profile picture updated successfully!' })
      router.refresh()
    } else {
      setStatus({ success: false, message: res.error || 'Failed to update avatar in database.' })
    }
  }

  const onSubmit = (data: any) => {
    setStatus(null)
    startTransition(async () => {
      const result = await updateProfileAction(null, data)
      if (result.success) {
        setStatus({ success: true, message: result.message || 'Profile saved!' })
        router.refresh()
        // Scroll to top to see success message
        window.scrollTo({ top: 0, behavior: 'smooth' })
      } else {
        setStatus({ success: false, message: result.error || 'Failed to update profile.' })
        window.scrollTo({ top: 0, behavior: 'smooth' })
      }
    })
  }

  // Accent mapping for accent choice borders
  const accentBorders: Record<string, string> = {
    indigo: 'border-indigo-600 ring-indigo-500/20',
    blue: 'border-blue-600 ring-blue-500/20',
    violet: 'border-violet-600 ring-violet-500/20',
    rose: 'border-rose-600 ring-rose-500/20',
    emerald: 'border-emerald-600 ring-emerald-500/20',
    orange: 'border-orange-650 ring-orange-500/20'
  }

  const buttonAccents: Record<string, string> = {
    indigo: 'bg-indigo-600 hover:bg-indigo-700',
    blue: 'bg-blue-600 hover:bg-blue-700',
    violet: 'bg-violet-600 hover:bg-violet-700',
    rose: 'bg-rose-600 hover:bg-rose-700',
    emerald: 'bg-emerald-600 hover:bg-emerald-700',
    orange: 'bg-orange-600 hover:bg-orange-700'
  }

  const activeBtnColor = buttonAccents[selectedAccent] || 'bg-indigo-600'

  return (
    <div className="space-y-6">
      {/* Alert Messaging */}
      {status && (
        <div className={`p-4 rounded-xl border flex gap-3 text-sm items-start ${
          status.success 
            ? 'bg-emerald-50 dark:bg-emerald-950/20 border-emerald-200 dark:border-emerald-900/50 text-emerald-800 dark:text-emerald-350'
            : 'bg-rose-50 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900/50 text-rose-800 dark:text-rose-350'
        }`}>
          {status.success ? (
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5 text-emerald-600 dark:text-emerald-450" />
          ) : (
            <AlertCircle className="w-5 h-5 shrink-0 mt-0.5 text-rose-600 dark:text-rose-450" />
          )}
          <div className="flex-1">
            <span>{status.message}</span>
            {status.success && (
              <span className="block mt-1 text-xs">
                <Link href={`/profile/${watch('username')}`} className="underline font-bold">
                  View your updated public card &rarr;
                </Link>
              </span>
            )}
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b border-zinc-200 dark:border-zinc-800 overflow-x-auto whitespace-nowrap scrollbar-none gap-2">
        <button
          onClick={() => setActiveTab('info')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-sm transition-all ${
            activeTab === 'info'
              ? 'border-indigo-600 text-indigo-650 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <User className="w-4 h-4" />
          Profile Info
        </button>

        <button
          onClick={() => setActiveTab('links')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-sm transition-all ${
            activeTab === 'links'
              ? 'border-indigo-600 text-indigo-650 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <LinkIcon className="w-4 h-4" />
          Social & Links
        </button>

        <button
          onClick={() => setActiveTab('skills')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-sm transition-all ${
            activeTab === 'skills'
              ? 'border-indigo-600 text-indigo-650 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <BookOpen className="w-4 h-4" />
          Subjects & Talents
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          className={`flex items-center gap-2 px-4 py-3 border-b-2 font-semibold text-sm transition-all ${
            activeTab === 'settings'
              ? 'border-indigo-600 text-indigo-650 dark:text-indigo-400'
              : 'border-transparent text-zinc-500 hover:text-zinc-700 dark:hover:text-zinc-300'
          }`}
        >
          <Settings className="w-4 h-4" />
          Theme & Display
        </button>
      </div>

      {/* Main Form Form */}
      <form onSubmit={handleSubmit(onSubmit)}>
        <Card>
          <CardContent className="p-6 space-y-6">
            
            {/* 1. Tab: Profile Info */}
            {activeTab === 'info' && (
              <div className="space-y-6">
                
                {/* Avatar Uploader component */}
                <div className="pb-6 border-b border-zinc-100 dark:border-zinc-800/50">
                  <h3 className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-4 text-center md:text-left">
                    Showcase Profile Picture
                  </h3>
                  <AvatarUploader 
                    value={avatarUrl}
                    userId={initialProfile.id}
                    onUploadComplete={handleAvatarUpload}
                    onError={(err) => setStatus({ success: false, message: err })}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Full Name"
                    placeholder="Jane Doe"
                    error={errors.fullName?.message}
                    {...register('fullName')}
                  />

                  <Input
                    label="Nickname"
                    placeholder="e.g. Jenny"
                    error={errors.nickname?.message}
                    {...register('nickname')}
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <Input
                    label="Showcase URL Slug / Username"
                    placeholder="janedoe"
                    error={errors.username?.message}
                    {...register('username')}
                  />

                  <Input
                    label="Birthday"
                    type="date"
                    error={errors.birthday?.message}
                    {...register('birthday')}
                  />
                </div>

                <Input
                  label="Short Biography"
                  placeholder="Aspiring software engineer in 11th grade. Passionate about AI."
                  error={errors.bio?.message}
                  maxLength={160}
                  {...register('bio')}
                />

                <Textarea
                  label="Longer 'About me' details"
                  placeholder="Tell your classmates more about who you are, what you like to learn, or what projects you hope to work on..."
                  rows={5}
                  error={errors.about?.message}
                  maxLength={2000}
                  {...register('about')}
                />

              </div>
            )}

            {/* 2. Tab: Social Links */}
            {activeTab === 'links' && (
              <div className="space-y-4">
                <Input
                  label="GitHub Profile URL"
                  placeholder="https://github.com/username"
                  error={errors.githubUrl?.message}
                  {...register('githubUrl')}
                />

                <Input
                  label="LinkedIn Profile URL"
                  placeholder="https://linkedin.com/in/username"
                  error={errors.linkedinUrl?.message}
                  {...register('linkedinUrl')}
                />

                <Input
                  label="Portfolio Showcase URL"
                  placeholder="https://myportfolio.com"
                  error={errors.portfolioUrl?.message}
                  {...register('portfolioUrl')}
                />

                <Input
                  label="Other Approved Website URL"
                  placeholder="https://myblog.com"
                  error={errors.websiteUrl?.message}
                  {...register('websiteUrl')}
                />
              </div>
            )}

            {/* 3. Tab: Subjects & Talents */}
            {activeTab === 'skills' && (
              <div className="space-y-6">
                
                {/* Favorite Subjects */}
                <Controller
                  name="favoriteSubjects"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      label="Favorite Subjects"
                      placeholder="e.g. Computer Science, Mathematics, Physics (Press Enter)"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.favoriteSubjects?.message}
                    />
                  )}
                />

                {/* Skills */}
                <Controller
                  name="skills"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      label="Skills & Programming Languages"
                      placeholder="e.g. JavaScript, Public Speaking, Figma, French (Press Enter)"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.skills?.message}
                    />
                  )}
                />

                {/* Interests */}
                <Controller
                  name="interests"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      label="Interests"
                      placeholder="e.g. Web Development, Robotics, Machine Learning (Press Enter)"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.interests?.message}
                    />
                  )}
                />

                {/* Hobbies */}
                <Controller
                  name="hobbies"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      label="Hobbies"
                      placeholder="e.g. Chess, Photography, Soccer, Playing Guitar (Press Enter)"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.hobbies?.message}
                    />
                  )}
                />

                {/* Achievements */}
                <Controller
                  name="achievements"
                  control={control}
                  render={({ field }) => (
                    <TagInput
                      label="Achievements & Awards"
                      placeholder="e.g. Science Fair 1st Place, Hackathon Winner, Honor Roll (Press Enter)"
                      value={field.value}
                      onChange={field.onChange}
                      error={errors.achievements?.message}
                    />
                  )}
                />

              </div>
            )}

            {/* 4. Tab: Settings & Accents */}
            {activeTab === 'settings' && (
              <div className="space-y-6">
                
                {/* Accent selection */}
                <div className="space-y-3">
                  <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                    Profile Accent Theme Color
                  </label>
                  <div className="grid grid-cols-3 sm:grid-cols-6 gap-3">
                    {['indigo', 'blue', 'violet', 'rose', 'emerald', 'orange'].map((accent) => (
                      <button
                        key={accent}
                        type="button"
                        onClick={() => setValue('profileAccent', accent as any)}
                        className={`py-3 px-4 rounded-xl border flex flex-col items-center gap-1.5 font-semibold text-xs capitalize transition-all ${
                          selectedAccent === accent
                            ? `bg-${accent}-50/50 border-${accent}-500 text-${accent}-600 ring-2 ring-${accent}-500/20`
                            : 'border-zinc-200 dark:border-zinc-800 text-zinc-500 hover:bg-zinc-50 dark:hover:bg-zinc-800/50'
                        }`}
                      >
                        <span className={`w-3.5 h-3.5 rounded-full bg-${accent === 'orange' ? 'orange-500' : `${accent}-600`} border border-white/20`} />
                        {accent}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Visibility Controls */}
                <div className="space-y-4 pt-6 border-t border-zinc-100 dark:border-zinc-800/50">
                  <h3 className="text-sm font-bold uppercase tracking-wider text-zinc-400">Visibility Settings</h3>
                  
                  <div className="space-y-3">
                    {/* Show birthday */}
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="h-4.5 w-4.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                        {...register('showBirthday')}
                      />
                      <div>
                        <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Show birthday in directory</span>
                        <span className="block text-xs text-zinc-400 mt-0.5">Let your classmates see your birthday month and day on the dashboard and profile.</span>
                      </div>
                    </label>

                    {/* Show external links */}
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="h-4.5 w-4.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                        {...register('showExternalLinks')}
                      />
                      <div>
                        <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Show social and website links</span>
                        <span className="block text-xs text-zinc-400 mt-0.5">Make your links to GitHub, LinkedIn, and websites visible on your profile card.</span>
                      </div>
                    </label>

                    {/* Show achievements */}
                    <label className="flex items-start gap-3 p-3 rounded-xl border border-zinc-200/50 dark:border-zinc-850 hover:bg-zinc-50 dark:hover:bg-zinc-800/20 cursor-pointer transition-colors">
                      <input
                        type="checkbox"
                        className="h-4.5 w-4.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500 mt-0.5"
                        {...register('showAchievements')}
                      />
                      <div>
                        <span className="block text-sm font-semibold text-zinc-900 dark:text-zinc-100">Show achievements section</span>
                        <span className="block text-xs text-zinc-400 mt-0.5">Display awards, science fairs, and school honors on your public profile.</span>
                      </div>
                    </label>
                  </div>
                </div>

              </div>
            )}

            {/* Form Actions Footer */}
            <div className="pt-6 border-t border-zinc-100 dark:border-zinc-800/50 flex justify-between items-center flex-wrap gap-4">
              <Link
                href={`/profile/${initialProfile.username}`}
                className="text-sm font-semibold text-zinc-500 hover:text-zinc-700 dark:text-zinc-400 dark:hover:text-zinc-300 transition-colors"
              >
                Cancel / View Profile
              </Link>
              
              <div className="flex gap-3">
                <button
                  type="submit"
                  disabled={isPending}
                  className={`py-2.5 px-6 font-semibold text-white rounded-xl transition-all shadow-md flex items-center gap-1.5 disabled:opacity-50 ${activeBtnColor}`}
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      Saving changes...
                    </>
                  ) : (
                    'Save Showcase Profile'
                  )}
                </button>
              </div>
            </div>

          </CardContent>
        </Card>
      </form>
    </div>
  )
}
export default EditProfileForm
