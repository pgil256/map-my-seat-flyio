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
