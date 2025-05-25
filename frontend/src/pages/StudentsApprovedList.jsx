import { useState, useEffect } from 'react';
import { Search, Download, Filter, ChevronDown, ChevronUp, Eye, FileText, Edit, Save, X } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import LoadingSpinner from '../components/common/LoadingSpinner';

const StudentsApprovedList = () => {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    area: 'all',
    sortBy: 'fecha',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [availableAreas, setAvailableAreas] = useState([]);
  
  // Estados para edición
  const [editingInscription, setEditingInscription] = useState(null);
  const [editForm, setEditForm] = useState({
    estado: '',
    motivo_rechazo: ''
  });
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    try {
      setLoading(true);
      // Cargar todas las inscripciones con sus relaciones
      const response = await api.get('/inscripción?_relations=estudiante,contacto,colegio,area1,area2,olimpiada');
      console.log('Inscripciones cargadas:', response);
      
      setInscriptions(response || []);
      
      // Extraer áreas únicas para filtros
      const areas = new Set();
      response.forEach(inscription => {
        if (inscription.area1?.nombre) areas.add(inscription.area1.nombre);
        if (inscription.area2?.nombre) areas.add(inscription.area2.nombre);
      });
      setAvailableAreas([...areas]);
      
    } catch (error) {
      console.error('Error al cargar inscripciones:', error);
      setError('Error al cargar las inscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const startEditing = (inscription) => {
    setEditingInscription(inscription.id);
    setEditForm({
      estado: inscription.estado,
      motivo_rechazo: inscription.motivo_rechazo || ''
    });
  };

  const cancelEditing = () => {
    setEditingInscription(null);
    setEditForm({ estado: '', motivo_rechazo: '' });
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    setEditForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const saveChanges = async (inscriptionId) => {
    try {
      setIsUpdating(true);
      
      const updateData = {
        estado: editForm.estado
      };

      // Solo incluir motivo_rechazo si el estado es 'rechazado'
      if (editForm.estado === 'rechazado') {
        updateData.motivo_rechazo = editForm.motivo_rechazo;
      }

      await api.put(`/inscripción/${inscriptionId}`, updateData);
      
      // Actualizar la lista local
      setInscriptions(prev => prev.map(inscription => 
        inscription.id === inscriptionId 
          ? { ...inscription, ...updateData }
          : inscription
      ));
      
      setEditingInscription(null);
      setEditForm({ estado: '', motivo_rechazo: '' });
      
    } catch (error) {
      console.error('Error al actualizar inscripción:', error);
      alert('Error al actualizar la inscripción');
    } finally {
      setIsUpdating(false);
    }
  };

  const filteredInscriptions = inscriptions.filter(inscription => {
    const studentName = inscription.estudiante ? 
      `${inscription.estudiante.nombres} ${inscription.estudiante.apellidos}`.toLowerCase() : '';
    const studentCI = inscription.estudiante?.ci || '';
    
    return (
      (filters.searchTerm === '' || 
       studentName.includes(filters.searchTerm.toLowerCase()) || 
       studentCI.includes(filters.searchTerm)) &&
      (filters.status === 'all' || inscription.estado === filters.status) &&
      (filters.area === 'all' || 
       inscription.area1?.nombre === filters.area || 
       inscription.area2?.nombre === filters.area)
    );
  }).sort((a, b) => {
    const order = filters.sortOrder === 'asc' ? 1 : -1;
    
    if (filters.sortBy === 'estudiante') {
      const nameA = a.estudiante ? `${a.estudiante.nombres} ${a.estudiante.apellidos}` : '';
      const nameB = b.estudiante ? `${b.estudiante.nombres} ${b.estudiante.apellidos}` : '';
      return nameA.localeCompare(nameB) * order;
    }
    
    if (a[filters.sortBy] < b[filters.sortBy]) return -1 * order;
    if (a[filters.sortBy] > b[filters.sortBy]) return 1 * order;
    return 0;
  });

  const getStatusBadge = (status) => {
    const badges = {
      'aprobado': 'bg-green-100 text-green-800',
      'pendiente': 'bg-yellow-100 text-yellow-800',
      'rechazado': 'bg-red-100 text-red-800'
    };
    
    const texts = {
      'aprobado': 'Aprobado',
      'pendiente': 'Pendiente',
      'rechazado': 'Rechazado'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
        {texts[status] || status}
      </span>
    );
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-8">
        <p className="text-red-600">{error}</p>
        <button 
          onClick={fetchInscriptions}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Reporte de Postulaciones</h1>
        <p className="text-gray-600">Todas las inscripciones registradas en el sistema</p>
      </div>
      
      {/* Filtros y búsqueda */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o CI..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange({ target: { name: 'searchTerm', value: e.target.value } })}
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filtros
              {showFilters ? <ChevronUp className="h-5 w-5 ml-1" /> : <ChevronDown className="h-5 w-5 ml-1" />}
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="h-5 w-5 mr-2" />
              Imprimir
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="all">Todos los estados</option>
                <option value="aprobado">Aprobados</option>
                <option value="pendiente">Pendientes</option>
                <option value="rechazado">Rechazados</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <select
                name="area"
                value={filters.area}
                onChange={handleFilterChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="all">Todas las áreas</option>
                {availableAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="fecha">Fecha de Inscripción</option>
                <option value="estudiante">Nombre del Estudiante</option>
                <option value="estado">Estado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Orden</label>
              <select
                name="sortOrder"
                value={filters.sortOrder}
                onChange={handleFilterChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Total</h3>
          <p className="text-2xl font-bold text-blue-600">{inscriptions.length}</p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Aprobados</h3>
          <p className="text-2xl font-bold text-green-600">
            {inscriptions.filter(i => i.estado === 'aprobado').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Pendientes</h3>
          <p className="text-2xl font-bold text-yellow-600">
            {inscriptions.filter(i => i.estado === 'pendiente').length}
          </p>
        </div>
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="text-lg font-medium text-gray-900">Rechazados</h3>
          <p className="text-2xl font-bold text-red-600">
            {inscriptions.filter(i => i.estado === 'rechazado').length}
          </p>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Mostrando {filteredInscriptions.length} de {inscriptions.length} inscripciones
        </p>
        {(filters.status !== 'all' || filters.area !== 'all' || filters.searchTerm !== '') && (
          <button
            onClick={() => setFilters({
              searchTerm: '',
              status: 'all',
              area: 'all',
              sortBy: 'fecha',
              sortOrder: 'desc'
            })}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla de inscripciones */}
      {filteredInscriptions.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No se encontraron inscripciones con los filtros aplicados</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">ID</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estudiante</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Áreas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Colegio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Código</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredInscriptions.map((inscription) => (
                  <tr key={inscription.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inscription.id}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {inscription.estudiante ? 
                          `${inscription.estudiante.nombres} ${inscription.estudiante.apellidos}` : 
                          'N/A'
                        }
                      </div>
                      <div className="text-sm text-gray-500">
                        {inscription.estudiante?.correo || 'N/A'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {inscription.estudiante?.ci || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        {inscription.area1 && (
                          <div className="mb-1">
                            <span className="font-medium">{inscription.area1.nombre}</span>
                            {inscription.area1.categoria && (
                              <span className="text-xs text-gray-400 ml-1">({inscription.area1.categoria})</span>
                            )}
                          </div>
                        )}
                        {inscription.area2 && (
                          <div>
                            <span className="font-medium">{inscription.area2.nombre}</span>
                            {inscription.area2.categoria && (
                              <span className="text-xs text-gray-400 ml-1">({inscription.area2.categoria})</span>
                            )}
                          </div>
                        )}
                        {!inscription.area1 && !inscription.area2 && 'Sin áreas'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <div>
                        <div className="font-medium">{inscription.colegio?.nombre || 'N/A'}</div>
                        <div className="text-xs text-gray-400">
                          {inscription.colegio?.departamento}, {inscription.colegio?.provincia}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {editingInscription === inscription.id ? (
                        <div className="space-y-2">
                          <select
                            name="estado"
                            value={editForm.estado}
                            onChange={handleEditChange}
                            className="text-xs border rounded px-2 py-1 w-full"
                          >
                            <option value="pendiente">Pendiente</option>
                            <option value="aprobado">Aprobado</option>
                            <option value="rechazado">Rechazado</option>
                          </select>
                          {editForm.estado === 'rechazado' && (
                            <textarea
                              name="motivo_rechazo"
                              value={editForm.motivo_rechazo}
                              onChange={handleEditChange}
                              placeholder="Motivo del rechazo..."
                              className="text-xs border rounded px-2 py-1 w-full"
                              rows="2"
                            />
                          )}
                        </div>
                      ) : (
                        <div>
                          {getStatusBadge(inscription.estado)}
                          {inscription.motivo_rechazo && (
                            <div className="text-xs text-red-600 mt-1">
                              {inscription.motivo_rechazo}
                            </div>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {inscription.fecha ? new Date(inscription.fecha).toLocaleDateString() : 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      <span className="font-mono text-xs bg-gray-100 px-2 py-1 rounded">
                        {inscription.codigo_comprobante || 'N/A'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        {editingInscription === inscription.id ? (
                          <>
                            <button
                              onClick={() => saveChanges(inscription.id)}
                              disabled={isUpdating}
                              className="text-green-600 hover:text-green-900 disabled:opacity-50 relative group"
                              title="Guardar cambios"
                            >
                              <Save className="h-4 w-4" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                Guardar cambios
                              </span>
                            </button>
                            <button
                              onClick={cancelEditing}
                              disabled={isUpdating}
                              className="text-gray-600 hover:text-gray-900 disabled:opacity-50 relative group"
                              title="Cancelar edición"
                            >
                              <X className="h-4 w-4" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                Cancelar edición
                              </span>
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => startEditing(inscription)}
                              className="text-blue-600 hover:text-blue-900 relative group"
                              title="Editar estado"
                            >
                              <Edit className="h-4 w-4" />
                              <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                Editar estado
                              </span>
                            </button>
                            
                            {inscription.estudiante?.ci && (
                              <Link
                                to={`/student-detail/${inscription.estudiante.ci}`}
                                className="text-indigo-600 hover:text-indigo-900 relative group"
                                title="Ver detalles del estudiante"
                              >
                                <Eye className="h-4 w-4" />
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap">
                                  Ver detalles del estudiante
                                </span>
                              </Link>
                            )}
                          </>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default StudentsApprovedList;
