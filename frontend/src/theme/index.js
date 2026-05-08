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
    lg: '0.75rem',   // 12px
    xl: '1rem',      // 16px
    '2xl': '1.5rem', // 24px
    full: '9999px',
  },
  shadows: {
    sm: '0 1px 2px rgba(17, 24, 39, 0.06)',
    base: '0 1px 2px rgba(17, 24, 39, 0.07)',
    md: '0 2px 8px rgba(17, 24, 39, 0.08)',
    lg: '0 8px 24px rgba(17, 24, 39, 0.10)',
    xl: '0 16px 36px rgba(17, 24, 39, 0.14)',
    '2xl': '0 24px 48px rgba(17, 24, 39, 0.16)',
    card: '0 1px 2px rgba(17, 24, 39, 0.06)',
    glow: '0 0 0 1px rgba(37, 99, 235, 0.16), 0 10px 28px -16px rgba(37, 99, 235, 0.38)',
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
        borderRadius: 'md',
        transition: 'background-color 0.15s ease, border-color 0.15s ease, color 0.15s ease, box-shadow 0.15s ease',
      },
      sizes: {
        md: {
          fontSize: 'md',
          px: 4,
          py: 2,
        },
        lg: {
          fontSize: 'md',
          px: 6,
          py: 3,
          borderRadius: 'md',
        },
      },
      variants: {
        solid: (props) => ({
          bg: props.colorMode === 'dark' ? 'brand.500' : 'brand.700',
          color: 'white',
          boxShadow: 'sm',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.400' : 'brand.800',
            boxShadow: 'sm',
            _disabled: { boxShadow: 'sm' },
          },
          _active: {
            bg: props.colorMode === 'dark' ? 'brand.600' : 'brand.900',
          },
        }),
        outline: (props) => ({
          bg: props.colorMode === 'dark' ? 'transparent' : 'white',
          color: props.colorMode === 'dark' ? 'brand.200' : 'brand.700',
          borderColor: props.colorMode === 'dark' ? 'brand.500' : 'brand.300',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.800' : 'brand.50',
            borderColor: props.colorMode === 'dark' ? 'brand.400' : 'brand.400',
          },
        }),
        ghost: (props) => ({
          color: props.colorMode === 'dark' ? 'brand.200' : 'brand.600',
          _hover: {
            bg: props.colorMode === 'dark' ? 'brand.800' : 'brand.100',
          },
        }),
        accent: (props) => ({
          bg: props.colorMode === 'dark' ? 'accent.500' : 'accent.600',
          color: 'white',
          boxShadow: 'sm',
          _hover: {
            bg: props.colorMode === 'dark' ? 'accent.400' : 'accent.700',
            boxShadow: 'sm',
            _disabled: { boxShadow: 'sm' },
          },
          _active: {
            bg: props.colorMode === 'dark' ? 'accent.600' : 'accent.800',
          },
        }),
        danger: (props) => ({
          bg: 'transparent',
          color: props.colorMode === 'dark' ? 'error.300' : 'error.600',
          borderWidth: '1px',
          borderColor: props.colorMode === 'dark' ? 'error.600' : 'error.300',
          _hover: {
            bg: props.colorMode === 'dark' ? 'error.900' : 'error.50',
            borderColor: props.colorMode === 'dark' ? 'error.500' : 'error.400',
          },
          _active: {
            bg: props.colorMode === 'dark' ? 'error.800' : 'error.100',
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
          boxShadow: 'card',
          transition: 'all 0.18s ease',
        },
      }),
    },
    Input: {
      variants: {
        outline: (props) => ({
          field: {
            bg: props.colorMode === 'dark' ? 'brand.800' : 'white',
            borderColor: props.colorMode === 'dark' ? 'brand.600' : 'brand.300',
            borderRadius: 'md',
            fontSize: 'md',
            transition: 'all 0.15s ease',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'brand.500' : 'brand.400',
            },
            _focus: {
              borderColor: props.colorMode === 'dark' ? 'accent.400' : 'accent.500',
              boxShadow: props.colorMode === 'dark'
                ? '0 0 0 3px rgba(45, 212, 191, 0.20)'
                : '0 0 0 3px rgba(20, 184, 166, 0.18)',
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
            borderRadius: 'md',
            fontSize: 'md',
            transition: 'all 0.15s ease',
            _hover: {
              borderColor: props.colorMode === 'dark' ? 'brand.500' : 'brand.400',
            },
            _focus: {
              borderColor: props.colorMode === 'dark' ? 'accent.400' : 'accent.500',
              boxShadow: props.colorMode === 'dark'
                ? '0 0 0 3px rgba(45, 212, 191, 0.20)'
                : '0 0 0 3px rgba(20, 184, 166, 0.18)',
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
        letterSpacing: 'tight',
      }),
      sizes: {
        '3xl': { fontSize: '4xl', letterSpacing: 'tighter' },
        '2xl': { fontSize: '3xl', letterSpacing: 'tighter' },
        xl: { fontSize: '2xl', letterSpacing: 'tight' },
        lg: { fontSize: 'xl' },
        md: { fontSize: 'lg' },
        sm: { fontSize: 'md' },
      },
    },
    Badge: {
      baseStyle: {
        borderRadius: 'md',
        px: 2.5,
        py: 0.5,
        fontSize: 'xs',
        fontWeight: 'semibold',
        textTransform: 'uppercase',
          letterSpacing: 'normal',
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
              borderRadius: 'md',
            },
          };
        },
      },
    },
    Modal: {
      baseStyle: (props) => ({
        dialog: {
          bg: props.colorMode === 'dark' ? 'brand.800' : 'white',
          borderWidth: '1px',
          borderColor: props.colorMode === 'dark' ? 'brand.700' : 'brand.200',
          borderRadius: 'md',
          boxShadow: 'xl',
        },
        header: {
          fontSize: 'lg',
          fontWeight: 'semibold',
          letterSpacing: 'tight',
        },
        overlay: {
          bg: 'rgba(15, 23, 42, 0.55)',
          backdropFilter: 'blur(4px)',
        },
      }),
    },
  },
});

export default theme;
