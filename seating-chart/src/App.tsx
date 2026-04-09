import { useState, useEffect, useCallback, useRef } from 'react'
import { Tab, ClassroomLayout, Student } from './types'
import { demoLayout, demoStudents } from './demoData'
import ClassroomEditor from './components/ClassroomEditor'
import GradebookManager from './components/GradebookManager'
import SeatingChart from './components/SeatingChart'

const STORAGE_KEY = 'seating-chart-state'
const STORAGE_VERSION = 2

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (raw) {
      const state = JSON.parse(raw)
      if (state.version && state.version > STORAGE_VERSION) {
        console.warn('Saved state is from a newer version, ignoring')
        return null
      }
      if (state.layout && !state.layout.furniture) {
        state.layout.furniture = []
      }
      return state
    }
  } catch (err) {
    console.warn('Failed to load saved state, resetting:', err)
    localStorage.removeItem(STORAGE_KEY)
  }
  return null
}

function saveState(layout: ClassroomLayout, students: Student[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ version: STORAGE_VERSION, layout, students }))
  } catch (err) {
    console.warn('Failed to save state to localStorage:', err)
  }
}

const defaultLayout: ClassroomLayout = {
  rows: 6,
  cols: 6,
  desks: [],
  furniture: [
    { id: 'furniture_teacher', type: 'teacher-desk', label: "Teacher's Desk", row: -1, col: 2, colSpan: 2, rowSpan: 1 },
  ],
  name: 'My Classroom',
}

// ── Toast system ──────────────────────────────────────────
interface Toast {
  id: number
  message: string
  type: 'success' | 'info' | 'warning'
  exiting?: boolean
}
let toastId = 0

const steps: { key: Tab; label: string; description: string; icon: React.ReactNode }[] = [
  {
    key: 'layout',
    label: 'Design Layout',
    description: 'Arrange desks & furniture',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
        <rect x="3" y="3" width="7" height="7" rx="1.5" />
        <rect x="14" y="3" width="7" height="7" rx="1.5" />
        <rect x="3" y="14" width="7" height="7" rx="1.5" />
        <rect x="14" y="14" width="7" height="7" rx="1.5" />
      </svg>
    ),
  },
  {
    key: 'students',
    label: 'Add Students',
    description: 'Import or enter roster',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
      </svg>
    ),
  },
  {
    key: 'chart',
    label: 'Generate Chart',
    description: 'Create seating plan',
    icon: (
      <svg viewBox="0 0 24 24" fill="none" className="w-4 h-4" stroke="currentColor" strokeWidth="2">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9.813 15.904L9 18.75l-.813-2.846a4.5 4.5 0 00-3.09-3.09L2.25 12l2.846-.813a4.5 4.5 0 003.09-3.09L9 5.25l.813 2.846a4.5 4.5 0 003.09 3.09L15.75 12l-2.846.813a4.5 4.5 0 00-3.09 3.09z" />
      </svg>
    ),
  },
]

