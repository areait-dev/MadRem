/** @type {import('tailwindcss').Config} */

// Colori semantici: i valori cambiano con il tema (.dark) in src/index.css
const token = (name) => `rgb(var(--c-${name}) / <alpha-value>)`

export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['var(--font-body)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-heading)', 'system-ui', 'sans-serif'],
      },
      colors: {
        // Semantici (light/dark)
        page: token('bg'),
        surface: token('surface'),
        fg: token('fg'),
        muted: token('muted'),
        line: token('line'),
        link: token('link'),
        elevated: token('elevated'),
        divider: 'var(--color-divider)',
        error: token('error'),
        success: token('success'),
        // Brand — design system Promotergroup
        primary: {
          DEFAULT: '#022A66',
          accent: '#0563F0',
          light: '#AFCEFD',
          dark: '#02193C',
          mid: '#044AB4',
          deep: '#033B90',
          deepest: '#01132E',
          lightest: '#DAE8FD',
          night: '#001428',
        },
        accent: {
          DEFAULT: '#0563F0',
          hover: '#044AB4',
        },
        grey: {
          50: '#F7F6F4',
          100: '#F0EEE9',
          200: '#D4D3D1',
          400: '#A8A8A6',
          600: '#6E6E6C',
          700: '#3D3D3B',
          800: '#1A1A18',
          900: '#0D0D0B',
        },
        ink: '#000814',
      },
      borderRadius: {
        btn: 'var(--radius-btn)',
        card: 'var(--radius-card)',
      },
      animation: {
        'fade-in': 'fadeIn 0.3s ease-in-out',
        'slide-up': 'slideUp 0.3s ease-out',
        'scale-in': 'scaleIn 0.2s ease-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { transform: 'translateY(10px)', opacity: '0' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
        scaleIn: {
          '0%': { transform: 'scale(0.95)', opacity: '0' },
          '100%': { transform: 'scale(1)', opacity: '1' },
        },
      },
    },
  },
  plugins: [],
}
