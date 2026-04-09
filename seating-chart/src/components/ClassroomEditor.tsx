import { useState } from 'react'
import { ClassroomLayout, Desk, FurnitureItem, FurnitureType } from '../types'
import { getEffectiveSpan } from '../utils/helpers'

interface Props {
  layout: ClassroomLayout
  onLayoutChange: (layout: ClassroomLayout) => void
  onNext: () => void
  addToast: (msg: string, type?: 'success' | 'info' | 'warning') => void
  onUndo?: () => void
  onRedo?: () => void
  canUndo?: boolean
  canRedo?: boolean
}

function nextDeskId() {
  return `desk_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

function nextFurnitureId() {
  return `furniture_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
}

const FURNITURE_CATALOG: { type: FurnitureType; label: string; icon: string; colSpan: number; rowSpan: number; color: string }[] = [
  { type: 'teacher-desk',  label: "Teacher's Desk", icon: '🖥️', colSpan: 2, rowSpan: 1, color: 'from-gray-600 to-gray-800' },
  { type: 'student-desk',  label: 'Student Desk',   icon: '🪑', colSpan: 1, rowSpan: 1, color: 'from-blue-500 to-cyan-600' },
  { type: 'bookshelf',     label: 'Bookshelf',      icon: '📚', colSpan: 2, rowSpan: 1, color: 'from-amber-600 to-amber-800' },
  { type: 'filing-cabinet', label: 'Filing Cabinet', icon: '🗄️', colSpan: 1, rowSpan: 1, color: 'from-slate-500 to-slate-700' },
  { type: 'rug',           label: 'Rug / Mat',       icon: '🟫', colSpan: 2, rowSpan: 2, color: 'from-orange-400 to-orange-600' },
  { type: 'table',         label: 'Table',           icon: '🍽️', colSpan: 2, rowSpan: 1, color: 'from-yellow-600 to-yellow-800' },
  { type: 'whiteboard',    label: 'Whiteboard',      icon: '📋', colSpan: 3, rowSpan: 1, color: 'from-sky-400 to-sky-600' },
  { type: 'door',          label: 'Door',            icon: '🚪', colSpan: 1, rowSpan: 1, color: 'from-stone-500 to-stone-700' },
  { type: 'window',        label: 'Window',          icon: '🪟', colSpan: 1, rowSpan: 1, color: 'from-cyan-400 to-cyan-600' },
]

