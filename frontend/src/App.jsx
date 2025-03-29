import { useEffect, useState } from 'react'
import TopbarGuest from './components/layout/TopbarGuest'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { ArrowRight } from 'lucide-react'
import AreaRegistration from './pages/AreaRegistration'

function App() {
  const [isLoading, setIsLoading] = useState(true)
  const [showAreaRegistration, setShowAreaRegistration] = useState(false)

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

      {/* Navbar con espacio controlado */}
      <div className="sticky top-0 z-30">
        <Navbar />
      </div>

      {/* Main con espacios igualados */}
      <main className="flex-grow flex items-center justify-center py-4 bg-white dark:bg-gray-900"> {/* py-4 igual arriba y abajo */}
        {showAreaRegistration ? (
          <AreaRegistration onBack={() => setShowAreaRegistration(false)} />
        ) : (
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <button 
                onClick={() => setShowAreaRegistration(true)}
                className="inline-flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors text-sm"
              >
                Ir a Registro de Áreas
                <ArrowRight className="ml-1 h-4 w-4" />
              </button>
            </div>
          </div>
        )}
      </main>

      {/* Footer con espacio igual */}
      <div className="pt-4"> {/* pt-4 igual al py-4 del main */}
        <Footer />
      </div>
    </div>
  )
}

export default App