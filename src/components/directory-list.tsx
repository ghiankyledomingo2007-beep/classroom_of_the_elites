'use client'

import React, { useState, useMemo } from 'react'
import Link from 'next/link'
import { Search, Github, Globe, ArrowUpRight, GraduationCap } from 'lucide-react'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export interface ClassmateProfile {
  id: string
  full_name: string
  nickname: string | null
  username: string
  bio: string | null
  avatar_url: string | null
  profile_accent: string
  skills: string[]
  interests: string[]
  favorite_subjects: string[]
  github_url: string | null
  website_url: string | null
  show_external_links: boolean
  points?: number
  tier?: string
  student_id_code?: string
}

export function DirectoryList({
  classmates,
  currentUserId
}: {
  classmates: ClassmateProfile[]
  currentUserId: string
}) {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedSkill, setSelectedSkill] = useState('')
  const [selectedInterest, setSelectedInterest] = useState('')
  const [selectedSubject, setSelectedSubject] = useState('')

  // 1. Gather all unique skills, interests, and subjects from classmates for filter options
  const filterOptions = useMemo(() => {
    const skills = new Set<string>()
    const interests = new Set<string>()
    const subjects = new Set<string>()

    classmates.forEach((c) => {
      c.skills?.forEach((s) => s && skills.add(s))
      c.interests?.forEach((i) => i && interests.add(i))
      c.favorite_subjects?.forEach((sub) => sub && subjects.add(sub))
    })

    return {
      skills: Array.from(skills).sort(),
      interests: Array.from(interests).sort(),
      subjects: Array.from(subjects).sort()
    }
  }, [classmates])

  // 2. Perform Filtering
  const filteredClassmates = useMemo(() => {
    return classmates.filter((c) => {
      // Search term match
      const query = searchTerm.toLowerCase().trim()
      const matchesSearch =
        !query ||
        c.full_name.toLowerCase().includes(query) ||
        (c.nickname && c.nickname.toLowerCase().includes(query)) ||
        c.username.toLowerCase().includes(query) ||
        c.bio?.toLowerCase().includes(query) ||
        c.skills?.some((s) => s.toLowerCase().includes(query)) ||
        c.interests?.some((i) => i.toLowerCase().includes(query)) ||
        c.favorite_subjects?.some((sub) => sub.toLowerCase().includes(query))

      // Filter matches
      const matchesSkill = !selectedSkill || c.skills?.includes(selectedSkill)
      const matchesInterest = !selectedInterest || c.interests?.includes(selectedInterest)
      const matchesSubject = !selectedSubject || c.favorite_subjects?.includes(selectedSubject)

      return matchesSearch && matchesSkill && matchesInterest && matchesSubject
    })
  }, [classmates, searchTerm, selectedSkill, selectedInterest, selectedSubject])

  // Reset filters helper
  const handleReset = () => {
    setSearchTerm('')
    setSelectedSkill('')
    setSelectedInterest('')
    setSelectedSubject('')
  }

  // Accent border maps
  const borderAccents: Record<string, string> = {
    indigo: 'border-t-4 border-t-indigo-600',
    blue: 'border-t-4 border-t-blue-600',
    violet: 'border-t-4 border-t-violet-600',
    rose: 'border-t-4 border-t-rose-600',
    emerald: 'border-t-4 border-t-emerald-600',
    orange: 'border-t-4 border-t-orange-600'
  }

  const hoverTextAccents: Record<string, string> = {
    indigo: 'group-hover:text-indigo-600',
    blue: 'group-hover:text-blue-600',
    violet: 'group-hover:text-violet-600',
    rose: 'group-hover:text-rose-600',
    emerald: 'group-hover:text-emerald-600',
    orange: 'group-hover:text-orange-600'
  }

  return (
    <div className="space-y-6">
      {/* Search & Filters Panel */}
      <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-5 rounded-2xl shadow-sm space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, skills, interests, or subjects..."
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 dark:focus:border-indigo-500 transition-all text-sm"
          />
        </div>

        {/* Filter Dropdowns */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          {/* Skill Filter */}
          <div>
            <select
              value={selectedSkill}
              onChange={(e) => setSelectedSkill(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
            >
              <option value="">Filter by Skill</option>
              {filterOptions.skills.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>

          {/* Interest Filter */}
          <div>
            <select
              value={selectedInterest}
              onChange={(e) => setSelectedInterest(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
            >
              <option value="">Filter by Interest</option>
              {filterOptions.interests.map((i) => (
                <option key={i} value={i}>
                  {i}
                </option>
              ))}
            </select>
          </div>

          {/* Subject Filter */}
          <div>
            <select
              value={selectedSubject}
              onChange={(e) => setSelectedSubject(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 text-zinc-900 dark:text-zinc-50 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 text-sm"
            >
              <option value="">Filter by Favorite Subject</option>
              {filterOptions.subjects.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Active Filters / Reset */}
        {(searchTerm || selectedSkill || selectedInterest || selectedSubject) && (
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-zinc-100 dark:border-zinc-800/50">
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="text-zinc-400 font-semibold uppercase">Active filters:</span>
              {searchTerm && <Badge variant="secondary">Keyword: {searchTerm}</Badge>}
              {selectedSkill && <Badge variant="secondary">Skill: {selectedSkill}</Badge>}
              {selectedInterest && <Badge variant="secondary">Interest: {selectedInterest}</Badge>}
              {selectedSubject && <Badge variant="secondary">Subject: {selectedSubject}</Badge>}
            </div>
            <button
              onClick={handleReset}
              className="text-xs font-bold text-indigo-650 hover:text-indigo-500 dark:text-indigo-400 transition-colors"
            >
              Clear all filters
            </button>
          </div>
        )}
      </div>

      {/* Classmates Grid */}
      {filteredClassmates.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredClassmates.map((student) => {
            const accentClass = borderAccents[student.profile_accent] || 'border-t-4 border-t-indigo-600'
            const hoverTextClass = hoverTextAccents[student.profile_accent] || 'group-hover:text-indigo-600'
            
            return (
              <Card
                key={student.id}
                className={`flex flex-col group transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${accentClass}`}
              >
                <CardContent className="p-6 flex-1 flex flex-col justify-between">
                  <div className="space-y-4">
                    {/* COTE ID Bar & CP Points */}
                    <div className="flex items-center justify-between pb-2 border-b border-zinc-100 dark:border-zinc-800/80">
                      <span className="font-mono text-[11px] font-semibold text-zinc-400">
                        {student.student_id_code || `ANHS-${student.id?.slice(0, 4).toUpperCase()}`}
                      </span>
                      <div className="flex items-center gap-1.5">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase bg-rose-50 dark:bg-rose-950/40 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-900/40">
                          {student.tier?.split('•')[0] || 'Class A'}
                        </span>
                        <span className="font-mono text-xs font-extrabold text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/40 px-2 py-0.5 rounded-md border border-amber-200 dark:border-amber-900/40">
                          {(student.points ?? 500).toLocaleString()} CP
                        </span>
                      </div>
                    </div>

                    {/* Top row: Avatar & Nickname */}
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex items-center gap-3">
                        {student.avatar_url ? (
                          <img
                            src={student.avatar_url}
                            alt={student.full_name}
                            className="w-12 h-12 rounded-2xl object-cover border border-zinc-200 dark:border-zinc-800 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 rounded-2xl bg-zinc-100 dark:bg-zinc-800 flex items-center justify-center border border-zinc-200 dark:border-zinc-800 text-zinc-500">
                            <span className="font-bold text-base">
                              {student.nickname ? student.nickname.substring(0, 2).toUpperCase() : student.full_name.substring(0, 2).toUpperCase()}
                            </span>
                          </div>
                        )}
                        <div>
                          <h3 className={`font-bold text-base text-zinc-900 dark:text-white leading-tight ${hoverTextClass} transition-colors`}>
                            {student.full_name}
                          </h3>
                          {student.nickname && (
                            <span className="text-xs text-zinc-400 font-medium">
                              "{student.nickname}"
                            </span>
                          )}
                        </div>
                      </div>

                      {/* External links icons */}
                      {student.show_external_links && student.github_url && (
                        <a
                          href={student.github_url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                        >
                          <Github className="w-4 h-4" />
                        </a>
                      )}
                    </div>

                    {/* Biography */}
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 line-clamp-3 leading-relaxed">
                      {student.bio || 'This student has not written a biography yet.'}
                    </p>

                    {/* Skills / Interests previews */}
                    <div className="space-y-1.5 pt-2">
                      {student.skills && student.skills.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {student.skills.slice(0, 3).map((skill) => (
                            <Badge key={skill} className="px-1.5 py-0.5 text-[10px]">
                              {skill}
                            </Badge>
                          ))}
                          {student.skills.length > 3 && (
                            <span className="text-[10px] text-zinc-400 font-semibold px-1 py-0.5">
                              +{student.skills.length - 3} more
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions / View Profile button */}
                  <div className="mt-6 pt-4 border-t border-zinc-100 dark:border-zinc-800/50">
                    <Link
                      href={`/profile/${student.username}`}
                      className="w-full flex items-center justify-center gap-1.5 py-2 px-3 text-xs font-semibold rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-50 dark:hover:bg-zinc-800/50 hover:border-zinc-300 dark:hover:border-zinc-700 text-zinc-700 dark:text-zinc-300 transition-colors"
                    >
                      View Showcase Profile
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      ) : (
        <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-12 rounded-2xl shadow-sm text-center">
          <div className="w-12 h-12 bg-zinc-100 dark:bg-zinc-800 rounded-full flex items-center justify-center mx-auto text-zinc-400 mb-4">
            <GraduationCap className="w-6 h-6" />
          </div>
          <h3 className="font-bold text-lg text-zinc-900 dark:text-white">No classmates found</h3>
          <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1 max-w-sm mx-auto">
            Try adjusting your keyword search or filters to discover other students.
          </p>
          <button
            onClick={handleReset}
            className="mt-4 px-4 py-2 text-xs font-semibold text-white bg-indigo-600 hover:bg-indigo-700 rounded-xl transition-colors"
          >
            Reset Filters
          </button>
        </div>
      )}
    </div>
  )
}
export default DirectoryList
