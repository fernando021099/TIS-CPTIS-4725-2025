import { useState, useEffect } from 'react';
import { Check, X, FileText, ArrowLeft, Save, RotateCw, User, GraduationCap, MapPin, Calendar, Hash } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../api/apiClient';

const StudentDetail = () => {
  const navigate = useNavigate();
  const { ci } = useParams();

  const [inscriptions, setInscriptions] = useState([]);
  const [selectedInscription, setSelectedInscription] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [tempStatus, setTempStatus] = useState('');
  const [tempReason, setTempReason] = useState('');
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!ci) {
      setError('CI no proporcionado en la ruta.');
      setLoading(false);
      return;
    }

    const fetchInscriptions = async () => {
      try {
        setLoading(true);
        setError(null);

        // Obtener todas las inscripciones y filtrar por CI del estudiante
        const response = await api.get('/inscripción?_relations=estudiante,contacto,colegio,area1,area2,olimpiada');
        
        // Filtrar inscripciones por CI del estudiante
        const studentInscriptions = response.filter(inscription => 
          inscription.estudiante?.ci === ci
        );

        if (!studentInscriptions || studentInscriptions.length === 0) {
          setError(`No se encontraron inscripciones para el CI: ${ci}`);
          setInscriptions([]);
          return;
        }

        setInscriptions(studentInscriptions);
        // Seleccionar la primera inscripción por defecto
        setSelectedInscription(studentInscriptions[0]);
        setTempStatus(studentInscriptions[0].estado || '');
        setTempReason(studentInscriptions[0].motivo_rechazo || '');
        
      } catch (err) {
        console.error('Error al cargar inscripciones:', err);
        setError(`Error al cargar datos: ${err.message || err}`);
        setInscriptions([]);
      } finally {
        setLoading(false);
      }
    };

    fetchInscriptions();
  }, [ci]);

  const saveChanges = async () => {
    if (!selectedInscription) return;

    if (tempStatus === 'rechazado' && tempReason.trim() === '') {
      alert('Debe especificar el motivo del rechazo.');
      return;
    }

    try {
      setSaving(true);
      const updateData = {
        estado: tempStatus,
        motivo_rechazo: tempStatus === 'rechazado' ? tempReason.trim() : null,
      };
      
      await api.put(`/inscripción/${selectedInscription.id}`, updateData);
      
      // Actualizar la inscripción seleccionada
      const updatedInscription = {
        ...selectedInscription,
        ...updateData
      };
      setSelectedInscription(updatedInscription);
      
      // Actualizar también en el array de inscripciones
      setInscriptions(prev => prev.map(inscription => 
        inscription.id === selectedInscription.id 
          ? updatedInscription 
          : inscription
      ));
      
      setEditing(false);
      alert(`Estado actualizado a: ${tempStatus}`);
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert(`Error al actualizar: ${error.message || error}`);
    } finally {
      setSaving(false);
    }
  };

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
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badges[status] || 'bg-gray-100 text-gray-800'}`}>
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
      <div className="max-w-3xl mx-auto p-4 text-center text-red-600">
        <p>{error}</p>
        <button
          onClick={() => navigate('/student-applications')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Volver a la lista de postulaciones
        </button>
      </div>
    );
  }

  if (!selectedInscription) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-center text-gray-600">
        <p>No se encontró información de inscripciones.</p>
        <button
          onClick={() => navigate('/student-applications')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Volver a la lista de postulaciones
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/student-applications')}
          className="flex items-center text-gray-600 hover:text-gray-800"
          title="Volver a la lista de postulaciones"
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Volver a la lista
        </button>
        <h1 className="text-2xl font-bold text-gray-900">Detalle del Estudiante</h1>
        <div></div> {/* Spacer for centering */}
      </div>

      {/* Selector de inscripciones si hay múltiples */}
      {inscriptions.length > 1 && (
        <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 mb-2">
            Este estudiante tiene {inscriptions.length} inscripciones
          </h3>
          <div className="flex flex-wrap gap-2">
            {inscriptions.map((inscription, index) => (
              <button
                key={inscription.id}
                onClick={() => {
                  setSelectedInscription(inscription);
                  setTempStatus(inscription.estado);
                  setTempReason(inscription.motivo_rechazo || '');
                  setEditing(false);
                }}
                className={`px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  selectedInscription.id === inscription.id
                    ? 'bg-blue-600 text-white'
                    : 'bg-white text-blue-600 border border-blue-600 hover:bg-blue-50'
                }`}
              >
                Inscripción #{inscription.id} - {inscription.area1?.nombre}
                {inscription.area2 && ` + ${inscription.area2.nombre}`}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Información del Estudiante */}
        <div className="space-y-6">
          <section className="p-6 border rounded-lg shadow-sm bg-white">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-blue-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Datos del Estudiante</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre Completo</label>
                <p className="text-lg font-medium text-gray-900">
                  {selectedInscription.estudiante?.nombres} {selectedInscription.estudiante?.apellidos}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">CI</label>
                <p className="text-gray-900">{selectedInscription.estudiante?.ci}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Correo Electrónico</label>
                <p className="text-gray-900">{selectedInscription.estudiante?.correo || 'No disponible'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Fecha de Nacimiento</label>
                <p className="text-gray-900">
                  {selectedInscription.estudiante?.fecha_nacimiento 
                    ? new Date(selectedInscription.estudiante.fecha_nacimiento).toLocaleDateString()
                    : 'No disponible'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Curso</label>
                <p className="text-gray-900">{selectedInscription.estudiante?.curso || 'No disponible'}</p>
              </div>
            </div>
          </section>

          {/* Información del Contacto */}
          <section className="p-6 border rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Contacto Responsable</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre</label>
                <p className="text-gray-900">{selectedInscription.contacto?.nombre || 'No disponible'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Teléfono</label>
                <p className="text-gray-900">{selectedInscription.contacto?.celular || 'No disponible'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Correo</label>
                <p className="text-gray-900">{selectedInscription.contacto?.correo || 'No disponible'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500">Relación</label>
                <p className="text-gray-900">{selectedInscription.contacto?.relacion || 'No disponible'}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Información de la Inscripción */}
        <div className="space-y-6">
          {/* Estado de la Inscripción */}
          <section className="p-6 border rounded-lg shadow-sm bg-white">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900">Estado de la Inscripción</h2>
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-gray-500" />
                <span className="text-sm text-gray-500">ID: {selectedInscription.id}</span>
              </div>
            </div>

            {!editing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-500">Estado Actual</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedInscription.estado)}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
                    title="Editar estado"
                  >
                    <FileText className="h-4 w-4 mr-2" /> Editar
                  </button>
                </div>
                
                {selectedInscription.estado === 'rechazado' && selectedInscription.motivo_rechazo && (
                  <div>
                    <label className="text-sm font-medium text-gray-500">Motivo de Rechazo</label>
                    <p className="mt-1 text-red-600 bg-red-50 p-3 rounded-md">
                      {selectedInscription.motivo_rechazo}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Fecha de Inscripción</label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 mr-2" />
                    <p className="text-gray-900">
                      {selectedInscription.fecha 
                        ? new Date(selectedInscription.fecha).toLocaleDateString() 
                        : 'No disponible'
                      }
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500">Código de Comprobante</label>
                  <p className="mt-1 font-mono text-sm bg-gray-100 px-3 py-2 rounded-md">
                    {selectedInscription.codigo_comprobante || 'No generado'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-2">
                    Nuevo estado
                  </label>
                  <select
                    id="status"
                    className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                    value={tempStatus}
                    onChange={(e) => setTempStatus(e.target.value)}
                  >
                    <option value="pendiente">Pendiente</option>
                    <option value="aprobado">Aprobado</option>
                    <option value="rechazado">Rechazado</option>
                  </select>
                </div>

                {tempStatus === 'rechazado' && (
                  <div>
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 mb-2">
                      Motivo de rechazo
                    </label>
                    <textarea
                      id="reason"
                      rows={3}
                      className="w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500"
                      value={tempReason}
                      onChange={(e) => setTempReason(e.target.value)}
                      placeholder="Especifica el motivo del rechazo"
                    />
                  </div>
                )}

                <div className="flex space-x-3">
                  <button
                    onClick={saveChanges}
                    disabled={saving}
                    className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 transition-colors"
                  >
                    {saving ? (
                      <RotateCw className="animate-spin mr-2 h-4 w-4" />
                    ) : (
                      <Save className="mr-2 h-4 w-4" />
                    )}
                    Guardar
                  </button>
                  <button
                    onClick={() => {
                      setEditing(false);
                      setTempStatus(selectedInscription.estado);
                      setTempReason(selectedInscription.motivo_rechazo || '');
                    }}
                    className="flex items-center px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400 transition-colors"
                  >
                    <X className="mr-2 h-4 w-4" /> Cancelar
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Colegio */}
          <section className="p-6 border rounded-lg shadow-sm bg-white">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-6 w-6 text-green-600 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900">Institución Educativa</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500">Nombre del Colegio</label>
                <p className="text-gray-900 font-medium">{selectedInscription.colegio?.nombre || 'No disponible'}</p>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 mr-2" />
                <div>
                  <span className="text-gray-900">
                    {selectedInscription.colegio?.departamento}, {selectedInscription.colegio?.provincia}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Áreas de Competencia */}
          <section className="p-6 border rounded-lg shadow-sm bg-white">
            <h2 className="text-xl font-semibold text-gray-900 mb-4">Áreas de Competencia</h2>
            <div className="space-y-3">
              {selectedInscription.area1 && (
                <div className="p-3 bg-blue-50 border border-blue-200 rounded-md">
                  <label className="text-sm font-medium text-blue-700">Área Principal</label>
                  <p className="text-blue-900 font-medium">{selectedInscription.area1.nombre}</p>
                  {selectedInscription.area1.categoria && (
                    <p className="text-sm text-blue-600">Categoría: {selectedInscription.area1.categoria}</p>
                  )}
                </div>
              )}
              
              {selectedInscription.area2 && (
                <div className="p-3 bg-green-50 border border-green-200 rounded-md">
                  <label className="text-sm font-medium text-green-700">Área Secundaria</label>
                  <p className="text-green-900 font-medium">{selectedInscription.area2.nombre}</p>
                  {selectedInscription.area2.categoria && (
                    <p className="text-sm text-green-600">Categoría: {selectedInscription.area2.categoria}</p>
                  )}
                </div>
              )}
              
              {!selectedInscription.area1 && !selectedInscription.area2 && (
                <p className="text-gray-500 italic">No hay áreas asignadas</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;
