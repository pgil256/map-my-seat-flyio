// frontend/src/theme/colors.js
export const colors = {
  // Primary - Slate Blue
  brand: {
    50: '#f8fafc',
    100: '#f1f5f9',
    200: '#e2e8f0',
    300: '#cbd5e1',
    400: '#94a3b8',
    500: '#64748b',
    600: '#475569',
    700: '#334155',
    800: '#1e293b',
    900: '#0f172a',
  },
  // Accent - Teal
  accent: {
    50: '#f0fdfa',
    100: '#ccfbf1',
    200: '#99f6e4',
    300: '#5eead4',
    400: '#2dd4bf',
    500: '#14b8a6',
    600: '#0d9488',
    700: '#0f766e',
    800: '#115e59',
    900: '#134e4a',
  },
  // Semantic - using Chakra's built-in but with our preferred shades
  success: {
    500: '#0d9488', // teal.600
    600: '#0f766e',
  },
  error: {
    500: '#dc2626', // red.600
    600: '#b91c1c',
  },
  warning: {
    500: '#d97706', // amber.600
    600: '#b45309',
  },
  // Accommodation badges (desaturated)
  accommodation: {
    ese: {
      bg: '#ede9fe',
      text: '#6d28d9',
    },
    plan504: {
      bg: '#dbeafe',
      text: '#1d4ed8',
    },
    ell: {
      bg: '#d1fae5',
      text: '#047857',
    },
    ebd: {
      bg: '#fed7aa',
      text: '#c2410c',
    },
  },
};