export default function ClassroomEditor({ layout, onLayoutChange, onNext, addToast, onUndo, onRedo, canUndo, canRedo }: Props) {
  const [deskType, setDeskType] = useState<'single' | 'double'>('single')
  const [tool, setTool] = useState<'add' | 'remove'>('add')
  const [dragDesk, setDragDesk] = useState<string | null>(null)
  const [dragFurniture, setDragFurniture] = useState<string | null>(null)
  const [hoveredCell, setHoveredCell] = useState<string | null>(null)
  const [selectedFurniture, setSelectedFurniture] = useState<string | null>(null)
  const [confirmClear, setConfirmClear] = useState(false)

  const furniture = layout.furniture || []

  const cellSize = 76
  const gap = 6

  const minFurnitureRow = furniture.length > 0 ? Math.min(0, ...furniture.map(f => f.row)) : 0
  const extraRowsAbove = Math.abs(Math.min(0, minFurnitureRow))
  const renderStartRow = minFurnitureRow < 0 ? minFurnitureRow : 0

  function isCellOccupiedByFurniture(row: number, col: number, excludeId?: string) {
    return furniture.some(f => {
      if (f.id === excludeId) return false
      const { cs, rs } = getEffectiveSpan(f)
      return row >= f.row && row < f.row + rs && col >= f.col && col < f.col + cs
    })
  }

  function isCellOccupiedByDesk(row: number, col: number, excludeId?: string) {
    return layout.desks.some(d => {
      if (d.id === excludeId) return false
      if (d.row === row && d.col === col) return true
      if (d.type === 'double' && d.row === row && d.col + 1 === col) return true
      return false
    })
  }

  function toggleDesk(row: number, col: number) {
    if (isCellOccupiedByFurniture(row, col)) {
      addToast('A furniture item is there', 'warning')
      return
    }
    const existing = layout.desks.find(d => d.row === row && d.col === col)
    if (tool === 'remove' && existing) {
      onLayoutChange({
        ...layout,
        desks: layout.desks.filter(d => d.id !== existing.id),
      })
    } else if (tool === 'add' && !existing) {
      if (deskType === 'double') {
        const rightOccupied = isCellOccupiedByDesk(row, col + 1) || isCellOccupiedByFurniture(row, col + 1)
        const isDoubleOverlap = layout.desks.find(
          d => d.type === 'double' && d.row === row && d.col === col - 1,
        )
        if (col + 1 >= layout.cols || rightOccupied || isDoubleOverlap) {
          addToast('Not enough space for a double desk there', 'warning')
          return
        }
      }
      const prevDouble = layout.desks.find(
        d => d.type === 'double' && d.row === row && d.col + 1 === col,
      )
      if (prevDouble) {
        addToast('That cell is part of a double desk', 'warning')
        return
      }
      const newDesk: Desk = {
        id: nextDeskId(),
        row,
        col,
        type: deskType,
        rotation: 0,
      }
      onLayoutChange({ ...layout, desks: [...layout.desks, newDesk] })
    }
  }

  function handleGridResize(newRows: number, newCols: number) {
    const r = Math.max(1, Math.min(12, newRows))
    const c = Math.max(1, Math.min(12, newCols))
    const filteredDesks = layout.desks.filter(d => {
      if (d.row >= r || d.col >= c) return false
      if (d.type === 'double' && d.col + 1 >= c) return false
      return true
    })
    onLayoutChange({ ...layout, rows: r, cols: c, desks: filteredDesks })
  }

  function clearAll() {
    if (!confirmClear) {
      setConfirmClear(true)
      setTimeout(() => setConfirmClear(false), 3000)
      return
    }
    onLayoutChange({ ...layout, desks: [], furniture: [] })
    setConfirmClear(false)
    addToast('Layout cleared', 'info')
  }

  function handleDragStart(deskId: string) {
    setDragDesk(deskId)
    setDragFurniture(null)
  }

  function handleFurnitureDragStart(furnitureId: string) {
    setDragFurniture(furnitureId)
    setDragDesk(null)
  }

  function handleDrop(row: number, col: number) {
    if (dragFurniture) {
      const item = furniture.find(f => f.id === dragFurniture)
      if (!item) return
      const { cs, rs } = getEffectiveSpan(item)
      if (col + cs > layout.cols) return
      for (let dr = 0; dr < rs; dr++) {
        for (let dc = 0; dc < cs; dc++) {
          const r = row + dr
          const c = col + dc
          if (isCellOccupiedByFurniture(r, c, item.id)) return
          if (r >= 0 && r < layout.rows && isCellOccupiedByDesk(r, c)) return
        }
      }
      onLayoutChange({
        ...layout,
        furniture: furniture.map(f => f.id === dragFurniture ? { ...f, row, col } : f),
      })
      setDragFurniture(null)
      return
    }

    if (dragDesk) {
      const desk = layout.desks.find(d => d.id === dragDesk)
      if (!desk) return
      if (row < 0) return
      const otherDesks = layout.desks.filter(d => d.id !== dragDesk)
      const occupied = otherDesks.find(d => {
        if (d.row === row && d.col === col) return true
        if (d.type === 'double' && d.row === row && d.col + 1 === col) return true
        return false
      })
      if (occupied) return
      if (isCellOccupiedByFurniture(row, col)) return
      if (desk.type === 'double' && col + 1 >= layout.cols) return
      if (desk.type === 'double') {
        const rightOccupied = otherDesks.find(d => d.row === row && d.col === col + 1)
        if (rightOccupied || isCellOccupiedByFurniture(row, col + 1)) return
      }
      onLayoutChange({
        ...layout,
        desks: layout.desks.map(d => (d.id === dragDesk ? { ...d, row, col } : d)),
      })
      setDragDesk(null)
    }
  }

  function rotateFurniture(id: string) {
    const item = furniture.find(f => f.id === id)
    if (!item) return

    // For square items (1x1, 2x2) rotation is a no-op visually, but we still toggle the flag
    const newRotated = !item.rotated
    const newCS = newRotated ? (item.rowSpan || 1) : (item.colSpan || 1)
    const newRS = newRotated ? (item.colSpan || 1) : (item.rowSpan || 1)

    // Check if rotated item fits at current position
    if (item.col + newCS > layout.cols) {
      addToast('Not enough space to rotate here', 'warning')
      return
    }
    for (let dr = 0; dr < newRS; dr++) {
      for (let dc = 0; dc < newCS; dc++) {
        const r = item.row + dr
        const c = item.col + dc
        if (isCellOccupiedByFurniture(r, c, item.id)) {
          addToast('Not enough space to rotate here', 'warning')
          return
        }
        if (r >= 0 && r < layout.rows && isCellOccupiedByDesk(r, c)) {
          addToast('Not enough space to rotate here', 'warning')
          return
        }
      }
    }

    onLayoutChange({
      ...layout,
      furniture: furniture.map(f => f.id === id ? { ...f, rotated: newRotated } : f),
    })
    addToast('Rotated 90°')
  }

  function addFurnitureItem(catalogItem: typeof FURNITURE_CATALOG[number]) {
    let targetRow = catalogItem.type === 'teacher-desk' ? -1 : 0
    let targetCol = 0
    let placed = false
    for (let r = targetRow; r < layout.rows + 2 && !placed; r++) {
      for (let c = 0; c <= layout.cols - catalogItem.colSpan && !placed; c++) {
        let fits = true
        for (let dr = 0; dr < catalogItem.rowSpan && fits; dr++) {
          for (let dc = 0; dc < catalogItem.colSpan && fits; dc++) {
            if (isCellOccupiedByFurniture(r + dr, c + dc)) fits = false
            if (r + dr >= 0 && r + dr < layout.rows && isCellOccupiedByDesk(r + dr, c + dc)) fits = false
          }
        }
        if (fits) {
          targetRow = r
          targetCol = c
          placed = true
        }
      }
    }

    const newItem: FurnitureItem = {
      id: nextFurnitureId(),
      type: catalogItem.type,
      label: catalogItem.label,
      row: targetRow,
      col: targetCol,
      colSpan: catalogItem.colSpan,
      rowSpan: catalogItem.rowSpan,
      rotated: false,
    }
    onLayoutChange({ ...layout, furniture: [...furniture, newItem] })
    addToast(`Added ${catalogItem.label}`)
  }

  function removeFurniture(id: string) {
    onLayoutChange({ ...layout, furniture: furniture.filter(f => f.id !== id) })
    setSelectedFurniture(null)
    addToast('Furniture removed', 'info')
  }

  function addPresetRow() {
    const nextRow = layout.desks.length > 0
      ? Math.max(...layout.desks.map(d => d.row)) + 1
      : 0
    const needed = Math.max(layout.rows, nextRow + 1)
    const newDesks: Desk[] = []
    for (let c = 0; c < Math.min(layout.cols, 5); c++) {
      if (!isCellOccupiedByFurniture(nextRow, c)) {
        newDesks.push({ id: nextDeskId(), row: nextRow, col: c, type: 'single', rotation: 0 })
      }
    }
    onLayoutChange({ ...layout, rows: needed, desks: [...layout.desks, ...newDesks] })
    addToast(`Added row of ${newDesks.length} single desks`)
  }

  function addPresetPairs() {
    const nextRow = layout.desks.length > 0
      ? Math.max(...layout.desks.map(d => d.row)) + 1
      : 0
    const needed = Math.max(layout.rows, nextRow + 1)
    const newDesks: Desk[] = []
    let count = 0
    for (let c = 0; c + 1 < layout.cols; c += 3) {
      if (!isCellOccupiedByFurniture(nextRow, c) && !isCellOccupiedByFurniture(nextRow, c + 1)) {
        newDesks.push({ id: nextDeskId(), row: nextRow, col: c, type: 'double', rotation: 0 })
        count++
      }
    }
    onLayoutChange({ ...layout, rows: needed, desks: [...layout.desks, ...newDesks] })
    addToast(`Added row of ${count} paired desks`)
  }

  function fillClassroom() {
    const newDesks: Desk[] = []
    for (let r = 0; r < layout.rows; r++) {
      for (let c = 0; c < layout.cols; c++) {
        if (!isCellOccupiedByFurniture(r, c)) {
          newDesks.push({ id: nextDeskId(), row: r, col: c, type: 'single', rotation: 0 })
        }
      }
    }
    onLayoutChange({ ...layout, desks: newDesks })
    addToast(`Filled with ${newDesks.length} single desks`)
  }

  function exportLayout() {
    const data = JSON.stringify({ layout }, null, 2)
    const blob = new Blob([data], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `${layout.name.replace(/[^a-zA-Z0-9-_ ]/g, '')}-layout.json`
    a.click()
    URL.revokeObjectURL(url)
    addToast('Layout exported')
  }

  function importLayout() {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0]
      if (!file) return
      const reader = new FileReader()
      reader.onload = (evt) => {
        try {
          const parsed = JSON.parse(evt.target?.result as string)
          if (parsed.layout && Array.isArray(parsed.layout.desks)) {
            onLayoutChange(parsed.layout)
            addToast(`Imported "${parsed.layout.name || 'layout'}"`)
          } else {
            addToast('Invalid layout file', 'warning')
          }
        } catch {
          addToast('Could not parse JSON file', 'warning')
        }
      }
      reader.onerror = () => addToast('Failed to read file', 'warning')
      reader.readAsText(file)
    }
    input.click()
  }

  const totalSeats = layout.desks.reduce((s, d) => s + (d.type === 'double' ? 2 : 1), 0)

  function getCatalogInfo(type: FurnitureType) {
    return FURNITURE_CATALOG.find(c => c.type === type)
  }

  return (
    <div className="flex flex-col gap-6">
      {/* Section header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div>
          <h2 className="text-xl sm:text-2xl font-bold text-gray-900 tracking-tight">Classroom Layout</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-1">Click cells to place desks. Drag furniture to rearrange. Click furniture to select, then rotate or remove.</p>
        </div>
        <button
          onClick={onNext}
          className="px-5 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-semibold text-sm transition-all shadow-md shadow-blue-200 hover:shadow-lg hover:shadow-blue-200 active:scale-95"
        >
          Next: Add Students &rarr;
        </button>
      </div>

      {/* Toolbar */}
      <div className="card p-3 sm:p-4 flex flex-wrap items-center gap-2 sm:gap-3">
        {/* Name */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Name</label>
          <input
            type="text"
            value={layout.name}
            onChange={e => { if (e.target.value.length <= 60) onLayoutChange({ ...layout, name: e.target.value }) }}
            maxLength={60}
            className="border border-gray-200 rounded-lg px-3 py-2 text-sm font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none bg-gray-50 hover:bg-white transition-colors w-44"
          />
        </div>

        <div className="w-px h-8 bg-gray-200" />

        {/* Grid size */}
        <div className="flex items-center gap-2">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wider">Grid</label>
          <div className="flex items-center gap-1.5 bg-gray-50 rounded-lg p-1">
            <input
              type="number"
              min={1}
              max={12}
              value={layout.rows}
              onChange={e => handleGridResize(Number(e.target.value), layout.cols)}
              className="w-12 border border-gray-200 rounded-md px-2 py-1.5 text-sm text-center font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
            <span className="text-gray-400 text-xs font-bold">&times;</span>
            <input
              type="number"
              min={1}
              max={12}
              value={layout.cols}
              onChange={e => handleGridResize(layout.rows, Number(e.target.value))}
              className="w-12 border border-gray-200 rounded-md px-2 py-1.5 text-sm text-center font-medium bg-white focus:ring-2 focus:ring-blue-500 outline-none"
            />
          </div>
        </div>

        <div className="w-px h-8 bg-gray-200" />

        {/* Tool toggle */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <button
            onClick={() => setTool('add')}
            aria-pressed={tool === 'add'}
            className={`px-4 py-2 text-sm font-semibold transition-all ${
              tool === 'add'
                ? 'bg-blue-600 text-white shadow-inner'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1">+</span> Place
          </button>
          <button
            onClick={() => setTool('remove')}
            aria-pressed={tool === 'remove'}
            className={`px-4 py-2 text-sm font-semibold transition-all border-l border-gray-200 ${
              tool === 'remove'
                ? 'bg-red-500 text-white shadow-inner'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <span className="mr-1">&times;</span> Remove
          </button>
        </div>

        {/* Desk type */}
        <div className="flex rounded-xl overflow-hidden border border-gray-200 shadow-sm">
          <button
            onClick={() => setDeskType('single')}
            aria-pressed={deskType === 'single'}
            className={`px-3 py-2 text-sm font-semibold transition-all flex items-center gap-1.5 ${
              deskType === 'single'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
              <rect x="5" y="7" width="14" height="10" rx="2" />
            </svg>
            Single
          </button>
          <button
            onClick={() => setDeskType('double')}
            aria-pressed={deskType === 'double'}
            className={`px-3 py-2 text-sm font-semibold transition-all flex items-center gap-1.5 border-l border-gray-200 ${
              deskType === 'double'
                ? 'bg-indigo-600 text-white'
                : 'bg-white text-gray-600 hover:bg-gray-50'
            }`}
          >
            <svg className="w-5 h-4" fill="none" stroke="currentColor" viewBox="0 0 28 24" strokeWidth="2">
              <rect x="2" y="7" width="24" height="10" rx="2" />
              <line x1="14" y1="7" x2="14" y2="17" />
            </svg>
            Pair
          </button>
        </div>
      </div>

      {/* Quick presets */}
      <div className="flex flex-wrap gap-2">
        {(onUndo || onRedo) && (
          <div className="flex gap-1">
            <button
              onClick={onUndo}
              disabled={!canUndo}
              className="px-3 py-2 text-sm rounded-xl font-semibold transition-all border active:scale-95 bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Undo (Ctrl+Z)"
              aria-label="Undo"
            >
              ↩ Undo
            </button>
            <button
              onClick={onRedo}
              disabled={!canRedo}
              className="px-3 py-2 text-sm rounded-xl font-semibold transition-all border active:scale-95 bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Redo (Ctrl+Y)"
              aria-label="Redo"
            >
              ↪ Redo
            </button>
          </div>
        )}
        {[
          { label: 'Row of Singles', icon: '▪▪▪▪▪', action: addPresetRow, color: 'bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200' },
          { label: 'Row of Pairs', icon: '▪▪ ▪▪', action: addPresetPairs, color: 'bg-violet-50 text-violet-700 hover:bg-violet-100 border-violet-200' },
          { label: 'Fill Grid', icon: '▦', action: fillClassroom, color: 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border-emerald-200' },
          { label: confirmClear ? 'Confirm Clear?' : 'Clear All', icon: '✕', action: clearAll, color: confirmClear ? 'bg-red-500 text-white hover:bg-red-600 border-red-500 animate-pulse' : 'bg-red-50 text-red-600 hover:bg-red-100 border-red-200' },
        ].map(p => (
          <button
            key={p.label}
            onClick={p.action}
            className={`px-3.5 py-2 text-sm rounded-xl font-semibold transition-all border active:scale-95 ${p.color}`}
          >
            <span className="mr-1.5 opacity-60">{p.icon}</span>
            {p.label}
          </button>
        ))}
        <div className="flex gap-1 ml-auto">
          <button
            onClick={exportLayout}
            className="px-3 py-2 text-sm rounded-xl font-semibold transition-all border active:scale-95 bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
            title="Export layout as JSON"
          >
            ↓ Export
          </button>
          <button
            onClick={importLayout}
            className="px-3 py-2 text-sm rounded-xl font-semibold transition-all border active:scale-95 bg-gray-50 text-gray-600 hover:bg-gray-100 border-gray-200"
            title="Import layout from JSON"
          >
            ↑ Import
          </button>
        </div>
      </div>

      {/* Furniture palette */}
      <div className="card p-4">
        <div className="flex items-center gap-2 mb-3">
          <h3 className="text-sm font-bold text-gray-700">Add Furniture</h3>
          <span className="text-xs text-gray-400">Click to add, then drag to position. Select to rotate or remove.</span>
        </div>
        <div className="flex flex-wrap gap-2">
          {FURNITURE_CATALOG.map(item => (
            <button
              key={item.type}
              onClick={() => addFurnitureItem(item)}
              className="flex items-center gap-2 px-3 py-2 bg-gray-50 hover:bg-gray-100 border border-gray-200 rounded-xl text-sm font-medium transition-all active:scale-95"
            >
              <span>{item.icon}</span>
              <span>{item.label}</span>
              <span className="text-[10px] text-gray-400">{item.colSpan}&times;{item.rowSpan}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Grid */}
      <div className="card p-3 sm:p-6 overflow-auto">
        {/* Front label */}
        <div className="flex flex-col items-center mb-4">
          <div className="text-[10px] text-gray-400 uppercase tracking-[0.2em] font-bold mb-2">Front of Classroom</div>
          <div className="w-full max-w-md h-px bg-gray-300" />
        </div>

        <div className="flex justify-center">
          <div className="relative" style={{ width: layout.cols * (cellSize + gap) - gap }}>
            {/* Furniture items (absolutely positioned) */}
            {furniture.map(f => {
              const cat = getCatalogInfo(f.type)
              const { cs, rs } = getEffectiveSpan(f)
              const topOffset = (f.row - renderStartRow) * (cellSize + gap)
              const leftOffset = f.col * (cellSize + gap)
              const width = cs * (cellSize + gap) - gap
              const height = rs * (cellSize + gap) - gap
              const isSelected = selectedFurniture === f.id

              return (
                <div
                  key={f.id}
                  draggable
                  onDragStart={() => handleFurnitureDragStart(f.id)}
                  onClick={(e) => { e.stopPropagation(); setSelectedFurniture(isSelected ? null : f.id) }}
                  className={`absolute rounded-xl bg-gradient-to-br ${cat?.color || 'from-gray-500 to-gray-700'} text-white flex items-center justify-center cursor-move select-none shadow-lg hover:shadow-xl transition-all z-10 ${isSelected ? 'ring-2 ring-yellow-400 ring-offset-2' : ''}`}
                  style={{
                    top: topOffset,
                    left: leftOffset,
                    width,
                    height,
                  }}
                >
                  <div className="flex flex-col items-center gap-0.5">
                    <span className="text-lg">{cat?.icon}</span>
                    <span className="text-[10px] font-bold opacity-90">{f.label}</span>
                  </div>
                  {isSelected && (
                    <div className="absolute -top-2 -right-2 flex gap-1 z-20">
                      {/* Rotate button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); rotateFurniture(f.id) }}
                        className="w-6 h-6 bg-blue-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-blue-600"
                        title="Rotate 90°"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182" />
                        </svg>
                      </button>
                      {/* Remove button */}
                      <button
                        onClick={(e) => { e.stopPropagation(); removeFurniture(f.id) }}
                        className="w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center shadow-md hover:bg-red-600"
                        title="Remove"
                      >
                        <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                      </button>
                    </div>
                  )}
                </div>
              )
            })}

            {/* Grid cells */}
            <div
              className="inline-grid relative"
              style={{
                gridTemplateColumns: `repeat(${layout.cols}, ${cellSize}px)`,
                gap: `${gap}px`,
                marginTop: extraRowsAbove > 0 ? (extraRowsAbove * (cellSize + gap)) : 0,
              }}
            >
              {/* Above-grid drop zones */}
              {extraRowsAbove > 0 && Array.from({ length: extraRowsAbove }).map((_, absR) => {
                const logicalRow = renderStartRow + absR
                return Array.from({ length: layout.cols }).map((_, c) => {
                  const cellKey = `above-${logicalRow}-${c}`
                  if (isCellOccupiedByFurniture(logicalRow, c)) {
                    return <div key={cellKey} style={{ height: cellSize, marginTop: -(extraRowsAbove * (cellSize + gap)) + absR * (cellSize + gap) }} />
                  }
                  return (
                    <div
                      key={cellKey}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleDrop(logicalRow, c)}
                      className="rounded-xl border border-dashed border-gray-100 bg-gray-50/30"
                      style={{ height: cellSize, marginTop: -(extraRowsAbove * (cellSize + gap)) + absR * (cellSize + gap) }}
                    />
                  )
                })
              })}

              {Array.from({ length: layout.rows }).map((_, r) =>
                Array.from({ length: layout.cols }).map((_, c) => {
                  const desk = layout.desks.find(d => d.row === r && d.col === c)
                  const isDoubleRight = layout.desks.find(
                    d => d.type === 'double' && d.row === r && d.col + 1 === c,
                  )
                  const cellKey = `${r}-${c}`
                  const isHovered = hoveredCell === cellKey
                  const hasFurniture = isCellOccupiedByFurniture(r, c)

                  if (isDoubleRight) return null

                  if (hasFurniture) {
                    return (
                      <div
                        key={cellKey}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => handleDrop(r, c)}
                        style={{ height: cellSize }}
                      />
                    )
                  }

                  if (desk && desk.type === 'double') {
                    return (
                      <div
                        key={cellKey}
                        draggable
                        onDragStart={() => handleDragStart(desk.id)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => handleDrop(r, c)}
                        onClick={() => toggleDesk(r, c)}
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                        aria-label={`Double desk at row ${r + 1}, column ${c + 1}. Drag to move or click to remove.`}
                        className="desk-glow rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex items-center justify-center cursor-move select-none shadow-lg animate-pop-in"
                        style={{
                          gridColumn: 'span 2',
                          height: cellSize,
                        }}
                      >
                        <div className="flex items-center gap-1">
                          <svg className="w-5 h-5 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 28 24" strokeWidth="2">
                            <rect x="2" y="6" width="24" height="12" rx="2" />
                            <line x1="14" y1="6" x2="14" y2="18" />
                          </svg>
                          <span className="text-xs font-bold">Pair</span>
                        </div>
                        {tool === 'remove' && isHovered && (
                          <div className="absolute inset-0 bg-red-500/80 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )
                  }

                  if (desk && desk.type === 'single') {
                    return (
                      <div
                        key={cellKey}
                        draggable
                        onDragStart={() => handleDragStart(desk.id)}
                        onDragOver={e => e.preventDefault()}
                        onDrop={() => handleDrop(r, c)}
                        onClick={() => toggleDesk(r, c)}
                        onMouseEnter={() => setHoveredCell(cellKey)}
                        onMouseLeave={() => setHoveredCell(null)}
                        aria-label={`Single desk at row ${r + 1}, column ${c + 1}. Drag to move or click to remove.`}
                        className="desk-glow rounded-xl bg-gradient-to-br from-blue-500 to-cyan-500 text-white flex items-center justify-center cursor-move select-none shadow-lg animate-pop-in relative"
                        style={{ height: cellSize }}
                      >
                        <svg className="w-6 h-6 opacity-60" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                          <rect x="5" y="7" width="14" height="10" rx="2" />
                        </svg>
                        {tool === 'remove' && isHovered && (
                          <div className="absolute inset-0 bg-red-500/80 rounded-xl flex items-center justify-center">
                            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          </div>
                        )}
                      </div>
                    )
                  }

                  return (
                    <div
                      key={cellKey}
                      role="button"
                      tabIndex={0}
                      aria-label={`Empty cell row ${r + 1}, column ${c + 1}. Click to ${tool === 'add' ? 'place' : 'remove'} desk`}
                      onDragOver={e => e.preventDefault()}
                      onDrop={() => handleDrop(r, c)}
                      onClick={() => toggleDesk(r, c)}
                      onKeyDown={e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); toggleDesk(r, c) } }}
                      onMouseEnter={() => setHoveredCell(cellKey)}
                      onMouseLeave={() => setHoveredCell(null)}
                      className={`rounded-xl border-2 border-dashed flex items-center justify-center transition-all cursor-pointer ${
                        isHovered && tool === 'add'
                          ? 'border-blue-400 bg-blue-50 text-blue-400 scale-105'
                          : 'border-gray-200 text-gray-300 hover:border-gray-300 hover:text-gray-400'
                      }`}
                      style={{ height: cellSize }}
                    >
                      <svg className="w-5 h-5 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2" aria-hidden="true">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    </div>
                  )
                }),
              )}
            </div>
          </div>
        </div>

        {/* Stats bar */}
        <div className="mt-5 flex items-center justify-center gap-6 text-sm">
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-4 h-4 rounded bg-gradient-to-br from-blue-500 to-cyan-500" />
            <span className="font-medium">{layout.desks.filter(d => d.type === 'single').length} singles</span>
          </div>
          <div className="flex items-center gap-2 text-gray-500">
            <div className="w-6 h-4 rounded bg-gradient-to-br from-indigo-500 to-purple-600" />
            <span className="font-medium">{layout.desks.filter(d => d.type === 'double').length} pairs</span>
          </div>
          <div className="w-px h-4 bg-gray-200" />
          <span className="font-bold text-gray-700">{totalSeats} total seats</span>
          {furniture.length > 0 && (
            <>
              <div className="w-px h-4 bg-gray-200" />
              <span className="text-gray-500 font-medium">{furniture.length} furniture</span>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
