import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { Search, Filter, Plus, Edit2, Trash2, ChevronLeft, ChevronRight, Check, X, AlertCircle } from 'lucide-react'
import { api } from '../api/apiClient'

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
  const [sortConfig, setSortConfig] = useState({ key: 'created_at', direction: 'desc' })
  const [showFilters, setShowFilters] = useState(false)
  const [editingArea, setEditingArea] = useState(null)
  const [editForm, setEditForm] = useState({})
  const itemsPerPage = 8

  // ============== LLAMADA API: OBTENER ÁREAS ==============
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        setIsLoading(true)
        setConnectionStatus({ message: "", type: "" })
        
        const areasData = await api.get('/area')
        console.log('Áreas cargadas desde la API:', areasData)
        
        setAreas(areasData)
        setConnectionStatus({ 
          message: `${areasData.length} áreas cargadas correctamente desde la base de datos`, 
          type: "success" 
        })
      } catch (error) {
        console.error('Error al cargar áreas:', error)
        setConnectionStatus({ 
          message: "Error al conectar con la base de datos. Verificar conexión.", 
          type: "error" 
        })
        setAreas([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchAreas()
  }, [])

  // ============== FUNCIONES DE EDICIÓN ==============
  const handleEdit = (area) => {
    // Limpiar mensajes previos
    setConnectionStatus({ message: "", type: "" })
    
    setEditingArea(area.id)
    setEditForm({
      nombre: area.nombre,
      categoria: area.categoria,
      descripcion: area.descripcion || '',
      costo: area.costo,
      estado: area.estado
    })
  }

  const handleCancelEdit = () => {
    setEditingArea(null)
    setEditForm({})
    // Limpiar mensajes de estado al cancelar
    setConnectionStatus({ message: "", type: "" })
  }

  const handleSaveEdit = async () => {
    try {
        setConnectionStatus({ message: "Actualizando área...", type: "info" })
        
        // Validar que los campos requeridos no estén vacíos
        if (!editForm.nombre?.trim()) {
            setConnectionStatus({ 
                message: "El nombre del área es requerido", 
                type: "error" 
            })
            return
        }
        
        if (!editForm.categoria?.trim()) {
            setConnectionStatus({ 
                message: "La categoría es requerida", 
                type: "error" 
            })
            return
        }
        
        if (!editForm.costo || parseFloat(editForm.costo) < 0) {
            setConnectionStatus({ 
                message: "El costo debe ser un número válido mayor o igual a 0", 
                type: "error" 
            })
            return
        }

        // Preparar datos para envío (solo campos que realmente se envían)
        const dataToSend = {
            nombre: editForm.nombre.trim(),
            categoria: editForm.categoria.trim(),
            descripcion: editForm.descripcion?.trim() || null,
            costo: parseFloat(editForm.costo),
            estado: editForm.estado
        }
        
        const updatedArea = await api.put(`/area/${editingArea}`, dataToSend)
        
        setAreas(prev => prev.map(area => 
            area.id === editingArea ? updatedArea : area
        ))
        
        setEditingArea(null)
        setEditForm({})
        setConnectionStatus({ 
            message: "Área actualizada correctamente", 
            type: "success" 
        })
        
        // Limpiar mensaje después de 3 segundos
        setTimeout(() => {
            setConnectionStatus({ message: "", type: "" })
        }, 3000)
        
    } catch (error) {
        console.error('Error al actualizar área:', error)
        
        let errorMessage = "Error al actualizar el área"
        
        // Manejar errores específicos del backend
        if (error.status === 422 && error.data?.errors) {
            const backendErrors = error.data.errors
            if (backendErrors.categoria && backendErrors.categoria.includes('Esta combinación de área y categoría ya existe')) {
                errorMessage = "Ya existe un área con este nombre y categoría. Por favor use una combinación diferente."
            } else {
                const errorMessages = Object.values(backendErrors).flat()
                errorMessage = errorMessages.join(", ")
            }
        } else if (error.data?.message) {
            errorMessage = error.data.message
        }
        
        setConnectionStatus({ 
            message: errorMessage, 
            type: "error" 
        })
        
        // Limpiar mensaje de error después de 5 segundos
        setTimeout(() => {
            setConnectionStatus({ message: "", type: "" })
        }, 5000)
    }
  }

  // ============== FUNCIÓN DE ELIMINACIÓN ==============
  const handleDelete = async (areaId) => {
    try {
      setConnectionStatus({ message: "Eliminando área...", type: "info" })
      
      await api.delete(`/area/${areaId}`)
      
      setAreas(prev => prev.filter(area => area.id !== areaId))
      setShowDeleteModal(null)
      setConnectionStatus({ 
        message: "Área eliminada correctamente", 
        type: "success" 
      })
    } catch (error) {
      console.error('Error al eliminar área:', error)
      setConnectionStatus({ 
        message: "Error al eliminar el área", 
        type: "error" 
      })
      setShowDeleteModal(null)
    }
  }

  // Ordenamiento
  const requestSort = (key) => {
    let direction = 'asc'
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc'
    }
    setSortConfig({ key, direction })
  }

  const sortedAreas = [...areas].sort((a, b) => {
    if (sortConfig.key) {
      const aValue = a[sortConfig.key]
      const bValue = b[sortConfig.key]
      
      if (aValue < bValue) {
        return sortConfig.direction === 'asc' ? -1 : 1
      }
      if (aValue > bValue) {
        return sortConfig.direction === 'asc' ? 1 : -1
      }
    }
    return 0
  })

  // Filtrado combinado
  const filteredAreas = sortedAreas.filter(area => {
    const matchesSearch = area.nombre.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         area.categoria.toLowerCase().includes(searchTerm.toLowerCase())
    
    const matchesLevel = selectedLevels.length === 0 || selectedLevels.includes(area.categoria)
    
    const matchesStatus = statusFilter === 'all' || area.estado === statusFilter
    
    return matchesSearch && matchesLevel && matchesStatus
  })

  // Paginación
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const currentAreas = filteredAreas.slice(startIndex, startIndex + itemsPerPage)

  // Obtener niveles únicos para el filtro
  const uniqueLevels = [...new Set(areas.map(area => area.categoria))].sort()

  if (isLoading) {
    return (
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="flex items-center justify-center min-h-[400px]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Cargando áreas...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Gestión de Áreas
        </h1>
        <button
          onClick={() => navigate('/areas/registro')}
          className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          <Plus className="h-4 w-4 mr-2" />
          Nueva Área
        </button>
      </div>

      {/* Estado de conexión con mejor UI */}
      {connectionStatus.message && (
        <div className={`mb-4 p-3 rounded-md text-sm border ${
          connectionStatus.type === "success" 
            ? "bg-green-100 text-green-800 border-green-200 dark:bg-green-900 dark:text-green-200 dark:border-green-700" 
            : connectionStatus.type === "error"
            ? "bg-red-100 text-red-800 border-red-200 dark:bg-red-900 dark:text-red-200 dark:border-red-700"
            : "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900 dark:text-blue-200 dark:border-blue-700"
        }`}>
          <div className="flex items-start">
            {connectionStatus.type === "success" ? (
              <Check className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            ) : connectionStatus.type === "error" ? (
              <X className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            ) : (
              <AlertCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
            )}
            <span className="flex-1">{connectionStatus.message}</span>
          </div>
        </div>
      )}

      {/* Controles de búsqueda y filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-6">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Búsqueda */}
          <div className="flex-1">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <input
                type="text"
                placeholder="Buscar por área o categoría..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              />
            </div>
          </div>

          {/* Botón de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            <Filter className="h-4 w-4 mr-2" />
            Filtros
          </button>
        </div>

        {/* Panel de filtros */}
        {showFilters && (
          <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Filtro por estado */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Estado
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                >
                  <option value="all">Todos los estados</option>
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
              </div>

              {/* Filtro por categorías */}
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Categorías
                </label>
                <div className="max-h-32 overflow-y-auto border border-gray-300 dark:border-gray-600 rounded-md p-2">
                  {uniqueLevels.map(level => (
                    <label key={level} className="flex items-center mb-1">
                      <input
                        type="checkbox"
                        checked={selectedLevels.includes(level)}
                        onChange={(e) => {
                          if (e.target.checked) {
                            setSelectedLevels([...selectedLevels, level])
                          } else {
                            setSelectedLevels(selectedLevels.filter(l => l !== level))
                          }
                        }}
                        className="mr-2 rounded"
                      />
                      <span className="text-sm text-gray-700 dark:text-gray-300">{level}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tabla de áreas con validación mejorada en campos de edición */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-700">
              <tr>
                <th
                  onClick={() => requestSort('nombre')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Área
                </th>
                <th
                  onClick={() => requestSort('categoria')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Descripción
                </th>
                <th
                  onClick={() => requestSort('costo')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Costo
                </th>
                <th
                  onClick={() => requestSort('estado')}
                  className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
                >
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {currentAreas.map((area) => (
                <tr key={area.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingArea === area.id ? (
                      <input
                        type="text"
                        value={editForm.nombre}
                        onChange={(e) => setEditForm(prev => ({ ...prev, nombre: e.target.value }))}
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Nombre del área"
                        required
                      />
                    ) : (
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {area.nombre}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingArea === area.id ? (
                      <input
                        type="text"
                        value={editForm.categoria}
                        onChange={(e) => setEditForm(prev => ({ ...prev, categoria: e.target.value }))}
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Categoría"
                        required
                      />
                    ) : (
                      <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                        {area.categoria}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    {editingArea === area.id ? (
                      <textarea
                        value={editForm.descripcion}
                        onChange={(e) => setEditForm(prev => ({ ...prev, descripcion: e.target.value }))}
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        rows="2"
                        placeholder="Descripción (opcional)"
                      />
                    ) : (
                      <div className="text-sm text-gray-900 dark:text-white max-w-xs truncate">
                        {area.descripcion || 'Sin descripción'}
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingArea === area.id ? (
                      <input
                        type="number"
                        value={editForm.costo}
                        onChange={(e) => setEditForm(prev => ({ ...prev, costo: e.target.value }))}
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        min="0"
                        step="0.01"
                        placeholder="0.00"
                        required
                      />
                    ) : (
                      <div className="text-sm text-gray-900 dark:text-white">
                        {area.costo} Bs.
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    {editingArea === area.id ? (
                      <select
                        value={editForm.estado}
                        onChange={(e) => setEditForm(prev => ({ ...prev, estado: e.target.value }))}
                        className="w-full px-2 py-1 border rounded text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="activo">Activo</option>
                        <option value="inactivo">Inactivo</option>
                      </select>
                    ) : (
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                        area.estado === 'activo' 
                          ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                          : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                      }`}>
                        {area.estado}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    {editingArea === area.id ? (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={handleSaveEdit}
                          className="text-green-600 hover:text-green-900 dark:text-green-400 dark:hover:text-green-300"
                          title="Guardar cambios"
                        >
                          <Check className="h-4 w-4" />
                        </button>
                        <button
                          onClick={handleCancelEdit}
                          className="text-gray-600 hover:text-gray-900 dark:text-gray-400 dark:hover:text-gray-300"
                          title="Cancelar edición"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => handleEdit(area)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300"
                          title="Editar área"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => setShowDeleteModal(area)}
                          className="text-red-600 hover:text-red-900 dark:text-red-400 dark:hover:text-red-300"
                          title="Eliminar área"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Paginación */}
        {totalPages > 1 && (
          <div className="bg-white dark:bg-gray-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-700">
            <div className="flex-1 flex justify-between sm:hidden">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Anterior
              </button>
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
              >
                Siguiente
              </button>
            </div>
            <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
              <div>
                <p className="text-sm text-gray-700 dark:text-gray-300">
                  Mostrando <span className="font-medium">{startIndex + 1}</span> a{' '}
                  <span className="font-medium">{Math.min(startIndex + itemsPerPage, filteredAreas.length)}</span> de{' '}
                  <span className="font-medium">{filteredAreas.length}</span> resultados
                </p>
              </div>
              <div>
                <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                  <button
                    onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                    disabled={currentPage === 1}
                    className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronLeft className="h-5 w-5" />
                  </button>
                  {[...Array(totalPages)].map((_, i) => (
                    <button
                      key={i + 1}
                      onClick={() => setCurrentPage(i + 1)}
                      className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium ${
                        currentPage === i + 1
                          ? 'z-10 bg-blue-50 border-blue-500 text-blue-600'
                          : 'bg-white border-gray-300 text-gray-500 hover:bg-gray-50'
                      }`}
                    >
                      {i + 1}
                    </button>
                  ))}
                  <button
                    onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                    disabled={currentPage === totalPages}
                    className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                  >
                    <ChevronRight className="h-5 w-5" />
                  </button>
                </nav>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl">
            <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-4">
              Confirmar eliminación
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
              ¿Está seguro que desea eliminar el área "{showDeleteModal.nombre}" - "{showDeleteModal.categoria}"?
              Esta acción no se puede deshacer.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteModal(null)}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600"
              >
                Cancelar
              </button>
              <button
                onClick={() => handleDelete(showDeleteModal.id)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700"
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