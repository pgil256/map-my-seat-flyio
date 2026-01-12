# Design System Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Transform the frontend from generic Chakra defaults to a professional, institutional aesthetic.

**Architecture:** Create a comprehensive Chakra theme file defining colors, typography, spacing, and component variants. Update all components to use theme tokens instead of hardcoded values. Preserve dark mode support.

**Tech Stack:** React 18, Chakra UI, Vite

---

## Task 1: Create Theme Foundation

**Files:**
- Create: `frontend/src/theme/index.js`
- Create: `frontend/src/theme/colors.js`
- Create: `frontend/src/theme/typography.js`

**Step 1: Create theme directory**

```bash
mkdir -p frontend/src/theme
```

**Step 2: Create colors.js**

```javascript
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
```

**Step 3: Create typography.js**

```javascript
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
```

**Step 4: Create main theme index.js**

```javascript
// frontend/src/theme/index.js
import { extendTheme } from '@chakra-ui/react';
import { colors } from './colors';
import { fonts, fontSizes, fontWeights, lineHeights, letterSpacings } from './typography';

const theme = extendTheme({
  config: {
    initialColorMode: 'light',
    useSystemColorMode: false,
  },
  colors,
  fonts,
  fontSizes,
  fontWeights,
  lineHeights,
  letterSpacings,
  space: {
    px: '1px',
    0.5: '0.125rem',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    8: '2rem',       // 32px
    10: '2.5rem',
    12: '3rem',
    16: '4rem',
  },
  radii: {
    none: '0',
    sm: '0.25rem',   // 4px
    base: '0.375rem', // 6px
    md: '0.5rem',    // 8px
    lg: '0.75rem',
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px rgba(0, 0, 0, 0.1), 0 1px 2px rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  styles: {
    global: (props) => ({
      body: {
        bg: props.colorMode === 'dark' ? 'brand.900' : 'brand.50',
        color: props.colorMode === 'dark' ? 'brand.100' : 'brand.800',
        fontSize: 'md',
        lineHeight: 'base',
      },
    }),
  },
  components: {
    Button: {
      baseStyle: {
        fontWeight: 'medium',
        borderRadius: 'base',
        transition: 'all 0.15s ease-in-out',
      },
      sizes: {
        md: {
          fontSize: 'md',
          px: 4,
          py: 2,
        },
      },
      variants: {
        solid: (props) => ({
          bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.600',
          color: 'white',
          boxShadow: 'sm',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.400' : 'brand.700',
            transform: 'none',
          },
          _active: {
            bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.800',
          },
        }),
        outline: (props) => ({
          bg: props.colorMode === 'dark' ? 'transparent' : 'white',
          color: props.colorMode === 'dark' ? 'brand.200' : 'brand.700',
          borderColor: props.colorMode === 'dark' ? 'brand.500' : 'brand.300',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.800' : 'brand.50',
            transform: 'none',
          },
        }),
        ghost: (props) => ({
          color: props.colorMode === 'dark' ? 'brand.200' : 'brand.600',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.800' : 'brand.100',
            transform: 'none',
          },
        }),
        accent: (props) => ({
          bg: props.colorMode === 'dark' ? 'accent.600' : 'accent.600',
          color: 'white',
          _hover: {
            bg: props.colorMode === 'dark' ? 'accent.500' : 'accent.700',
            transform: 'none',
          },
        }),
      },
      defaultProps: {
        variant: 'solid',
      },
    },
    Card: {
      baseStyle: (props) => ({
        container: {
          bg: props.colorMode === 'dark' ? 'brand.800' : 'white',
          borderWidth: '1px',
          borderColor: props.colorMode === 'dark' ? 'brand.700' : 'brand.200',
          borderRadius: 'md',
          boxShadow: 'none',
          transition: 'none',
          _hover: {
            transform: 'none',
            boxShadow: 'none',
          },
        },
      }),
    },
    Input: {
      variants: {
        outline: (props) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'brand.800' : 'white',
            borderColor: props.colorMode === 'dark' ? 'brand.600' : 'brand.300',
            borderRadius: 'base',
            fontSize: 'md',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'brand.500' : 'brand.400',
            },
            _focus: {
              borderColor: props.colorMode === 'dark' ? 'brand.400' : 'brand.400',
              boxShadow: 'none',
            },
          },
        }),
      },
      defaultProps: {
        variant: 'outline',
      },
    },
    Select: {
      variants: {
        outline: (props) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'brand.800' : 'white',
            borderColor: props.colorMode === 'dark' ? 'brand.600' : 'brand.300',
            borderRadius: 'base',
            fontSize: 'md',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'brand.500' : 'brand.400',
            },
            _focus: {
              borderColor: props.colorMode === 'dark' ? 'brand.400' : 'brand.400',
              boxShadow: 'none',
            },
          },
        }),
      },
    },
    FormLabel: {
      baseStyle: (props) => ({
        fontSize: 'sm',
        fontWeight: 'medium',
        color: props.colorMode === 'dark' ? 'brand.300' : 'brand.600',
        mb: 1,
      }),
    },
    Heading: {
      baseStyle: (props) => ({
        color: props.colorMode === 'dark' ? 'brand.100' : 'brand.800',
        fontWeight: 'semibold',
      }),
      sizes: {
        lg: {
          fontSize: 'xl',
        },
        md: {
          fontSize: 'lg',
        },
        sm: {
          fontSize: 'md',
        },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'full',
        px: 2,
        py: 0.5,
        fontSize: 'xs',
        fontWeight: 'medium',
        textTransform: 'uppercase',
        letterSpacing: 'wide',
      },
    },
    Table: {
      variants: {
        simple: (props) => ({
          th: {
            bg: props.colorMode === 'dark' ? 'brand.800' : 'brand.50',
            color: props.colorMode === 'dark' ? 'brand.200' : 'brand.600',
            fontWeight: 'medium',
            fontSize: 'sm',
            textTransform: 'none',
            letterSpacing: 'normal',
            borderColor: props.colorMode === 'dark' ? 'brand.700' : 'brand.200',
          },
          td: {
            borderColor: props.colorMode === 'dark' ? 'brand.700' : 'brand.200',
            fontSize: 'md',
          },
          tr: {
            _hover: {
              bg: props.colorMode === 'dark' ? 'brand.800' : 'brand.50',
            },
          },
        }),
      },
    },
    Breadcrumb: {
      baseStyle: (props) => ({
        link: {
          color: props.colorMode === 'dark' ? 'brand.200' : 'brand.600',
          fontSize: 'sm',
          _hover: {
            color: props.colorMode === 'dark' ? 'brand.100' : 'brand.800',
            textDecoration: 'none',
          },
        },
        separator: {
          color: props.colorMode === 'dark' ? 'brand.500' : 'brand.400',
        },
      }),
    },
    Alert: {
      variants: {
        subtle: (props) => {
          const colorScheme = props.colorScheme || 'brand';
          return {
            container: {
              bg: props.colorMode === 'dark' ? 'brand.800' : 'white',
              borderLeft: '4px solid',
              borderColor: `${colorScheme}.500`,
              borderRadius: 'base',
            },
          };
        },
      },
    },
  },
});

export default theme;
```

