// src/App.jsx
import { useEffect, useState } from 'react'
import { Outlet, useLocation, useNavigate } from 'react-router-dom'
import TopbarGuest from './components/layout/TopbarGuest'
import Navbar from './components/layout/Navbar'
import Footer from './components/layout/Footer'
import { Toaster } from 'react-hot-toast'
import LoadingSpinner from './components/common/LoadingSpinner'

export default function App({ onOpenComprobantePago }) {
  const [isLoading, setIsLoading] = useState(true)
  const location = useLocation()
  const navigate = useNavigate()

  useEffect(() => {
    // Configuración del tema dark
    const handleTheme = () => {
      if (localStorage.theme === 'dark' || 
         (!('theme' in localStorage) && 
          window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark')
      } else {
        document.documentElement.classList.remove('dark')
      }
    }

    // Verificación de autenticación (puedes implementarla después)
    const checkAuth = async () => {
      // Ejemplo: 
      // const token = localStorage.getItem('authToken');
      // if (!token && !['/login'].includes(location.pathname)) {
      //   navigate('/login');
      // }
    }

    handleTheme()
    checkAuth().finally(() => setIsLoading(false))
  }, [location, navigate])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-800">
        <LoadingSpinner size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
      <TopbarGuest />
      <Navbar onOpenComprobantePago={onOpenComprobantePago} />
      
      <main className="flex-grow py-6">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <Outlet />
        </div>
      </main>
      
      <Toaster
        position="top-right"
        toastOptions={{
          className: 'dark:bg-gray-800 dark:text-white',
          duration: 5000,
        }}
      />
      
      <Footer />
    </div>
  )
}