// frontend/src/theme/typography.js
export const fonts = {
  heading: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  body: 'Inter, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
};

export const fontSizes = {
  xs: '0.625rem',   // 10px - badges
  sm: '0.75rem',    // 12px - labels, small text
  md: '0.875rem',   // 14px - body
  lg: '1.125rem',   // 18px - section headers
  xl: '1.5rem',     // 24px - page titles
  '2xl': '1.875rem', // 30px
  '3xl': '2.25rem',  // 36px
};

export const fontWeights = {
  normal: 400,
  medium: 500,
  semibold: 600,
  bold: 700,
};

export const lineHeights = {
  normal: 'normal',
  none: 1,
  shorter: 1.25,
  short: 1.375,
  base: 1.5,
  tall: 1.625,
};

export const letterSpacings = {
  tighter: '-0.025em',
  tight: '-0.0125em',
  normal: '0',
  wide: '0.025em',
};