**Step 5: Run frontend tests to ensure no regressions**

```bash
cd frontend && npm test
```

Expected: All tests pass (268 tests)

**Step 6: Commit theme foundation**

```bash
git add frontend/src/theme/
git commit -m "feat(theme): add design system foundation with colors, typography, and component variants"
```

---

## Task 2: Integrate Theme into App

**Files:**
- Modify: `frontend/src/main.jsx`
- Modify: `frontend/src/index.css`

**Step 1: Update main.jsx to use new theme**

Replace the entire file:

```javascript
// frontend/src/main.jsx
import React from 'react'
import { ChakraProvider } from '@chakra-ui/react'
import ReactDOM from 'react-dom/client'
import App from './App.jsx'
import theme from './theme'
import './index.css'

const rootElement = document.getElementById('root')
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ChakraProvider theme={theme}>
      <App />
    </ChakraProvider>
  </React.StrictMode>,
)
```

**Step 2: Update index.css to remove conflicting styles**

Replace the entire file with minimal reset:

```css
/* frontend/src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');

*,
*::before,
*::after {
  box-sizing: border-box;
}

body {
  margin: 0;
  min-width: 320px;
  min-height: 100vh;
  font-synthesis: none;
  text-rendering: optimizeLegibility;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}

/* Remove default button styles to let Chakra handle them */
button {
  font-family: inherit;
}

/* Focus visible for accessibility */
:focus-visible {
  outline: 2px solid #475569;
  outline-offset: 2px;
}
```

**Step 3: Run frontend tests**

```bash
cd frontend && npm test
```

