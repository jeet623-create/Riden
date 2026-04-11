/** @type {import('tailwindcss').Config} */
module.exports = {
  content: ['./src/**/*.{js,ts,jsx,tsx,mdx}'],
  theme: {
    extend: {
      colors: {
        riden: {
          teal: '#1D9E75',
          'teal-dark': '#157A5A',
          'teal-light': '#22B585',
          'teal-dim': '#0F4A38',
          black: '#080E0B',
          dark: '#0D1610',
          card: '#111A14',
          border: '#1E2E22',
          muted: '#3D5445',
          text: '#A8C4AF',
          white: '#E8F5EB',
        }
      },
      fontFamily: {
        display: ['var(--font-display)', 'sans-serif'],
        body: ['var(--font-body)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
      },
      backgroundImage: {
        'grid-pattern': "url(\"data:image/svg+xml,%3Csvg width='40' height='40' viewBox='0 0 40 40' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231D9E75' fill-opacity='0.05'%3E%3Cpath d='M0 0h40v1H0zM0 0v40H1V0z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E\")",
      },
      animation: {
        'fade-up': 'fadeUp 0.6s ease forwards',
        'fade-in': 'fadeIn 0.4s ease forwards',
        'pulse-teal': 'pulseTeal 2s ease-in-out infinite',
        'slide-right': 'slideRight 0.3s ease forwards',
        'glow': 'glow 3s ease-in-out infinite',
      },
      keyframes: {
        fadeUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        pulseTeal: {
          '0%, 100%': { boxShadow: '0 0 0 0 rgba(29, 158, 117, 0.4)' },
          '50%': { boxShadow: '0 0 0 8px rgba(29, 158, 117, 0)' },
        },
        slideRight: {
          '0%': { transform: 'translateX(-10px)', opacity: '0' },
          '100%': { transform: 'translateX(0)', opacity: '1' },
        },
        glow: {
          '0%, 100%': { filter: 'brightness(1)' },
          '50%': { filter: 'brightness(1.2)' },
        }
      },
      boxShadow: {
        'teal': '0 0 30px rgba(29, 158, 117, 0.15)',
        'teal-lg': '0 0 60px rgba(29, 158, 117, 0.2)',
        'card': '0 4px 24px rgba(0,0,0,0.4)',
        'inner-teal': 'inset 0 1px 0 rgba(29, 158, 117, 0.2)',
      }
    },
  },
  plugins: [],
}
