import { useRef, useState, useCallback } from 'react'
import { Student } from '../types'
import { parseGradebookCSV } from '../utils/seatingAlgorithm'

let manualIdCounter = 0

interface Props {
  students: Student[]
  onStudentsChange: (students: Student[]) => void
  onNext: () => void
  onBack: () => void
  addToast: (msg: string, type?: 'success' | 'info' | 'warning') => void
}

function getInitials(name: string): string {
  const parts = name.split(',')
  if (parts.length >= 2) {
    return (parts[1].trim().charAt(0) + parts[0].trim().charAt(0)).toUpperCase()
  }
  const words = name.trim().split(/\s+/)
  return words.map(w => w.charAt(0)).slice(0, 2).join('').toUpperCase()
}

const avatarColors = [
  'from-blue-400 to-blue-600',
  'from-emerald-400 to-emerald-600',
  'from-violet-400 to-violet-600',
  'from-amber-400 to-amber-600',
  'from-rose-400 to-rose-600',
  'from-cyan-400 to-cyan-600',
  'from-fuchsia-400 to-fuchsia-600',
  'from-teal-400 to-teal-600',
]

function getAvatarColor(name: string): string {
  let hash = 0
  for (let i = 0; i < name.length; i++) hash = (hash << 5) - hash + name.charCodeAt(i)
  return avatarColors[Math.abs(hash) % avatarColors.length]
}