export default function App() {
  const saved = loadState()
  const hasExistingData = saved && (saved.layout?.desks?.length > 0 || saved.students?.length > 0)

  const [showWelcome, setShowWelcome] = useState(!hasExistingData)
  const [isDemo, setIsDemo] = useState(false)
  const [activeTab, setActiveTab] = useState<Tab>('layout')
  const [layout, setLayout] = useState<ClassroomLayout>(() => saved?.layout || defaultLayout)
  const [students, setStudents] = useState<Student[]>(() => saved?.students || [])
  const [toasts, setToasts] = useState<Toast[]>([])

  // ── Undo/Redo for layout ─────────────────────────────────
  const undoStack = useRef<ClassroomLayout[]>([])
  const redoStack = useRef<ClassroomLayout[]>([])
  const skipUndoRef = useRef(false)

  const handleLayoutChange = useCallback((newLayout: ClassroomLayout) => {
    if (!skipUndoRef.current) {
      undoStack.current.push(layout)
      if (undoStack.current.length > 50) undoStack.current.shift()
      redoStack.current = []
    }
    skipUndoRef.current = false
    setLayout(newLayout)
  }, [layout])

  const handleUndo = useCallback(() => {
    if (undoStack.current.length === 0) return
    redoStack.current.push(layout)
    skipUndoRef.current = true
    setLayout(undoStack.current.pop()!)
  }, [layout])

  const handleRedo = useCallback(() => {
    if (redoStack.current.length === 0) return
    undoStack.current.push(layout)
    skipUndoRef.current = true
    setLayout(redoStack.current.pop()!)
  }, [layout])

  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey && activeTab === 'layout') {
        e.preventDefault()
        handleUndo()
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey)) && activeTab === 'layout') {
        e.preventDefault()
        handleRedo()
      }
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [activeTab, handleUndo, handleRedo])

  useEffect(() => {
    saveState(layout, students)
  }, [layout, students])

  const addToast = useCallback((message: string, type: Toast['type'] = 'success') => {
    const id = ++toastId
    setToasts(t => [...t, { id, message, type }])
    setTimeout(() => {
      setToasts(t => t.map(x => (x.id === id ? { ...x, exiting: true } : x)))
      setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 300)
    }, 2500)
  }, [])

  function startDemo() {
    setLayout(demoLayout)
    setStudents(demoStudents)
    setIsDemo(true)
    setShowWelcome(false)
    setActiveTab('chart')
    setTimeout(() => addToast('Demo loaded! Explore the app freely.'), 300)
  }

  function startFresh() {
    setLayout(defaultLayout)
    setStudents([])
    setIsDemo(false)
    setShowWelcome(false)
    setActiveTab('layout')
  }

  function exitDemo() {
    setLayout(defaultLayout)
    setStudents([])
    setIsDemo(false)
    addToast('Demo cleared. Start building your own!', 'info')
  }

  const totalSeats = layout.desks.reduce((s, d) => s + (d.type === 'double' ? 2 : 1), 0)
  const activeStepIndex = steps.findIndex(s => s.key === activeTab)

  const stepStatus = (i: number): 'done' | 'active' | 'pending' => {
    if (i < activeStepIndex) return 'done'
    if (i === activeStepIndex) return 'active'
    return 'pending'
  }

  // ── Welcome Screen ────────────────────────────────────────
  if (showWelcome) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center px-6 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-20 left-[10%] w-72 h-72 bg-blue-200/30 rounded-full blur-3xl animate-float" />
          <div className="absolute bottom-20 right-[10%] w-96 h-96 bg-violet-200/30 rounded-full blur-3xl animate-float-delayed" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-indigo-100/20 rounded-full blur-3xl" />
        </div>

        <div className="relative z-10 max-w-lg w-full text-center animate-fade-in">
          {/* Logo */}
          <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 flex items-center justify-center mx-auto mb-8 shadow-2xl shadow-indigo-300/50 animate-pop-in">
            <svg viewBox="0 0 24 24" fill="none" className="w-10 h-10 text-white" stroke="currentColor" strokeWidth="1.5">
              <rect x="3" y="3" width="7" height="7" rx="1.5" />
              <rect x="14" y="3" width="7" height="7" rx="1.5" />
              <rect x="3" y="14" width="7" height="7" rx="1.5" />
              <rect x="14" y="14" width="7" height="7" rx="1.5" />
            </svg>
          </div>

          <h1 className="text-4xl font-extrabold tracking-tight text-gray-900 mb-3">
            Map My Seat
          </h1>
          <p className="text-lg text-gray-500 mb-10 max-w-md mx-auto leading-relaxed">
            Design your classroom layout, import your roster, and generate optimized seating assignments in seconds.
          </p>

          {/* Action cards */}
          <div className="grid gap-4 sm:grid-cols-2">
            {/* Demo card */}
            <button
              onClick={startDemo}
              className="group relative overflow-hidden bg-gradient-to-br from-blue-500 via-indigo-500 to-violet-600 text-white rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-2xl hover:shadow-indigo-300/40 active:scale-[0.98] cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-white/20 flex items-center justify-center mb-4">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
                  </svg>
                </div>
                <div className="text-lg font-bold mb-1">Try the Demo</div>
                <div className="text-sm text-blue-100 leading-snug">
                  See a fully loaded classroom with 24 students and a complete layout
                </div>
              </div>
            </button>

            {/* Start fresh card */}
            <button
              onClick={startFresh}
              className="group relative overflow-hidden bg-white border-2 border-gray-200 text-gray-900 rounded-2xl p-6 text-left transition-all hover:scale-[1.02] hover:shadow-xl hover:border-gray-300 active:scale-[0.98] cursor-pointer"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-gray-100 rounded-full -translate-y-1/2 translate-x-1/2 group-hover:scale-150 transition-transform duration-500" />
              <div className="relative">
                <div className="w-12 h-12 rounded-xl bg-gray-100 flex items-center justify-center mb-4 group-hover:bg-blue-50 transition-colors">
                  <svg className="w-6 h-6 text-gray-500 group-hover:text-blue-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
                  </svg>
                </div>
                <div className="text-lg font-bold mb-1">Start Fresh</div>
                <div className="text-sm text-gray-500 leading-snug">
                  Build your own classroom from scratch with the step-by-step wizard
                </div>
              </div>
            </button>
          </div>

          {/* Continue button when data exists */}
          {hasExistingData && (
            <button
              onClick={() => setShowWelcome(false)}
              className="mt-6 w-full max-w-[calc(50%+50%+16px)] text-center py-3 rounded-xl border-2 border-dashed border-gray-300 text-gray-500 font-semibold text-sm hover:border-blue-400 hover:text-blue-600 hover:bg-blue-50/50 transition-all active:scale-[0.98]"
            >
              Continue where you left off ({layout.desks.length} desks, {students.length} students)
            </button>
          )}

          {/* Features preview */}
          <div className="mt-12 flex items-center justify-center gap-8 text-xs text-gray-400 font-medium">
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-emerald-50 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
                </svg>
              </div>
              CSV Import
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-blue-50 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7.5 21L3 16.5m0 0L7.5 12M3 16.5h13.5m0-13.5L21 7.5m0 0L16.5 12M21 7.5H7.5" />
                </svg>
              </div>
              Drag & Swap
            </div>
            <div className="flex items-center gap-2">
              <div className="w-6 h-6 rounded-lg bg-violet-50 flex items-center justify-center">
                <svg className="w-3.5 h-3.5 text-violet-500" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6.72 13.829c-.24.03-.48.062-.72.096m.72-.096a42.415 42.415 0 0110.56 0m-10.56 0L6.34 18m10.94-4.171c.24.03.48.062.72.096m-.72-.096L17.66 18m0 0l.229 2.523a1.125 1.125 0 01-1.12 1.227H7.231c-.662 0-1.18-.568-1.12-1.227L6.34 18m11.318 0h1.091A2.25 2.25 0 0021 15.75V9.456c0-1.081-.768-2.015-1.837-2.175a48.055 48.055 0 00-1.913-.247M6.34 18H5.25A2.25 2.25 0 013 15.75V9.456c0-1.081.768-2.015 1.837-2.175a48.041 48.041 0 011.913-.247m0 0a48.955 48.955 0 0110.5 0M3.75 7.5V6.108c0-1.135.845-2.098 1.976-2.192.373-.03.748-.057 1.123-.08M18 7.5V6.108c0-1.135-.845-2.098-1.976-2.192a48.424 48.424 0 00-1.123-.08" />
                </svg>
              </div>
              Print Ready
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ── Main App ──────────────────────────────────────────────
  return (
    <div className="min-h-screen flex flex-col">
      <a href="#main-content" className="skip-link">Skip to content</a>
      {/* ── Demo Banner ──────────────────────────────────────── */}
      {isDemo && (
        <div className="bg-gradient-to-r from-amber-400 via-amber-300 to-yellow-300 text-amber-900 animate-slide-down">
          <div className="max-w-6xl mx-auto px-6 py-2 flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm font-semibold">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.347a1.125 1.125 0 010 1.972l-11.54 6.347a1.125 1.125 0 01-1.667-.986V5.653z" />
              </svg>
              Demo Mode -- Explore freely! All changes are temporary.
            </div>
            <button
              onClick={exitDemo}
              className="text-xs font-bold bg-amber-900/10 hover:bg-amber-900/20 px-3 py-1 rounded-lg transition-colors"
            >
              Exit Demo
            </button>
          </div>
        </div>
      )}

      {/* ── Header ────────────────────────────────────────── */}
      <header className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-indigo-600 to-violet-600 text-white">
        {/* Decorative elements */}
        <div className="absolute -top-12 -right-12 w-48 h-48 bg-white/5 rounded-full blur-2xl" />
        <div className="absolute -bottom-8 -left-8 w-36 h-36 bg-white/5 rounded-full blur-xl" />

        <div className="relative max-w-6xl mx-auto px-3 sm:px-6 py-4 sm:py-5 flex items-center justify-between">
          <div className="flex items-center gap-2 sm:gap-3">
            <button
              onClick={() => setShowWelcome(true)}
              className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/15 backdrop-blur flex items-center justify-center text-xl shadow-lg hover:bg-white/25 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-white"
              title="Back to home"
              aria-label="Back to home"
            >
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6" stroke="currentColor" strokeWidth="1.8">
                <rect x="3" y="3" width="7" height="7" rx="1.5" />
                <rect x="14" y="3" width="7" height="7" rx="1.5" />
                <rect x="3" y="14" width="7" height="7" rx="1.5" />
                <rect x="14" y="14" width="7" height="7" rx="1.5" />
              </svg>
            </button>
            <div>
              <h1 className="text-xl font-bold tracking-tight">Map My Seat</h1>
              <p className="text-xs text-blue-100 font-medium">Design, import, arrange</p>
            </div>
          </div>

          {/* Stats pills */}
          <div className="flex gap-1.5 sm:gap-2">
            {(() => {
              const hasMismatch = students.length > 0 && totalSeats > 0 && students.length !== totalSeats
              const tooMany = students.length > totalSeats
              return [
                { label: 'Desks', value: layout.desks.length, color: layout.desks.length > 0 ? 'bg-blue-500/30' : 'bg-white/15' },
                { label: 'Seats', value: totalSeats, color: hasMismatch && !tooMany ? 'bg-amber-500/40' : totalSeats > 0 ? 'bg-indigo-500/30' : 'bg-white/15' },
                { label: 'Students', value: students.length, color: tooMany ? 'bg-red-500/40' : students.length > 0 ? 'bg-emerald-500/30' : 'bg-white/15' },
              ].map(stat => (
                <div key={stat.label} className={`${stat.color} backdrop-blur rounded-lg px-2 sm:px-3 py-1 sm:py-1.5 text-center min-w-[52px] sm:min-w-[68px] transition-colors`}>
                  <div className="text-base sm:text-lg font-bold leading-tight">{stat.value}</div>
                  <div className="text-[9px] sm:text-[10px] text-blue-100 uppercase tracking-wider font-medium">{stat.label}</div>
                </div>
              ))
            })()}
          </div>
        </div>
      </header>

      {/* ── Stepper ───────────────────────────────────────── */}
      <div className="bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-3xl mx-auto px-3 sm:px-6 py-3 sm:py-4">
          <div className="flex items-center" role="tablist" aria-label="Setup steps">
            {steps.map((step, i) => {
              const status = stepStatus(i)
              return (
                <div key={step.key} className="flex items-center flex-1 last:flex-initial">
                  <button
                    role="tab"
                    aria-selected={status === 'active'}
                    aria-label={`${step.label}: ${step.description}${status === 'done' ? ' (completed)' : ''}`}
                    onClick={() => setActiveTab(step.key)}
                    className="flex items-center gap-2 sm:gap-3 group cursor-pointer focus:outline-none focus-visible:ring-2 focus-visible:ring-blue-500 focus-visible:ring-offset-2 rounded-lg p-1"
                  >
                    <div
                      className={`w-8 h-8 sm:w-9 sm:h-9 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        status === 'active'
                          ? 'bg-blue-600 text-white shadow-lg shadow-blue-200 scale-110'
                          : status === 'done'
                          ? 'bg-emerald-500 text-white'
                          : 'bg-gray-100 text-gray-400 group-hover:bg-gray-200 group-hover:text-gray-600'
                      }`}
                    >
                      {status === 'done' ? (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={3}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                        </svg>
                      ) : (
                        step.icon
                      )}
                    </div>

                    <div className="text-left">
                      <div
                        className={`text-xs sm:text-sm font-semibold transition-colors ${
                          status === 'active' ? 'text-blue-700' : status === 'done' ? 'text-emerald-700' : 'text-gray-400'
                        }`}
                      >
                        <span className="sm:hidden">{step.key === 'layout' ? 'Layout' : step.key === 'students' ? 'Students' : 'Chart'}</span>
                        <span className="hidden sm:inline">{step.label}</span>
                      </div>
                      <div className="text-xs text-gray-400 hidden sm:block">{step.description}</div>
                    </div>
                  </button>

                  {i < steps.length - 1 && (
                    <div className="flex-1 mx-2 sm:mx-4">
                      <div
                        className="step-connector rounded-full"
                        style={{
                          background:
                            i < activeStepIndex
                              ? 'linear-gradient(to right, #10b981, #10b981)'
                              : i === activeStepIndex
                              ? 'linear-gradient(to right, #3b82f6, #e2e8f0)'
                              : '#e2e8f0',
                        }}
                      />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Content ───────────────────────────────────────── */}
      <main id="main-content" className="flex-1 max-w-6xl w-full mx-auto px-3 sm:px-6 py-4 sm:py-8">
        <div key={activeTab} className="animate-fade-in">
          {activeTab === 'layout' && (
            <ClassroomEditor
              layout={layout}
              onLayoutChange={handleLayoutChange}
              onNext={() => setActiveTab('students')}
              addToast={addToast}
              onUndo={handleUndo}
              onRedo={handleRedo}
              canUndo={undoStack.current.length > 0}
              canRedo={redoStack.current.length > 0}
            />
          )}
          {activeTab === 'students' && (
            <GradebookManager
              students={students}
              onStudentsChange={setStudents}
              onNext={() => setActiveTab('chart')}
              onBack={() => setActiveTab('layout')}
              addToast={addToast}
            />
          )}
          {activeTab === 'chart' && (
            <SeatingChart
              layout={layout}
              students={students}
              onBack={() => setActiveTab('students')}
              addToast={addToast}
            />
          )}
        </div>
      </main>

      {/* ── Toasts ────────────────────────────────────────── */}
      <div className="fixed bottom-6 right-6 flex flex-col gap-2 z-50" role="status" aria-live="polite">
        {toasts.map(toast => (
          <div
            key={toast.id}
            className={`${
              toast.exiting ? 'animate-toast-exit' : 'animate-toast-enter'
            } flex items-center gap-2.5 px-5 py-3.5 rounded-2xl shadow-2xl backdrop-blur text-sm font-medium ${
              toast.type === 'success'
                ? 'bg-emerald-600 text-white'
                : toast.type === 'warning'
                ? 'bg-amber-500 text-white'
                : 'bg-gray-800 text-white'
            }`}
          >
            {toast.type === 'success' && (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            )}
            {toast.type === 'warning' && (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01M12 3l9.5 16.5H2.5L12 3z" />
              </svg>
            )}
            {toast.type === 'info' && (
              <svg className="w-4 h-4 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M11.25 11.25l.041-.02a.75.75 0 011.063.852l-.708 2.836a.75.75 0 001.063.853l.041-.021M21 12a9 9 0 11-18 0 9 9 0 0118 0zm-9-3.75h.008v.008H12V8.25z" />
              </svg>
            )}
            {toast.message}
          </div>
        ))}
      </div>
    </div>
  )
}