Expected: All tests pass

**Step 4: Commit integration**

```bash
git add frontend/src/main.jsx frontend/src/index.css
git commit -m "feat(theme): integrate design system theme into app"
```

---

## Task 3: Update Navigation Component

**Files:**
- Modify: `frontend/src/navigation/Navigation.jsx`
- Modify: `frontend/src/navigation/MobileNav.jsx`

**Step 1: Update Navigation.jsx**

```javascript
// frontend/src/navigation/Navigation.jsx
import { useContext } from "react";
import { Link } from "react-router-dom";
import UserContext from "../auth/UserContext";
import MobileNav from "./MobileNav";
import {
  Box,
  Flex,
  Container,
  HStack,
  Link as ChakraLink,
  IconButton,
  useColorMode,
  useColorModeValue,
  Text,
} from "@chakra-ui/react";
import { MoonIcon, SunIcon } from "@chakra-ui/icons";

const Navigation = ({ logout }) => {
  const { currentUser } = useContext(UserContext);
  const { colorMode, toggleColorMode } = useColorMode();
  const bgColor = useColorModeValue("white", "brand.800");
  const borderColor = useColorModeValue("brand.200", "brand.700");
  const textColor = useColorModeValue("brand.600", "brand.200");
  const activeColor = useColorModeValue("brand.800", "brand.100");
  const hoverBg = useColorModeValue("brand.50", "brand.700");

  const NavLink = ({ to, children, onClick }) => (
    <ChakraLink
      as={Link}
      to={to}
      onClick={onClick}
      px={3}
      py={2}
      fontSize="sm"
      fontWeight="medium"
      color={textColor}
      borderRadius="base"
      _hover={{
        bg: hoverBg,
        color: activeColor,
        textDecoration: "none",
      }}
    >
      {children}
    </ChakraLink>
  );

  const loggedInNav = () => {
    return (
      <Box
        bg={bgColor}
        w="100%"
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="container.xl" py={3}>
          <Flex justify="space-between" align="center">
            <HStack spacing={1} display={{ base: "none", md: "flex" }}>
              <ChakraLink
                as={Link}
                to="/"
                fontWeight="semibold"
                fontSize="md"
                color={activeColor}
                mr={4}
                _hover={{ textDecoration: "none" }}
              >
                Map My Seat
              </ChakraLink>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/periods">Classes</NavLink>
              <NavLink to={`/classrooms/${currentUser.username}`}>Classrooms</NavLink>
              <NavLink to="/profile">Profile</NavLink>
              <NavLink to="/" onClick={logout}>Logout</NavLink>
            </HStack>

            <Box display={{ base: "block", md: "none" }}>
              <ChakraLink
                as={Link}
                to="/"
                fontWeight="semibold"
                color={activeColor}
                _hover={{ textDecoration: 'none' }}
              >
                Map My Seat
              </ChakraLink>
            </Box>

            <HStack spacing={2}>
              <IconButton
                aria-label="Toggle dark mode"
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                size="sm"
                display={{ base: "none", md: "flex" }}
              />
              <MobileNav currentUser={currentUser} logout={logout} />
            </HStack>
          </Flex>
        </Container>
      </Box>
    );
  };

  const loggedOutNav = () => {
    return (
      <Box
        bg={bgColor}
        w="100%"
        borderBottom="1px"
        borderColor={borderColor}
        position="sticky"
        top={0}
        zIndex={10}
      >
        <Container maxW="container.xl" py={3}>
          <Flex justify="space-between" align="center">
            <HStack spacing={1} display={{ base: "none", md: "flex" }}>
              <ChakraLink
                as={Link}
                to="/"
                fontWeight="semibold"
                fontSize="md"
                color={activeColor}
                mr={4}
                _hover={{ textDecoration: "none" }}
              >
                Map My Seat
              </ChakraLink>
              <NavLink to="/">Home</NavLink>
              <NavLink to="/login">Log In</NavLink>
              <NavLink to="/signup">Sign Up</NavLink>
            </HStack>

            <Box display={{ base: "block", md: "none" }}>
              <ChakraLink
                as={Link}
                to="/"
                fontWeight="semibold"
                color={activeColor}
                _hover={{ textDecoration: 'none' }}
              >
                Map My Seat
              </ChakraLink>
            </Box>

            <HStack spacing={2}>
              <IconButton
                aria-label="Toggle dark mode"
                icon={colorMode === "light" ? <MoonIcon /> : <SunIcon />}
                onClick={toggleColorMode}
                variant="ghost"
                size="sm"
                display={{ base: "none", md: "flex" }}
              />
              <MobileNav currentUser={currentUser} logout={logout} />
            </HStack>
          </Flex>
        </Container>
      </Box>
    );
  };

  return <nav>{!currentUser ? loggedOutNav() : loggedInNav()}</nav>;
};

export default Navigation;
```

