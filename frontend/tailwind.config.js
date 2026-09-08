/** @type {import('tailwindcss').Config} */
export default {
  darkMode: "class",
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        // Dark Industrial Palette matching reference image
        industrial: {
          bg: "#070D17",
          card: "#0B1320",
          cardHover: "#0E1726",
          border: "#132238",
          borderSubtle: "#182840",
          borderLight: "#203554",
          cyan: "#00F2FE",
          teal: "#4CD7F6",
          emerald: "#4EDEA3",
          amber: "#FFB95F",
          red: "#FF5C5C",
          blue: "#3B82F6",
          purple: "#8B5CF6",
          text: "#E2E8F0",
          textMuted: "#94A3B8",
          textDim: "#64748B",
        },
        // Nested Surface structure
        surface: {
          DEFAULT: "#0B1320",
          dim: "#070D17",
          bright: "#16253D",
          variant: "#132238",
          tint: "#00F2FE",
          container: {
            DEFAULT: "#0E1726",
            lowest: "#070D17",
            low: "#0B1320",
            high: "#132238",
            highest: "#182840",
          },
        },
        // Flat Surface token aliases
        "surface-container-lowest": "#070D17",
        "surface-container-low": "#0B1320",
        "surface-container": "#0E1726",
        "surface-container-high": "#132238",
        "surface-container-highest": "#182840",
        "surface-variant": "#132238",
        "surface-dim": "#070D17",
        "surface-bright": "#16253D",
        "surface-tint": "#00F2FE",
        background: "#070D17",
        "on-background": "#E2E8F0",

        // Nested On-Surface structure & flat aliases
        "on-surface": {
          DEFAULT: "#E2E8F0",
          variant: "#94A3B8",
        },
        "on-surface-variant": "#94A3B8",
        "inverse-surface": "#E2E8F0",
        "inverse-on-surface": "#1E293B",

        // Outline tokens
        outline: {
          DEFAULT: "#64748B",
          variant: "#132238",
        },
        "outline-variant": "#132238",

        // Primary / Industrial Cyan
        primary: {
          DEFAULT: "#00F2FE",
          container: "#0284C7",
          fixed: {
            DEFAULT: "#38BDF8",
            dim: "#00F2FE",
          },
        },
        "primary-container": "#0369A1",
        "primary-fixed": "#38BDF8",
        "primary-fixed-dim": "#00F2FE",
        "inverse-primary": "#0284C7",

        "on-primary": {
          DEFAULT: "#031726",
          container: "#E0F2FE",
          fixed: {
            DEFAULT: "#031726",
            variant: "#075985",
          },
        },
        "on-primary-container": "#E0F2FE",
        "on-primary-fixed": "#031726",
        "on-primary-fixed-variant": "#075985",

        // Secondary / Operational Emerald
        secondary: {
          DEFAULT: "#4EDEA3",
          container: "#059669",
          fixed: {
            DEFAULT: "#6EE7B7",
            dim: "#4EDEA3",
          },
        },
        "secondary-container": "#065F46",
        "secondary-fixed": "#6EE7B7",
        "secondary-fixed-dim": "#4EDEA3",

        "on-secondary": {
          DEFAULT: "#022C1C",
          container: "#D1FAE5",
          fixed: {
            DEFAULT: "#022C1C",
            variant: "#047857",
          },
        },
        "on-secondary-container": "#D1FAE5",
        "on-secondary-fixed": "#022C1C",
        "on-secondary-fixed-variant": "#047857",

        // Tertiary / Warning Amber
        tertiary: {
          DEFAULT: "#FFB95F",
          container: "#D97706",
          fixed: {
            DEFAULT: "#FDE68A",
            dim: "#FFB95F",
          },
        },
        "tertiary-container": "#92400E",
        "tertiary-fixed": "#FDE68A",
        "tertiary-fixed-dim": "#FFB95F",

        "on-tertiary": {
          DEFAULT: "#3B1A00",
          container: "#FEF3C7",
          fixed: {
            DEFAULT: "#3B1A00",
            variant: "#B45309",
          },
        },
        "on-tertiary-container": "#FEF3C7",
        "on-tertiary-fixed": "#3B1A00",
        "on-tertiary-fixed-variant": "#B45309",

        // Error / Critical Crimson
        error: {
          DEFAULT: "#FF5C5C",
          container: "#DC2626",
        },
        "error-container": "#991B1B",

        "on-error": {
          DEFAULT: "#450A0A",
          container: "#FEE2E2",
        },
        "on-error-container": "#FEE2E2",

        // Pulse tokens for backward compatibility
        pulse: {
          bg: "#070D17",
          card: "#0B1320",
          border: "#132238",
          cyan: "#00F2FE",
          emerald: "#4EDEA3",
          amber: "#FFB95F",
          rose: "#FF5C5C",
          purple: "#8B5CF6",
        }
      },
      fontSize: {
        "body-sm": ["11px", { lineHeight: "16px", fontWeight: "400" }],
        "body-md": ["13px", { lineHeight: "18px", fontWeight: "400" }],
        "body-lg": ["14px", { lineHeight: "20px", fontWeight: "400" }],
        "headline-sm": ["14px", { lineHeight: "20px", letterSpacing: "0.02em", fontWeight: "600" }],
        "headline-md": ["18px", { lineHeight: "24px", letterSpacing: "-0.01em", fontWeight: "600" }],
        "headline-lg": ["24px", { lineHeight: "32px", letterSpacing: "-0.015em", fontWeight: "600" }],
        "headline-xl": ["32px", { lineHeight: "40px", letterSpacing: "-0.02em", fontWeight: "700" }],
        "mono-code": ["11px", { lineHeight: "15px", fontWeight: "400" }],
        "mono-data": ["12px", { lineHeight: "16px", fontWeight: "400" }],
        "mono-metric-md": ["18px", { lineHeight: "22px", letterSpacing: "-0.02em", fontWeight: "500" }],
        "mono-metric-lg": ["28px", { lineHeight: "32px", letterSpacing: "-0.03em", fontWeight: "600" }],
        "label-caps": ["10px", { lineHeight: "12px", letterSpacing: "0.08em", fontWeight: "600" }],
      },
      gridTemplateColumns: {
        '16': 'repeat(16, minmax(0, 1fr))',
      },
      gridColumn: {
        'span-4': 'span 4 / span 4',
        'span-12': 'span 12 / span 12',
        'span-16': 'span 16 / span 16',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        mono: ['"JetBrains Mono"', 'monospace'],
        'body-sm': ['Inter', 'sans-serif'],
        'body-md': ['Inter', 'sans-serif'],
        'body-lg': ['Inter', 'sans-serif'],
        'headline-sm': ['Inter', 'sans-serif'],
        'headline-md': ['Inter', 'sans-serif'],
        'headline-lg': ['Inter', 'sans-serif'],
        'headline-xl': ['Inter', 'sans-serif'],
        'mono-code': ['"JetBrains Mono"', 'monospace'],
        'mono-data': ['"JetBrains Mono"', 'monospace'],
        'mono-metric-md': ['"JetBrains Mono"', 'monospace'],
        'mono-metric-lg': ['"JetBrains Mono"', 'monospace'],
        'label-caps': ['"JetBrains Mono"', 'monospace'],
      },
      spacing: {
        'gutter-panel': '0.75rem',
        'gutter-dense': '0.5rem',
        'margin-screen': '1rem',
        'space-2xs': '0.125rem',
        'space-xs': '0.25rem',
        'space-sm': '0.5rem',
        'space-md': '0.75rem',
        'space-lg': '1rem',
        'space-xl': '1.25rem',
        'space-2xl': '1.5rem',
      },
      borderRadius: {
        'DEFAULT': '0.125rem',
        'sm': '0.125rem',
        'md': '0.25rem',
        'lg': '0.25rem',
        'xl': '0.5rem',
        '2xl': '0.75rem',
        'full': '9999px',
      },
      animation: {
        'pulse-glow': 'pulseGlow 2s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'beacon': 'beacon 1.5s ease-in-out infinite',
      },
      keyframes: {
        pulseGlow: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.4' },
        },
        beacon: {
          '0%, 100%': { transform: 'scale(1)', opacity: '1' },
          '50%': { transform: 'scale(1.2)', opacity: '0.6' },
        }
      }
    },
  },
  plugins: [],
}
