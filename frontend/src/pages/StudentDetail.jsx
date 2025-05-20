import { useState, useEffect } from 'react';
import { Check, X, FileText, ArrowLeft, Save, RotateCw } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import LoadingSpinner from '../components/common/LoadingSpinner';
import { api } from '../api/apiClient';

const StudentDetail = () => {
  const navigate = useNavigate();
  const { ci } = useParams();

  const [inscription, setInscription] = useState(null);
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

    const fetchInscription = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await api.get(
          `/inscripción/${ci}?_relations=estudiante,contacto,colegio,area1,area2,olimpiada`
        );
        const data = response.data;

        if (!data || !data.id) {
          setError('No se encontró la inscripción con ese CI');
          setInscription(null);
          return;
        }

        setInscription(data);
        setTempStatus(data.estado || '');
        setTempReason(data.motivo_rechazo || '');
      } catch (err) {
        setError(`Error al cargar datos: ${err.message || err}`);
        setInscription(null);
      } finally {
        setLoading(false);
      }
    };

    fetchInscription();
  }, [ci]);

  const saveChanges = async () => {
    if (!inscription) return;

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
      const response = await api.patch(`/inscripción/${ci}`, updateData);
      const updatedInscription = response.data || response;
      setInscription(updatedInscription);
      setEditing(false);
      alert(`Estado actualizado a: ${tempStatus}`);
    } catch (error) {
      alert(`Error al actualizar: ${error.message || error}`);
    } finally {
      setSaving(false);
    }
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
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  if (!inscription) {
    return (
      <div className="max-w-3xl mx-auto p-4 text-center text-gray-600">
        <p>No se encontró información de la inscripción.</p>
        <button
          onClick={() => navigate('/')}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
        >
          Volver a la lista
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={() => navigate('/')}
          className="flex items-center text-gray-600 hover:text-gray-800"
          title="Volver a la lista"
        >
          <ArrowLeft className="h-5 w-5 mr-1" /> Volver
        </button>
        <h1 className="text-xl font-bold">Detalle de Inscripción</h1>
      </div>

      <section className="mb-6 p-4 border rounded shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-2">Datos del Estudiante</h2>
        <p>
          <strong>Nombre:</strong> {inscription.estudiante?.nombre_completo || 'N/D'}
        </p>
        <p>
          <strong>Contacto:</strong> {inscription.contacto?.telefono || 'N/D'}
        </p>
        <p>
          <strong>Colegio:</strong> {inscription.colegio?.nombre || 'N/D'}
        </p>
      </section>

      <section className="mb-6 p-4 border rounded shadow-sm bg-white">
        <h2 className="text-lg font-semibold mb-2">Estado de la Inscripción</h2>

        {!editing ? (
          <div className="flex items-center space-x-4">
            <p className="capitalize font-medium">
              Estado: <span className="text-blue-700">{inscription.estado}</span>
            </p>
            {inscription.estado === 'rechazado' && (
              <p>
                Motivo: <em>{inscription.motivo_rechazo || 'No especificado'}</em>
              </p>
            )}
            <button
              onClick={() => setEditing(true)}
              className="ml-auto px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700"
              title="Editar estado"
            >
              <FileText className="inline h-5 w-5 mr-1" /> Editar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div>
              <label htmlFor="status" className="block font-medium mb-1">
                Nuevo estado
              </label>
              <select
                id="status"
                className="border rounded px-3 py-2 w-full"
                value={tempStatus}
                onChange={(e) => setTempStatus(e.target.value)}
              >
                <option value="aprobado">Aprobado</option>
                <option value="rechazado">Rechazado</option>
                <option value="pendiente">Pendiente</option>
              </select>
            </div>

            {tempStatus === 'rechazado' && (
              <div>
                <label htmlFor="reason" className="block font-medium mb-1">
                  Motivo de rechazo
                </label>
                <textarea
                  id="reason"
                  rows={3}
                  className="border rounded px-3 py-2 w-full"
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
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
              >
                {saving ? (
                  <RotateCw className="animate-spin mr-2 h-5 w-5" />
                ) : (
                  <Save className="mr-2 h-5 w-5" />
                )}
                Guardar
              </button>
              <button
                onClick={() => {
                  setEditing(false);
                  setTempStatus(inscription.estado);
                  setTempReason(inscription.motivo_rechazo || '');
                }}
                className="flex items-center px-4 py-2 bg-gray-300 rounded hover:bg-gray-400"
              >
                <X className="mr-2 h-5 w-5" /> Cancelar
              </button>
            </div>
          </div>
        )}
      </section>

      {inscription.area1 && (
        <section className="mb-6 p-4 border rounded shadow-sm bg-white">
          <h2 className="text-lg font-semibold mb-2">Área 1</h2>
          <p>{inscription.area1.nombre}</p>
        </section>
      )}
      {inscription.area2 && (
        <section className="mb-6 p-4 border rounded shadow-sm bg-white">
          <h2 className="text-lg font-semibold mb-2">Área 2</h2>
          <p>{inscription.area2.nombre}</p>
        </section>
      )}
      {inscription.olimpiada && (
        <section className="mb-6 p-4 border rounded shadow-sm bg-white">
          <h2 className="text-lg font-semibold mb-2">Olimpiada</h2>
          <p>{inscription.olimpiada.nombre}</p>
        </section>
      )}
    </div>
  );
};

export default StudentDetail;
