import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight, Check, X, Search, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { api } from '../api/apiClient'
import LoadingSpinner from '../components/common/LoadingSpinner'

const AreaList = () => {
  const navigate = useNavigate()
  const [areas, setAreas] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevels, setSelectedLevels] = useState([])
  const [statusFilter, setStatusFilter] = useState('all')
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState({ message: "", type: "" })
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' })
  const [showFilters, setShowFilters] = useState(false)
  const itemsPerPage = 8

  // ============== API CALL: GET AREAS ==============
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setIsLoading(true)
        setConnectionStatus({ message: "", type: "" })
        
        const response = await api.get('/areas')
        const formattedAreas = response.map(area => ({
          id: area.id,
          name: area.nombre,
          categoryLevel: area.categoria,
          cost: area.costo ?? 0,
          description: area.descripcion || "",
          isActive: area.estado === 'activo',
          createdAt: area.id,
          modo: area.modo,
        }))
        
        setAreas(formattedAreas)
      } catch (error) {
        console.error("Error loading areas:", error)
        setConnectionStatus({ 
          message: `Error: ${error.response?.data?.message || error.message}`, 
          type: "error" 
        })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAreas()
  }, [])

  // Sorting
  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedAreas = [...areas].sort((a, b) => {
    const valA = a[sortConfig.key]
    const valB = b[sortConfig.key]

    if (valA < valB) return sortConfig.direction === 'asc' ? -1 : 1
    if (valA > valB) return sortConfig.direction === 'asc' ? 1 : -1
    return 0
  })

  // Filtering
  const filteredAreas = sortedAreas.filter(area => {
    const matchesSearch = area.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         area.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = selectedLevels.length === 0 || 
                        selectedLevels.some(level => area.categoryLevel?.toLowerCase().includes(level.toLowerCase()))
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && area.isActive) || 
                         (statusFilter === 'inactive' && !area.isActive)
    return matchesSearch && matchesLevel && matchesStatus
  })

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentAreas = filteredAreas.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage)

  // ============== API CALL: TOGGLE STATUS ==============
  const toggleAreaStatus = async (id) => {
    try {
      const areaToUpdate = areas.find(area => area.id === id)
      if (!areaToUpdate) return

      const newStatusApi = areaToUpdate.isActive ? 'inactivo' : 'activo'
      
      await api.put(`/areas/${id}`, {
        nombre: areaToUpdate.name,
        categoria: areaToUpdate.categoryLevel,
        costo: areaToUpdate.cost,
        descripcion: areaToUpdate.description,
        estado: newStatusApi,
        modo: areaToUpdate.modo,
      })
      
      setAreas(areas.map(area => 
        area.id === id ? { ...area, isActive: !areaToUpdate.isActive } : area
      ))
      setConnectionStatus({ 
        message: `Estado actualizado (ID: ${id})`, 
        type: "success" 
      })
    } catch (error) {
      console.error("Error updating status:", error)
      setConnectionStatus({ 
        message: `Error (ID: ${id}): ${error.response?.data?.message || error.message}`, 
        type: "error" 
      })
    }
  }

  // ============== API CALL: DELETE AREA ==============
  const handleDelete = async (id) => {
    try {
      await api.delete(`/areas/${id}`)
      setAreas(areas.filter(area => area.id !== id))
      setShowDeleteModal(null)
      setConnectionStatus({ 
        message: `Área eliminada (ID: ${id})`, 
        type: "success" 
      })
    } catch (error) {
      console.error("Error deleting area:", error)
      setConnectionStatus({ 
        message: `Error (ID: ${id}): ${error.response?.data?.message || error.message}`, 
        type: "error" 
      })
    }
  }

  // Navigation handlers
  const handleEdit = (id) => navigate(`/editar-area/${id}`)
  const handleNewArea = () => navigate('/register')
  const handleBack = () => navigate(-1)

  // Get unique levels for filters
  const uniqueLevels = [...new Set(
    areas.map(area => area.categoryLevel)
         .filter(level => level)
         .sort()
  )]

  return (
    <div className="max-w-7xl mx-auto px-4 py-6 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <button 
          onClick={handleBack}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Volver
        </button>
        
        <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center sm:text-left">
          Gestión de Áreas Académicas
        </h1>
        
        <button
          onClick={handleNewArea}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nueva Área
        </button>
      </div>

      {/* Connection status */}
      {connectionStatus.message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          connectionStatus.type === "success" 
            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
        }`}>
          {connectionStatus.type === "success" ? (
            <Check className="h-4 w-4 inline mr-1" />
          ) : (
            <X className="h-4 w-4 inline mr-1" />
          )}
          {connectionStatus.message}
        </div>
      )}

      {/* Search and filters */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search bar */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Filters toggle */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md transition-colors"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filtros
            {showFilters ? (
              <ChevronUp className="h-5 w-5 ml-1" />
            ) : (
              <ChevronDown className="h-5 w-5 ml-1" />
            )}
          </button>
        </div>
        
        {/* Filters panel */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white transition-colors"
              >
                <option value="all">Todos</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
            </div>
            
            {/* Level filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nivel/Categoría
              </label>
              <div className="flex flex-wrap gap-2">
                {uniqueLevels.map(level => (
                  <button
                    key={level}
                    onClick={() => {
                      if (selectedLevels.includes(level)) {
                        setSelectedLevels(selectedLevels.filter(l => l !== level))
                      } else {
                        setSelectedLevels([...selectedLevels, level])
                      }
                    }}
                    className={`px-3 py-1 rounded-full text-xs flex items-center transition-colors ${
                      selectedLevels.includes(level)
                        ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200 border border-blue-200 dark:border-blue-700'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200 border border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    {selectedLevels.includes(level) && (
                      <Check className="h-3 w-3 mr-1" />
                    )}
                    {level}
                  </button>
                ))}
              </div>
            </div>
            
            {/* Sorting */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ordenar por
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => requestSort('name')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    sortConfig.key === 'name' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  Nombre
                  {sortConfig.key === 'name' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                  )}
                </button>
                <button
                  onClick={() => requestSort('createdAt')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    sortConfig.key === 'createdAt' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  ID
                  {sortConfig.key === 'createdAt' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                  )}
                </button>
                <button
                  onClick={() => requestSort('cost')}
                  className={`px-3 py-1 text-sm rounded-md transition-colors ${
                    sortConfig.key === 'cost' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  Costo
                  {sortConfig.key === 'cost' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results summary */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredAreas.length} de {areas.length} áreas
        </p>
        {(statusFilter !== 'all' || selectedLevels.length > 0) && (
          <button 
            onClick={() => {
              setStatusFilter('all')
              setSelectedLevels([])
            }}
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 transition-colors"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Areas table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
        {isLoading ? (
          <div className="p-8 text-center">
            <LoadingSpinner size="lg" />
          </div>
        ) : filteredAreas.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || selectedLevels.length > 0 || statusFilter !== 'all'
                ? "No se encontraron áreas con los filtros aplicados"
                : "No hay áreas registradas"}
            </p>
            <button
              onClick={handleNewArea}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm transition-colors"
            >
              <Plus className="h-4 w-4 mr-1 inline" />
              Registrar primera área
            </button>
          </div>
        ) : (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th 
                      onClick={() => requestSort('name')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center">
                        Nombre
                        {sortConfig.key === 'name' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="h-4 w-4 ml-1" /> : 
                            <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nivel/Categoría
                    </th>
                    <th 
                      onClick={() => requestSort('cost')}
                      className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                    >
                      <div className="flex items-center">
                        Costo
                        {sortConfig.key === 'cost' && (
                          sortConfig.direction === 'asc' ? 
                            <ChevronUp className="h-4 w-4 ml-1" /> : 
                            <ChevronDown className="h-4 w-4 ml-1" />
                        )}
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {currentAreas.map((area) => (
                    <tr key={area.id} className="hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {area.name}
                        </div>
                        {area.description && (
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {area.description}
                          </div>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {area.categoryLevel}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500 dark:text-gray-400">
                        {area.cost ? `Bs. ${Number(area.cost).toFixed(2)}` : 'N/A'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleAreaStatus(area.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center transition-colors ${
                            area.isActive
                              ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                              : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                          }`}
                        >
                          {area.isActive ? (
                            <Check className="h-3 w-3 mr-1" />
                          ) : (
                            <X className="h-3 w-3 mr-1" />
                          )}
                          {area.isActive ? 'Activo' : 'Inactivo'}
                        </button>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(area.id)}  
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1 transition-colors"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(area.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1 transition-colors"
                            title="Eliminar"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600 sm:px-6">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a <span className="font-medium">{Math.min(indexOfLastItem, filteredAreas.length)}</span> de <span className="font-medium">{filteredAreas.length}</span> resultados
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Paginación">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                      >
                        <span className="sr-only">Anterior</span>
                        <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                      </button>
                      {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                        <button
                          key={pageNumber}
                          onClick={() => setCurrentPage(pageNumber)}
                          aria-current={pageNumber === currentPage ? 'page' : undefined}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium transition-colors
                            ${pageNumber === currentPage 
                              ? 'z-10 bg-blue-50 border-blue-500 text-blue-600 dark:bg-blue-900 dark:border-blue-700 dark:text-blue-200' 
                              : 'bg-white dark:bg-gray-800 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                            }
                          `}
                        >
                          {pageNumber}
                        </button>
                      ))}
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50 transition-colors"
                      >
                        <span className="sr-only">Siguiente</span>
                        <ChevronRight className="h-5 w-5" aria-hidden="true" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Delete confirmation modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl transition-colors">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Confirmar eliminación
              </h3>
              <button 
                onClick={() => setShowDeleteModal(null)} 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300 transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mb-6">
              ¿Estás seguro que deseas eliminar esta área? Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition-colors"
              >
                Eliminar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AreaList