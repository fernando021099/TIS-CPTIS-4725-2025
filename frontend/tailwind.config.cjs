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
          DEFAULT: '#E53E3E', // Rojo principal (como en tu footer)
          dark: '#C53030',    // Rojo oscuro
          light: '#FEB2B2',   // Rojo claro
        },
        umss: { // Paleta institucional
          blue: '#005BA7',
          yellow: '#FFD700',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'], // Fuente profesional
      },
      container: {
        center: true,
        padding: {
          DEFAULT: '1rem',
          sm: '2rem',
          lg: '4rem'
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/forms'), // Estilos para formularios
    require('@tailwindcss/typography'), // Tipografía consistente
  ],
}