import { useState, useEffect } from 'react';
import { Search, Download, Filter, ChevronDown, ChevronUp, Eye, Printer, Calendar, User, GraduationCap, FileText } from 'lucide-react';
import { Link } from 'react-router-dom';
import { api } from '../api/apiClient';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ReportesVarios = () => {
  const [inscriptions, setInscriptions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({
    searchTerm: '',
    status: 'all',
    area: 'all',
    categoria: 'all',
    tutor: 'all',
    colegio: 'all',
    sortBy: 'fecha',
    sortOrder: 'desc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [availableCategorias, setAvailableCategorias] = useState([]);
  const [availableTutores, setAvailableTutores] = useState([]);
  const [availableColegios, setAvailableColegios] = useState([]);

  useEffect(() => {
    fetchInscriptions();
  }, []);

  const fetchInscriptions = async () => {
    try {
      setLoading(true);
      const response = await api.get('/inscripción?_relations=estudiante,contacto,colegio,area1,area2,olimpiada');
      
      setInscriptions(response || []);
      
      // Extraer datos únicos para filtros
      const areas = new Set();
      const categorias = new Set();
      const tutores = new Set();
      const colegios = new Set();
      
      response.forEach(inscription => {
        if (inscription.area1?.nombre) areas.add(inscription.area1.nombre);
        if (inscription.area2?.nombre) areas.add(inscription.area2.nombre);
        if (inscription.area1?.categoria) categorias.add(inscription.area1.categoria);
        if (inscription.area2?.categoria) categorias.add(inscription.area2.categoria);
        if (inscription.contacto?.nombres) tutores.add(`${inscription.contacto.nombres} ${inscription.contacto.apellidos}`);
        if (inscription.colegio?.nombre) colegios.add(inscription.colegio.nombre);
      });
      
      setAvailableAreas([...areas]);
      setAvailableCategorias([...categorias]);
      setAvailableTutores([...tutores]);
      setAvailableColegios([...colegios]);
      
    } catch (error) {
      console.error('Error al cargar inscripciones:', error);
      setError('Error al cargar las inscripciones');
    } finally {
      setLoading(false);
    }
  };

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({ ...prev, [name]: value }));
  };

  const filteredInscriptions = inscriptions.filter(inscription => {
    const studentName = inscription.estudiante ? 
      `${inscription.estudiante.nombres} ${inscription.estudiante.apellidos}`.toLowerCase() : '';
    const studentCI = inscription.estudiante?.ci || '';
    const tutorName = inscription.contacto ?
      `${inscription.contacto.nombres} ${inscription.contacto.apellidos}`.toLowerCase() : '';
    
    return (
      (filters.searchTerm === '' || 
       studentName.includes(filters.searchTerm.toLowerCase()) || 
       studentCI.includes(filters.searchTerm)) &&
      (filters.status === 'all' || inscription.estado === filters.status) &&
      (filters.area === 'all' || 
       inscription.area1?.nombre === filters.area || 
       inscription.area2?.nombre === filters.area) &&
      (filters.categoria === 'all' || 
       inscription.area1?.categoria === filters.categoria || 
       inscription.area2?.categoria === filters.categoria) &&
      (filters.tutor === 'all' || 
       tutorName.includes(filters.tutor.toLowerCase())) &&
      (filters.colegio === 'all' || 
       (inscription.colegio?.nombre && inscription.colegio.nombre === filters.colegio))
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
      'aprobado': 'bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-200',
      'pendiente': 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200',
      'rechazado': 'bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-200'
    };
    
    const texts = {
      'aprobado': 'Aprobado',
      'pendiente': 'Pendiente',
      'rechazado': 'Rechazado'
    };
    
    return (
      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${badges[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
        {texts[status] || status}
      </span>
    );
  };

  const handlePrintStudent = (inscription) => {
    const printWindow = window.open('', '_blank', 'width=800,height=600');
    
    const studentData = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Reporte Completo del Estudiante - ${inscription.estudiante?.nombres} ${inscription.estudiante?.apellidos}</title>
          <style>
            body { 
              font-family: Arial, sans-serif; 
              margin: 20px; 
              line-height: 1.6;
              color: #333;
            }
            .header {
              text-align: center;
              border-bottom: 2px solid #333;
              padding-bottom: 20px;
              margin-bottom: 30px;
            }
            .section {
              margin-bottom: 25px;
              border: 1px solid #ddd;
              padding: 15px;
              border-radius: 5px;
            }
            .section h3 {
              color: #2563eb;
              margin-top: 0;
              border-bottom: 1px solid #e5e7eb;
              padding-bottom: 10px;
            }
            .field {
              margin-bottom: 10px;
              display: flex;
            }
            .field-label {
              font-weight: bold;
              min-width: 150px;
              color: #4b5563;
            }
            .field-value {
              flex: 1;
            }
            .status-badge {
              padding: 4px 12px;
              border-radius: 20px;
              font-size: 12px;
              font-weight: bold;
              text-transform: uppercase;
            }
            .status-aprobado { background-color: #dcfce7; color: #166534; }
            .status-pendiente { background-color: #fef3c7; color: #92400e; }
            .status-rechazado { background-color: #fee2e2; color: #991b1b; }
            .areas-container {
              display: flex;
              gap: 15px;
              flex-wrap: wrap;
            }
            .area-card {
              border: 1px solid #d1d5db;
              padding: 10px;
              border-radius: 5px;
              background-color: #f9fafb;
              min-width: 200px;
            }
            @media print {
              body { margin: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>REPORTE VARIOS - ESTUDIANTE</h1>
            <p>Fecha de generación: ${new Date().toLocaleDateString('es-ES')} - ${new Date().toLocaleTimeString('es-ES')}</p>
          </div>

          <div class="section">
            <h3>👤 Información Personal</h3>
            <div class="field">
              <span class="field-label">CI:</span>
              <span class="field-value">${inscription.estudiante?.ci || 'N/A'}</span>
            </div>
            <div class="field">
              <span class="field-label">Nombre Completo:</span>
              <span class="field-value">${inscription.estudiante?.nombres || 'N/A'} ${inscription.estudiante?.apellidos || ''}</span>
            </div>
            <div class="field">
              <span class="field-label">Correo Electrónico:</span>
              <span class="field-value">${inscription.estudiante?.correo || 'No disponible'}</span>
            </div>
            <div class="field">
              <span class="field-label">Fecha de Nacimiento:</span>
              <span class="field-value">${inscription.estudiante?.fecha_nacimiento ? new Date(inscription.estudiante.fecha_nacimiento).toLocaleDateString('es-ES') : 'No disponible'}</span>
            </div>
            <div class="field">
              <span class="field-label">Curso:</span>
              <span class="field-value">${inscription.estudiante?.curso || 'No disponible'}</span>
            </div>
          </div>

          <div class="section">
            <h3>👨‍🏫 Información del Tutor</h3>
            <div class="field">
              <span class="field-label">Nombre del Tutor:</span>
              <span class="field-value">${inscription.contacto?.nombres || 'N/A'} ${inscription.contacto?.apellidos || ''}</span>
            </div>
            <div class="field">
              <span class="field-label">Teléfono del Tutor:</span>
              <span class="field-value">${inscription.contacto?.telefono || 'No disponible'}</span>
            </div>
            <div class="field">
              <span class="field-label">Correo del Tutor:</span>
              <span class="field-value">${inscription.contacto?.correo || 'No disponible'}</span>
            </div>
          </div>

          <div class="section">
            <h3>📚 Áreas de Competencia</h3>
            <div class="areas-container">
              ${inscription.area1 ? `
                <div class="area-card">
                  <h4 style="margin: 0 0 10px 0; color: #2563eb;">Área Principal</h4>
                  <div class="field">
                    <span class="field-label">Área:</span>
                    <span class="field-value">${inscription.area1.nombre}</span>
                  </div>
                  <div class="field">
                    <span class="field-label">Categoría:</span>
                    <span class="field-value">${inscription.area1.categoria || 'No especificada'}</span>
                  </div>
                </div>
              ` : ''}
              
              ${inscription.area2 ? `
                <div class="area-card">
                  <h4 style="margin: 0 0 10px 0; color: #16a34a;">Área Secundaria</h4>
                  <div class="field">
                    <span class="field-label">Área:</span>
                    <span class="field-value">${inscription.area2.nombre}</span>
                  </div>
                  <div class="field">
                    <span class="field-label">Categoría:</span>
                    <span class="field-value">${inscription.area2.categoria || 'No especificada'}</span>
                  </div>
                </div>
              ` : ''}
              
              ${!inscription.area1 && !inscription.area2 ? '<p style="color: #6b7280; font-style: italic;">No hay áreas asignadas</p>' : ''}
            </div>
          </div>

          <div class="section">
            <h3>🏫 Institución Educativa</h3>
            <div class="field">
              <span class="field-label">Nombre del Colegio:</span>
              <span class="field-value">${inscription.colegio?.nombre || 'No disponible'}</span>
            </div>
            <div class="field">
              <span class="field-label">Departamento:</span>
              <span class="field-value">${inscription.colegio?.departamento || 'No disponible'}</span>
            </div>
            <div class="field">
              <span class="field-label">Provincia:</span>
              <span class="field-value">${inscription.colegio?.provincia || 'No disponible'}</span>
            </div>
          </div>

          <div class="section">
            <h3>📋 Estado e Información de Inscripción</h3>
            <div class="field">
              <span class="field-label">Estado:</span>
              <span class="field-value">
                <span class="status-badge status-${inscription.estado}">${inscription.estado}</span>
              </span>
            </div>
            <div class="field">
              <span class="field-label">Fecha de Inscripción:</span>
              <span class="field-value">${inscription.fecha ? new Date(inscription.fecha).toLocaleDateString('es-ES') : 'No disponible'}</span>
            </div>
            ${inscription.motivo_rechazo ? `
              <div class="field">
                <span class="field-label">Motivo de Rechazo:</span>
                <span class="field-value" style="color: #dc2626;">${inscription.motivo_rechazo}</span>
              </div>
            ` : ''}
          </div>

          <div style="margin-top: 40px; text-align: center; font-size: 12px; color: #6b7280;">
            <p>Este reporte fue generado automáticamente por el Sistema de Gestión de Olimpiadas</p>
            <p>Reporte Varios - Documento generado el ${new Date().toLocaleString('es-ES')}</p>
          </div>

          <script>
            window.onload = function() {
              window.print();
            }
          </script>
        </body>
      </html>
    `;
    
    printWindow.document.write(studentData);
    printWindow.document.close();
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
        <p className="text-red-600 dark:text-red-400">{error}</p>
        <button 
          onClick={fetchInscriptions}
          className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800"
        >
          Reintentar
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-6">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Reportes Varios</h1>
        <p className="text-gray-600 dark:text-gray-400">Reporte detallado de estudiantes con áreas, categorías y tutores</p>
      </div>
      
      {/* Filtros y búsqueda */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-4 mb-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400 dark:text-gray-500" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o CI..."
              className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
              value={filters.searchTerm}
              onChange={(e) => handleFilterChange({ target: { name: 'searchTerm', value: e.target.value } })}
            />
          </div>

          <div className="flex space-x-2">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md dark:text-white"
            >
              <Filter className="h-5 w-5 mr-2" />
              Filtros
              {showFilters ? <ChevronUp className="h-5 w-5 ml-1" /> : <ChevronDown className="h-5 w-5 ml-1" />}
            </button>

            <button
              onClick={() => window.print()}
              className="flex items-center px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800"
            >
              <Download className="h-5 w-5 mr-2" />
              Imprimir Reporte
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Estado</label>
              <select
                name="status"
                value={filters.status}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos los estados</option>
                <option value="aprobado">Aprobados</option>
                <option value="pendiente">Pendientes</option>
                <option value="rechazado">Rechazados</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Área</label>
              <select
                name="area"
                value={filters.area}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todas las áreas</option>
                {availableAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Categoría</label>
              <select
                name="categoria"
                value={filters.categoria}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todas las categorías</option>
                {availableCategorias.map(categoria => (
                  <option key={categoria} value={categoria}>{categoria}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Tutor</label>
              <select
                name="tutor"
                value={filters.tutor}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos los tutores</option>
                {availableTutores.map(tutor => (
                  <option key={tutor} value={tutor}>{tutor}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Colegio</label>
              <select
                name="colegio"
                value={filters.colegio}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-700 dark:text-white"
              >
                <option value="all">Todos los colegios</option>
                {availableColegios.map(colegio => (
                  <option key={colegio} value={colegio}>{colegio}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Ordenar por</label>
              <select
                name="sortBy"
                value={filters.sortBy}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-700 dark:text-white"
              >
                <option value="fecha">Fecha de Inscripción</option>
                <option value="estudiante">Nombre del Estudiante</option>
                <option value="estado">Estado</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Orden</label>
              <select
                name="sortOrder"
                value={filters.sortOrder}
                onChange={handleFilterChange}
                className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 dark:bg-gray-700 dark:text-white"
              >
                <option value="desc">Descendente</option>
                <option value="asc">Ascendente</option>
              </select>
            </div>
          </div>
        )}
      </div>

      {/* Estadísticas rápidas */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <User className="h-8 w-8 text-blue-600 dark:text-blue-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Total Estudiantes</h3>
              <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">{inscriptions.length}</p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <GraduationCap className="h-8 w-8 text-green-600 dark:text-green-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Aprobados</h3>
              <p className="text-2xl font-bold text-green-600 dark:text-green-400">
                {inscriptions.filter(i => i.estado === 'aprobado').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <Calendar className="h-8 w-8 text-yellow-600 dark:text-yellow-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Pendientes</h3>
              <p className="text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {inscriptions.filter(i => i.estado === 'pendiente').length}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow border border-gray-200 dark:border-gray-700">
          <div className="flex items-center">
            <FileText className="h-8 w-8 text-red-600 dark:text-red-400 mr-3" />
            <div>
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">Rechazados</h3>
              <p className="text-2xl font-bold text-red-600 dark:text-red-400">
                {inscriptions.filter(i => i.estado === 'rechazado').length}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Contador de resultados */}
      <div className="mb-4 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Mostrando {filteredInscriptions.length} de {inscriptions.length} registros
        </p>
        {(filters.status !== 'all' || filters.area !== 'all' || filters.categoria !== 'all' || filters.searchTerm !== '' || filters.tutor !== 'all' || filters.colegio !== 'all') && (
          <button
            onClick={() => setFilters({
              searchTerm: '',
              status: 'all',
              area: 'all',
              categoria: 'all',
              tutor: 'all',
              colegio: 'all',
              sortBy: 'fecha',
              sortOrder: 'desc'
            })}
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {/* Tabla de reportes */}
      {filteredInscriptions.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow p-8 text-center border border-gray-200 dark:border-gray-700">
          <p className="text-gray-500 dark:text-gray-400">No se encontraron registros con los filtros aplicados</p>
        </div>
      ) : (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden border border-gray-200 dark:border-gray-700">
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
              <thead className="bg-gray-50 dark:bg-gray-700">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">CI</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Nombre</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Áreas</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Categoría</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Tutor</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Colegio</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Estado</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Fecha</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">Acciones</th>
                </tr>
              </thead>
              <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                {filteredInscriptions.map((inscription) => (
                  <tr key={inscription.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900 dark:text-white font-mono">
                      {inscription.estudiante?.ci || 'N/A'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900 dark:text-white">
                        {inscription.estudiante ? 
                          `${inscription.estudiante.nombres} ${inscription.estudiante.apellidos}` : 
                          'N/A'
                        }
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {inscription.estudiante?.correo || 'Sin correo'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        {inscription.area1 && (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-400">
                              {inscription.area1.nombre}
                            </span>
                          </div>
                        )}
                        {inscription.area2 && (
                          <div className="flex items-center">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-400">
                              {inscription.area2.nombre}
                            </span>
                          </div>
                        )}
                        {!inscription.area1 && !inscription.area2 && (
                          <span className="text-gray-400 italic">Sin áreas</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="space-y-1">
                        {inscription.area1?.categoria && (
                          <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">
                            {inscription.area1.categoria}
                          </div>
                        )}
                        {inscription.area2?.categoria && (
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            {inscription.area2.categoria}
                          </div>
                        )}
                        {(!inscription.area1?.categoria && !inscription.area2?.categoria) && (
                          <span className="text-gray-400 italic">Sin categoría</span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {inscription.contacto ? 
                        <div>
                          <div className="text-sm font-medium text-gray-900 dark:text-white">
                            {inscription.contacto.nombres} {inscription.contacto.apellidos}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {inscription.contacto.telefono || 'Sin teléfono'}
                          </div>
                        </div> :
                        <span className="text-gray-400 italic">Sin tutor</span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {inscription.colegio?.nombre || 
                        <span className="text-gray-400 italic">Sin colegio</span>
                      }
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      {getStatusBadge(inscription.estado)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      <div className="flex items-center">
                        <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-1" />
                        {inscription.fecha ? new Date(inscription.fecha).toLocaleDateString('es-ES', {
                          year: 'numeric',
                          month: '2-digit',
                          day: '2-digit'
                        }) : 'N/A'}
                      </div>
                      <div className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                        {inscription.fecha ? new Date(inscription.fecha).toLocaleTimeString('es-ES', {
                          hour: '2-digit',
                          minute: '2-digit'
                        }) : ''}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-3">
                        {inscription.estudiante?.ci && (
                          <Link
                            to={`/student-detail/${inscription.estudiante.ci}`}
                            className="text-indigo-600 dark:text-indigo-400 hover:text-indigo-900 dark:hover:text-indigo-300 relative group"
                            title="Ver detalles del estudiante"
                          >
                            <Eye className="h-4 w-4" />
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                              Ver detalles del estudiante
                            </span>
                          </Link>
                        )}

                        <button
                          onClick={() => handlePrintStudent(inscription)}
                          className="text-green-600 dark:text-green-400 hover:text-green-900 dark:hover:text-green-300 relative group"
                          title="Imprimir datos completos"
                        >
                          <Printer className="h-4 w-4" />
                          <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 px-2 py-1 text-xs text-white bg-gray-800 dark:bg-gray-700 rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 whitespace-nowrap z-10">
                            Imprimir datos completos
                          </span>
                        </button>
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

export default ReportesVarios;