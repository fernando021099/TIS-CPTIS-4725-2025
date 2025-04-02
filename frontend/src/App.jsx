import { useEffect, useState } from 'react'
import { Outlet } from 'react-router-dom'
import TopbarGuest from './components/layout/TopbarGuest'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'

export default function App() {
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    // Configuración del tema dark
    if (localStorage.theme === 'dark' || 
       (!('theme' in localStorage) && 
        window.matchMedia('(prefers-color-scheme: dark)').matches)) {
      document.documentElement.classList.add('dark')
    } else {
      document.documentElement.classList.remove('dark')
    }
    setIsLoading(false)
  }, [])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-pulse">Cargando...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900">
      <TopbarGuest />
      <Navbar />
      
      <main className="flex-grow py-4">
        <Outlet /> {/* Aquí se renderizan las páginas */}
      </main>
      
      <Footer />
    </div>
  )
}