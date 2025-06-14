import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { Edit, Trash2, Plus, ChevronLeft, ChevronRight, Check, X, Search, Filter, ChevronDown, ChevronUp } from "lucide-react"
import { api } from '../api/apiClient'; // Importar apiClient
import LoadingSpinner from '../components/common/LoadingSpinner'

const AreaList = () => {
  const navigate = useNavigate()
  const [areas, setAreas] = useState([])
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevels, setSelectedLevels] = useState([]) // Esto filtra por 'categoria'
  const [statusFilter, setStatusFilter] = useState('all') // 'activo', 'inactivo'
  const [isLoading, setIsLoading] = useState(true)
  const [showDeleteModal, setShowDeleteModal] = useState(null) // Almacena el ID del área a eliminar
  const [connectionStatus, setConnectionStatus] = useState({ message: "", type: "" })
  const [sortConfig, setSortConfig] = useState({ key: 'id', direction: 'desc' }) // Ordenar por ID descendente por defecto
  const [showFilters, setShowFilters] = useState(false)
  const itemsPerPage = 8

  // ============== LLAMADA API: OBTENER ÁREAS ==============
  useEffect(() => {
    console.log("AreaList: Montando componente y ejecutando fetchAreas..."); // Log al montar
    const fetchAreas = async () => {
      try {
        setIsLoading(true);
        setConnectionStatus({ message: "", type: "" });
        // console.log("AreaList: Llamando a api.get('/areas')..."); 
        const response = await api.get('/areas'); // API call
        // console.log("AreaList: Datos recibidos de la API:", response); 

        // La API ya devuelve los datos en el formato esperado por el backend
        // id, nombre, categoria, costo, descripcion, estado, modo
        // El frontend espera: id, name, categoryLevel, cost, description, isActive, createdAt (o id)
        const formattedAreas = response.map(area => ({
          id: area.id,
          name: area.nombre,
          categoryLevel: area.categoria, // Mapear 'categoria' a 'categoryLevel'
          cost: area.costo ?? 0,
          description: area.descripcion || "",
          isActive: area.estado === 'activo', // Mapear 'estado' a 'isActive'
          // createdAt: area.created_at || area.id // La tabla 'area' no tiene timestamps
          // Usaremos 'id' para ordenar si se selecciona fecha, o un campo que no existe
          // Lo ideal sería añadir timestamps a la tabla 'area' si se necesita ordenar por fecha de creación.
          // Por ahora, si se ordena por 'createdAt', se ordenará por 'id'.
          createdAt: area.id, // Usar 'id' como fallback para 'createdAt'
          modo: area.modo,
        }));
        // console.log("AreaList: Datos formateados:", formattedAreas);
        
        setAreas(formattedAreas);
        // setConnectionStatus({ message: "Datos cargados desde la API", type: "success" });
      } catch (error) {
        console.error("Error cargando áreas desde API:", error);
        setConnectionStatus({ message: `Error al obtener datos: ${error.response?.data?.message || error.message}`, type: "error" });
      } finally {
        setIsLoading(false);
        // console.log("AreaList: fetchAreas finalizado.");
      }
    };
    
    fetchAreas();
  }, []); // El array vacío significa que se ejecuta solo al montar

  // Ordenamiento
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedAreas = [...areas].sort((a, b) => {
    const valA = a[sortConfig.key];
    const valB = b[sortConfig.key];

    if (valA < valB) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (valA > valB) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });


  // Filtrado combinado
  const filteredAreas = sortedAreas.filter(area => {
    const matchesSearch = area.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         (area.description && area.description.toLowerCase().includes(searchTerm.toLowerCase()));
    // selectedLevels filtra por 'categoryLevel' que es la 'categoria' del backend
    const matchesLevel = selectedLevels.length === 0 || 
                        selectedLevels.some(level => area.categoryLevel.toLowerCase().includes(level.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || 
                         (statusFilter === 'active' && area.isActive) || 
                         (statusFilter === 'inactive' && !area.isActive);
    return matchesSearch && matchesLevel && matchesStatus;
  });

  // Extraer niveles únicos para los filtros (basado en categoryLevel)
  const uniqueLevels = [...new Set(
    areas.map(area => area.categoryLevel) // Usar categoryLevel directamente
         .filter(level => level) // Filtrar nulos o vacíos
         .sort()
  )]

  // Paginación
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentAreas = filteredAreas.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage)

  // ============== LLAMADA API: CAMBIAR ESTADO ÁREA ==============
  const toggleAreaStatus = async (id) => {
    try {
      const areaToUpdate = areas.find(area => area.id === id);
      if (!areaToUpdate) return;

      const newStatusApi = areaToUpdate.isActive ? 'inactivo' : 'activo'; // Estado para la API
      
      // Se necesita enviar todos los campos requeridos por la validación del backend
      // o modificar el backend para permitir actualizaciones parciales de 'estado'
      // Por ahora, asumimos que el backend permite actualizar solo el estado
      // o que el controlador de backend maneja esto adecuadamente con PATCH.
      // Si el backend requiere todos los campos para PUT, esto fallará.
      // La solución es usar PATCH en el backend o enviar todos los campos.

      const areaDataForUpdate = {
        nombre: areaToUpdate.name,
        categoria: areaToUpdate.categoryLevel,
        costo: areaToUpdate.cost,
        descripcion: areaToUpdate.description,
        estado: newStatusApi,
        modo: areaToUpdate.modo,
      };
      
      await api.put(`/areas/${id}`, areaDataForUpdate); // Usar PUT
      
      setAreas(areas.map(area => 
        area.id === id ? { ...area, isActive: !areaToUpdate.isActive } : area
      ));
      setConnectionStatus({ 
        message: `Estado del área ID: ${id} actualizado a ${newStatusApi}.`, 
        type: "success" 
      });
    } catch (error) {
      console.error("Error cambiando estado vía API:", error);
      setConnectionStatus({ 
        message: `Error al actualizar estado (ID: ${id}): ${error.response?.data?.message || error.message}`, 
        type: "error" 
      });
    }
  };

  // ============== LLAMADA API: ELIMINAR ÁREA ==============
  const handleDelete = async (id) => {
    if (!id) return;
    try {
      await api.delete(`/areas/${id}`);
      
      setAreas(areas.filter(area => area.id !== id));
      setShowDeleteModal(null); // Cerrar modal
      setConnectionStatus({ 
        message: `Área eliminada (ID: ${id})`, 
        type: "success" 
      });
    } catch (error) {
      console.error("Error eliminando área vía API:", error);
      setConnectionStatus({ 
        message: `Error al eliminar (ID: ${id}): ${error.response?.data?.message || error.message}`, 
        type: "error" 
      });
      // No cerrar el modal si hay error para que el usuario vea el mensaje
    }
  };

  const handleEdit = (id) => {
    navigate(`/editar-area/${id}`); // Navega a la página de edición
  };

  const handleNewArea = () => {
    navigate('/register'); // Navega a la página de registro de área
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
          Gestión de Áreas Académicas
        </h1>
        
        <button
          onClick={handleNewArea}
          className="flex items-center px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md text-sm"
        >
          <Plus className="h-4 w-4 mr-1" />
          Nueva Área
        </button>
      </div>

      {/* Estado de conexión */}
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

      {/* Panel de búsqueda y filtros */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Barra de búsqueda */}
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o descripción..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          
          {/* Botón toggle de filtros */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 rounded-md"
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
        
        {/* Panel de filtros desplegable */}
        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            {/* Filtro por estado */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado
              </label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="active">Activas</option>
                <option value="inactive">Inactivas</option>
              </select>
            </div>
            
            {/* Filtro por nivel */}
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
            
            {/* Ordenamiento */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Ordenar por
              </label>
              <div className="flex space-x-2">
                <button
                  onClick={() => requestSort('name')}
                  className={`px-3 py-1 text-sm rounded-md ${
                    sortConfig.key === 'name' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  Nombre
                  {sortConfig.key === 'name' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                  )}
                </button>
                <button // Botón para ordenar por 'createdAt' (que ahora usa 'id')
                  onClick={() => requestSort('createdAt')} 
                  className={`px-3 py-1 text-sm rounded-md ${
                    sortConfig.key === 'createdAt' ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200' : 'bg-gray-100 dark:bg-gray-700'
                  }`}
                >
                  ID (Fecha Reg.) 
                  {sortConfig.key === 'createdAt' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                  )}
                </button>
                 <button // Botón para ordenar por 'cost'
                  onClick={() => requestSort('cost')} 
                  className={`px-3 py-1 text-sm rounded-md ${
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

      {/* Resumen de resultados */}
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
            className="text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
          >
            Limpiar filtros
          </button>
        )}
      </div>

{/* Listado de áreas */}
<div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
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
              <th 
                onClick={() => requestSort('name')}
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
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
                className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-600"
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
                  {area.cost ? `Bs. ${Number(area.cost).toFixed(2)}` : 'N/A'}
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
        <div className="bg-gray-50 dark:bg-gray-700 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-gray-600 sm:px-6">
          <div className="flex-1 flex justify-between sm:hidden">
            <button
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
            >
              Anterior
            </button>
            <button
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-gray-600 text-sm font-medium rounded-md text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
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
                  className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
                >
                  <span className="sr-only">Anterior</span>
                  <ChevronLeft className="h-5 w-5" aria-hidden="true" />
                </button>
                {/* Aquí podrías agregar la lógica para mostrar números de página si lo deseas */}
                {/* Ejemplo simple de números de página (podría mejorarse para rangos grandes) */}
                {Array.from({ length: totalPages }, (_, i) => i + 1).map(pageNumber => (
                  <button
                    key={pageNumber}
                    onClick={() => setCurrentPage(pageNumber)}
                    aria-current={pageNumber === currentPage ? 'page' : undefined}
                    className={`relative inline-flex items-center px-4 py-2 border text-sm font-medium
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
                  className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm font-medium text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 disabled:opacity-50"
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