import { useEffect, useState } from 'react'
import TopbarGuest from './components/layout/TopbarGuest'
import Footer from './components/layout/Footer'

function App() {
  const [isLoading, setIsLoading] = useState(true)

  // Configurar tema al cargar
  useEffect(() => {
    if (
      localStorage.theme === 'dark' || 
      (!('theme' in localStorage) && 
      window.matchMedia('(prefers-color-scheme: dark)').matches)
    ) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white dark:bg-gray-900">
        <div className="animate-pulse text-gray-500 dark:text-gray-400">
          Cargando...
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
      {/* Solo TopbarGuest (versión simplificada) */}
      <TopbarGuest />

      {/* Main completamente vacío con fondo blanco */}
      <main className="flex-grow pt-16 bg-white dark:bg-gray-900">
        {/* Espacio vacío intencional */}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App