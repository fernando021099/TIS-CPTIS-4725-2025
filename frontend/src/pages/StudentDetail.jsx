import { useState, useEffect } from 'react';
import { Check, X, FileText, ArrowLeft, Save, RotateCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';

const StudentDetail = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [tempStatus, setTempStatus] = useState('');
  const [tempReason, setTempReason] = useState('');
  const [saving, setSaving] = useState(false);

  // API: Obtener detalles del estudiante
  useEffect(() => {
    const fetchStudent = async () => {
      try {
        setLoading(true);
        
        // SIMULACIÓN - Reemplazar por API real
        await new Promise(resolve => setTimeout(resolve, 500));
        
        /* API REAL:
        const response = await fetch(`/api/students/${id}`);
        if (!response.ok) throw new Error('Error al cargar estudiante');
        const data = await response.json();
        setStudent(data);
        */
        
        // Datos mock
        const allStudents = [
          {
            id: 1,
            studentName: "MARÍA FERNANDA LÓPEZ",
            ci: "14268363",
            area: "Matemáticas",
            status: "approved",
            proofUrl: "/comprobantes/comprobante1.pdf",
            rejectionReason: "",
            paymentDate: "2023-05-20",
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
            rejectionReason: "Monto incorrecto (150 Bs. en lugar de 200 Bs.) y fecha vencida",
            paymentDate: "2023-05-22",
            paymentAmount: "150 Bs.",
            ocrConfidence: "65%",
            lastUpdated: "2023-11-20T11:15:00Z"
          }
        ];

        const foundStudent = allStudents.find(s => s.id === Number(id));
        if (!foundStudent) throw new Error("Estudiante no encontrado");
        
        setStudent(foundStudent);
        setTempStatus(foundStudent.status);
        setTempReason(foundStudent.rejectionReason || '');
      } catch (error) {
        console.error("Error:", error);
        navigate('/student-applications', { replace: true });
      } finally {
        setLoading(false);
      }
    };
    
    fetchStudent();
  }, [id, navigate]);

  // API: Guardar cambios
  const saveChanges = async () => {
    try {
      setSaving(true);
      
      // SIMULACIÓN - Reemplazar por API real
      await new Promise(resolve => setTimeout(resolve, 500));
      
      /* API REAL:
      const response = await fetch(`/api/students/${id}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          status: tempStatus,
          rejectionReason: tempStatus === 'rejected' ? tempReason : '' 
        })
      });
      
      if (!response.ok) throw new Error('Error al guardar');
      const updatedStudent = await response.json();
      */
      
      // Actualización local (simulación)
      const updatedStudent = {
        ...student,
        status: tempStatus,
        rejectionReason: tempStatus === 'rejected' ? tempReason : '',
        lastUpdated: new Date().toISOString()
      };
      
      setStudent(updatedStudent);
      setEditing(false);
      
      // Mostrar notificación de éxito
      alert(`Estado actualizado a: ${tempStatus === 'approved' ? 'Aprobado' : 'Rechazado'}`);
      
    } catch (error) {
      console.error("Error al guardar:", error);
      alert("Error al guardar los cambios");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><LoadingSpinner size="lg" /></div>;
  }

  if (!student) return null;

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button onClick={() => navigate(-1)} className="flex items-center text-gray-600 hover:text-gray-800">
          <ArrowLeft className="h-5 w-5 mr-1" /> Volver
        </button>
        <h1 className="text-xl font-bold">Detalle de Inscripción</h1>
      </div>

      <div className="bg-white rounded-lg shadow p-6">
        <h2 className="text-lg font-medium mb-4">{student.studentName}</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <h3 className="font-medium mb-2">Información Básica</h3>
            <p><span className="text-sm text-gray-500">CI:</span> {student.ci}</p>
            <p><span className="text-sm text-gray-500">Área:</span> {student.area}</p>
            <p><span className="text-sm text-gray-500">Última actualización:</span> {new Date(student.lastUpdated).toLocaleString()}</p>
          </div>
          
          <div>
            <h3 className="font-medium mb-2">Estado</h3>
            {!editing ? (
              <>
                {student.status === 'approved' ? (
                  <div className="flex items-center text-green-600">
                    <Check className="h-5 w-5 mr-1" />
                    <span>Aprobado - Pago verificado</span>
                  </div>
                ) : (
                  <div>
                    <div className="flex items-center text-red-600">
                      <X className="h-5 w-5 mr-1" />
                      <span>Rechazado</span>
                    </div>
                    {student.rejectionReason && (
                      <div className="mt-2 p-2 bg-red-50 rounded">
                        <p className="text-sm text-red-800">{student.rejectionReason}</p>
                      </div>
                    )}
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
                    <option value="approved">Aprobado</option>
                    <option value="rejected">Rechazado</option>
                  </select>
                </div>
                
                {tempStatus === 'rejected' && (
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Motivo de rechazo</label>
                    <textarea
                      value={tempReason}
                      onChange={(e) => setTempReason(e.target.value)}
                      className="border rounded p-2 w-full"
                      rows="3"
                      placeholder="Especificar el motivo..."
                    />
                  </div>
                )}
                
                <div className="flex space-x-2">
                  <button
                    onClick={saveChanges}
                    disabled={saving}
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
                      setTempStatus(student.status);
                      setTempReason(student.rejectionReason || '');
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
          
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-sm text-gray-500">Monto</p>
              <p>{student.paymentAmount}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Fecha</p>
              <p>{student.paymentDate}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Confianza OCR</p>
              <p>{student.ocrConfidence}</p>
            </div>
          </div>
          
          <button
            onClick={() => window.open(student.proofUrl, '_blank')}
            className="flex items-center px-4 py-2 bg-blue-50 text-blue-600 rounded hover:bg-blue-100"
          >
            <FileText className="h-5 w-5 mr-2" />
            Ver comprobante completo (PDF)
          </button>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;