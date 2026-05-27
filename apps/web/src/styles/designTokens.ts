/**
 * Design Token System
 * Semantic tokens for consistent design across AthletiCap
 */

export const designTokens = {
  // Color Palette - Semantic
  colors: {
    // Primary Brand Colors
    gold: {
      50: '#FEF9F0',
      100: '#FDF1DE',
      200: '#FBE3BD',
      300: '#F8D59C',
      400: '#F5BC5A',
      500: '#F0A500',
      600: '#D4860F',
      700: '#A86B0E',
      800: '#8C570B',
      900: '#704608',
      950: '#472A04',
    },
    teal: {
      50: '#F0FEFD',
      100: '#CCFBF1',
      200: '#99F6E4',
      300: '#5EEAD4',
      400: '#2DD4BF',
      500: '#0FB8A8',
      600: '#0D9488',
      700: '#0D7377',
      800: '#0F5F5F',
      900: '#134E4A',
      950: '#092F2F',
    },
    // Semantic Colors
    success: {
      50: '#F0FDF4',
      100: '#DCFCE7',
      200: '#BBF7D0',
      300: '#86EFAC',
      400: '#4ADE80',
      500: '#22C55E',
      600: '#16A34A',
      700: '#15803D',
      800: '#166534',
      900: '#145231',
      950: '#051C15',
    },
    error: {
      50: '#FEF2F2',
      100: '#FEE2E2',
      200: '#FECACA',
      300: '#FCA5A5',
      400: '#F87171',
      500: '#EF4444',
      600: '#DC2626',
      700: '#B91C1C',
      800: '#991B1B',
      900: '#7F1D1D',
      950: '#500724',
    },
    warning: {
      50: '#FFFBEB',
      100: '#FEF3C7',
      200: '#FDE68A',
      300: '#FCD34D',
      400: '#FBBF24',
      500: '#F59E0B',
      600: '#D97706',
      700: '#B45309',
      800: '#92400E',
      900: '#78350F',
      950: '#451A03',
    },
    info: {
      50: '#EFF6FF',
      100: '#DDE9F8',
      200: '#C2D9F0',
      300: '#9EC8E8',
      400: '#7EBCE1',
      500: '#5BA5D9',
      600: '#4388CC',
      700: '#2B6EBE',
      800: '#2058A8',
      900: '#1A4788',
      950: '#102855',
    },
    // Neutral/Gray
    neutral: {
      50: '#F9FAFB',
      100: '#F3F4F6',
      200: '#E5E7EB',
      300: '#D1D5DB',
      400: '#9CA3AF',
      500: '#6B7280',
      600: '#4B5563',
      700: '#374151',
      800: '#1F2937',
      900: '#111827',
      950: '#030712',
    },
  },

  // Spacing Scale (8px base unit)
  spacing: {
    0: '0',
    1: '0.25rem',    // 4px
    2: '0.5rem',     // 8px
    3: '0.75rem',    // 12px
    4: '1rem',       // 16px
    5: '1.25rem',    // 20px
    6: '1.5rem',     // 24px
    7: '1.75rem',    // 28px
    8: '2rem',       // 32px
    9: '2.25rem',    // 36px
    10: '2.5rem',    // 40px
    12: '3rem',      // 48px
    14: '3.5rem',    // 56px
    16: '4rem',      // 64px
    20: '5rem',      // 80px
    24: '6rem',      // 96px
    28: '7rem',      // 112px
    32: '8rem',      // 128px
    36: '9rem',      // 144px
    40: '10rem',     // 160px
    44: '11rem',     // 176px
    48: '12rem',     // 192px
    52: '13rem',     // 208px
    56: '14rem',     // 224px
    60: '15rem',     // 240px
    64: '16rem',     // 256px
    72: '18rem',     // 288px
    80: '20rem',     // 320px
    96: '24rem',     // 384px
  },

  // Typography Scale
  typography: {
    // Display (large headings)
    display: {
      lg: {
        fontSize: '3.5rem',     // 56px
        lineHeight: '1.2',
        letterSpacing: '-0.02em',
        fontWeight: 700,
      },
      md: {
        fontSize: '2.25rem',    // 36px
        lineHeight: '1.25',
        letterSpacing: '-0.015em',
        fontWeight: 700,
      },
      sm: {
        fontSize: '1.875rem',   // 30px
        lineHeight: '1.3',
        letterSpacing: '-0.01em',
        fontWeight: 700,
      },
    },
    // Heading (section headings)
    heading: {
      lg: {
        fontSize: '1.5rem',     // 24px
        lineHeight: '1.4',
        letterSpacing: '-0.01em',
        fontWeight: 700,
      },
      md: {
        fontSize: '1.25rem',    // 20px
        lineHeight: '1.4',
        letterSpacing: '-0.005em',
        fontWeight: 600,
      },
      sm: {
        fontSize: '1rem',       // 16px
        lineHeight: '1.5',
        fontWeight: 600,
      },
    },
    // Body text
    body: {
      lg: {
        fontSize: '1.125rem',   // 18px
        lineHeight: '1.6',
      },
      md: {
        fontSize: '1rem',       // 16px
        lineHeight: '1.5',
      },
      sm: {
        fontSize: '0.875rem',   // 14px
        lineHeight: '1.5',
      },
      xs: {
        fontSize: '0.75rem',    // 12px
        lineHeight: '1.5',
        letterSpacing: '0.01em',
      },
    },
    // Mono/code
    mono: {
      md: {
        fontSize: '0.875rem',   // 14px
        lineHeight: '1.6',
        fontFamily: 'Fira Code, monospace',
      },
      sm: {
        fontSize: '0.75rem',    // 12px
        lineHeight: '1.5',
        fontFamily: 'Fira Code, monospace',
      },
    },
  },

  // Shadows (elevation system)
  shadows: {
    none: 'none',
    sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
    base: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
    md: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
    lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
    xl: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)',
    '2xl': '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
    inner: 'inset 0 2px 4px 0 rgba(0, 0, 0, 0.05)',
    focus: '0 0 0 3px rgba(240, 165, 0, 0.1), 0 0 0 2px rgba(240, 165, 0, 1)',
  },

  // Border Radius
  borderRadius: {
    none: '0',
    sm: '0.25rem',     // 4px
    base: '0.375rem',  // 6px
    md: '0.5rem',      // 8px
    lg: '0.75rem',     // 12px
    xl: '1rem',        // 16px
    '2xl': '1.5rem',   // 24px
    '3xl': '2rem',     // 32px
    full: '9999px',
  },

  // Transitions & Motion
  motion: {
    // Durations
    durations: {
      instant: '0ms',
      fast: '150ms',
      base: '200ms',
      slow: '300ms',
      slower: '500ms',
    },
    // Easing functions
    easing: {
      linear: 'linear',
      easeIn: 'cubic-bezier(0.4, 0, 1, 1)',
      easeOut: 'cubic-bezier(0, 0, 0.2, 1)',
      easeInOut: 'cubic-bezier(0.4, 0, 0.2, 1)',
      // Custom easing for specific use cases
      spring: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
      bounce: 'cubic-bezier(0.68, -0.55, 0.265, 1.55)',
    },
  },

  // Z-Index Scale
  zIndex: {
    hide: -1,
    base: 0,
    dropdown: 1000,
    sticky: 1020,
    fixed: 1030,
    modalBackdrop: 1040,
    modal: 1050,
    popover: 1060,
    tooltip: 1070,
    notification: 1080,
  },

  // Breakpoints
  breakpoints: {
    xs: '320px',
    sm: '640px',
    md: '768px',
    lg: '1024px',
    xl: '1280px',
    '2xl': '1536px',
  },

  // Font Family
  fontFamily: {
    sans: ['Syne', 'system-ui', 'sans-serif'],
    serif: ['Playfair Display', 'serif'],
    mono: ['Fira Code', 'monospace'],
  },

  // Component-specific tokens
  components: {
    button: {
      height: {
        sm: '2rem',      // 32px
        md: '2.5rem',    // 40px
        lg: '3rem',      // 48px
        xl: '3.5rem',    // 56px
      },
      minWidth: '2.5rem', // 40px (for square buttons)
    },
    input: {
      height: '2.5rem',   // 40px
      paddingX: '1rem',   // 16px
      paddingY: '0.5rem', // 8px
    },
    card: {
      padding: '1.5rem',  // 24px
      borderRadius: '0.75rem', // 12px
    },
  },
};

