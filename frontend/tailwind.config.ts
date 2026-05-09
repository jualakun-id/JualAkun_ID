import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './app/**/*.{ts,tsx}',
    './components/**/*.{ts,tsx}',
    './lib/**/*.{ts,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary: {
          DEFAULT: '#6366F1',
          hover: '#4F46E5',
          light: '#818CF8',
        },
        secondary: '#8B5CF6',
        accent: '#22D3EE',
        bg: '#09090B',
        surface: {
          DEFAULT: '#18181B',
          2: '#27272A',
        },
        border: {
          DEFAULT: '#3F3F46',
          subtle: '#27272A',
        },
        text: {
          DEFAULT: '#FAFAFA',
          muted: '#A1A1AA',
          subtle: '#71717A',
        },
        success: '#10B981',
        warning: '#F59E0B',
        danger: '#EF4444',
        info: '#38BDF8',

        // Light system — vibrant cyan-teal matching logo doodle color
        brand: {
          50:  '#ECFEFF',  // very light cyan tint (section bg)
          100: '#CFFAFE',
          200: '#A5F3FC',
          300: '#67E8F9',
          400: '#22D3EE',  // bright accent (footer/dark bg)
          500: '#06B6D4',  // LOGO color — vibrant cyan-teal (decorative, badges, accents)
          600: '#0891B2',  // primary CTA bg with white text (kontras 4.6:1 — AA pass)
          700: '#0E7490',  // CTA hover, darker accent
          800: '#155E75',
          900: '#1A4480',  // navy heading accent (hero highlight)
        },
        ink: {
          DEFAULT: '#1A2340',
          muted: '#4A5568',
          subtle: '#718096',
        },
        sky: {
          hero: '#5BB5DD',
        },
        stat: {
          blue:   '#1567C8',
          red:    '#D9304B',
          green:  '#0F8F4F',
          yellow: '#F5A623',
        },
      },
      fontFamily: {
        heading: ['var(--font-heading)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        poppins: ['var(--font-poppins)', 'sans-serif'],
      },
      fontSize: {
        hero: ['3rem', { lineHeight: '1.15', fontWeight: '800' }],
        h1: ['2.25rem', { lineHeight: '1.2', fontWeight: '700' }],
        h2: ['1.75rem', { lineHeight: '1.25', fontWeight: '700' }],
        h3: ['1.375rem', { lineHeight: '1.3', fontWeight: '600' }],
        h4: ['1.125rem', { lineHeight: '1.4', fontWeight: '600' }],
      },
      backgroundImage: {
        'gradient-primary': 'linear-gradient(135deg, #6366F1 0%, #8B5CF6 100%)',
        'gradient-accent': 'linear-gradient(135deg, #4F46E5 0%, #22D3EE 100%)',
      },
      boxShadow: {
        glow: '0 0 24px rgba(99, 102, 241, 0.15)',
        'glow-sm': '0 0 20px rgba(99, 102, 241, 0.1)',
      },
    },
  },
  plugins: [],
}

export default config
