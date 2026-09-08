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
        // Nested Surface structure
        surface: {
          DEFAULT: "#10141a",
          dim: "#10141a",
          bright: "#353940",
          variant: "#31353c",
          tint: "#4cd7f6",
          container: {
            DEFAULT: "#1c2026",
            lowest: "#0a0e14",
            low: "#181c22",
            high: "#262a31",
            highest: "#31353c",
          },
        },
        // Flat Surface token aliases (guarantees both kebab-case and nested paths)
        "surface-container-lowest": "#0a0e14",
        "surface-container-low": "#181c22",
        "surface-container": "#1c2026",
        "surface-container-high": "#262a31",
        "surface-container-highest": "#31353c",
        "surface-variant": "#31353c",
        "surface-dim": "#10141a",
        "surface-bright": "#353940",
        "surface-tint": "#4cd7f6",
        background: "#10141a",
        "on-background": "#dfe2eb",

        // Nested On-Surface structure & flat aliases
        "on-surface": {
          DEFAULT: "#dfe2eb",
          variant: "#bcc9cd",
        },
        "on-surface-variant": "#bcc9cd",
        "inverse-surface": "#dfe2eb",
        "inverse-on-surface": "#2d3137",

        // Outline tokens
        outline: {
          DEFAULT: "#869397",
          variant: "#3d494c",
        },
        "outline-variant": "#3d494c",

        // Primary / Compute Cyan
        primary: {
          DEFAULT: "#4cd7f6",
          container: "#06b6d4",
          fixed: {
            DEFAULT: "#acedff",
            dim: "#4cd7f6",
          },
        },
        "primary-container": "#06b6d4",
        "primary-fixed": "#acedff",
        "primary-fixed-dim": "#4cd7f6",
        "inverse-primary": "#00687a",

        "on-primary": {
          DEFAULT: "#003640",
          container: "#00424f",
          fixed: {
            DEFAULT: "#001f26",
            variant: "#004e5c",
          },
        },
        "on-primary-container": "#00424f",
        "on-primary-fixed": "#001f26",
        "on-primary-fixed-variant": "#004e5c",

        // Secondary / Recovery Emerald
        secondary: {
          DEFAULT: "#4edea3",
          container: "#00a572",
          fixed: {
            DEFAULT: "#6ffbbe",
            dim: "#4edea3",
          },
        },
        "secondary-container": "#00a572",
        "secondary-fixed": "#6ffbbe",
        "secondary-fixed-dim": "#4edea3",

        "on-secondary": {
          DEFAULT: "#003824",
          container: "#00311f",
          fixed: {
            DEFAULT: "#002113",
            variant: "#005236",
          },
        },
        "on-secondary-container": "#00311f",
        "on-secondary-fixed": "#002113",
        "on-secondary-fixed-variant": "#005236",

        // Tertiary / Telemetry Amber
        tertiary: {
          DEFAULT: "#ffb95f",
          container: "#e79400",
          fixed: {
            DEFAULT: "#ffddb8",
            dim: "#ffb95f",
          },
        },
        "tertiary-container": "#e79400",
        "tertiary-fixed": "#ffddb8",
        "tertiary-fixed-dim": "#ffb95f",

        "on-tertiary": {
          DEFAULT: "#472a00",
          container: "#563400",
          fixed: {
            DEFAULT: "#2a1700",
            variant: "#653e00",
          },
        },
        "on-tertiary-container": "#563400",
        "on-tertiary-fixed": "#2a1700",
        "on-tertiary-fixed-variant": "#653e00",

        // Error / Critical Crimson
        error: {
          DEFAULT: "#ffb4ab",
          container: "#93000a",
        },
        "error-container": "#93000a",

        "on-error": {
          DEFAULT: "#690005",
          container: "#ffdad6",
        },
        "on-error-container": "#ffdad6",

        // Legacy pulse tokens for backward compatibility
        pulse: {
          bg: "#0A0E14",
          card: "#181C22",
          border: "#252D38",
          cyan: "#4CD7F6",
          emerald: "#4EDEA3",
          amber: "#FFB95F",
          rose: "#FFB4AB",
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
