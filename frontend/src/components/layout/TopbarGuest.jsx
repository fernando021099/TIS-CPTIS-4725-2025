"use client"

import { LogIn, LogOut, Sun, Moon } from "lucide-react"
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

  // Escuchar cambios a localStorage usando un evento personalizado
  useEffect(() => {
    const handleStorageChange = () => {
      const updatedUser = localStorage.getItem("user")
      setUser(updatedUser)
    }

    window.addEventListener("storage", handleStorageChange)
    window.addEventListener("user-change", handleStorageChange) // evento personalizado

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
    window.dispatchEvent(new Event("user-change")) // Notifica otros componentes
    navigate("/")
  }

  return (
    <header className="sticky top-0 z-50 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          <div className="flex items-center gap-3">
            {/* El div contenedor ahora no tiene las clases del círculo rojo */}
            <div> 
              {/* El SVG ha sido reemplazado por la imagen */}
              <img src="/ohsansi.jpg" alt="Logo Olimpiadas San Simón" className="h-12 w-12" /> {/* Ajusta h-10 w-10 según necesites */}
            </div>
            <h1 className="text-xl font-bold text-gray-900 dark:text-white">
              Olimpiadas San Simón
            </h1>
          </div>

          <div className="flex items-center gap-4">
            <button
              onClick={toggleTheme}
              className="p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors"
              aria-label={darkMode ? "Cambiar a tema claro" : "Cambiar a tema oscuro"}
            >
              {darkMode ? <Sun className="h-5 w-5 text-yellow-400" /> : <Moon className="h-5 w-5 text-gray-600" />}
            </button>

            {!user ? (
              <button
                onClick={handleLoginClick}
                className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors"
              >
                <LogIn className="h-4 w-4" />
                <span>Iniciar Sesión</span>
              </button>
            ) : (
              <div className="flex items-center gap-4">
                <span className="text-sm font-semibold text-gray-700 dark:text-white">Hola, {user}</span>
                <button
                  onClick={handleLogout}
                  className="px-3 py-2 bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-800 dark:text-white rounded-md text-sm font-medium"
                >
                  Salir
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
