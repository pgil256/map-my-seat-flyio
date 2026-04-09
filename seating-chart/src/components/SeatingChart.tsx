import React, { useState, useRef, useMemo, useCallback } from 'react'
import { ClassroomLayout, Student, SeatAssignment, SeatingConfig } from '../types'
import { generateSeatingChart } from '../utils/seatingAlgorithm'
import { getInitials, getDisplayName, getAvatarColor, getEffectiveSpan, furnitureConfig, levelConfig, escapeHtml } from '../utils/helpers'

interface Props {
  layout: ClassroomLayout
  students: Student[]
  onBack: () => void
  addToast: (msg: string, type?: 'success' | 'info' | 'warning') => void
}

const strategies: { key: SeatingConfig['strategy']; label: string; description: string; icon: React.ReactNode }[] = [
  {
    key: 'random',
    label: 'Random',
    description: 'Shuffle all students randomly',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 12c0-1.232-.046-2.453-.138-3.662a4.006 4.006 0 00-3.7-3.7 48.678 48.678 0 00-7.324 0 4.006 4.006 0 00-3.7 3.7c-.017.22-.032.441-.046.662M19.5 12l3-3m-3 3l-3-3m-12 3c0 1.232.046 2.453.138 3.662a4.006 4.006 0 003.7 3.7 48.656 48.656 0 007.324 0 4.006 4.006 0 003.7-3.7c.017-.22.032-.441.046-.662M4.5 12l3 3m-3-3l-3 3" />
      </svg>
    ),
  },
  {
    key: 'alphabetical',
    label: 'A to Z',
    description: 'Sort alphabetically by name',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25H12" />
      </svg>
    ),
  },
  {
    key: 'mixed',
    label: 'Mixed',
    description: 'Pair high performers with low',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
      </svg>
    ),
  },
  {
    key: 'grouped',
    label: 'Grouped',
    description: 'Cluster students by level',
    icon: (
      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
        <path strokeLinecap="round" strokeLinejoin="round" d="M6 6.878V6a2.25 2.25 0 012.25-2.25h7.5A2.25 2.25 0 0118 6v.878m-12 0c.235-.083.487-.128.75-.128h10.5c.263 0 .515.045.75.128m-12 0A2.25 2.25 0 004.5 9v.878m13.5-3A2.25 2.25 0 0119.5 9v.878m0 0a2.246 2.246 0 00-.75-.128H5.25c-.263 0-.515.045-.75.128m15 0A2.25 2.25 0 0121 12v6a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 18v-6c0-.98.626-1.813 1.5-2.122" />
      </svg>
    ),
  },
]

function buildPrintDocument(title: string, contentHtml: string): string {
  const styles = [
    '* { margin: 0; padding: 0; box-sizing: border-box; }',
    "body { font-family: 'Inter', system-ui, sans-serif; padding: 24px; color: #1e293b; }",
    'h1 { font-size: 22px; font-weight: 700; margin-bottom: 2px; }',
    '.meta { color: #64748b; font-size: 12px; margin-bottom: 18px; }',
    '.front-label { text-align: center; font-size: 10px; color: #94a3b8; text-transform: uppercase; letter-spacing: 3px; font-weight: 700; margin-bottom: 6px; }',
    '.front-bar { height: 3px; background: #1e293b; border-radius: 2px; margin-bottom: 20px; }',
    '.grid { display: inline-grid; gap: 8px; }',
    '.seat { border: 2px solid #e2e8f0; border-radius: 10px; padding: 8px 4px; text-align: center; font-size: 11px; font-weight: 600; display: flex; flex-direction: column; align-items: center; justify-content: center; min-height: 60px; }',
    '.seat.high { background: #ecfdf5; border-color: #a7f3d0; }',
    '.seat.medium { background: #fffbeb; border-color: #fde68a; }',
    '.seat.low { background: #fef2f2; border-color: #fecaca; }',
    '.seat.ungraded { background: #f8fafc; border-color: #e2e8f0; }',
    '.seat .initials { width: 24px; height: 24px; border-radius: 6px; display: flex; align-items: center; justify-content: center; font-size: 9px; font-weight: 800; color: white; margin-bottom: 4px; }',
    '.double { display: flex; border: 2px solid #e2e8f0; border-radius: 10px; overflow: hidden; }',
    '.double .seat { border: none; border-radius: 0; flex: 1; }',
    '.double .seat + .seat { border-left: 1px solid #e2e8f0; }',
    '.empty-cell { min-height: 60px; }',
    '.legend { display: flex; gap: 20px; margin-top: 20px; font-size: 11px; }',
    '.legend-item { display: flex; align-items: center; gap: 5px; }',
    '.legend-dot { width: 10px; height: 10px; border-radius: 50%; }',
    '.roster { margin-top: 24px; columns: 3; gap: 8px; font-size: 11px; }',
    '.roster-item { break-inside: avoid; padding: 3px 0; display: flex; align-items: center; gap: 6px; }',
    '.roster-dot { width: 6px; height: 6px; border-radius: 50%; flex-shrink: 0; }',
    '.roster-pos { color: #94a3b8; font-family: monospace; font-size: 10px; }',
    '@media print { body { padding: 12px; } }',
  ].join('\n')

  return `<!DOCTYPE html><html><head><title>${escapeHtml(title)}</title><style>${styles}</style></head><body>${contentHtml}</body></html>`
}