// CSS Custom Properties (for use in CSS files)
export const cssVariables = `
:root {
  /* Colors */
  --color-gold: ${designTokens.colors.gold[500]};
  --color-teal: ${designTokens.colors.teal[500]};
  --color-success: ${designTokens.colors.success[500]};
  --color-error: ${designTokens.colors.error[500]};
  --color-warning: ${designTokens.colors.warning[500]};
  --color-info: ${designTokens.colors.info[500]};

  /* Spacing */
  --spacing-unit: 4px;
  --spacing-xs: 0.25rem;
  --spacing-sm: 0.5rem;
  --spacing-md: 1rem;
  --spacing-lg: 1.5rem;
  --spacing-xl: 2rem;
  --spacing-2xl: 3rem;

  /* Motion */
  --duration-fast: 150ms;
  --duration-base: 200ms;
  --duration-slow: 300ms;
  --easing-out: cubic-bezier(0, 0, 0.2, 1);
  --easing-in-out: cubic-bezier(0.4, 0, 0.2, 1);

  /* Shadows */
  --shadow-sm: 0 1px 2px 0 rgba(0, 0, 0, 0.05);
  --shadow-md: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  --shadow-lg: 0 10px 15px -3px rgba(0, 0, 0, 0.1);
  --shadow-focus: 0 0 0 3px rgba(240, 165, 0, 0.1), 0 0 0 2px rgba(240, 165, 0, 1);
}

@media (prefers-reduced-motion: reduce) {
  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
`;
