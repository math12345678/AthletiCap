import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    colors: {
      // Base Colors
      white: '#FFFFFF',
      black: '#000000',
      transparent: 'transparent',

      // Primary Colors
      bg: {
        primary: '#FAFAF8',
        secondary: '#F4F3EF',
        elevated: '#FFFFFF',
      },
      text: {
        primary: '#1A1916',
        secondary: '#5C5A54',
        muted: '#8A8783',
      },
      border: '#D8D5CC',

      // Accent Colors
      primary: '#1A56DB',      // Electric Blue
      secondary: '#ECEAE3',    // Warm Beige
      destructive: '#C0392B',  // Red
      success: '#2DD09A',       // Green
      warning: '#F59E0B',       // Orange
      info: '#5BA5D9',          // Light Blue

      // Chart Colors
      chart: {
        '1': '#0E7C50',         // Green
        '2': '#B45309',         // Orange
        '3': '#7C3AED',         // Purple
        '4': '#1A56DB',         // Blue
        '5': '#C0392B',         // Red
      },
    },
    fontFamily: {
      sans: ['DM Sans', 'system-ui', 'sans-serif'],
      serif: ['DM Serif Display', 'serif'],
      mono: ['DM Mono', 'monospace'],
    },
    fontSize: {
      xs: ['12px', { lineHeight: '16px' }],
      sm: ['14px', { lineHeight: '20px' }],
      base: ['16px', { lineHeight: '24px' }],
      lg: ['18px', { lineHeight: '28px' }],
      xl: ['20px', { lineHeight: '28px' }],
      '2xl': ['24px', { lineHeight: '32px' }],
      '3xl': ['30px', { lineHeight: '36px' }],
      '4xl': ['36px', { lineHeight: '40px' }],
    },
    borderRadius: {
      none: '0',
      sm: '1px',
      DEFAULT: '2px',
      md: '4px',
      lg: '6px',
      xl: '8px',
    },
    boxShadow: {
      none: 'none',
      sm: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
      DEFAULT: '0 1px 3px 0 rgba(0, 0, 0, 0.1)',
      md: '0 4px 6px -1px rgba(0, 0, 0, 0.1)',
      lg: '0 10px 15px -3px rgba(0, 0, 0, 0.1)',
    },
    extend: {
      animation: {
        slideUp: 'slideUp 300ms cubic-bezier(0, 0, 0.2, 1)',
        slideDown: 'slideDown 300ms cubic-bezier(0, 0, 0.2, 1)',
        fadeIn: 'fadeIn 200ms cubic-bezier(0, 0, 0.2, 1)',
        fadeOut: 'fadeOut 200ms cubic-bezier(0.4, 0, 1, 1)',
        pulse: 'pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        shimmer: 'shimmer 2s infinite',
        bounce: 'bounce 1s infinite',
        spin: 'spin 1s linear infinite',
        ping: 'ping 1s cubic-bezier(0, 0, 0.2, 1) infinite',
      },
      keyframes: {
        slideUp: {
          from: { transform: 'translateY(20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        slideDown: {
          from: { transform: 'translateY(-20px)', opacity: '0' },
          to: { transform: 'translateY(0)', opacity: '1' },
        },
        fadeIn: {
          from: { opacity: '0' },
          to: { opacity: '1' },
        },
        fadeOut: {
          from: { opacity: '1' },
          to: { opacity: '0' },
        },
        shimmer: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.5' },
        },
        bounce: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(-10px)' },
        },
        spin: {
          from: { transform: 'rotate(0deg)' },
          to: { transform: 'rotate(360deg)' },
        },
        ping: {
          '75%, 100%': { transform: 'scale(2)', opacity: '0' },
        },
      },
    },
  },
  plugins: [],
} satisfies Config;