**Step 2: Run navigation tests**

```bash
cd frontend && npm test -- --testPathPattern="Navigation"
```

Expected: All navigation tests pass

**Step 3: Commit navigation updates**

```bash
git add frontend/src/navigation/
git commit -m "feat(navigation): apply design system to navigation bar"
```

---

## Task 4: Update Landing Page

**Files:**
- Modify: `frontend/src/home/LandingPage.jsx`

**Step 1: Read current LandingPage to understand structure**

```bash
cat frontend/src/home/LandingPage.jsx
```

**Step 2: Update LandingPage with new design system**

Key changes:
- Replace teal color scheme with brand/accent colors
- Update button variants
- Apply consistent spacing and typography
- Keep structure, update visual styling

**Step 3: Run home tests**

```bash
cd frontend && npm test -- --testPathPattern="Home"
```

Expected: All home tests pass

**Step 4: Commit landing page updates**

```bash
git add frontend/src/home/
git commit -m "feat(landing): apply design system to landing page"
```

---

## Task 5: Update Form Components

**Files:**
- Modify: `frontend/src/auth/LoginForm.jsx`
- Modify: `frontend/src/auth/SignupForm.jsx`
- Modify: `frontend/src/periods/PeriodForm.jsx`
- Modify: `frontend/src/students/StudentForm.jsx`
- Modify: `frontend/src/profile/ProfileForm.jsx`

**Step 1: Create a shared form card wrapper pattern**

For each form, apply:
- Card container with proper padding (p={6})
- Consistent heading size (size="lg")
- Form field spacing (spacing={4} on VStack)
- Button using solid variant
- Error states using theme colors

**Step 2: Update LoginForm.jsx**

Key changes:
- Wrap in Card component
- Use theme-consistent colors
- Update button to use solid variant

**Step 3: Update SignupForm.jsx**

Same pattern as LoginForm

**Step 4: Update PeriodForm.jsx**

Same pattern with form-specific fields

**Step 5: Update StudentForm.jsx**

Same pattern, update accommodation badges to use theme colors

**Step 6: Update ProfileForm.jsx**

Same pattern

**Step 7: Run all form tests**

```bash
cd frontend && npm test -- --testPathPattern="Form"
```

Expected: All form tests pass

**Step 8: Commit form updates**

```bash
git add frontend/src/auth/ frontend/src/periods/ frontend/src/students/ frontend/src/profile/
git commit -m "feat(forms): apply design system to all form components"
```

---

## Task 6: Update Classroom and Seating Chart

**Files:**
- Modify: `frontend/src/classrooms/ClassroomForm.jsx`
- Modify: `frontend/src/seating/SeatingChart.jsx`
- Modify: `frontend/src/seating/SeatingChart.css`

**Step 1: Update ClassroomForm.jsx**

- Apply card wrapper pattern
- Update grid editor colors to use brand palette
- Update algorithm selection styling

**Step 2: Update SeatingChart.jsx**

Key changes:
- Container: white card with subtle border
- Desk cells: brand.100 background, brand.200 border
- Student desks: white background, brand.300 border
- Teacher desk: brand.200 background
- Accommodation badges: use theme accommodation colors
- Hover states: subtle shadow

**Step 3: Update SeatingChart.css print styles**

```css
/* frontend/src/seating/SeatingChart.css */
@media print {
  nav,
  button,
  .no-print {
    display: none !important;
  }

  body {
    margin: 0;
    padding: 0;
    background: white !important;
  }

  .seating-chart-container {
    width: 100%;
    max-width: none;
    page-break-inside: avoid;
  }

  .seating-chart-container table {
    border-collapse: collapse;
  }

  .seating-chart-container td {
    border: 2px solid #1e293b !important;
    background: white !important;
    color: #1e293b !important;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  .seating-chart-container td.desk {
    background: #f1f5f9 !important;
  }

  .seating-chart-container td.teacher-desk {
    background: #e2e8f0 !important;
  }

  /* Badges become text in print */
  .accommodation-badge {
    background: none !important;
    color: #1e293b !important;
    font-size: 10px;
  }
}
```

