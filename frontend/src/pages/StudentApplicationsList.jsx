import { useState, useEffect } from "react";
import { Check, X, Search, ChevronDown, ChevronUp, Mail, Phone } from "lucide-react";

const StudentApplicationsList = () => {
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [statusFilter, setStatusFilter] = useState("all");

  // API PRINCIPAL: Obtener lista de postulaciones
  // Endpoint: GET /api/applications
  // Descripción: Obtiene todas las postulaciones con sus datos completos
  // Parámetros opcionales: status (para filtrar), search (para búsqueda)
  useEffect(() => {
    const fetchApplications = async () => {
      try {
        // En producción, reemplazar con llamada a API real:
        /*
        const response = await fetch('/api/applications');
        if (!response.ok) throw new Error('Error al cargar postulaciones');
        const data = await response.json();
        setApplications(data);
        */
        
        // Simulación de carga (manteniendo tus datos estáticos)
        await new Promise(resolve => setTimeout(resolve, 1000));
        
        // Datos de ejemplo mejorados (se mantienen estáticos como en tu código)
        const mockData = [
          {
            id: 1,
            studentName: "FRESIA GRETY TICONA PLATA",
            ci: "14268363",
            area: "Química",
            category: "6S",
            school: "UNIDAD EDUCATIVA NUEVA ESPERANZA",
            status: "approved",
            registrationDate: "2023-05-15",
            contactEmail: "fresia.ticona@example.com",
            contactPhone: "78945612",
            notes: ""
          },
          {
            id: 2,
            studentName: "DAYRA DAMIAN GRAGEDA",
            ci: "15582477",
            area: "Robótica",
            category: "Lego P",
            school: "Santo Domingo Savio A",
            status: "pending",
            registrationDate: "2023-05-18",
            contactEmail: "dayra.grageda@example.com",
            contactPhone: "65412378",
            notes: "Verificar documento de identidad"
          },
          {
            id: 3,
            studentName: "CARLOS MAMANI QUISPE",
            ci: "12345678",
            area: "Matemáticas",
            category: "Tercer Nivel",
            school: "Colegio San Andrés",
            status: "rejected",
            registrationDate: "2023-05-20",
            contactEmail: "carlos.mamani@example.com",
            contactPhone: "71234567",
            notes: "No cumple con los requisitos de edad"
          }
        ];
        
        setApplications(mockData);
      } catch (error) {
        console.error("Error al cargar aplicaciones:", error);
        // Mostrar error al usuario si es necesario
      } finally {
        setLoading(false);
      }
    };
    
    fetchApplications();
  }, []);

  // API SUGERIDA: Búsqueda en backend (opcional)
  // Endpoint: GET /api/applications?search=<term>
  // Descripción: Podría implementarse para búsquedas más eficientes en grandes conjuntos de datos
  const filteredApplications = applications.filter(app => {
    const matchesSearch = 
      app.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.ci.includes(searchTerm) ||
      app.area.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      app.status === statusFilter;
      // Se eliminó la condición de filtro por pago
    
    return matchesSearch && matchesStatus;
  });

  const toggleExpand = (id) => {
    setExpandedId(expandedId === id ? null : id);
  };

  // API SUGERIDA: Actualizar estado de postulación
  // Endpoint: PATCH /api/applications/:id/status
  // Body: { status: "approved" | "rejected" | "pending" }
  // Descripción: Actualiza el estado de una postulación específica
  const updateStatus = async (id, newStatus) => {
    try {
      // Simulación de actualización
      /*
      const response = await fetch(`/api/applications/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus })
      });
      if (!response.ok) throw new Error('Error al actualizar estado');
      */
      
      setApplications(applications.map(app => 
        app.id === id ? { ...app, status: newStatus } : app
      ));
    } catch (error) {
      console.error("Error al actualizar estado:", error);
      // Mostrar error al usuario
    }
  };

  // API SUGERIDA: Actualizar notas
  // Endpoint: PATCH /api/applications/:id/notes
  // Body: { notes: "texto de notas" }
  // Descripción: Actualiza las notas internas de una postulación
  const updateNotes = async (id, notes) => {
    try {
      // Simulación de actualización
      /*
      const response = await fetch(`/api/applications/${id}/notes`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ notes })
      });
      if (!response.ok) throw new Error('Error al actualizar notas');
      */
      
      setApplications(applications.map(app => 
        app.id === id ? { ...app, notes } : app
      ));
    } catch (error) {
      console.error("Error al actualizar notas:", error);
      // Mostrar error al usuario
    }
  };

  // Funciones de ayuda para UI (se mantienen igual)
  const getStatusColor = (status) => {
    switch(status) {
      case 'approved':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200';
      case 'pending':
      default:
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
    }
  };

  const getStatusText = (status) => {
    switch(status) {
      case 'approved':
        return 'Aprobado';
      case 'rejected':
        return 'Rechazado';
      case 'pending':
      default:
        return 'Pendiente';
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
        Lista de Postulaciones
      </h1>
      
      {/* Filtros y búsqueda */}
      <div className="mb-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Barra de búsqueda */}
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-gray-400" />
          </div>
          <input
            type="text"
            placeholder="Buscar por nombre, CI o área..."
            className="pl-10 pr-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md w-full focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        {/* Filtro por estado */}
        <div className="flex items-center space-x-4">
          <label className="text-sm font-medium text-gray-700 dark:text-gray-300">
            Filtrar por:
          </label>
          <select
            className="border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 focus:ring-blue-500 focus:border-blue-500"
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
          >
            <option value="all">Todos</option>
            <option value="approved">Aprobados</option>
            <option value="pending">Pendientes</option>
            <option value="rejected">Rechazados</option>
            {/* Se eliminó la opción de filtro por pago */}
          </select>
        </div>
      </div>
      
      {/* Tabla de aplicaciones */}
      {loading ? (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      ) : (
        <div className="overflow-x-auto shadow ring-1 ring-black ring-opacity-5 rounded-lg">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-800">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estudiante
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Área/Categoría
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Estado
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                  Acciones
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {filteredApplications.length > 0 ? (
                filteredApplications.map((app) => (
                  <>
                    <tr key={app.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-medium text-gray-900 dark:text-white">
                          {app.studentName}
                        </div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">
                          CI: {app.ci}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900 dark:text-white">{app.area}</div>
                        <div className="text-sm text-gray-500 dark:text-gray-300">{app.category}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(app.status)}`}>
                          {getStatusText(app.status)}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => toggleExpand(app.id)}
                          className="text-blue-600 hover:text-blue-900 dark:text-blue-400 dark:hover:text-blue-300 mr-4"
                        >
                          {expandedId === app.id ? (
                            <ChevronUp className="h-5 w-5" />
                          ) : (
                            <ChevronDown className="h-5 w-5" />
                          )}
                        </button>
                      </td>
                    </tr>
                    
                    {/* Detalles expandidos */}
                    {expandedId === app.id && (
                      <tr className="bg-gray-50 dark:bg-gray-700">
                        <td colSpan="4" className="px-6 py-4">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {/* Información del estudiante */}
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Información del Estudiante
                              </h3>
                              <div className="space-y-2">
                                <p className="text-sm">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Colegio:</span> {app.school}
                                </p>
                                <p className="text-sm">
                                  <span className="font-medium text-gray-700 dark:text-gray-300">Fecha de registro:</span> {app.registrationDate}
                                </p>
                                <div className="flex items-center text-sm">
                                  <Mail className="h-4 w-4 mr-1 text-gray-500" />
                                  <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">Email:</span>
                                  <a href={`mailto:${app.contactEmail}`} className="text-blue-600 hover:underline">
                                    {app.contactEmail}
                                  </a>
                                </div>
                                <div className="flex items-center text-sm">
                                  <Phone className="h-4 w-4 mr-1 text-gray-500" />
                                  <span className="font-medium text-gray-700 dark:text-gray-300 mr-1">Teléfono:</span>
                                  <a href={`tel:${app.contactPhone}`} className="text-blue-600 hover:underline">
                                    {app.contactPhone}
                                  </a>
                                </div>
                              </div>
                            </div>
                            
                            {/* Gestión de postulación */}
                            <div>
                              <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                                Gestión de Postulación
                              </h3>
                              <div className="flex flex-wrap gap-2 mb-4">
                                <button
                                  onClick={() => updateStatus(app.id, 'approved')}
                                  className={`px-3 py-1 text-sm rounded ${
                                    app.status === 'approved' 
                                      ? 'bg-green-600 text-white'
                                      : 'bg-green-100 text-green-800 hover:bg-green-200'
                                  }`}
                                >
                                  Aprobar
                                </button>
                                <button
                                  onClick={() => updateStatus(app.id, 'rejected')}
                                  className={`px-3 py-1 text-sm rounded ${
                                    app.status === 'rejected' 
                                      ? 'bg-red-600 text-white'
                                      : 'bg-red-100 text-red-800 hover:bg-red-200'
                                  }`}
                                >
                                  Rechazar
                                </button>
                                <button
                                  onClick={() => updateStatus(app.id, 'pending')}
                                  className={`px-3 py-1 text-sm rounded ${
                                    app.status === 'pending' 
                                      ? 'bg-yellow-600 text-white'
                                      : 'bg-yellow-100 text-yellow-800 hover:bg-yellow-200'
                                  }`}
                                >
                                  Pendiente
                                </button>
                              </div>
                              
                              <div className="mt-4">
                                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                                  Notas:
                                </label>
                                <textarea
                                  value={app.notes || ''}
                                  onChange={(e) => updateNotes(app.id, e.target.value)}
                                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                                  rows="3"
                                  placeholder="Agregar notas sobre esta postulación..."
                                />
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
                ))
              ) : (
                <tr>
                  <td colSpan="4" className="px-6 py-4 text-center text-sm text-gray-500 dark:text-gray-300">
                    No se encontraron postulaciones
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default StudentApplicationsList;