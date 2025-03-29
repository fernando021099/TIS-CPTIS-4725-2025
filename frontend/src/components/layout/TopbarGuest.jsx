"use client"

import { LogIn, Sun, Moon } from "lucide-react"
import { useEffect, useState } from 'react'

export default function TopbarGuest() {
  const [darkMode, setDarkMode] = useState(false)

  // Efecto para aplicar el tema al cargar y cuando cambia
  useEffect(() => {
    // Verificar preferencia al cargar
    if (typeof window !== 'undefined') {
      const isDark = localStorage.theme === 'dark' || 
                    (!('theme' in localStorage) && 
                    window.matchMedia('(prefers-color-scheme: dark)').matches)
      setDarkMode(isDark)
    }
  }, [])

  // Efecto para aplicar cambios de tema
  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add('dark')
      localStorage.theme = 'dark'
    } else {
      document.documentElement.classList.remove('dark')
      localStorage.theme = 'light'
    }
  }, [darkMode])

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo izquierdo */}
          <div className="flex items-center gap-3">
            <div className="bg-red-600 rounded-full p-1.5">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="h-6 w-6 text-white"
                viewBox="0 0 20 20"
                fill="currentColor"
              >
                <path
                  fillRule="evenodd"
                  d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z"
                  clipRule="evenodd"
                />
              </svg>
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Olimpiadas San Simón
            </h1>
          </div>

          {/* Controles derecha */}
          <div className="flex items-center gap-4">
            {/* Botón de cambio de tema */}
            <button 
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={darkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-yellow-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600" />
              )}
            </button>

            {/* Botón de login */}
            <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
              <LogIn className="h-4 w-4" />
              <span>Iniciar Sesión</span>
            </button>
          </div>
        </div>
      </div>
    </header>
  )
}