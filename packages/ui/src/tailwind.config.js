// packages/ui/tailwind.config.js
const { hairlineWidth } = require('nativewind/theme')

/** @type {import('tailwindcss').Config} */
module.exports = {
  darkMode: 'class', // ✅ IMPORTANT: enables manual dark mode

  content: ['./src/**/*.{ts,tsx}', '../../apps/**/*.{ts,tsx}'],

  presets: [require('nativewind/preset')],

  theme: {
    extend: {
      colors: {
        primary: {
          50:  '#EEF2FF',
          100: '#E0E7FF',
          200: '#C7D2FE',
          300: '#A5B4FC',
          400: '#818CF8',
          500: '#4F6EF7',
          600: '#4338CA',
          700: '#3730A3',
          800: '#312E81',
          900: '#1E1B4B',
        },
        secondary: {
          50:  '#FFF7ED',
          100: '#FFEDD5',
          200: '#FED7AA',
          300: '#FDBA74',
          400: '#FB923C',
          500: '#F97316',
          600: '#EA580C',
          700: '#C2410C',
          800: '#9A3412',
          900: '#7C2D12',
        },
        neutral: {
          50:  '#F8FAFC',
          100: '#F1F5F9',
          200: '#E2E8F0',
          300: '#CBD5E1',
          400: '#94A3B8',
          500: '#64748B',
          600: '#475569',
          700: '#334155',
          800: '#1E293B',
          900: '#0F172A',
        },
        success: {
          50:  '#F0FDF4',
          100: '#DCFCE7',
          200: '#BBF7D0',
          500: '#22C55E',
          600: '#16A34A',
          700: '#15803D',
        },
        warning: {
          50:  '#FEFCE8',
          100: '#FEF9C3',
          200: '#FEF08A',
          500: '#EAB308',
          600: '#CA8A04',
          700: '#A16207',
        },
        error: {
          50:  '#FEF2F2',
          100: '#FEE2E2',
          200: '#FECACA',
          500: '#EF4444',
          600: '#DC2626',
          700: '#B91C1C',
        },
      },

      fontFamily: {
        sans: ['System'],
      },

      borderWidth: {
        hairline: hairlineWidth(),
      },

      spacing: {
        18: '4.5rem',
        22: '5.5rem',
      },

      borderRadius: {
        '3xl': '1.5rem',
        '4xl': '2rem',
      },
    },
  },

  plugins: [],
}