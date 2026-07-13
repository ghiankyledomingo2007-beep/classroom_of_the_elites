'use client'

import React, { useState, useTransition } from 'react'
import { useRouter } from 'next/navigation'
import { useForm, Controller } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { 
  FolderGit2, 
  Plus, 
  Pencil, 
  Trash2, 
  Github, 
  Globe, 
  EyeOff, 
  X, 
  Loader2, 
  AlertCircle,
  Calendar,
  Image as ImageIcon
} from 'lucide-react'
import { projectSchema } from '@/lib/validation/schemas'
import { createProjectAction, updateProjectAction, deleteProjectAction } from '@/app/actions/projects'
import { createClient } from '@/lib/supabase/client'
import { Input, Textarea } from '@/components/ui/input'
import { Card, CardContent } from '@/components/ui/card'
import { TagInput } from '@/components/ui/tag-input'
import { ConfirmationDialog } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'

export interface Project {
  id: string
  profile_id: string
  title: string
  description: string
  image_url: string | null
  technologies: string[]
  github_url: string | null
  live_url: string | null
  project_date: string | null
  is_visible: boolean
}

export function ProjectsList({
  initialProjects,
  userId
}: {
  initialProjects: Project[]
  userId: string
}) {
  const router = useRouter()
  const [isPending, startTransition] = useTransition()
  const [modalOpen, setModalOpen] = useState(false)
  const [editingProject, setEditingProject] = useState<Project | null>(null)
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null)
  
  // Storage upload states
  const [uploadingImage, setUploadingImage] = useState(false)
  const [projectImageUrl, setProjectImageUrl] = useState<string | null>(null)

  const supabase = createClient()

  const {
    register,
    handleSubmit,
    control,
    setValue,
    reset,
    formState: { errors }
  } = useForm({
    resolver: zodResolver(projectSchema),
    defaultValues: {
      title: '',
      description: '',
      githubUrl: '',
      liveUrl: '',
      technologies: [] as string[],
      projectDate: '',
      isVisible: true
    }
  })

  // Open modal for adding
  const handleAddOpen = () => {
    setEditingProject(null)
    setProjectImageUrl(null)
    reset({
      title: '',
      description: '',
      githubUrl: '',
      liveUrl: '',
      technologies: [],
      projectDate: '',
      isVisible: true
    })
    setModalOpen(true)
  }

  // Open modal for editing
  const handleEditOpen = (proj: Project) => {
    setEditingProject(proj)
    setProjectImageUrl(proj.image_url)
    reset({
      title: proj.title,
      description: proj.description,
      githubUrl: proj.github_url || '',
      liveUrl: proj.live_url || '',
      technologies: proj.technologies || [],
      projectDate: proj.project_date || '',
      isVisible: proj.is_visible
    })
    setModalOpen(true)
  }

  // Image Upload handler
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    if (!['image/jpeg', 'image/png', 'image/webp'].includes(file.type)) {
      alert('Only JPEG, PNG, and WebP images are accepted.')
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      alert('Maximum file size is 5 MB.')
      return
    }

    try {
      setUploadingImage(true)
      const fileExt = file.name.split('.').pop()
      const fileName = `${userId}-${Math.random().toString(36).substring(2)}.${fileExt}`
      const filePath = `projects/${fileName}`

      const { error } = await supabase.storage
        .from('projects')
        .upload(filePath, file)

      if (error) throw error

      const { data: { publicUrl } } = supabase.storage
        .from('projects')
        .getPublicUrl(filePath)

      setProjectImageUrl(publicUrl)
    } catch (err: any) {
      console.error('Project image upload error:', err)
      alert('Failed to upload image. Make sure projects bucket exists.')
    } finally {
      setUploadingImage(false)
    }
  }

  // Submit form handler
  const onSubmit = (data: any) => {
    // Add upload url to data
    const formData = {
      ...data,
      imageUrl: projectImageUrl
    }

    startTransition(async () => {
      let res
      if (editingProject) {
        res = await updateProjectAction(null, {
          projectId: editingProject.id,
          data: formData
        })
      } else {
        res = await createProjectAction(null, formData)
      }

      if (res.success) {
        setModalOpen(false)
        router.refresh()
      } else {
        alert(res.error || 'Failed to save project.')
      }
    })
  }

  // Delete project handler
  const handleDelete = async () => {
    if (!deleteConfirmId) return
    const res = await deleteProjectAction(deleteConfirmId)
    if (res.success) {
      setDeleteConfirmId(null)
      router.refresh()
    } else {
      alert(res.error || 'Failed to delete project.')
    }
  }

  return (
    <div className="space-y-6">
      {/* Header bar with trigger */}
      <div className="flex justify-end">
        <button
          onClick={handleAddOpen}
          className="inline-flex items-center gap-2 py-2.5 px-4 font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-all shadow-sm shadow-indigo-650/10 text-sm"
        >
          <Plus className="w-4 h-4" />
          Add Project
        </button>
      </div>

      {/* Projects Grid */}
      {initialProjects.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {initialProjects.map((proj) => (
            <Card key={proj.id} className="flex flex-col h-full overflow-hidden hover:shadow-md transition-shadow relative group">
              {proj.image_url && (
                <div className="h-44 w-full relative bg-zinc-100 dark:bg-zinc-800">
                  <img
                    src={proj.image_url}
                    alt={proj.title}
                    className="w-full h-full object-cover"
                  />
                  {!proj.is_visible && (
                    <div className="absolute top-3 left-3 px-2 py-1 rounded bg-black/70 text-white text-[10px] font-semibold flex items-center gap-1.5 backdrop-blur-sm border border-white/10">
                      <EyeOff className="w-3.5 h-3.5" />
                      Hidden
                    </div>
                  )}
                </div>
              )}
              <CardContent className="p-6 flex-1 flex flex-col justify-between">
                <div className="space-y-3">
                  <div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white leading-snug">
                      {proj.title}
                    </h3>
                    {proj.project_date && (
                      <span className="block text-xs text-zinc-400 font-medium inline-flex items-center gap-1 mt-1">
                        <Calendar className="w-3.5 h-3.5" />
                        {new Date(proj.project_date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' })}
                      </span>
                    )}
                  </div>
                  
                  <p className="text-xs text-zinc-550 dark:text-zinc-450 leading-relaxed line-clamp-3">
                    {proj.description}
                  </p>
                  
                  {proj.technologies && proj.technologies.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {proj.technologies.map((t) => (
                        <Badge key={t} className="px-1.5 py-0.5 text-[9px]">
                          {t}
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>

                {/* Actions row */}
                <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 flex items-center justify-between gap-4">
                  {/* Left: links */}
                  <div className="flex items-center gap-2">
                    {proj.github_url && (
                      <a
                        href={proj.github_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        title="Repository"
                      >
                        <Github className="w-4 h-4" />
                      </a>
                    )}
                    {proj.live_url && (
                      <a
                        href={proj.live_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        title="Live Site"
                      >
                        <Globe className="w-4 h-4" />
                      </a>
                    )}
                  </div>

                  {/* Right: edit & delete */}
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleEditOpen(proj)}
                      className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 text-zinc-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-50/50 dark:hover:bg-indigo-950/20 hover:border-indigo-150 dark:hover:border-indigo-950 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => setDeleteConfirmId(proj.id)}
                      className="p-2 rounded-lg border border-zinc-200 dark:border-zinc-850 text-zinc-400 hover:text-rose-600 dark:hover:text-rose-400 hover:bg-rose-50/50 dark:hover:bg-rose-950/20 hover:border-rose-150 dark:hover:border-rose-950 transition-colors"
                      title="Delete"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400 mb-4">
            <FolderGit2 className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">Showcase your projects</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            You haven't added any projects yet. Upload school reports, team hacks, or coding projects to build your portfolio.
          </p>
          <button
            onClick={handleAddOpen}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-750 rounded-xl transition-colors"
          >
            Add your first project
          </button>
        </div>
      )}

      {/* 1. Modal: Create / Edit Dialog Overlay */}
      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div 
            className="fixed inset-0 bg-black/40 backdrop-blur-sm transition-opacity" 
            onClick={() => !isPending && setModalOpen(false)}
          />

          <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl max-w-lg w-full p-6 shadow-xl relative z-10 animate-in fade-in zoom-in-95 duration-200 max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                {editingProject ? 'Edit Showcase Project' : 'Add Showcase Project'}
              </h3>
              <button 
                onClick={() => !isPending && setModalOpen(false)}
                className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200"
                disabled={isPending}
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Project Title"
                placeholder="e.g. Science Fair Robotics Arm"
                error={errors.title?.message}
                {...register('title')}
                disabled={isPending}
              />

              <Textarea
                label="Description"
                placeholder="Describe your project, what problem it solves, what you learned, and how it works..."
                rows={4}
                error={errors.description?.message}
                {...register('description')}
                disabled={isPending}
              />

              {/* Technologies tag input */}
              <Controller
                name="technologies"
                control={control}
                render={({ field }) => (
                  <TagInput
                    label="Technologies / Subjects Used"
                    placeholder="e.g. Next.js, Python, Arduino, Physics (Press Enter)"
                    value={field.value}
                    onChange={field.onChange}
                    error={errors.technologies?.message}
                  />
                )}
              />

              {/* Project Image Uploader */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300">
                  Project Screenshot / Cover Image (Optional)
                </label>
                <div className="flex items-center gap-4">
                  <div className="w-24 h-16 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950 flex items-center justify-center overflow-hidden shrink-0">
                    {projectImageUrl ? (
                      <img src={projectImageUrl} alt="Project Preview" className="w-full h-full object-cover" />
                    ) : (
                      <ImageIcon className="w-6 h-6 text-zinc-400" />
                    )}
                  </div>
                  <div className="flex-1">
                    <input
                      type="file"
                      id="projectImage"
                      onChange={handleImageUpload}
                      accept="image/jpeg,image/png,image/webp"
                      className="hidden"
                      disabled={uploadingImage || isPending}
                    />
                    <label
                      htmlFor="projectImage"
                      className={`inline-flex px-3 py-2 text-xs font-semibold rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-350 bg-white dark:bg-zinc-900 cursor-pointer hover:bg-zinc-50 transition-colors ${
                        uploadingImage || isPending ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      {uploadingImage ? 'Uploading...' : 'Choose Image'}
                    </label>
                    <span className="block text-[10px] text-zinc-400 mt-1">JPEG, PNG, WebP (Max. 5MB)</span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Repository URL (e.g. GitHub)"
                  placeholder="https://github.com/..."
                  error={errors.githubUrl?.message}
                  {...register('githubUrl')}
                  disabled={isPending}
                />

                <Input
                  label="Live Site URL"
                  placeholder="https://my-demo.com"
                  error={errors.liveUrl?.message}
                  {...register('liveUrl')}
                  disabled={isPending}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Input
                  label="Project Completion Date"
                  type="date"
                  error={errors.projectDate?.message}
                  {...register('projectDate')}
                  disabled={isPending}
                />

                <div className="flex items-center h-full pt-6">
                  <label className="flex items-center gap-2.5 cursor-pointer">
                    <input
                      type="checkbox"
                      className="h-4.5 w-4.5 rounded border-zinc-300 text-indigo-600 focus:ring-indigo-500"
                      {...register('isVisible')}
                      disabled={isPending}
                    />
                    <div>
                      <span className="block text-xs font-semibold text-zinc-700 dark:text-zinc-300">Visible to classmates</span>
                    </div>
                  </label>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-800/50 mt-6">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  disabled={isPending}
                  className="px-4 py-2 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 transition-colors disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isPending || uploadingImage}
                  className="px-4 py-2 text-xs font-semibold rounded-xl text-white bg-indigo-600 hover:bg-indigo-750 transition-colors flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isPending ? (
                    <>
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      Saving...
                    </>
                  ) : (
                    'Save Project'
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* 2. Dialog: Delete Confirmation Overlay */}
      <ConfirmationDialog
        isOpen={deleteConfirmId !== null}
        title="Delete Project?"
        description="Are you sure you want to remove this project? This will permanently delete the project record and its reference from your portfolio showcase. This action cannot be undone."
        confirmText="Delete Project"
        cancelText="Cancel"
        isDestructive={true}
        onConfirm={handleDelete}
        onCancel={() => setDeleteConfirmId(null)}
      />
    </div>
  )
}
export default ProjectsList
