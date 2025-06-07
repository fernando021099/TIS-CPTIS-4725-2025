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

        const response = await api.get('/inscripción?_relations=estudiante,contacto,colegio,area1,area2,olimpiada');
        
        const studentInscriptions = response.filter(inscription => 
          inscription.estudiante?.ci === ci
        );

        if (!studentInscriptions || studentInscriptions.length === 0) {
          setError(`No se encontraron inscripciones para el CI: ${ci}`);
          setInscriptions([]);
          return;
        }

        setInscriptions(studentInscriptions);
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
      
      const updatedInscription = {
        ...selectedInscription,
        ...updateData
      };
      setSelectedInscription(updatedInscription);
      
      setInscriptions(prev => prev.map(inscription => 
        inscription.id === selectedInscription.id 
          ? updatedInscription 
          : inscription
      ));
      
      setEditing(false);
    } catch (error) {
      console.error('Error al actualizar:', error);
      alert(`Error al actualizar: ${error.message || error}`);
    } finally {
      setSaving(false);
    }
  };

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
      <span className={`px-3 py-1 text-sm font-semibold rounded-full ${badges[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'}`}>
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
      <div className="max-w-3xl mx-auto p-4 text-center text-red-600 dark:text-red-400">
        <p>{error}</p>
        <button
          onClick={() => navigate('/student-applications')}
          className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800"
        >
          Volver a la lista de postulaciones
        </button>
      </div>
    );
  }

  if (!selectedInscription) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-center text-gray-600 dark:text-gray-400">
        <p>No se encontró información de inscripciones.</p>
        <button
          onClick={() => navigate('/student-applications')}
          className="mt-4 px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded hover:bg-blue-700 dark:hover:bg-blue-800"
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
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-800 dark:hover:text-white"
          title="Volver a la lista de postulaciones"
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Volver a la lista
        </button>
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Detalle del Estudiante</h1>
        <div></div>
      </div>

      {/* Selector de inscripciones si hay múltiples */}
      {inscriptions.length > 1 && (
        <div className="mb-6 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
          <h3 className="text-lg font-medium text-blue-900 dark:text-blue-200 mb-2">
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
                    ? 'bg-blue-600 dark:bg-blue-700 text-white'
                    : 'bg-white dark:bg-gray-700 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/10'
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
          <section className="p-6 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <User className="h-6 w-6 text-blue-600 dark:text-blue-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Datos del Estudiante</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre Completo</label>
                <p className="text-lg font-medium text-gray-900 dark:text-white">
                  {selectedInscription.estudiante?.nombres} {selectedInscription.estudiante?.apellidos}
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">CI</label>
                <p className="text-gray-900 dark:text-white">{selectedInscription.estudiante?.ci}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Correo Electrónico</label>
                <p className="text-gray-900 dark:text-white">{selectedInscription.estudiante?.correo || 'No disponible'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Nacimiento</label>
                <p className="text-gray-900 dark:text-white">
                  {selectedInscription.estudiante?.fecha_nacimiento 
                    ? new Date(selectedInscription.estudiante.fecha_nacimiento).toLocaleDateString()
                    : 'No disponible'
                  }
                </p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Curso</label>
                <p className="text-gray-900 dark:text-white">{selectedInscription.estudiante?.curso || 'No disponible'}</p>
              </div>
            </div>
          </section>

          {/* Información del Contacto */}
          <section className="p-6 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contacto Responsable</h2>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre</label>
                <p className="text-gray-900 dark:text-white">{selectedInscription.contacto?.nombre || 'No disponible'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Teléfono</label>
                <p className="text-gray-900 dark:text-white">{selectedInscription.contacto?.celular || 'No disponible'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Correo</label>
                <p className="text-gray-900 dark:text-white">{selectedInscription.contacto?.correo || 'No disponible'}</p>
              </div>
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Relación</label>
                <p className="text-gray-900 dark:text-white">{selectedInscription.contacto?.relacion || 'No disponible'}</p>
              </div>
            </div>
          </section>
        </div>

        {/* Información de la Inscripción */}
        <div className="space-y-6">
          {/* Estado de la Inscripción */}
          <section className="p-6 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Estado de la Inscripción</h2>
              <div className="flex items-center space-x-2">
                <Hash className="h-4 w-4 text-gray-500 dark:text-gray-400" />
                <span className="text-sm text-gray-500 dark:text-gray-400">ID: {selectedInscription.id}</span>
              </div>
            </div>

            {!editing ? (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Estado Actual</label>
                    <div className="mt-1">
                      {getStatusBadge(selectedInscription.estado)}
                    </div>
                  </div>
                  <button
                    onClick={() => setEditing(true)}
                    className="flex items-center px-3 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800 transition-colors"
                    title="Editar estado"
                  >
                    <FileText className="h-4 w-4 mr-2" /> Editar
                  </button>
                </div>
                
                {selectedInscription.estado === 'rechazado' && selectedInscription.motivo_rechazo && (
                  <div>
                    <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Motivo de Rechazo</label>
                    <p className="mt-1 text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 p-3 rounded-md">
                      {selectedInscription.motivo_rechazo}
                    </p>
                  </div>
                )}
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Fecha de Inscripción</label>
                  <div className="flex items-center mt-1">
                    <Calendar className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                    <p className="text-gray-900 dark:text-white">
                      {selectedInscription.fecha 
                        ? new Date(selectedInscription.fecha).toLocaleDateString() 
                        : 'No disponible'
                      }
                    </p>
                  </div>
                </div>
                
                <div>
                  <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Código de Comprobante</label>
                  <p className="mt-1 font-mono text-sm bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-md">
                    {selectedInscription.codigo_comprobante || 'No generado'}
                  </p>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Nuevo estado
                  </label>
                  <select
                    id="status"
                    className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                    <label htmlFor="reason" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Motivo de rechazo
                    </label>
                    <textarea
                      id="reason"
                      rows={3}
                      className="w-full border border-gray-300 dark:border-gray-600 rounded-md px-3 py-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
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
                    className="flex items-center px-4 py-2 bg-green-600 dark:bg-green-700 text-white rounded-md hover:bg-green-700 dark:hover:bg-green-800 disabled:opacity-50 transition-colors"
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
                    className="flex items-center px-4 py-2 bg-gray-300 dark:bg-gray-600 text-gray-700 dark:text-gray-200 rounded-md hover:bg-gray-400 dark:hover:bg-gray-500 transition-colors"
                  >
                    <X className="mr-2 h-4 w-4" /> Cancelar
                  </button>
                </div>
              </div>
            )}
          </section>

          {/* Colegio */}
          <section className="p-6 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
            <div className="flex items-center mb-4">
              <GraduationCap className="h-6 w-6 text-green-600 dark:text-green-400 mr-2" />
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Institución Educativa</h2>
            </div>
            <div className="space-y-3">
              <div>
                <label className="text-sm font-medium text-gray-500 dark:text-gray-400">Nombre del Colegio</label>
                <p className="text-gray-900 dark:text-white font-medium">{selectedInscription.colegio?.nombre || 'No disponible'}</p>
              </div>
              <div className="flex items-center">
                <MapPin className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2" />
                <div>
                  <span className="text-gray-900 dark:text-white">
                    {selectedInscription.colegio?.departamento}, {selectedInscription.colegio?.provincia}
                  </span>
                </div>
              </div>
            </div>
          </section>

          {/* Áreas de Competencia */}
          <section className="p-6 border rounded-lg shadow-sm bg-white dark:bg-gray-800 dark:border-gray-700">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Áreas de Competencia</h2>
            <div className="space-y-3">
              {selectedInscription.area1 && (
                <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-md">
                  <label className="text-sm font-medium text-blue-700 dark:text-blue-300">Área Principal</label>
                  <p className="text-blue-900 dark:text-blue-200 font-medium">{selectedInscription.area1.nombre}</p>
                  {selectedInscription.area1.categoria && (
                    <p className="text-sm text-blue-600 dark:text-blue-400">Categoría: {selectedInscription.area1.categoria}</p>
                  )}
                </div>
              )}
              
              {selectedInscription.area2 && (
                <div className="p-3 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-700 rounded-md">
                  <label className="text-sm font-medium text-green-700 dark:text-green-300">Área Secundaria</label>
                  <p className="text-green-900 dark:text-green-200 font-medium">{selectedInscription.area2.nombre}</p>
                  {selectedInscription.area2.categoria && (
                    <p className="text-sm text-green-600 dark:text-green-400">Categoría: {selectedInscription.area2.categoria}</p>
                  )}
                </div>
              )}
              
              {!selectedInscription.area1 && !selectedInscription.area2 && (
                <p className="text-gray-500 dark:text-gray-400 italic">No hay áreas asignadas</p>
              )}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default StudentDetail;