import { useState, useEffect } from 'react';
import {
  Search, ArrowLeft, FileText, Check, X, Edit, Filter, ChevronDown, ChevronUp
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../api/apiClient';

const StudentsApprovedList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);

  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'lastUpdated', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    setStudents([
      {
        id: 1,
        studentName: "Juan Pérez",
        ci: "12345678",
        area: "Ciencias",
        status: "aprobado",
        lastUpdated: new Date().toISOString(),
        paymentDate: "2025-05-01",
        proofUrl: "#",
        rejectionReason: ""
      }
    ]);
    setLoading(false);
  }, []);

  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
    if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
    return 0;
  });

  const filteredStudents = sortedStudents.filter(student => {
    const matchesSearch = (student.studentName?.toLowerCase().includes(searchTerm.toLowerCase()) || student.ci?.includes(searchTerm));
    const matchesStatus = statusFilter === 'all' || student.status === statusFilter;
    const matchesArea = areaFilter === 'all' || student.area === areaFilter;
    return matchesSearch && matchesStatus && matchesArea;
  });

  const uniqueAreas = [...new Set(students.map(student => student.area).filter(area => area !== 'N/A'))];

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Inscripciones</h1>
      </div>

      {/* Search + Filters */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Buscar por nombre o CI..."
              className="pl-10 pr-4 py-2 border border-gray-300 rounded-md w-full focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
          >
            <Filter className="h-5 w-5 mr-2" />
            Filtros
            {showFilters ? <ChevronUp className="h-5 w-5 ml-1" /> : <ChevronDown className="h-5 w-5 ml-1" />}
          </button>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="all">Todos los estados</option>
                <option value="aprobado">Aprobados</option>
                <option value="rechazado">Rechazados</option>
                <option value="pendiente">Pendientes</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="all">Todas las áreas</option>
                {uniqueAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <div className="flex space-x-2">
                <button
                  onClick={() => requestSort('studentName')}
                  className={`px-3 py-1 text-sm rounded-md ${sortConfig.key === 'studentName' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
                >
                  Nombre
                  {sortConfig.key === 'studentName' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                  )}
                </button>
                <button
                  onClick={() => requestSort('lastUpdated')}
                  className={`px-3 py-1 text-sm rounded-md ${sortConfig.key === 'lastUpdated' ? 'bg-blue-100 text-blue-800' : 'bg-gray-100'}`}
                >
                  Fecha
                  {sortConfig.key === 'lastUpdated' && (
                    sortConfig.direction === 'asc' ? <ChevronUp className="h-4 w-4 inline ml-1" /> : <ChevronDown className="h-4 w-4 inline ml-1" />
                  )}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Resultados */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Mostrando {filteredStudents.length} de {students.length} registros
        </p>
        {(statusFilter !== 'all' || areaFilter !== 'all') && (
          <button
            onClick={() => {
              setStatusFilter('all');
              setAreaFilter('all');
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No se encontraron resultados</p>
          <button
            onClick={() => {
              setSearchTerm('');
              setStatusFilter('all');
              setAreaFilter('all');
            }}
            className="mt-2 text-sm text-blue-600 hover:text-blue-800"
          >
            Limpiar búsqueda
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredStudents.map(student => (
            <div key={student.id} className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-white">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-medium">{student.studentName}</h3>
                  <div className="flex flex-wrap gap-x-4 gap-y-1 mt-1">
                    <p className="text-sm text-gray-500">CI: {student.ci}</p>
                    <p className="text-sm text-gray-500">Área: {student.area}</p>
                    <p className="text-sm text-gray-500">Fecha Inscripción: {student.paymentDate}</p>
                  </div>
                  <div className="mt-2 flex items-center space-x-2">
                    {student.status === 'aprobado' ? (
                      <span className="flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" /> Aprobado
                      </span>
                    ) : student.status === 'rechazado' ? (
                      <span className="flex items-center px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        <X className="h-3 w-3 mr-1" /> Rechazado
                      </span>
                    ) : (
                      <span className="flex items-center px-2 py-1 text-xs rounded-full bg-yellow-100 text-yellow-800">
                        {student.status || 'Pendiente'}
                      </span>
                    )}
                    <span className="text-xs text-gray-500">{new Date(student.lastUpdated).toLocaleDateString()}</span>
                  </div>
                  {student.status === 'rechazado' && student.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1">
                      <span className="font-medium">Motivo:</span> {student.rejectionReason}
                    </p>
                  )}
                </div>
                <div className="flex space-x-2">
                  <button
                    onClick={() => student.proofUrl && student.proofUrl !== '#' && window.open(student.proofUrl, '_blank')}
                    disabled={!student.proofUrl || student.proofUrl === '#'}
                    className={`flex items-center text-sm p-2 rounded ${
                      student.proofUrl && student.proofUrl !== '#'
                        ? 'text-blue-600 hover:text-blue-800 hover:bg-blue-50'
                        : 'text-gray-400 cursor-not-allowed'
                    }`}
                    title={student.proofUrl && student.proofUrl !== '#' ? "Ver comprobante" : "Sin comprobante"}
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => navigate(`/student-detail/${student.ci}`)}
                    className="flex items-center text-gray-600 hover:text-gray-800 text-sm p-2 rounded hover:bg-gray-100"
                    title="Editar estado"
                  >
                    <Edit className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default StudentsApprovedList;
