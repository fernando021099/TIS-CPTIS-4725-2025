"use client"

import { LogIn } from "lucide-react"

export default function TopbarGuest() {
  return (
    <header className="sticky top-0 z-50 bg-white border-b border-gray-200">
      <div className="container mx-auto px-4">
        <div className="flex h-16 items-center justify-between">
          
          {/* Logo izquierdo - Versión simplificada */}
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
            <h1 className="text-xl font-bold text-gray-900">
              Olimpiadas San Simón
            </h1>
          </div>

          {/* Botón de login - Versión minimalista */}
          <button className="flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors">
            <LogIn className="h-4 w-4" />
            <span>Iniciar Sesión</span>
          </button>
        </div>
      </div>
    </header>
  )
}