// ── Component ────────────────────────────────────────────
export default function SeatingChart({ layout, students, onBack, addToast }: Props) {
  const [assignments, setAssignments] = useState<SeatAssignment[]>([])
  const [strategy, setStrategy] = useState<SeatingConfig['strategy']>('random')
  const [generated, setGenerated] = useState(false)
  const [animKey, setAnimKey] = useState(0)
  const [swapMode, setSwapMode] = useState(false)
  const [swapFirst, setSwapFirst] = useState<{ deskId: string; seatIndex: number } | null>(null)
  const [lockedSeats, setLockedSeats] = useState<Set<string>>(new Set())
  const printRef = useRef<HTMLDivElement>(null)

  function generate() {
    const result = generateSeatingChart(students, layout.desks, { strategy })
    setAssignments(result)
    setGenerated(true)
    setAnimKey(k => k + 1)
    setSwapMode(false)
    setSwapFirst(null)
    addToast(`Seating chart generated (${strategy})`)
  }

  function reshuffle() {
    const locked = assignments.filter(a => lockedSeats.has(`${a.deskId}-${a.seatIndex}`))
    const lockedStudentIds = new Set(locked.map(a => a.studentId))
    const unlockedStudents = students.filter(s => !lockedStudentIds.has(s.id))
    const freshResult = generateSeatingChart(unlockedStudents, layout.desks, { strategy })
    const lockedPositions = new Set(locked.map(a => `${a.deskId}-${a.seatIndex}`))
    const unlockedFromFresh = freshResult.filter(a => !lockedPositions.has(`${a.deskId}-${a.seatIndex}`))

    setAssignments([...locked, ...unlockedFromFresh])
    setAnimKey(k => k + 1)
    setSwapFirst(null)
    addToast(lockedSeats.size > 0
      ? `Reshuffled (${lockedSeats.size} locked seats kept)`
      : 'Reshuffled!')
  }

  const handleSeatClick = useCallback(function handleSeatClick(deskId: string, seatIndex: number) {
    if (!swapMode) return
    const key = `${deskId}-${seatIndex}`
    if (lockedSeats.has(key)) {
      addToast('That seat is locked', 'warning')
      return
    }

    if (!swapFirst) {
      setSwapFirst({ deskId, seatIndex })
    } else {
      const a1 = assignments.find(a => a.deskId === swapFirst.deskId && a.seatIndex === swapFirst.seatIndex)
      const a2 = assignments.find(a => a.deskId === deskId && a.seatIndex === seatIndex)

      if (a1 && a2) {
        setAssignments(prev =>
          prev.map(a => {
            if (a.deskId === swapFirst.deskId && a.seatIndex === swapFirst.seatIndex)
              return { ...a, studentId: a2.studentId }
            if (a.deskId === deskId && a.seatIndex === seatIndex)
              return { ...a, studentId: a1.studentId }
            return a
          }),
        )
        addToast('Students swapped!')
      }
      setSwapFirst(null)
    }
  }, [swapMode, swapFirst, assignments, lockedSeats, addToast])

  const toggleLock = useCallback(function toggleLock(deskId: string, seatIndex: number) {
    const key = `${deskId}-${seatIndex}`
    setLockedSeats(prev => {
      const next = new Set(prev)
      if (next.has(key)) next.delete(key)
      else next.add(key)
      return next
    })
  }, [])

  const studentMap = useMemo(() => new Map(students.map(s => [s.id, s])), [students])
  const assignmentMap = useMemo(() => {
    const m = new Map<string, SeatAssignment>()
    for (const a of assignments) m.set(`${a.deskId}-${a.seatIndex}`, a)
    return m
  }, [assignments])

  function getStudentForSeat(deskId: string, seatIndex: number): Student | undefined {
    const assignment = assignmentMap.get(`${deskId}-${seatIndex}`)
    if (!assignment) return undefined
    return studentMap.get(assignment.studentId)
  }

  const totalSeats = layout.desks.reduce((s, d) => s + (d.type === 'double' ? 2 : 1), 0)
  const unseatedCount = Math.max(0, students.length - totalSeats)
  const emptySeats = Math.max(0, totalSeats - students.length)

  const deskOrder = useMemo(() => {
    const sorted = [...layout.desks].sort((a, b) => a.row - b.row || a.col - b.col)
    return Object.fromEntries(sorted.map((d, i) => [d.id, i]))
  }, [layout.desks])

  function handlePrint() {
    const content = printRef.current
    if (!content) return
    const win = window.open('', '_blank')
    if (!win) {
      addToast('Pop-up blocked — please allow pop-ups for this site', 'warning')
      return
    }

    const title = `${layout.name} - Seating Chart`
    const doc = buildPrintDocument(title, content.innerHTML)
    win.document.open()
    win.document.writeln(doc)
    win.document.close()
    setTimeout(() => win.print(), 200)
  }

  // ── Seat cell renderer ─────────────────────────────────
  function renderSeat(deskId: string, seatIndex: number, delay: number) {
    const student = getStudentForSeat(deskId, seatIndex)
    const seatKey = `${deskId}-${seatIndex}`
    const isLocked = lockedSeats.has(seatKey)
    const isSwapSelected = swapFirst?.deskId === deskId && swapFirst?.seatIndex === seatIndex

    if (!student) {
      return (
        <div className="flex-1 flex items-center justify-center p-1 bg-[repeating-linear-gradient(45deg,transparent,transparent_4px,rgba(0,0,0,0.02)_4px,rgba(0,0,0,0.02)_8px)]">
          <span className="text-[9px] text-gray-200 select-none">—</span>
        </div>
      )
    }

    const lc = levelConfig[student.performanceLevel]

    return (
      <div
        role="button"
        tabIndex={0}
        aria-label={`${student.name}, ${lc.label} performer${isLocked ? ', locked' : ''}${isSwapSelected ? ', selected for swap' : ''}`}
        onClick={() => handleSeatClick(deskId, seatIndex)}
        onDoubleClick={() => toggleLock(deskId, seatIndex)}
        onKeyDown={e => {
          if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); handleSeatClick(deskId, seatIndex) }
          if (e.key === 'l' || e.key === 'L') toggleLock(deskId, seatIndex)
        }}
        className={`flex-1 flex flex-col items-center justify-center p-2 bg-gradient-to-b ${lc.gradient} relative group/seat transition-all ${
          swapMode ? 'cursor-pointer hover:ring-2 hover:ring-yellow-400' : ''
        } ${isSwapSelected ? 'swap-highlight ring-2 ring-yellow-400' : ''}`}
        style={{ animationDelay: `${delay * 0.04}s` }}
        title={`${student.name}\nLevel: ${lc.label}\nDouble-click to ${isLocked ? 'unlock' : 'lock'}`}
      >
        {isLocked && (
          <div className="absolute top-1 right-1">
            <svg className="w-3 h-3 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
            </svg>
          </div>
        )}

        <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${getAvatarColor(student.name)} text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm mb-1`}>
          {getInitials(student.name)}
        </div>

        <span className={`text-[11px] font-semibold leading-tight text-center ${lc.text}`}>
          {getDisplayName(student.name)}
        </span>

        <div className={`w-1.5 h-1.5 rounded-full ${lc.dot} mt-1`} />
      </div>
    )
  }

  // ── Empty states ───────────────────────────────────────
  if (layout.desks.length === 0) {
    return (
      <div className="card p-8 sm:p-16 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <rect x="3" y="3" width="7" height="7" rx="1.5" />
            <rect x="14" y="3" width="7" height="7" rx="1.5" />
            <rect x="3" y="14" width="7" height="7" rx="1.5" />
            <rect x="14" y="14" width="7" height="7" rx="1.5" />
          </svg>
        </div>
        <p className="text-gray-600 font-semibold text-lg">No classroom layout yet</p>
        <p className="text-sm text-gray-400 mt-1">Head to the Layout step to place some desks first.</p>
        <button onClick={onBack} className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all">
          &larr; Go to Layout
        </button>
      </div>
    )
  }

  if (students.length === 0) {
    return (
      <div className="card p-8 sm:p-16 text-center animate-fade-in">
        <div className="w-20 h-20 rounded-3xl bg-gray-100 flex items-center justify-center mx-auto mb-4">
          <svg className="w-10 h-10 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
          </svg>
        </div>
        <p className="text-gray-600 font-semibold text-lg">No students loaded</p>
        <p className="text-sm text-gray-400 mt-1">Import a CSV or add students manually first.</p>
        <button onClick={onBack} className="mt-4 px-5 py-2 bg-blue-600 text-white rounded-xl text-sm font-semibold hover:bg-blue-700 transition-all">
          &larr; Go to Students
        </button>
      </div>
    )
  }

  const cellSize = 100

  return (
    <div className="flex flex-col gap-6">
      {/* ── Header ─────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Seating Chart</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">
            {generated
              ? 'Click two seats in swap mode to exchange. Double-click to lock a seat from reshuffling.'
              : 'Pick a seating strategy, then generate your chart.'}
          </p>
        </div>
        <button
          onClick={onBack}
          className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all active:scale-95"
        >
          &larr; Students
        </button>
      </div>

      {/* ── Strategy cards ─────────────────────────────────── */}
      {!generated && (
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 animate-fade-in" role="radiogroup" aria-label="Seating strategy">
          {strategies.map(s => (
            <button
              key={s.key}
              role="radio"
              aria-checked={strategy === s.key}
              onClick={() => setStrategy(s.key)}
              className={`strategy-card p-4 rounded-xl border-2 text-left cursor-pointer transition-all active:scale-95 ${
                strategy === s.key
                  ? 'border-blue-500 bg-blue-50 shadow-md shadow-blue-100'
                  : 'border-gray-200 bg-white hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-3 ${
                strategy === s.key ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-500'
              }`}>
                {s.icon}
              </div>
              <div className={`text-sm font-bold ${strategy === s.key ? 'text-blue-700' : 'text-gray-700'}`}>
                {s.label}
              </div>
              <div className="text-xs text-gray-500 mt-0.5">{s.description}</div>
            </button>
          ))}
        </div>
      )}

      {/* ── Generate / Controls ────────────────────────────── */}
      <div className="card p-3 sm:p-4 flex flex-wrap items-center gap-2 sm:gap-3">
        {generated && (
          <div className="flex items-center gap-2">
            <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Strategy</label>
            <select
              value={strategy}
              onChange={e => setStrategy(e.target.value as SeatingConfig['strategy'])}
              className="border border-gray-200 rounded-xl px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none bg-gray-50 hover:bg-white transition-colors cursor-pointer"
            >
              {strategies.map(s => (
                <option key={s.key} value={s.key}>{s.label}</option>
              ))}
            </select>
          </div>
        )}

        <button
          onClick={generated ? reshuffle : generate}
          className={`px-6 py-2.5 rounded-xl font-semibold text-sm transition-all shadow-md hover:shadow-lg active:scale-95 flex items-center gap-2 ${
            generated
              ? 'bg-blue-600 text-white shadow-blue-200 hover:bg-blue-700'
              : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-200 hover:from-blue-700 hover:to-indigo-700'
          }`}
        >
          {generated ? (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              Reshuffle
            </>
          ) : (
            <>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
              </svg>
              Generate Chart
            </>
          )}
        </button>

        {generated && (
          <>
            <div className="w-px h-8 bg-gray-200" />

            <button
              onClick={() => { setSwapMode(!swapMode); setSwapFirst(null) }}
              aria-pressed={swapMode}
              className={`px-4 py-2.5 rounded-xl text-sm font-semibold transition-all flex items-center gap-2 active:scale-95 ${
                swapMode
                  ? 'bg-yellow-400 text-yellow-900 shadow-md shadow-yellow-200'
                  : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
              </svg>
              {swapMode ? 'Swapping...' : 'Swap'}
            </button>

            <button
              onClick={handlePrint}
              className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 rounded-xl hover:bg-gray-50 font-semibold text-sm transition-all flex items-center gap-2 active:scale-95"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m0 0a48.955 48.955 0 0110.5 0M3.75 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M18 7.5V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08" />
              </svg>
              Print
            </button>
          </>
        )}

        {/* Stats */}
        <div className="ml-auto flex items-center gap-3 text-sm">
          <span className="text-gray-500 font-medium">{students.length} students</span>
          <span className="text-gray-300">/</span>
          <span className="text-gray-500 font-medium">{totalSeats} seats</span>
          {unseatedCount > 0 && (
            <span className="px-2.5 py-1 bg-red-100 text-red-700 rounded-lg text-xs font-bold animate-pop-in">
              {unseatedCount} unseated
            </span>
          )}
          {emptySeats > 0 && generated && (
            <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-bold">
              {emptySeats} empty
            </span>
          )}
          {lockedSeats.size > 0 && (
            <span className="px-2.5 py-1 bg-blue-100 text-blue-700 rounded-lg text-xs font-bold flex items-center gap-1">
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
              </svg>
              {lockedSeats.size} locked
            </span>
          )}
        </div>
      </div>

      {/* ── Swap mode banner ───────────────────────────────── */}
      {swapMode && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 flex items-center gap-3 animate-fade-in">
          <div className="w-8 h-8 rounded-lg bg-yellow-400 text-yellow-900 flex items-center justify-center flex-shrink-0">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
            </svg>
          </div>
          <div>
            <p className="text-sm font-semibold text-yellow-800">
              {swapFirst ? 'Now click the second seat to swap with' : 'Click the first seat to swap'}
            </p>
            <p className="text-xs text-yellow-600">Click two seats to exchange their students. ESC or click Swap again to cancel.</p>
          </div>
        </div>
      )}

      {/* ── Chart ──────────────────────────────────────────── */}
      {generated && (
        <div ref={printRef}>
          <div className="card p-3 sm:p-8 overflow-auto">
            <h1 className="text-xl font-bold text-gray-900 mb-0.5">{layout.name}</h1>
            <p className="text-xs text-gray-400 mb-5">
              {students.length} students &middot; Strategy: {strategy} &middot; Generated {new Date().toLocaleDateString()}
            </p>

            <div className="flex flex-col items-center mb-5">
              <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-2">Front of Classroom</div>
              <div className="w-full h-[3px] bg-gray-800 rounded" />
            </div>

            {(layout.furniture || []).filter(f => f.row < 0).length > 0 && (
              <div className="flex justify-center mb-3" key={`furn-above-${animKey}`}>
                <div className="flex flex-wrap gap-2 justify-center">
                  {(layout.furniture || []).filter(f => f.row < 0).map(f => {
                    const fc = furnitureConfig[f.type]
                    const { cs } = getEffectiveSpan(f)
                    return (
                      <div
                        key={f.id}
                        className={`rounded-xl bg-gradient-to-br ${fc.color} text-white flex items-center justify-center px-4 py-2 shadow-md`}
                        style={{ minWidth: cs * 80 }}
                      >
                        <span className="mr-2">{fc.icon}</span>
                        <span className="text-xs font-bold">{f.label}</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}

            <div className="flex justify-center" key={animKey}>
              <div
                className="inline-grid relative"
                style={{
                  gridTemplateColumns: `repeat(${layout.cols}, ${cellSize}px)`,
                  gap: '8px',
                }}
              >
                {(layout.furniture || []).filter(f => f.row >= 0).map(f => {
                  const fc = furnitureConfig[f.type]
                  const { cs, rs } = getEffectiveSpan(f)
                  const top = f.row * (cellSize + 8)
                  const left = f.col * (cellSize + 8)
                  const width = cs * (cellSize + 8) - 8
                  const height = rs * (cellSize + 8) - 8
                  return (
                    <div
                      key={f.id}
                      className={`absolute rounded-xl bg-gradient-to-br ${fc.color} text-white flex items-center justify-center shadow-md z-10`}
                      style={{ top, left, width, height }}
                    >
                      <span className="mr-1.5">{fc.icon}</span>
                      <span className="text-[10px] font-bold opacity-90">{f.label}</span>
                    </div>
                  )
                })}

                {Array.from({ length: layout.rows }).map((_, r) =>
                  Array.from({ length: layout.cols }).map((_, c) => {
                    const desk = layout.desks.find(d => d.row === r && d.col === c)
                    const isDoubleRight = layout.desks.find(
                      d => d.type === 'double' && d.row === r && d.col + 1 === c,
                    )
                    const hasFurniture = (layout.furniture || []).some(f => {
                      const { cs, rs } = getEffectiveSpan(f)
                      return r >= f.row && r < f.row + rs && c >= f.col && c < f.col + cs
                    })

                    if (isDoubleRight) return null
                    if (hasFurniture) return <div key={`${r}-${c}`} style={{ height: cellSize }} />

                    const delay = desk ? (deskOrder[desk.id] ?? 0) : 0

                    if (desk && desk.type === 'double') {
                      return (
                        <div
                          key={`${r}-${c}`}
                          className="rounded-xl border-2 border-gray-200 flex overflow-hidden shadow-sm hover:shadow-md transition-shadow animate-desk-fill bg-white"
                          style={{ gridColumn: 'span 2', height: cellSize, animationDelay: `${delay * 0.04}s` }}
                        >
                          {renderSeat(desk.id, 0, delay)}
                          <div className="w-px bg-gray-200" />
                          {renderSeat(desk.id, 1, delay)}
                        </div>
                      )
                    }

                    if (desk && desk.type === 'single') {
                      return (
                        <div
                          key={`${r}-${c}`}
                          className="rounded-xl border-2 border-gray-200 overflow-hidden shadow-sm hover:shadow-md transition-shadow animate-desk-fill bg-white"
                          style={{ height: cellSize, animationDelay: `${delay * 0.04}s` }}
                        >
                          {renderSeat(desk.id, 0, delay)}
                        </div>
                      )
                    }

                    return <div key={`${r}-${c}`} style={{ height: cellSize }} />
                  }),
                )}
              </div>
            </div>

            <div className="flex gap-5 mt-6 justify-center">
              {(['high', 'medium', 'low', 'ungraded'] as const).map(level => {
                const lc = levelConfig[level]
                return (
                  <div key={level} className="flex items-center gap-1.5 text-xs text-gray-600 font-medium">
                    <div className={`w-3 h-3 rounded-full ${lc.dot}`} />
                    {lc.label}
                  </div>
                )
              })}
            </div>
          </div>
        </div>
      )}

      {/* ── Roster list ────────────────────────────────────── */}
      {generated && (
        <div className="card p-3 sm:p-6 animate-slide-up">
          <h3 className="text-lg font-bold text-gray-900 mb-4">Seat Assignments</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 stagger-children">
            {assignments.map(a => {
              const student = students.find(s => s.id === a.studentId)
              const desk = layout.desks.find(d => d.id === a.deskId)
              if (!student || !desk) return null
              const lc = levelConfig[student.performanceLevel]
              const isLocked = lockedSeats.has(`${a.deskId}-${a.seatIndex}`)
              return (
                <div
                  key={`${a.deskId}-${a.seatIndex}`}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl ${lc.bg} animate-fade-in`}
                >
                  <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${getAvatarColor(student.name)} text-white text-[10px] font-extrabold flex items-center justify-center shadow-sm flex-shrink-0`}>
                    {getInitials(student.name)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className={`text-sm font-semibold truncate ${lc.text}`}>{student.name}</div>
                    <div className="text-[10px] text-gray-400 font-mono">
                      Row {desk.row + 1}, Col {desk.col + 1}
                      {desk.type === 'double' ? (a.seatIndex === 0 ? ' (L)' : ' (R)') : ''}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {isLocked && (
                      <svg className="w-3.5 h-3.5 text-blue-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5 9V7a5 5 0 0110 0v2a2 2 0 012 2v5a2 2 0 01-2 2H5a2 2 0 01-2-2v-5a2 2 0 012-2zm8-2v2H7V7a3 3 0 016 0z" clipRule="evenodd" />
                      </svg>
                    )}
                    <div className={`w-2.5 h-2.5 rounded-full ${lc.dot}`} />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* ── Pre-generate prompt ────────────────────────────── */}
      {!generated && (
        <div className="card p-12 text-center animate-fade-in">
          <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09zM19.5 6.75l.372 1.302a3.375 3.375 0 002.077 2.077L23.25 10.5l-1.302.372a3.375 3.375 0 00-2.077 2.077L19.5 14.25l-.372-1.302a3.375 3.375 0 00-2.077-2.077L15.75 10.5l1.302-.372a3.375 3.375 0 002.077-2.077L19.5 6.75z" />
            </svg>
          </div>
          <p className="text-gray-600 font-semibold text-lg">Ready to generate</p>
          <p className="text-sm text-gray-400 mt-1 max-w-md mx-auto">
            {layout.desks.length} desks ({totalSeats} seats) and {students.length} students loaded.
            Select a strategy above and hit <span className="font-semibold text-gray-500">Generate Chart</span>.
          </p>
        </div>
      )}
    </div>
  )
}
