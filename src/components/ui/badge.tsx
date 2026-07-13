import React from 'react'

export function Badge({ className = '', children, variant = 'default', ...props }: React.HTMLAttributes<HTMLSpanElement> & {
  variant?: 'default' | 'success' | 'warning' | 'danger' | 'info' | 'secondary'
}) {
  const baseStyles = 'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold transition-all duration-200'
  const variants = {
    default: 'bg-zinc-100 text-zinc-800 dark:bg-zinc-800 dark:text-zinc-200',
    secondary: 'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/50 dark:text-indigo-300',
    success: 'bg-emerald-50 text-emerald-700 dark:bg-emerald-950/50 dark:text-emerald-300',
    warning: 'bg-amber-50 text-amber-700 dark:bg-amber-950/50 dark:text-amber-300',
    danger: 'bg-rose-50 text-rose-700 dark:bg-rose-950/50 dark:text-rose-300',
    info: 'bg-blue-50 text-blue-700 dark:bg-blue-950/50 dark:text-blue-300'
  }

  return (
    <span className={`${baseStyles} ${variants[variant]} ${className}`} {...props}>
      {children}
    </span>
  )
}

export function StatusBadge({ status }: { status: string }) {
  const mappedStatus = status.toLowerCase()
  if (mappedStatus === 'approved') return <Badge variant="success">Approved</Badge>
  if (mappedStatus === 'pending') return <Badge variant="warning">Pending</Badge>
  if (mappedStatus === 'rejected') return <Badge variant="danger">Rejected</Badge>
  if (mappedStatus === 'deactivated') return <Badge variant="default">Deactivated</Badge>
  return <Badge variant="default">{status}</Badge>
}
