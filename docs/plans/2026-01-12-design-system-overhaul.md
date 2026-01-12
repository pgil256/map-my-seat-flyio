# Design System Overhaul

**Date:** 2026-01-12
**Goal:** Transform Map-My-Seat from generic Chakra defaults to a professional, institutional aesthetic suitable for K-12 school environments.

---

## Overview

The current UI suffers from inconsistent styling, generic component appearance, and a lack of visual cohesion. This design system establishes a unified visual language that feels trustworthy, structured, and appropriate alongside other school admin tools.

**Design principles:**
- Professional and institutional, not playful
- Dense but organized - more visible at a glance without feeling cramped
- Consistent patterns across all pages
- Accessible and print-friendly

---

## Color Palette

### Primary Colors

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Primary | Slate Blue | `#475569` (Slate 600) | Headers, primary buttons, active states |
| Accent | Teal | `#0D9488` (Teal 600) | Success states, links, secondary actions |

### Neutrals (Cool Grays)

| Role | Color | Hex | Usage |
|------|-------|-----|-------|
| Background | Slate 50 | `#F8FAFC` | Page backgrounds |
| Surface | White | `#FFFFFF` | Cards, modals, inputs |
| Border | Slate 200 | `#E2E8F0` | Borders, dividers |
| Text Secondary | Slate 500 | `#64748B` | Helper text, labels |
| Text Primary | Slate 800 | `#1E293B` | Body text, headings |

### Semantic Colors

| Role | Hex | Usage |
|------|-----|-------|
| Error | `#DC2626` (Red 600) | Error states, destructive actions |
| Warning | `#D97706` (Amber 600) | Warning states |
| Success | `#0D9488` (Teal 600) | Success states (same as accent) |
| Info | `#475569` (Slate 600) | Info states (same as primary) |

### Accommodation Badges (Desaturated)

| Type | Background | Text |
|------|------------|------|
| ESE | `#EDE9FE` (Violet 100) | `#6D28D9` (Violet 700) |
| 504 | `#DBEAFE` (Blue 100) | `#1D4ED8` (Blue 700) |
| ELL | `#D1FAE5` (Emerald 100) | `#047857` (Emerald 700) |
| EBD | `#FED7AA` (Orange 200) | `#C2410C` (Orange 700) |

---

## Typography

### Font Stack

```css
font-family: Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
```

### Type Scale

| Element | Size | Weight | Color |
|---------|------|--------|-------|
| Page title | 24px | 600 (semibold) | Slate 800 |
| Section header | 18px | 500 (medium) | Slate 800 |
| Body | 14px | 400 (regular) | Slate 800 |
| Small / Labels | 12px | 500 (medium) | Slate 600 |
| Tiny (badges) | 10px | 500 (medium) | Varies |

### Letter Spacing

- Labels and small text: `0.025em` (slightly expanded)
- All other text: default

---

## Spacing System

**Base unit:** 4px

| Token | Value | Usage |
|-------|-------|-------|
| `space.1` | 4px | Tight gaps (badge padding) |
| `space.2` | 8px | Between related elements |
| `space.3` | 12px | Form field gaps |
| `space.4` | 16px | Card padding, section gaps |
| `space.6` | 24px | Page margins, large sections |
| `space.8` | 32px | Between major page sections |

---

## Components

### Buttons

**Primary:**
- Background: Slate 600
- Text: White
- Border radius: 6px
- Padding: 8px 16px
- Font: 14px, medium weight
- Hover: Slate 700
- Shadow: `0 1px 2px rgba(0,0,0,0.05)`

**Secondary:**
- Background: White
- Border: 1px Slate 300
- Text: Slate 700
- Hover: Slate 50 background

**Ghost:**
- Background: transparent
- Text: Slate 600
- Hover: Slate 100 background

### Cards

- Background: White
- Border: 1px Slate 200
- Border radius: 8px
- Padding: 16px
- Shadow: none (or `0 1px 2px rgba(0,0,0,0.03)` for elevation)

### Form Inputs

- Background: White
- Border: 1px Slate 300
- Border radius: 6px
- Padding: 8px 12px
- Focus: Slate 400 border (no glow)
- Error: Red 600 border + error text below
- Labels: 12px, medium weight, Slate 600, 4px margin below

### Tables

- Header: Slate 50 background, Slate 600 text, medium weight
- Rows: White background, 1px Slate 200 bottom border
- Row height: 48px
- Hover (if clickable): Slate 50 background
- No vertical gridlines

### Badges

