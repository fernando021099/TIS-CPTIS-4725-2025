/** @type {import('tailwindcss').Config} */
module.exports = {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  darkMode: 'class', // Modo oscuro basado en clase
  theme: {
    extend: {
      colors: {
        brand: {
          DEFAULT: '#E53E3E',
          dark: '#C53030',
          light: '#FEB2B2',
        },
        umss: {
          blue: '#005BA7',
          yellow: '#FFD700',
        },
        // Nueva paleta para modo oscuro
        dark: {
          DEFAULT: '#1a202c',
          50: '#f7fafc',
          100: '#edf2f7',
          200: '#e2e8f0',
          300: '#cbd5e0',
          400: '#a0aec0',
          500: '#718096',
          600: '#4a5568',
          700: '#2d3748',
          800: '#1a202c',
          900: '#171923',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem'
        },
      },
      // Extender utilidades para modo oscuro
      backgroundColor: {
        dark: {
          primary: 'var(--color-dark-800)',
          secondary: 'var(--color-dark-700)',
          accent: 'var(--color-brand-DEFAULT)'
        }
      },
      textColor: {
        dark: {
          primary: 'var(--color-gray-100)',
          secondary: 'var(--color-gray-300)',
          accent: 'var(--color-brand-light)'
        }
      },
      borderColor: {
        dark: {
          DEFAULT: 'var(--color-dark-600)',
          accent: 'var(--color-brand-DEFAULT)'
        }
      }
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/typography'),
    // Plugin para mejor soporte de dark mode
    function({ addUtilities }) {
      addUtilities({
        '.bg-dark': {
          'background-color': 'var(--color-dark-800)',
        },
        '.text-dark': {
          'color': 'var(--color-gray-100)',
        },
      })
    }
  ],
  // Variantes para dark mode
  variants: {
    extend: {
      backgroundColor: ['dark'],
      textColor: ['dark'],
      borderColor: ['dark'],
      opacity: ['dark'],
      display: ['dark'],
    },
  }
}