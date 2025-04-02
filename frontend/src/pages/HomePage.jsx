import { Link } from 'react-router-dom'
import { ArrowRight, List } from 'lucide-react'

export default function HomePage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto space-y-4">
        <h1 className="text-2xl font-bold text-center text-gray-800 dark:text-white">
          Gestión de Áreas
        </h1>
        
        <Link
          to="/register"
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span>Registrar nueva área</span>
          <ArrowRight className="h-5 w-5" />
        </Link>
        
        <Link
          to="/areas"
          className="flex items-center justify-between p-4 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors"
        >
          <span>Ver listado de áreas</span>
          <List className="h-5 w-5" />
        </Link>
      </div>
    </div>
  )
}