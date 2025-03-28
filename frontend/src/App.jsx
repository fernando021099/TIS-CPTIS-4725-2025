import { useEffect, useState } from 'react'
import TopbarGuest from './components/layout/TopbarGuest'
import Navbar from './components/layout/Navbar'
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
      {/* Topbar */}
      <TopbarGuest />

      {/* Navbar */}
      <Navbar />

      {/* Main con espacio ajustado para el Navbar */}
      <main className="flex-grow pt-[7.5rem] bg-white dark:bg-gray-900">
        {/* 
          pt-[7.5rem] = 64px (Topbar) + 56px (Navbar) + 1px (borde)
          Espacio vacío para contenido futuro 
        */}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}

export default App