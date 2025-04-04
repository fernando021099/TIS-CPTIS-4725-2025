import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight, Check, X } from "lucide-react"
import { supabase } from '../supabaseClient'

const AreaList = () => {
  const navigate = useNavigate()
  const [areas, setAreas] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevels, setSelectedLevels] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(null)
  const [connectionStatus, setConnectionStatus] = useState({ message: "", type: "" }) // Para mostrar estado de conexión
  const itemsPerPage = 8

  // ============== LLAMADA API: OBTENER ÁREAS ==============
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const { data, error } = await supabase
          .from('area')
          .select('*')
        
        if (error) throw error
        
        // Transformar datos al formato esperado por el componente
        const formattedAreas = data.map(area => ({
          id: area.id,
          name: area.nombre,
          categoryLevel: area.nivel,
          cost: area.costo || 50, // Ahora usamos el campo real costo de la base de datos
          description: area.descripcion || "",
          isActive: area.estado === 'ACTIVO',
          createdAt: new Date().toISOString() // La tabla no tiene campo createdAt
        }))
        
        setAreas(formattedAreas)
        setConnectionStatus({ message: "Conexión Supabase exitosa", type: "success" })
      } catch (error) {
        console.error("Error cargando áreas:", error)
        setConnectionStatus({ message: "Error al obtener datos", type: "error" })
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchAreas()
  }, [])

  // Filtrado de áreas
  const filteredAreas = areas.filter(area => {
    const matchesSearch = area.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (area.description && area.description.toLowerCase().includes(searchTerm.toLowerCase()))
    const matchesLevel = selectedLevels.length === 0 || 
                        selectedLevels.some(level => area.categoryLevel.includes(level))
    return matchesSearch && matchesLevel
  })

  // Extraer niveles únicos para los filtros
  const uniqueLevels = [...new Set(
    areas.map(area => {
      const parts = area.categoryLevel.split(" - ")
      return parts.length > 1 ? parts[1] : area.categoryLevel
    })
  )]

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentAreas = filteredAreas.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage)

  // ============== LLAMADA API: CAMBIAR ESTADO ÁREA ==============
  const toggleAreaStatus = async (id) => {
    try {
      const areaToUpdate = areas.find(area => area.id === id)
      const newStatus = areaToUpdate.isActive ? 'INACTIVO' : 'ACTIVO'
      
      const { error } = await supabase
        .from('area')
        .update({ estado: newStatus })
        .eq('id', id)
      
      if (error) throw error
      
      // Actualizar estado local
      setAreas(areas.map(area => 
        area.id === id ? { ...area, isActive: !area.isActive } : area
      ))
      
      setConnectionStatus({ 
        message: `Cambio de estado exitoso (ID: ${id})`, 
        type: "success" 
      })
    } catch (error) {
      console.error("Error cambiando estado:", error)
      setConnectionStatus({ 
        message: `Error al cambiar estado (ID: ${id})`, 
        type: "error" 
      })
    }
  }

  // ============== LLAMADA API: ELIMINAR ÁREA ==============
  const handleDelete = async (id) => {
    try {
      const { error } = await supabase
        .from('area')
        .delete()
        .eq('id', id)
      
      if (error) throw error
      
      setAreas(areas.filter(area => area.id !== id))
      setShowDeleteModal(null)
      
      setConnectionStatus({ 
        message: `Área eliminada correctamente (ID: ${id})`, 
        type: "success" 
      })
    } catch (error) {
      console.error("Error eliminando área:", error)
      setConnectionStatus({ 
        message: `Error al eliminar área (ID: ${id})`, 
        type: "error" 
      })
    }
  }

  const handleEdit = (id) => {
    navigate(`/edit-area/${id}`)
  }

  const handleNewArea = () => {
    navigate('/register', { state: { fromList: true } })
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      {/* Encabezado con navegación */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ChevronLeft className="h-5 w-5 mr-1" />
          Volver
        </button>
        
        <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center sm:text-left">
          Listado de Áreas Registradas
        </h1>
        
        <button
          onClick={handleNewArea}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nueva Área
        </button>
      </div>

      {/* Mostrar estado de conexión */}
      {connectionStatus.message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          connectionStatus.type === "success" 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }`}>
          {connectionStatus.type === "success" ? (
            <Check className="h-4 w-4 inline mr-1" />
          ) : (
            <X className="h-4 w-4 inline mr-1" />
          )}
          {connectionStatus.message}
        </div>
      )}

      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Buscar áreas
            </label>
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Filtrar por nivel
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
                  className={`px-3 py-1 rounded-full text-xs flex items-center ${
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
        </div>
      </div>

      {/* Listado de áreas */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
        {isLoading ? (
          <div className="p-8 text-center text-gray-500 dark:text-gray-400">
            Cargando áreas...
          </div>
        ) : filteredAreas.length === 0 ? (
          <div className="p-8 text-center">
            <p className="text-gray-500 dark:text-gray-400">
              {searchTerm || selectedLevels.length > 0
                ? "No se encontraron áreas con los filtros aplicados"
                : "No hay áreas registradas"}
            </p>
            <button
              onClick={handleNewArea}
              className="mt-4 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nivel/Categoría
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Costo
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
                    <tr key={area.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
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
                        Bs. {area.cost.toFixed(2)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <button
                          onClick={() => toggleAreaStatus(area.id)}
                          className={`px-3 py-1 rounded-full text-xs font-medium flex items-center ${
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
                            className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 p-1"
                            title="Editar"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => setShowDeleteModal(area.id)}
                            className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 p-1"
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

            {/* Paginación */}
            {totalPages > 1 && (
              <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600">
                <div className="flex-1 flex justify-between sm:hidden">
                  <button
                    onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500"
                  >
                    Anterior
                  </button>
                  <button
                    onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                    disabled={currentPage === totalPages}
                    className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-600 hover:bg-gray-50 dark:hover:bg-gray-500"
                  >
                    Siguiente
                  </button>
                </div>
                <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                  <div>
                    <p className="text-sm text-gray-700 dark:text-gray-300">
                      Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a{' '}
                      <span className="font-medium">{Math.min(indexOfLastItem, filteredAreas.length)}</span> de{' '}
                      <span className="font-medium">{filteredAreas.length}</span> áreas
                    </p>
                  </div>
                  <div>
                    <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                      <button
                        onClick={() => setCurrentPage(1)}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white dark:bg-gray-600 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500"
                      >
                        <span className="sr-only">Primera</span>
                        <ChevronLeft className="h-4 w-4" />
                        <ChevronLeft className="h-4 w-4 -ml-2" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white dark:bg-gray-600 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500"
                      >
                        <span className="sr-only">Anterior</span>
                        <ChevronLeft className="h-4 w-4" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                            currentPage === i + 1
                              ? 'z-10 bg-blue-50 dark:bg-blue-900 border-blue-500 dark:border-blue-600 text-blue-600 dark:text-blue-200'
                              : 'bg-white dark:bg-gray-600 border-gray-300 dark:border-gray-500 text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500'
                          }`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 border border-gray-300 bg-white dark:bg-gray-600 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500"
                      >
                        <span className="sr-only">Siguiente</span>
                        <ChevronRight className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(totalPages)}
                        disabled={currentPage === totalPages}
                        className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white dark:bg-gray-600 text-sm font-medium text-gray-500 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-500"
                      >
                        <span className="sr-only">Última</span>
                        <ChevronRight className="h-4 w-4" />
                        <ChevronRight className="h-4 w-4 -ml-2" />
                      </button>
                    </nav>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* Modal de confirmación para eliminar */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                Confirmar eliminación
              </h3>
              <button 
                onClick={() => setShowDeleteModal(null)} 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
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
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 hover:bg-red-700 rounded-md"
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