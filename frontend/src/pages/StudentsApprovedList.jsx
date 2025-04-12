import { useState, useEffect } from 'react';
import { Search, ArrowLeft, FileText, Check, X, Edit, Filter, ChevronDown, ChevronUp } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

const StudentsApprovedList = () => {
  const navigate = useNavigate();
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Filtros y búsqueda
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [areaFilter, setAreaFilter] = useState('all');
  const [sortConfig, setSortConfig] = useState({ key: 'lastUpdated', direction: 'desc' });
  const [showFilters, setShowFilters] = useState(false);

  // ==============================================
  // API CALL: Get all students
  // ==============================================
  useEffect(() => {
    const fetchStudents = async () => {
      try {
        setLoading(true);
        
        // >>>>> REPLACE WITH REAL API CALL <<<<<
        /*
        const response = await fetch('https://your-api-endpoint.com/students', {
          method: 'GET',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('authToken')}`,
            'Content-Type': 'application/json'
          }
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        setStudents(data);
        */
        
        // Mock data (development only)
        await new Promise(resolve => setTimeout(resolve, 800));
        const mockData = [
          {
            id: 1,
            studentName: "MARÍA FERNANDA LÓPEZ",
            ci: "14268363",
            area: "Matemáticas",
            status: "approved",
            proofUrl: "/comprobantes/comprobante1.pdf",
            rejectionReason: "",
            paymentDate: "2023-11-20",
            lastUpdated: "2023-11-20T10:30:00Z"
          },
          {
            id: 2,
            studentName: "JUAN CARLOS PÉREZ",
            ci: "15582477",
            area: "Robótica",
            status: "rejected",
            proofUrl: "/comprobantes/comprobante2.pdf",
            rejectionReason: "Monto incorrecto y fecha vencida",
            paymentDate: "2023-11-18",
            lastUpdated: "2023-11-20T11:15:00Z"
          },
          {
            id: 3,
            studentName: "ANA GABRIELA GUTIÉRREZ",
            ci: "12345678",
            area: "Física",
            status: "approved",
            proofUrl: "/comprobantes/comprobante3.pdf",
            rejectionReason: "",
            paymentDate: "2023-11-22",
            lastUpdated: "2023-11-22T09:45:00Z"
          },
          {
            id: 4,
            studentName: "CARLOS ALBERTO MARTÍNEZ",
            ci: "18765432",
            area: "Matemáticas",
            status: "rejected",
            proofUrl: "/comprobantes/comprobante4.pdf",
            rejectionReason: "Documento ilegible",
            paymentDate: "2023-11-15",
            lastUpdated: "2023-11-19T14:20:00Z"
          }
        ];
        
        setStudents(mockData);
      } catch (error) {
        console.error("Failed to fetch students:", error);
        // >>>>> ADD ERROR HANDLING UI HERE <<<<<
        // setError('Failed to load students. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudents();
  }, []);

  // Sorting functionality
  const requestSort = (key) => {
    let direction = 'asc';
    if (sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  const sortedStudents = [...students].sort((a, b) => {
    if (a[sortConfig.key] < b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? -1 : 1;
    }
    if (a[sortConfig.key] > b[sortConfig.key]) {
      return sortConfig.direction === 'asc' ? 1 : -1;
    }
    return 0;
  });

  // Combined filtering
  const filteredStudents = sortedStudents.filter(student => {
    const matchesSearch = 
      student.studentName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      student.ci.includes(searchTerm);
    
    const matchesStatus = 
      statusFilter === 'all' || 
      student.status === statusFilter;
    
    const matchesArea = 
      areaFilter === 'all' || 
      student.area === areaFilter;
    
    return matchesSearch && matchesStatus && matchesArea;
  });

  // Get unique areas for filter dropdown
  const uniqueAreas = [...new Set(students.map(student => student.area))];

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Gestión de Inscripciones</h1>
      </div>

      {/* Search and filter bar */}
      <div className="mb-6 bg-white p-4 rounded-lg shadow">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          {/* Search input */}
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
          
          {/* Filters toggle button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-md"
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
          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {/* Status filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Estado</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todos los estados</option>
                <option value="approved">Aprobados</option>
                <option value="rejected">Rechazados</option>
              </select>
            </div>
            
            {/* Area filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Área</label>
              <select
                value={areaFilter}
                onChange={(e) => setAreaFilter(e.target.value)}
                className="w-full border rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="all">Todas las áreas</option>
                {uniqueAreas.map(area => (
                  <option key={area} value={area}>{area}</option>
                ))}
              </select>
            </div>
            
            {/* Sorting */}
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

      {/* Results summary */}
      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Mostrando {filteredStudents.length} de {students.length} registros
        </p>
        {statusFilter !== 'all' || areaFilter !== 'all' ? (
          <button 
            onClick={() => {
              setStatusFilter('all');
              setAreaFilter('all');
            }}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Limpiar filtros
          </button>
        ) : null}
      </div>

      {/* Students list */}
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
                    <p className="text-sm text-gray-500">Fecha pago: {student.paymentDate}</p>
                  </div>
                  
                  <div className="mt-2 flex items-center space-x-2">
                    {student.status === 'approved' ? (
                      <span className="flex items-center px-2 py-1 text-xs rounded-full bg-green-100 text-green-800">
                        <Check className="h-3 w-3 mr-1" /> Aprobado
                      </span>
                    ) : (
                      <span className="flex items-center px-2 py-1 text-xs rounded-full bg-red-100 text-red-800">
                        <X className="h-3 w-3 mr-1" /> Rechazado
                      </span>
                    )}
                    <span className="text-xs text-gray-500">
                      {new Date(student.lastUpdated).toLocaleDateString()}
                    </span>
                  </div>
                  
                  {student.status === 'rejected' && student.rejectionReason && (
                    <p className="text-xs text-red-600 mt-1">
                      <span className="font-medium">Motivo:</span> {student.rejectionReason}
                    </p>
                  )}
                </div>
                
                <div className="flex space-x-2">
                  <button 
                    onClick={() => window.open(student.proofUrl, '_blank')}
                    className="flex items-center text-blue-600 hover:text-blue-800 text-sm p-2 rounded hover:bg-blue-50"
                    title="Ver comprobante"
                  >
                    <FileText className="h-4 w-4" />
                  </button>
                  <button 
                    onClick={() => navigate(`/student-applications/${student.id}`)}
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