export default function GradebookManager({ students, onStudentsChange, onNext, onBack, addToast }: Props) {
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [addName, setAddName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')
  const [search, setSearch] = useState('')
  const [isDragOver, setIsDragOver] = useState(false)
  const [confirmClear, setConfirmClear] = useState(false)

  function handleCSV(text: string) {
    const parsed = parseGradebookCSV(text)
    if (parsed.length > 0) {
      onStudentsChange(parsed)
      addToast(`Imported ${parsed.length} students from CSV`)
    } else {
      addToast('No students found in CSV', 'warning')
    }
  }

  function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (evt) => handleCSV(evt.target?.result as string)
    reader.onerror = () => addToast('Failed to read file', 'warning')
    reader.readAsText(file)
    e.target.value = ''
  }

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(true)
  }, [])

  const handleDragLeave = useCallback(() => setIsDragOver(false), [])

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault()
    setIsDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file && (file.name.endsWith('.csv') || file.type === 'text/csv')) {
      const reader = new FileReader()
      reader.onload = (evt) => handleCSV(evt.target?.result as string)
      reader.onerror = () => addToast('Failed to read file', 'warning')
      reader.readAsText(file)
    } else {
      addToast('Please drop a .csv file', 'warning')
    }
  }, [])

  function addStudent() {
    const trimmed = addName.trim()
    if (!trimmed) return
    if (trimmed.length > 100) {
      addToast('Name is too long (max 100 characters)', 'warning')
      return
    }
    const isDuplicate = students.some(s => s.name.toLowerCase() === trimmed.toLowerCase())
    if (isDuplicate) {
      addToast(`"${trimmed}" is already in the roster`, 'warning')
      return
    }
    const newStudent: Student = {
      id: `manual_${++manualIdCounter}_${Math.random().toString(36).slice(2, 8)}`,
      name: trimmed,
      grade: '',
      scores: {},
      performanceLevel: 'ungraded',
    }
    onStudentsChange([...students, newStudent])
    setAddName('')
    addToast(`Added ${trimmed}`)
  }

  function removeStudent(id: string) {
    const name = students.find(s => s.id === id)?.name || 'Student'
    onStudentsChange(students.filter(s => s.id !== id))
    addToast(`Removed ${name}`, 'info')
  }

  function startEdit(student: Student) {
    setEditingId(student.id)
    setEditName(student.name)
  }

  function saveEdit() {
    if (!editingId) return
    onStudentsChange(
      students.map(s => (s.id === editingId ? { ...s, name: editName.trim() || s.name } : s)),
    )
    setEditingId(null)
    setEditName('')
  }

  function cyclePerformance(id: string) {
    const levels: Student['performanceLevel'][] = ['high', 'medium', 'low', 'ungraded']
    onStudentsChange(
      students.map(s => {
        if (s.id !== id) return s
        const idx = levels.indexOf(s.performanceLevel)
        return { ...s, performanceLevel: levels[(idx + 1) % levels.length] }
      }),
    )
  }

  const levelStyles: Record<Student['performanceLevel'], { bg: string; text: string; label: string; dot: string }> = {
    high:     { bg: 'bg-emerald-50', text: 'text-emerald-700', label: 'High',   dot: 'bg-emerald-400' },
    medium:   { bg: 'bg-amber-50',   text: 'text-amber-700',   label: 'Medium', dot: 'bg-amber-400' },
    low:      { bg: 'bg-red-50',     text: 'text-red-700',     label: 'Low',    dot: 'bg-red-400' },
    ungraded: { bg: 'bg-gray-100',   text: 'text-gray-500',    label: 'N/A',    dot: 'bg-gray-400' },
  }

  const filtered = search
    ? students.filter(s => s.name.toLowerCase().includes(search.toLowerCase()))
    : students

  const counts = {
    high: students.filter(s => s.performanceLevel === 'high').length,
    medium: students.filter(s => s.performanceLevel === 'medium').length,
    low: students.filter(s => s.performanceLevel === 'low').length,
    ungraded: students.filter(s => s.performanceLevel === 'ungraded').length,
  }

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex items-end justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900 tracking-tight">Student Roster</h2>
          <p className="text-sm text-gray-500 mt-1">Import a CSV gradebook or add students manually. Click the level badge to adjust.</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={onBack}
            className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all active:scale-95"
          >
            &larr; Layout
          </button>
          <button
            onClick={onNext}
            disabled={students.length === 0}
            className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm transition-all shadow-md shadow-blue-200 hover:shadow-lg disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            Next: Generate Chart &rarr;
          </button>
        </div>
      </div>

      {/* ── Drag-drop upload zone ──────────────────────────── */}
      <div
        role="button"
        tabIndex={0}
        aria-label="Upload CSV file. Click to browse or drag and drop."
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`card p-8 flex flex-col items-center justify-center text-center transition-all cursor-pointer ${
          isDragOver ? 'dropzone-active !border-blue-400' : ''
        }`}
        onClick={() => fileInputRef.current?.click()}
        onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); fileInputRef.current?.click() } }}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept=".csv"
          onChange={handleFileUpload}
          className="hidden"
        />
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center mb-3 transition-colors ${
          isDragOver ? 'bg-blue-100' : 'bg-gray-100'
        }`}>
          <svg className={`w-7 h-7 ${isDragOver ? 'text-blue-600' : 'text-gray-400'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
          </svg>
        </div>
        <p className="text-sm font-semibold text-gray-700">
          {isDragOver ? 'Drop your CSV here' : 'Drag & drop a CSV file, or click to browse'}
        </p>
        <p className="text-xs text-gray-400 mt-1">Supports standard gradebook exports (Student ID, Name, Grade, Scores)</p>
      </div>

      {/* ── Add manually ───────────────────────────────────── */}
      <div className="card p-4">
        <div className="flex gap-2">
          <input
            type="text"
            value={addName}
            onChange={e => setAddName(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addStudent()}
            placeholder="Type a student name (Last, First) and press Enter"
            maxLength={100}
            className="flex-1 border border-gray-200 rounded-xl px-4 py-2.5 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 hover:bg-white transition-colors placeholder:text-gray-400"
          />
          <button
            onClick={addStudent}
            disabled={!addName.trim()}
            className="px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold text-sm transition-all shadow-sm disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
          >
            + Add
          </button>
        </div>
      </div>

      {/* ── Student list ───────────────────────────────────── */}
      <div className="card p-5">
        {/* List header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <h3 className="text-lg font-bold text-gray-900">{students.length} Students</h3>
            {students.length > 0 && (
              <button
                onClick={() => {
                  if (!confirmClear) {
                    setConfirmClear(true)
                    setTimeout(() => setConfirmClear(false), 3000)
                    return
                  }
                  onStudentsChange([])
                  setConfirmClear(false)
                  addToast('All students removed', 'info')
                }}
                className={`text-xs font-medium transition-all ${
                  confirmClear
                    ? 'text-white bg-red-500 px-2 py-0.5 rounded-md animate-pulse'
                    : 'text-red-500 hover:text-red-700'
                }`}
              >
                {confirmClear ? 'Click again to confirm' : 'Clear all'}
              </button>
            )}
          </div>

          {/* Level breakdown */}
          <div className="flex gap-1.5">
            {(['high', 'medium', 'low', 'ungraded'] as const).map(level => (
              <div
                key={level}
                className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold ${levelStyles[level].bg} ${levelStyles[level].text}`}
              >
                <div className={`w-2 h-2 rounded-full ${levelStyles[level].dot}`} />
                {counts[level]}
              </div>
            ))}
          </div>
        </div>

        {/* Search */}
        {students.length > 5 && (
          <div className="mb-3">
            <div className="relative">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <circle cx="11" cy="11" r="8" />
                <path strokeLinecap="round" d="m21 21-4.35-4.35" />
              </svg>
              <input
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search students..."
                className="w-full pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50"
              />
            </div>
          </div>
        )}

        {students.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3">
              <svg className="w-8 h-8 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
              </svg>
            </div>
            <p className="text-gray-500 font-semibold">No students yet</p>
            <p className="text-sm text-gray-400 mt-1">Upload a CSV or add them one by one above</p>
          </div>
        ) : (
          <div className="space-y-1 max-h-[440px] overflow-y-auto custom-scroll stagger-children">
            {filtered.map((student) => {
              const ls = levelStyles[student.performanceLevel]
              return (
                <div
                  key={student.id}
                  className="flex items-center gap-3 px-3 py-2.5 rounded-xl hover:bg-gray-50 group transition-colors animate-fade-in"
                >
                  {/* Avatar */}
                  <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${getAvatarColor(student.name)} text-white text-xs font-bold flex items-center justify-center shadow-sm flex-shrink-0`}>
                    {getInitials(student.name)}
                  </div>

                  {/* Name */}
                  {editingId === student.id ? (
                    <input
                      autoFocus
                      value={editName}
                      onChange={e => setEditName(e.target.value)}
                      onBlur={saveEdit}
                      onKeyDown={e => {
                        if (e.key === 'Enter') saveEdit()
                        if (e.key === 'Escape') { setEditingId(null); setEditName('') }
                      }}
                      className="flex-1 border border-blue-400 rounded-lg px-2.5 py-1 text-sm outline-none ring-2 ring-blue-200"
                    />
                  ) : (
                    <span
                      className="flex-1 text-sm font-medium text-gray-800 cursor-pointer hover:text-blue-600 transition-colors"
                      onDoubleClick={() => startEdit(student)}
                      title="Double-click to edit"
                    >
                      {student.name}
                    </span>
                  )}

                  {/* Level badge */}
                  <button
                    onClick={() => cyclePerformance(student.id)}
                    className={`px-2.5 py-1 rounded-lg text-xs font-bold border transition-all hover:scale-105 active:scale-95 ${ls.bg} ${ls.text} border-transparent`}
                    title="Click to cycle performance level"
                  >
                    {ls.label}
                  </button>

                  {/* Delete */}
                  <button
                    onClick={() => removeStudent(student.id)}
                    aria-label={`Remove ${student.name}`}
                    className="w-7 h-7 rounded-lg flex items-center justify-center text-gray-200 hover:text-red-500 hover:bg-red-50 transition-all sm:opacity-0 sm:group-hover:opacity-100 focus:opacity-100"
                    title="Remove student"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              )
            })}
            {search && filtered.length === 0 && (
              <p className="text-center text-sm text-gray-400 py-4">No matches for "{search}"</p>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
