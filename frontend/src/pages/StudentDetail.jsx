import { useState, useEffect } from 'react';
import { Check, X, FileText, ArrowLeft, Save, RotateCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../api/apiClient'; // Importar apiClient

const StudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // ID de la inscripción
  const [inscription, setInscription] = useState(null); // Cambiado de student a inscription
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [tempStatus, setTempStatus] = useState('');
  const [tempReason, setTempReason] = useState(''); // Motivo de rechazo
  const [saving, setSaving] = useState(false);

  // Datos Mock (para referencia futura)
  const mockStudents = [
    {
      id: 1,
      studentName: "MARÍA FERNANDA LÓPEZ",
      ci: "14268363",
      area: "Matemáticas",
      status: "approved",
      proofUrl: "/comprobantes/comprobante1.pdf",
      rejectionReason: "",
      paymentDate: "2023-11-20",
      paymentAmount: "200 Bs.",
      ocrConfidence: "95%",
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
      paymentAmount: "150 Bs.",
      ocrConfidence: "65%",
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
      paymentAmount: "200 Bs.",
      ocrConfidence: "92%",
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
      paymentAmount: "200 Bs.",
      ocrConfidence: "45%",
      lastUpdated: "2023-11-19T14:20:00Z"
    }
  ];

  // ==============================================
  // LLAMADA API: Obtener inscripción específica
  // ==============================================
  useEffect(() => {
    const fetchInscription = async () => {
      try {
        setLoading(true);
        
        // >>>>> LLAMADA API REAL <<<<<
        // Asume que la API carga relaciones automáticamente o mediante parámetros
        const data = await api.get(`/inscripción/${id}?_relations=estudiante,contacto,colegio,area1,area2,olimpiada`); // CAMBIADO
        
        // >>>>> CÓDIGO API ANTERIOR (COMENTADO) <<<<<
        /*
        const response = await fetch(`https://your-api-endpoint.com/students/${id}`, { ... });
        if (!response.ok) throw new Error(...);
        const data = await response.json();
        setStudent(data);
        setTempStatus(data.status);
        setTempReason(data.rejectionReason || '');
        */
        
        // >>>>> LÓGICA MOCK (COMENTADA) <<<<<
        /*
        await new Promise(resolve => setTimeout(resolve, 500));
        const foundStudent = mockStudents.find(s => s.id === Number(id));
        if (!foundStudent) {
          throw new Error("Estudiante no encontrado");
        }
        setStudent(foundStudent); // Usaba setStudent
        setTempStatus(foundStudent.status);
        setTempReason(foundStudent.rejectionReason || '');
        */

        // Actualizar estado con datos de la API
        setInscription(data);
        setTempStatus(data.estado); // Usar 'estado' de la API
        // Asumir que la API devuelve 'motivo_rechazo' si existe
        setTempReason(data.motivo_rechazo || ''); 

      } catch (error) {
        console.error("Error al obtener inscripción:", error);
        // >>>>> MANEJO DE ERRORES UI AQUÍ <<<<<
        // setError('Error al cargar datos. Redirigiendo...');
        alert(`Error al cargar datos: ${error.message}`);
        navigate('/student-applications', { replace: true }); // O a la ruta correcta
      } finally {
        setLoading(false);
      }
    };
    
    fetchInscription();
  }, [id, navigate]);

  // ==============================================
  // LLAMADA API: Actualizar estado de inscripción
  // ==============================================
  const saveChanges = async () => {
    if (!inscription) return;
    
    try {
      setSaving(true);
      
      // >>>>> LLAMADA API REAL <<<<<
      const updateData = {
        estado: tempStatus,
        // Incluir motivo solo si está rechazado y hay motivo
        motivo_rechazo: tempStatus === 'rechazado' ? tempReason.trim() : null 
      };
      const updatedInscription = await api.patch(`/inscripción/${id}`, updateData); // CAMBIADO

      // >>>>> CÓDIGO API ANTERIOR (COMENTADO) <<<<<
      /*
      const response = await fetch(`https://your-api-endpoint.com/students/${id}/status`, { ... });
      if (!response.ok) throw new Error(...);
      const updatedStudent = await response.json();
      setStudent(updatedStudent); // Usaba setStudent
      */
      
      // >>>>> LÓGICA MOCK (COMENTADA) <<<<<
      /*
      await new Promise(resolve => setTimeout(resolve, 500));
      const updatedStudent = {
        ...student, // Usaba student
        status: tempStatus,
        rejectionReason: tempStatus === 'rejected' ? tempReason : '',
        lastUpdated: new Date().toISOString()
      };
      setStudent(updatedStudent); // Usaba setStudent
      */
      
      // Actualizar estado local con la respuesta de la API
      setInscription(updatedInscription); 
      setEditing(false);
      
      // Notificación de éxito
      alert(`Estado actualizado a: ${tempStatus}`);
      
    } catch (error) {
      console.error("Error al actualizar inscripción:", error);
      // >>>>> MANEJO DE ERRORES UI AQUÍ <<<<<
      // setError('Error al actualizar. Intente nuevamente.');
      alert(`Error al actualizar: ${error.message}`);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  // Cambiar 'student' por 'inscription'
  if (!inscription) { 
    return null; // O mostrar mensaje de no encontrado
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/student-applications')} // Ajustar ruta si es necesario
          className="flex items-center text-gray-600 hover:text-gray-800"
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Volver
        </button>
        <h1 className="text-xl font-bold">Detalle de Inscripción</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        {/* Usar datos de la inscripción y sus relaciones */}
        <h2 className="text-lg font-medium mb-4">
          {inscription.estudiante?.nombres || 'N/A'} {inscription.estudiante?.apellidos || 'N/A'}
        </h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium mb-2">Información Básica</h3>
            <p><span className="text-sm text-gray-500">CI:</span> {inscription.estudiante?.ci || 'N/A'}</p>
            <p><span className="text-sm text-gray-500">Área 1:</span> {inscription.area1?.nombre || 'N/A'} ({inscription.area1?.categoria || 'N/A'})</p>
            {inscription.area2 && (
              <p><span className="text-sm text-gray-500">Área 2:</span> {inscription.area2.nombre} ({inscription.area2.categoria})</p>
            )}
            <p><span className="text-sm text-gray-500">Olimpiada:</span> {inscription.olimpiada?.nombre || 'N/A'} ({inscription.olimpiada_version})</p>
            {/* Asumiendo que la API devuelve updated_at o similar */}
            {/* <p><span className="text-sm text-gray-500">Última actualización:</span> {inscription.updated_at ? new Date(inscription.updated_at).toLocaleString() : 'N/A'}</p> */}
            <p><span className="text-sm text-gray-500">Colegio:</span> {inscription.colegio?.nombre || 'N/A'} ({inscription.colegio?.departamento || 'N/A'})</p>
            <p><span className="text-sm text-gray-500">Contacto Tutor:</span> {inscription.contacto?.nombre || 'N/A'} ({inscription.contacto?.celular || 'N/A'})</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Estado</h3>
            {!editing ? (
              <>
                {/* Comparar con los estados de la API ('pendiente', 'aprobado', 'rechazado', etc.) */}
                {inscription.estado === 'aprobado' ? ( 
                  <div className="flex items-center text-green-600">
                    <Check className="h-5 w-5 mr-1" />
                    <span>Aprobado</span> 
                  </div>
                ) : inscription.estado === 'rechazado' ? (
                  <div>
                    <div className="flex items-center text-red-600">
                      <X className="h-5 w-5 mr-1" />
                      <span>Rechazado</span>
                    </div>
                    {/* Usar motivo_rechazo de la API */}
                    {inscription.motivo_rechazo && ( 
                      <div className="mt-2 p-2 bg-red-50 rounded">
                        <p className="text-sm text-red-800">{inscription.motivo_rechazo}</p>
                      </div>
                    )}
                  </div>
                ) : ( // Otros estados como 'pendiente'
                   <div className="flex items-center text-yellow-600">
                     {/* Podrías añadir un icono para pendiente */}
                     <span>{inscription.estado || 'Pendiente'}</span> {/* Mostrar estado actual */}
                   </div>
                )}
                <button 
                  onClick={() => setEditing(true)}
                  className="mt-3 px-3 py-1 text-sm bg-gray-100 hover:bg-gray-200 rounded"
                >
                  Editar estado
                </button>
              </>
            ) : (
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Nuevo estado</label>
                  <select
                    value={tempStatus}
                    onChange={(e) => setTempStatus(e.target.value)}
                    className="border rounded p-2 w-full"
                  >
                    {/* Ajustar opciones según los estados posibles en la API */}
                    <option value="pendiente">Pendiente</option> 
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                    {/* Añadir otros estados si existen */}
                  </select>
                </div>
                
                {/* Usar tempStatus === 'rechazado' */}
                {tempStatus === 'rechazado' && ( 
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de rechazo</label>
                    <textarea
                      value={tempReason}
                      onChange={(e) => setTempReason(e.target.value)}
                      className="border rounded p-2 w-full"
                      rows="3"
                      placeholder="Especificar el motivo..."
                      // required se maneja en la validación del botón
                    />
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={saveChanges}
                    // Validar motivo si es rechazado
                    disabled={saving || (tempStatus === 'rechazado' && !tempReason.trim())} 
                    className="flex items-center px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                  >
                    {saving ? (
                      <>
                        <RotateCw className="h-4 w-4 mr-1 animate-spin" />
                        Guardando...
                      </>
                    ) : (
                      <>
                        <Save className="h-4 w-4 mr-1" />
                        Guardar
                      </>
                    )}
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setTempStatus(inscription.estado); // Usar estado actual
                      setTempReason(inscription.motivo_rechazo || ''); // Usar motivo actual
                    }}
                    className="px-3 py-1 bg-gray-200 hover:bg-gray-300 rounded"
                  >
                    Cancelar
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="border-t pt-4">
          <h3 className="font-medium mb-3">Comprobante de Pago</h3>
          
          {/* Mostrar datos del comprobante si existen en la inscripción */}
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Código Comprobante</p>
              <p>{inscription.codigo_comprobante || 'N/A'}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha Registro</p>
              {/* Usar 'fecha' de la inscripción */}
              <p>{inscription.fecha ? new Date(inscription.fecha).toLocaleDateString() : 'N/A'}</p> 
            </div>
            {/* Otros campos si la API los devuelve (Monto, Confianza OCR, etc.) */}
            {/* <div><p className="text-sm text-gray-500">Monto</p><p>{inscription.monto_pago || 'N/A'}</p></div> */}
          </div>
          
          {/* Asumir que hay una URL para el comprobante, si no, mostrar mensaje */}
          {inscription.url_comprobante ? ( // Cambiar 'url_comprobante' si la API usa otro nombre
            <button
              onClick={() => window.open(inscription.url_comprobante, '_blank')}
              className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
            >
              <FileText className="h-5 w-5 mr-2" />
              Ver comprobante
            </button>
          ) : (
            <p className="text-sm text-gray-500">No hay comprobante adjunto.</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;