**Step 4: Run seating chart tests**

```bash
cd frontend && npm test -- --testPathPattern="SeatingChart"
```

Expected: All seating chart tests pass

**Step 5: Commit seating chart updates**

```bash
git add frontend/src/classrooms/ frontend/src/seating/
git commit -m "feat(seating): apply design system to classroom and seating chart"
```

---

## Task 7: Update Common Components

**Files:**
- Modify: `frontend/src/common/EmptyState.jsx`
- Modify: `frontend/src/common/Alert.jsx`
- Modify: `frontend/src/common/PageSkeleton.jsx`
- Modify: `frontend/src/common/WelcomeModal.jsx`

**Step 1: Update EmptyState.jsx**

```javascript
// Key styling:
// - Centered text
// - Icon in brand.400
// - Heading in brand.800 (light) / brand.100 (dark)
// - Subtext in brand.500
// - Primary action button below
```

**Step 2: Update Alert.jsx**

Use theme's Alert variant which has left border styling

**Step 3: Update PageSkeleton.jsx**

Update skeleton colors to use brand.200

**Step 4: Update WelcomeModal.jsx**

Apply card styling to modal, update button colors

**Step 5: Run common component tests**

```bash
cd frontend && npm test -- --testPathPattern="common"
```

Expected: All common tests pass

**Step 6: Commit common component updates**

```bash
git add frontend/src/common/
git commit -m "feat(common): apply design system to shared components"
```

---

## Task 8: Update Toast Context

**Files:**
- Modify: `frontend/src/common/ToastContext.jsx`

**Step 1: Update toast styling**

Update the toast options to use:
- Position: bottom-right
- White background with left color bar
- Success: accent.600 bar
- Error: error.500 bar
- Info: brand.600 bar

**Step 2: Test toast notifications manually**

Start dev server and trigger toasts to verify styling

```bash
cd frontend && npm run dev
```

**Step 3: Commit toast updates**

```bash
git add frontend/src/common/ToastContext.jsx
git commit -m "feat(toast): apply design system to toast notifications"
```

---

## Task 9: Clean Up App.css

**Files:**
- Modify: `frontend/src/App.css`

**Step 1: Remove unused Vite boilerplate styles**

Replace with minimal App-specific styles if needed, or remove entirely if all styling is in theme:

```css
/* frontend/src/App.css */
/* App-specific styles - most styling handled by Chakra theme */

#root {
  min-height: 100vh;
}
```

**Step 2: Run all tests**

```bash
cd frontend && npm test
```

Expected: All 268 tests pass

**Step 3: Commit cleanup**

```bash
git add frontend/src/App.css
git commit -m "chore: clean up unused CSS boilerplate"
```

---

## Task 10: Final Testing and Review

**Step 1: Run full test suite**

```bash
cd frontend && npm test
```

Expected: All tests pass

**Step 2: Run linter**

```bash
cd frontend && npm run lint
```

Fix any linting errors

**Step 3: Start dev server for visual review**

```bash
npm run dev:frontend
```

**Step 4: Manual visual review checklist**

- [ ] Landing page looks professional
- [ ] Navigation bar is clean and consistent
- [ ] Login/Signup forms have proper styling
- [ ] Period form has consistent styling
- [ ] Student form with badges looks good
- [ ] Classroom editor has proper colors
- [ ] Seating chart grid looks clean
- [ ] Empty states are helpful and styled
- [ ] Dark mode works throughout
- [ ] Print preview of seating chart looks good

**Step 5: Final commit**

```bash
git add -A
git commit -m "feat(design-system): complete design system overhaul implementation"
```

---

## Summary

This implementation plan transforms the frontend through:

1. **Theme Foundation** - Colors, typography, spacing, and component variants
2. **App Integration** - Hook theme into ChakraProvider
3. **Navigation** - Professional top bar with subtle styling
4. **Landing Page** - Clean, institutional hero and features
5. **Forms** - Consistent card-wrapped forms with proper spacing
6. **Seating Chart** - Professional grid with subtle colors
7. **Common Components** - Empty states, alerts, skeletons
8. **Toast Notifications** - Left-bar indicator style
9. **CSS Cleanup** - Remove conflicting styles
10. **Final Review** - Test everything, visual QA

Each task is designed to be committed independently, allowing incremental progress and easy rollback if needed.