- Border radius: 9999px (pill)
- Padding: 2px 8px
- Font: 10px, medium weight
- Desaturated colors per accommodation type

---

## Navigation

### Top Navigation Bar

- Height: 56px
- Background: White
- Border: 1px Slate 200 bottom
- Logo: Slate 800, medium weight, left-aligned
- Links: Slate 600, hover Slate 900, active has Slate 900 + underline
- User menu: Right-aligned

### Breadcrumbs

- Font: 12px
- Color: Slate 500, current page Slate 800
- Separator: `/` or chevron in Slate 400

### Page Layout

- Max width: 1200px, centered
- Page margins: 24px
- Page header pattern: Title left, primary action right
- Content organized in cards or bordered sections

### Mobile

- Hamburger menu opens slide-out drawer
- Stacked links with same styling as desktop
- Bottom-sticky primary action on key pages

### Setup Progress Indicator

- Horizontal steps with checkmarks
- Completed: Teal checkmark, Slate 600 text
- Current: Teal text, bold
- Upcoming: Slate 400 text

---

## Seating Chart Grid

### Container

- White card, 1px Slate 200 border
- Padding: 24px
- Title bar: Classroom name, period, generation date
- Actions: Top-right, secondary button style

### Grid

- Cell gap: 4px
- Cell size: 80-100px squares
- Optional row/column labels in Slate 400, 10px

### Desk Cells

**Empty:**
- Background: Slate 50
- Border: 1px dashed Slate 300
- Border radius: 4px

**Student (occupied):**
- Background: White
- Border: 1px Slate 300
- Border radius: 4px
- Student name: 13px, medium weight, centered, truncate with ellipsis
- Badges: Below name, tiny pills
- Hover: Subtle shadow (`0 2px 4px rgba(0,0,0,0.1)`)

**Teacher:**
- Background: Slate 200
- Label: "Teacher" in Slate 500

### Print Styles

- Grayscale-friendly (no color reliance)
- Badges become text: "(ESE, 504)"
- Thicker borders: 2px
- Remove shadows and hover states

---

## Empty States

- Centered in content area
- Optional minimal icon (32px, Slate 400)
- Headline: 18px, medium weight, Slate 800
- Subtext: 14px, Slate 500
- Primary action button below

Example:
```
[icon]
No students yet
Add students to this period to get started.
[Add Student]
```

---

## Loading States

- Skeleton shapes match actual content layout
- Skeleton color: Slate 200
- Pulse animation: 1.5s ease-in-out

---

## Toast Notifications

- Position: Bottom-right
- Background: White
- Left border: 4px, color indicates type
- Border radius: 6px
- Shadow: `0 4px 6px rgba(0,0,0,0.1)`
- Auto-dismiss: 4 seconds

| Type | Border Color |
|------|--------------|
| Success | Teal 600 |
| Error | Red 600 |
| Info | Slate 600 |

---

## Icons

**Icon set:** Lucide Icons (or Heroicons)

- Consistent 20px size for inline icons
- 24px for standalone/button icons
- Stroke width: 1.5px
- Color: Inherit from text color

---

## Transitions

- Duration: 150ms
- Easing: ease-in-out
- Apply to: hover states, focus states, color changes
- No flashy animations

---

## Landing Page

- Clean hero: Headline + subhead + single CTA
- Feature grid: 3 columns, simple icons, short descriptions
- Alternating section backgrounds (White / Slate 50)
- Professional tone, no playful elements
- Optional social proof section

---

## Implementation Notes

### Chakra Theme Customization

All values should be implemented as a custom Chakra theme extending the default:

```javascript
const theme = extendTheme({
  colors: {
    brand: {
      // Slate palette for primary
      // Teal for accent
    }
  },
  fonts: {
    heading: 'Inter, sans-serif',
    body: 'Inter, sans-serif',
  },
  components: {
    Button: { /* variants */ },
    Card: { /* base styles */ },
    Input: { /* variants */ },
    // etc.
  }
})
```

### Files to Modify

1. `frontend/src/theme.js` - Create or update Chakra theme
2. `frontend/src/index.css` - Global styles, font imports
3. All component files - Update to use theme tokens instead of hardcoded values
4. `frontend/src/seating/SeatingChart.jsx` - Grid-specific styling
5. Print stylesheet - Separate or scoped print styles

### Migration Approach

1. Create theme file with all tokens
2. Update global styles
3. Migrate components page-by-page
4. Test print styles
5. Verify dark mode compatibility (if keeping)
