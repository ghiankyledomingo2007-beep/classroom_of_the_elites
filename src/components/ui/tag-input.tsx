'use client'

import React, { useState } from 'react'
import { X } from 'lucide-react'

export interface TagInputProps {
  label?: string
  placeholder?: string
  value: string[]
  onChange: (value: string[]) => void
  error?: string
}

export function TagInput({
  label,
  placeholder = 'Type and press Enter or comma...',
  value = [],
  onChange,
  error
}: TagInputProps) {
  const [inputValue, setInputValue] = useState('')

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' || e.key === ',') {
      e.preventDefault()
      const trimmed = inputValue.trim().replace(/^,+|,+$/g, '')
      if (trimmed && !value.includes(trimmed)) {
        onChange([...value, trimmed])
      }
      setInputValue('')
    }
  }

  const handleRemove = (tag: string) => {
    onChange(value.filter((t) => t !== tag))
  }

  return (
    <div className="w-full">
      {label && (
        <label className="block text-sm font-medium text-zinc-700 dark:text-zinc-300 mb-1.5">
          {label}
        </label>
      )}
      <div className={`min-h-[44px] p-1.5 flex flex-wrap gap-2 w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 focus-within:ring-2 focus-within:ring-indigo-500/20 focus-within:border-indigo-500 dark:focus-within:border-indigo-500 transition-all ${
        error ? 'border-rose-500' : ''
      }`}>
        {value.map((tag) => (
          <span
            key={tag}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-medium bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200 border border-zinc-200/50 dark:border-zinc-700"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemove(tag)}
              className="text-zinc-400 hover:text-zinc-600 dark:hover:text-zinc-200 focus:outline-none"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </span>
        ))}
        <input
          type="text"
          value={inputValue}
          onChange={(e) => setInputValue(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={value.length === 0 ? placeholder : ''}
          className="flex-1 min-w-[120px] px-2 py-1 text-sm bg-transparent border-0 focus:outline-none focus:ring-0 text-zinc-900 dark:text-zinc-50 placeholder-zinc-400"
        />
      </div>
      {error && (
        <p className="mt-1 text-xs text-rose-500 font-medium">{error}</p>
      )}
    </div>
  )
}
