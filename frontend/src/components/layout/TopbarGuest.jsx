"use client"

import { LogIn, LogOut, Sun, Moon, User } from "lucide-react"
import { useEffect, useState } from "react"
import { useNavigate } from "react-router-dom"

export default function TopbarGuest() {
  const [darkMode, setDarkMode] = useState(false)
  const [user, setUser] = useState(null)
  const navigate = useNavigate()

  // Detectar usuario desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    setUser(storedUser)
  }, [])

  // Escuchar cambios en localStorage
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user")
      setUser(updatedUser)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("user-change", handleStorageChange)

    return () => {
      window.removeEventListener("storage", handleStorageChange)
      window.removeEventListener("user-change", handleStorageChange)
    }
  }, [])

  // Tema oscuro
  useEffect(() => {
    const isDark =
      localStorage.theme === "dark" ||
      (!("theme" in localStorage) && window.matchMedia("(prefers-color-scheme: dark)").matches)
    setDarkMode(isDark)
  }, [])

  useEffect(() => {
    if (darkMode) {
      document.documentElement.classList.add("dark")
      localStorage.theme = "dark"
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.theme = "light"
    }
  }, [darkMode])

  const toggleTheme = () => {
    setDarkMode(!darkMode)
  }

  const handleLoginClick = () => {
    navigate("/admin")
  }

  const handleLogout = () => {
    localStorage.removeItem("user")
    setUser(null)
    window.dispatchEvent(new Event("user-change"))
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm border-b border-gray-200/50 dark:border-gray-800/50 transition-colors duration-300">
      <div className="container mx-auto px-4">
        <div className="flex h-14 sm:h-16 items-center justify-between">
          {/* Logo y título */}
          <div className="flex items-center gap-2 sm:gap-3">
            <div className="flex-shrink-0">
              <img 
                src="/ohsansi.jpg" 
                alt="Logo Olimpiadas San Simón" 
                className="h-8 w-8 sm:h-10 sm:w-10 rounded-full object-cover border border-gray-200 dark:border-gray-700" 
              />
            </div>
            <h1 className="text-lg font-bold text-gray-800 dark:text-gray-100 tracking-tight">
              Olimpiadas <span className="hidden sm:inline">San Simón</span>
              <span className="sm:hidden">S.S.</span>
            </h1>
          </div>

          {/* Controles */}
          <div className="flex items-center gap-2">
            {/* Botón tema oscuro/claro */}
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors duration-200"
              aria-label={darkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            >
              {darkMode ? (
                <Sun className="h-5 w-5 text-amber-400" />
              ) : (
                <Moon className="h-5 w-5 text-gray-600 dark:text-gray-300" />
              )}
            </button>

            {/* Botón login/logout */}
            {!user ? (
              <button
                onClick={handleLoginClick}
                className="flex items-center gap-2 px-3 py-1.5 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-700 hover:to-red-600 text-white rounded-lg transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 text-sm font-medium"
              >
                <LogIn className="h-4 w-4" />
                <span className="inline">Iniciar Sesión</span> {/* ← Asegúrate de que tenga "inline" */}
              </button>
            ) :  (
              <div className="flex items-center gap-2">
                <span className="hidden sm:inline text-sm font-medium text-gray-700 dark:text-gray-200 px-2 py-1 rounded bg-gray-100 dark:bg-gray-800">
                  <User className="inline h-4 w-4 mr-1" />
                  {user}
                </span>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-1 px-3 py-1.5 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 rounded-lg transition-all duration-200 text-sm font-medium"
                >
                  <LogOut className="h-4 w-4" />
                  <span className="hidden xs:inline">Salir</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}