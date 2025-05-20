import { useState, useEffect } from 'react';
import {
  Search, Download, Filter, ChevronDown, ChevronUp, FileText, Printer
} from 'lucide-react';
import { jsPDF } from 'jspdf';
import 'jspdf-autotable';
import LoadingSpinner from '../components/common/LoadingSpinner';

const ReportesVarios = () => {
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filters, setFilters] = useState({
    searchTerm: '',
    area: 'all',
    status: 'all',
    teacher: 'all',
    sortBy: 'ci',
    sortOrder: 'asc'
  });
  const [showFilters, setShowFilters] = useState(false);
  const [availableAreas, setAvailableAreas] = useState([]);
  const [availableTeachers, setAvailableTeachers] = useState([]);

  useEffect(() => {
    // Simular carga de datos
    const fetchData = async () => {
      try {
        // Datos de ejemplo - en producción vendrían de una API
        const mockStudents = [
          {
            id: 1,
            fullName: "Juan Pérez",
            ci: "12345678",
            email: "juan@example.com",
            area: "Matemáticas",
            category: "Primer Nivel",
            teacher: "Prof. García",
            status: "aprobado",
            registrationDate: "2025-05-01"
          },
          // ... más datos de ejemplo
        ];

        setStudents(mockStudents);
        
        const areas = [...new Set(mockStudents.map(s => s.area))];
        const teachers = [...new Set(mockStudents.map(s => s.teacher))];
        
        setAvailableAreas(areas);
        setAvailableTeachers(teachers);
        setLoading(false);
      } catch (error) {
        console.error("Error al cargar datos:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  const handleFilterChange = (e) => {
    const { name, value } = e.target;
    setFilters(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const filteredStudents = students.filter(student => {
    return (
      (filters.searchTerm === '' || 
       student.fullName.toLowerCase().includes(filters.searchTerm.toLowerCase()) || 
       student.ci.includes(filters.searchTerm)) &&
      (filters.area === 'all' || student.area === filters.area) &&
      (filters.status === 'all' || student.status === filters.status) &&
      (filters.teacher === 'all' || student.teacher === filters.teacher)
    );
  }).sort((a, b) => {
    const order = filters.sortOrder === 'asc' ? 1 : -1;
    if (a[filters.sortBy] < b[filters.sortBy]) return -1 * order;
    if (a[filters.sortBy] > b[filters.sortBy]) return 1 * order;
    return 0;
  });

  const generatePDF = () => {
    const doc = new jsPDF();
    
    doc.setFontSize(18);
    doc.text('Reporte de Estudiantes Inscritos', 14, 22);
    
    doc.setFontSize(10);
    doc.text(`Generado el: ${new Date().toLocaleDateString()}`, 14, 30);
    
    let filterText = 'Filtros: ';
    if (filters.area !== 'all') filterText += `Área: ${filters.area} `;
    if (filters.status !== 'all') filterText += `Estado: ${filters.status} `;
    if (filters.teacher !== 'all') filterText += `Docente: ${filters.teacher}`;
    
    if (filterText !== 'Filtros: ') {
      doc.text(filterText, 14, 38);
    }
    
    const headers = [
      'CI', 
      'Nombre Completo', 
      'Correo', 
      'Área', 
      'Categoría', 
      'Docente', 
      'Estado', 
      'Fecha Inscripción'
    ];
    
    const data = filteredStudents.map(student => [
      student.ci,
      student.fullName,
      student.email,
      student.area,
      student.category,
      student.teacher,
      student.status === 'aprobado' ? 'Aprobado' : 
        student.status === 'pendiente' ? 'Pendiente' : 'Rechazado',
      student.registrationDate
    ]);
    
    doc.autoTable({
      startY: 45,
      head: [headers],
      body: data,
      theme: 'grid',
      headStyles: {
        fillColor: [41, 128, 185],
        textColor: 255,
        fontStyle: 'bold'
      },
      alternateRowStyles: {
        fillColor: [245, 245, 245]
      },
      margin: { top: 40 }
    });
    
    const pageCount = doc.internal.getNumberOfPages();
    for(let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(10);
      doc.text(
        `Página ${i} de ${pageCount}`,
        190,
        doc.internal.pageSize.height - 10,
        { align: 'right' }
      );
    }
    
    doc.save(`reporte_estudiantes_${new Date().toISOString().slice(0,10)}.pdf`);
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-6">Reportes de Estudiantes</h1>
      
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
              onClick={generatePDF}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              <Download className="h-5 w-5 mr-2" />
              Exportar PDF
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4 pt-4 border-t">
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Docente</label>
              <select
                name="teacher"
                value={filters.teacher}
                onChange={handleFilterChange}
                className="w-full border rounded-md px-3 py-2"
              >
                <option value="all">Todos los docentes</option>
                {availableTeachers.map(teacher => (
                  <option key={teacher} value={teacher}>{teacher}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Ordenar por</label>
              <div className="flex space-x-2">
                <select
                  name="sortBy"
                  value={filters.sortBy}
                  onChange={handleFilterChange}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="ci">CI</option>
                  <option value="fullName">Nombre</option>
                  <option value="area">Área</option>
                  <option value="teacher">Docente</option>
                  <option value="registrationDate">Fecha Inscripción</option>
                </select>
                <select
                  name="sortOrder"
                  value={filters.sortOrder}
                  onChange={handleFilterChange}
                  className="w-full border rounded-md px-3 py-2"
                >
                  <option value="asc">Ascendente</option>
                  <option value="desc">Descendente</option>
                </select>
              </div>
            </div>
          </div>
        )}
      </div>

      <div className="mb-4 flex justify-between items-center">
        <p className="text-sm text-gray-600">
          Mostrando {filteredStudents.length} de {students.length} estudiantes
        </p>
        {(filters.area !== 'all' || filters.status !== 'all' || filters.teacher !== 'all') && (
          <button
            onClick={() => setFilters({
              searchTerm: '',
              area: 'all',
              status: 'all',
              teacher: 'all',
              sortBy: 'ci',
              sortOrder: 'asc'
            })}
            className="text-sm text-blue-600 hover:text-blue-800"
          >
            Limpiar filtros
          </button>
        )}
      </div>

      {filteredStudents.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <p className="text-gray-500">No se encontraron estudiantes con los filtros aplicados</p>
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">CI</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Área</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Categoría</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Docente</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estado</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Fecha</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredStudents.map((student) => (
                <tr key={student.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.ci}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">{student.fullName}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.area}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.teacher}</td>
                  <td className="px-6 py-4 whitespace-nowrap">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      student.status === 'aprobado' ? 'bg-green-100 text-green-800' :
                      student.status === 'pendiente' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                      {student.status === 'aprobado' ? 'Aprobado' : 
                       student.status === 'pendiente' ? 'Pendiente' : 'Rechazado'}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{student.registrationDate}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                    <button
                      onClick={() => {
                        // Implementar vista detallada
                        alert(`Mostrar detalles de ${student.fullName}`);
                      }}
                      className="text-blue-600 hover:text-blue-900 mr-3"
                    >
                      <FileText className="h-4 w-4 inline" />
                    </button>
                    <button
                      onClick={() => window.print()}
                      className="text-gray-600 hover:text-gray-900"
                    >
                      <Printer className="h-4 w-4 inline" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default ReportesVarios;