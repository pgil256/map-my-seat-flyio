import { FurnitureType } from '../types'

// ── Avatar & Display ────────────────────────────────────────

export function getInitials(name: string): string {
  const parts = name.split(',')
  if (parts.length >= 2) {
    return (parts[1].trim().charAt(0) + parts[0].trim().charAt(0)).toUpperCase()
  }
  const words = name.trim().split(/\s+/)
  return words.map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase()
}

export function getDisplayName(name: string): string {
  const parts = name.split(',')
  if (parts.length >= 2) {
    const firstName = parts[1].trim().split(' ')[0]
    const last = parts[0].trim()
    return `${firstName} ${last.charAt(0)}.`
  }
  return name
}

export const avatarColors = [
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-violet-400 to-violet-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
  'from-cyan-400 to-cyan-600',
  'from-fuchsia-400 to-fuchsia-600',
  'from-teal-400 to-teal-600',
]

export function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

// ── Furniture ───────────────────────────────────────────────

export function getEffectiveSpan(f: { colSpan: number; rowSpan: number; rotated?: boolean }) {
  if (f.rotated) return { cs: f.rowSpan || 1, rs: f.colSpan || 1 }
  return { cs: f.colSpan || 1, rs: f.rowSpan || 1 }
}

export const furnitureConfig: Record<FurnitureType, { icon: string; color: string }> = {
  'teacher-desk':    { icon: '\u{1F5A5}\uFE0F', color: 'from-gray-600 to-gray-800' },
  'student-desk':    { icon: '\u{1FA91}', color: 'from-blue-500 to-cyan-600' },
  'bookshelf':       { icon: '\u{1F4DA}', color: 'from-amber-600 to-amber-800' },
  'filing-cabinet':  { icon: '\u{1F5C4}\uFE0F', color: 'from-slate-500 to-slate-700' },
  'rug':             { icon: '\u{1F7EB}', color: 'from-orange-400 to-orange-600' },
  'table':           { icon: '\u{1F37D}\uFE0F', color: 'from-yellow-600 to-yellow-800' },
  'whiteboard':      { icon: '\u{1F4CB}', color: 'from-sky-400 to-sky-600' },
  'door':            { icon: '\u{1F6AA}', color: 'from-stone-500 to-stone-700' },
  'window':          { icon: '\u{1FA9F}', color: 'from-cyan-400 to-cyan-600' },
}

// ── Performance Level Config ────────────────────────────────

export const levelConfig = {
  high:     { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', gradient: 'from-emerald-50 to-emerald-100', dot: 'bg-emerald-400', ring: 'ring-emerald-200', label: 'High' },
  medium:   { bg: 'bg-amber-50',   border: 'border-amber-200',   text: 'text-amber-800',   gradient: 'from-amber-50 to-amber-100',   dot: 'bg-amber-400',   ring: 'ring-amber-200',   label: 'Medium' },
  low:      { bg: 'bg-red-50',     border: 'border-red-200',     text: 'text-red-800',     gradient: 'from-red-50 to-red-100',       dot: 'bg-red-400',     ring: 'ring-red-200',     label: 'Low' },
  ungraded: { bg: 'bg-slate-50',   border: 'border-slate-200',   text: 'text-slate-700',   gradient: 'from-slate-50 to-slate-100',   dot: 'bg-slate-400',   ring: 'ring-slate-200',   label: 'N/A' },
} as const

export const levelStyles: Record<string, { bg: string; text: string; label: string; dot: string }> = {
  high:     { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'High',   dot: 'bg-emerald-400' },
  medium:   { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Medium', dot: 'bg-amber-400' },
  low:      { bg: 'bg-red-50',     text: 'text-red-700',     label: 'Low',    dot: 'bg-red-400' },
  ungraded: { bg: 'bg-gray-100',   text: 'text-gray-500',    label: 'N/A',    dot: 'bg-gray-400' },
}

// ── HTML helpers ────────────────────────────────────────────

export function escapeHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
}
