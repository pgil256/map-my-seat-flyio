import { describe, it, expect } from 'vitest'
import { getInitials, getDisplayName, getAvatarColor, getEffectiveSpan, escapeHtml } from './helpers'

describe('getInitials', () => {
  it('handles "Last, First" format', () => {
    expect(getInitials('Smith, John')).toBe('JS')
  })

  it('handles "First Last" format', () => {
    expect(getInitials('John Smith')).toBe('JS')
  })

  it('handles single name', () => {
    expect(getInitials('Madonna')).toBe('M')
  })
})

describe('getDisplayName', () => {
  it('converts "Last, First" to "First L."', () => {
    expect(getDisplayName('Anderson, Emma')).toBe('Emma A.')
  })

  it('returns name as-is when not in "Last, First" format', () => {
    expect(getDisplayName('Emma')).toBe('Emma')
  })

  it('handles multiple first names', () => {
    expect(getDisplayName('Garcia, Maria Elena')).toBe('Maria G.')
  })
})

describe('getAvatarColor', () => {
  it('returns a consistent color for the same name', () => {
    const c1 = getAvatarColor('John')
    const c2 = getAvatarColor('John')
    expect(c1).toBe(c2)
  })

  it('returns a gradient string', () => {
    expect(getAvatarColor('Test')).toMatch(/^from-/)
  })
})

describe('getEffectiveSpan', () => {
  it('returns normal span when not rotated', () => {
    expect(getEffectiveSpan({ colSpan: 2, rowSpan: 1 })).toEqual({ cs: 2, rs: 1 })
  })

  it('swaps span when rotated', () => {
    expect(getEffectiveSpan({ colSpan: 2, rowSpan: 1, rotated: true })).toEqual({ cs: 1, rs: 2 })
  })

  it('defaults to 1 for zero/falsy spans', () => {
    expect(getEffectiveSpan({ colSpan: 0, rowSpan: 0 })).toEqual({ cs: 1, rs: 1 })
  })
})

describe('escapeHtml', () => {
  it('escapes special HTML characters', () => {
    expect(escapeHtml('<script>"alert&</script>')).toBe('&lt;script&gt;&quot;alert&amp;&lt;/script&gt;')
  })

  it('returns plain text unchanged', () => {
    expect(escapeHtml('hello world')).toBe('hello world')
  })
})
