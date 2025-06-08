import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from '../api/apiClient'; // Asegúrate que la ruta sea correcta
import { ArrowLeft, Check, X, AlertCircle, Trash2, RefreshCw, Edit } from 'lucide-react';

const OlympiadVersionRegistration = () => {
  const [formData, setFormData] = useState({
    versionNumber: "",
    versionName: "",
    registrationDeadline: "", // Este será el campo 'fecha' para el backend
    status: "habilitado"    // Por defecto, la nueva versión estará habilitada
  });

  const [uiState, setUiState] = useState({
    isSubmitting: false,
    showSuccessModal: false, // Controla tu modal de éxito
    showErrorModal: false,   // Controla tu modal de error
    modalMessage: ""         // Mensaje para tus modales
  });

  const [errors, setErrors] = useState({});
  const [olimpiadas, setOlimpiadas] = useState([]);
  const [isLoadingList, setIsLoadingList] = useState(true);
  const [deletingId, setDeletingId] = useState(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [olimpiadaToDelete, setOlimpiadaToDelete] = useState(null);
  const [showEditModal, setShowEditModal] = useState(false);
  const [olimpiadaToEdit, setOlimpiadaToEdit] = useState(null);
  const [editFormData, setEditFormData] = useState({
    nombre: "",
    fecha: "",
    estado: ""
  });
  const [editErrors, setEditErrors] = useState({});
  const [isUpdating, setIsUpdating] = useState(false);
  const navigate = useNavigate(); // Si necesitas redirigir después del éxito

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // useEffect para validaciones en tiempo real (opcional, puedes adaptarlo)
  useEffect(() => {
    const newDynamicErrors = {};
    if (formData.versionNumber && !/^\d+$/.test(formData.versionNumber)) {
      newDynamicErrors.versionNumber = "La versión debe ser un número entero positivo.";
    }
    if (formData.registrationDeadline) {
      const today = new Date();
      today.setHours(0,0,0,0); // Para comparar solo fechas
      const selectedDate = new Date(formData.registrationDeadline);
      // Ajustar la fecha seleccionada para evitar problemas de zona horaria si es necesario
      // selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset());


      if (selectedDate < today) {
        newDynamicErrors.registrationDeadline = "La fecha límite no puede ser en el pasado.";
      }
    }
    // Actualizar solo los errores dinámicos para no borrar los de submit
    // Esto es un ejemplo, puedes ajustar la lógica de cómo se muestran los errores
    if (Object.keys(newDynamicErrors).length > 0) {
        setErrors(prev => ({...prev, ...newDynamicErrors}));
    } else {
        // Limpiar errores dinámicos si se corrigen
        if (errors.versionNumber && /^\d+$/.test(formData.versionNumber)) {
            setErrors(prev => ({...prev, versionNumber: null}));
        }
        if (errors.registrationDeadline) {
            const today = new Date();
            today.setHours(0,0,0,0);
            const selectedDate = new Date(formData.registrationDeadline);
            // selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset());
            if (selectedDate >= today) {
                 setErrors(prev => ({...prev, registrationDeadline: null}));
            }
        }
    }
  }, [formData.versionNumber, formData.registrationDeadline]);


  const validateForm = () => {
    const newErrors = {};
    if (!formData.versionNumber.trim()) {
      newErrors.versionNumber = "El número de versión es requerido.";
    } else if (!/^\d+$/.test(formData.versionNumber)) {
      // Esta validación ya podría estar cubierta por el useEffect
      newErrors.versionNumber = "La versión debe ser un número entero positivo.";
    }
    if (!formData.versionName.trim()) {
      newErrors.versionName = "El nombre de la versión es requerido.";
    }
    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = "La fecha límite de inscripción es requerida.";
    } else {
      const today = new Date();
      today.setHours(0,0,0,0); // Para comparar solo fechas
      const selectedDate = new Date(formData.registrationDeadline);
      // Ajustar la fecha seleccionada para evitar problemas de zona horaria si es necesario
      // selectedDate.setMinutes(selectedDate.getMinutes() + selectedDate.getTimezoneOffset());
      if (selectedDate < today) {
        // Esta validación ya podría estar cubierta por el useEffect
        newErrors.registrationDeadline = "La fecha límite no puede ser en el pasado.";
      }
    }
    if (!formData.status) {
      newErrors.status = "El estado es requerido.";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setUiState({ isSubmitting: true, showSuccessModal: false, showErrorModal: false, modalMessage: "" });

    const payload = {
      version: parseInt(formData.versionNumber, 10),
      nombre: formData.versionName,
      fecha: formData.registrationDeadline,
      estado: formData.status,
    };

    try {
      await api.post('/olimpiadas', payload); 

      setUiState({ 
        isSubmitting: false, 
        showSuccessModal: true, 
        showErrorModal: false, 
        modalMessage: "¡Versión de olimpiada registrada exitosamente!" 
      });
      setFormData({
        versionNumber: "",
        versionName: "",
        registrationDeadline: "",
        status: "habilitado"
      });
      setErrors({}); 
      
      // Recargar la lista después de registrar una nueva versión
      await fetchOlimpiadas();
      
      // Opcional: setTimeout para cerrar el modal de éxito automáticamente
      setTimeout(() => {
        closeModal();
        // navigate('/admin/olympiads-list'); // O a donde necesites ir
      }, 3000);

    } catch (error) {
      console.error("Error al registrar la versión:", error);
      let message = "Error al registrar la versión. Intente nuevamente.";
      const backendErrors = {};

      if (error.response && error.response.data) {
        if (error.response.status === 422 && error.response.data.errors) { // Errores de validación de Laravel
          const laravelErrors = error.response.data.errors;
          const firstErrorKey = Object.keys(laravelErrors)[0];
          message = laravelErrors[firstErrorKey][0]; 
          
          if (laravelErrors.version) backendErrors.versionNumber = laravelErrors.version[0];
          if (laravelErrors.nombre) backendErrors.versionName = laravelErrors.nombre[0];
          if (laravelErrors.fecha) backendErrors.registrationDeadline = laravelErrors.fecha[0];
          if (laravelErrors.estado) backendErrors.status = laravelErrors.estado[0];
          setErrors(prev => ({...prev, ...backendErrors}));

        } else if (error.response.data.message) {
          message = error.response.data.message;
        }
      } else if (error.message) {
        message = error.message;
      }
      setUiState({ 
        isSubmitting: false, 
        showSuccessModal: false, 
        showErrorModal: true, 
        modalMessage: message 
      });
    }
  };

  const closeModal = () => {
    setUiState(prev => ({ ...prev, showSuccessModal: false, showErrorModal: false, modalMessage: "" }));
  };

  // Cargar lista de olimpiadas al montar el componente
  useEffect(() => {
    fetchOlimpiadas();
  }, []);

  const fetchOlimpiadas = async () => {
    setIsLoadingList(true);
    try {
      const response = await api.get('/olimpiadas');
      setOlimpiadas(response || []);
    } catch (error) {
      console.error('Error al cargar olimpiadas:', error);
    } finally {
      setIsLoadingList(false);
    }
  };

  const handleDeleteClick = (olimpiada) => {
    setOlimpiadaToDelete(olimpiada);
    setShowDeleteModal(true);
  };

  const confirmDelete = async () => {
    if (!olimpiadaToDelete) return;

    setDeletingId(olimpiadaToDelete.version);
    try {
      await api.delete(`/olimpiadas/${olimpiadaToDelete.version}`);
      await fetchOlimpiadas(); // Recargar la lista
      setShowDeleteModal(false);
      setOlimpiadaToDelete(null);
    } catch (error) {
      console.error('Error al eliminar olimpiada:', error);
      // Aquí podrías mostrar un mensaje de error
    } finally {
      setDeletingId(null);
    }
  };

  const handleEditClick = (olimpiada) => {
    setOlimpiadaToEdit(olimpiada);
    
    // NUEVA FUNCIONALIDAD: Procesar la fecha correctamente para el input date
    // Antes solo se asignaba directamente: fecha: olimpiada.fecha
    let fechaFormateada = '';
    if (olimpiada.fecha) {
      // Si la fecha viene como string "YYYY-MM-DD", la usamos directamente
      if (typeof olimpiada.fecha === 'string' && olimpiada.fecha.match(/^\d{4}-\d{2}-\d{2}$/)) {
        fechaFormateada = olimpiada.fecha;
      } else {
        // Si viene como objeto Date o en otro formato, la convertimos
        const fecha = new Date(olimpiada.fecha);
        if (!isNaN(fecha.getTime())) {
          fechaFormateada = fecha.toISOString().split('T')[0];
        }
      }
    }
    // FIN NUEVA FUNCIONALIDAD
    
    setEditFormData({
      nombre: olimpiada.nombre,
      fecha: fechaFormateada, // ANTES: fecha: olimpiada.fecha,
      estado: olimpiada.estado
    });
    setEditErrors({});
    setShowEditModal(true);
  };

  const handleEditChange = (e) => {
    const { name, value } = e.target;
    if (editErrors[name]) {
      setEditErrors(prev => ({ ...prev, [name]: null }));
    }
    setEditFormData(prev => ({ ...prev, [name]: value }));
  };

  const validateEditForm = () => {
    const newErrors = {};
    if (!editFormData.nombre.trim()) {
      newErrors.nombre = "El nombre es requerido.";
    }
    if (!editFormData.fecha) {
      newErrors.fecha = "La fecha es requerida.";
    }
    if (!editFormData.estado) {
      newErrors.estado = "El estado es requerido.";
    }
    setEditErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleEditSubmit = async (e) => {
    e.preventDefault();
    if (!validateEditForm() || !olimpiadaToEdit) return;

    setIsUpdating(true);
    try {
      const payload = {
        nombre: editFormData.nombre,
        fecha: editFormData.fecha,
        estado: editFormData.estado
      };

      await api.put(`/olimpiadas/${olimpiadaToEdit.version}`, payload);
      await fetchOlimpiadas(); // Recargar la lista
      setShowEditModal(false);
      setOlimpiadaToEdit(null);
    } catch (error) {
      console.error('Error al actualizar olimpiada:', error);
      if (error.response && error.response.data && error.response.data.errors) {
        const backendErrors = error.response.data.errors;
        const newErrors = {};
        if (backendErrors.nombre) newErrors.nombre = backendErrors.nombre[0];
        if (backendErrors.fecha) newErrors.fecha = backendErrors.fecha[0];
        if (backendErrors.estado) newErrors.estado = backendErrors.estado[0];
        setEditErrors(newErrors);
      }
    } finally {
      setIsUpdating(false);
    }
  };

  const getStatusBadge = (estado) => {
    const badges = {
      'habilitado': 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200',
      'cerrado': 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200',
      'proximamente': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
    };
    return badges[estado] || 'bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-200';
  };

  // Este es un esqueleto del JSX. Deberás integrar la lógica anterior
  // (estados, handlers, errores) con tu estructura de formulario y estilos existentes.
  return (
    <div className="max-w-4xl mx-auto px-4 py-6"> {/* Reemplaza con tu clase contenedora principal */}
      {/* Encabezado simplificado */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Registro de Nueva Versión de Olimpiada
        </h1>
        <div className="w-24"></div> {/* Espaciador para centrar el título si es necesario */}
      </div>

      {/* Aquí podrías tener un mensaje de estado de conexión si lo implementas */}
      {/* Ejemplo:
      {uiState.connectionStatus?.message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          uiState.connectionStatus.type === "success" 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }`}>
          {uiState.connectionStatus.type === "success" ? (
            <Check className="h-4 w-4 inline mr-1" />
          ) : (
            <X className="h-4 w-4 inline mr-1" />
          )}
          {uiState.connectionStatus.message}
        </div>
      )}
      */}
      
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Complete los datos de la nueva versión
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Campo Número de Versión */}
            <div>
              <label htmlFor="versionNumber" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número de Versión (Año) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="versionNumber"
                id="versionNumber"
                value={formData.versionNumber}
                onChange={handleChange}
                placeholder="Ej: 2025"
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.versionNumber ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.versionNumber && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.versionNumber}
                </p>
              )}
            </div>

            {/* Campo Nombre de la Versión */}
            <div>
              <label htmlFor="versionName" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre de Versión <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="versionName"
                id="versionName"
                value={formData.versionName}
                onChange={handleChange}
                placeholder="Ej: Olimpiadas Científicas San Simón"
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.versionName ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.versionName && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.versionName}
                </p>
              )}
            </div>

            {/* Campo Fecha Límite de Inscripción */}
            <div>
              <label htmlFor="registrationDeadline" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Límite de Inscripción <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="registrationDeadline"
                id="registrationDeadline"
                value={formData.registrationDeadline}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.registrationDeadline ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.registrationDeadline && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.registrationDeadline}
                </p>
              )}
            </div>
            
            {/* Campo Estado */}
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Estado <span className="text-red-500">*</span>
              </label>
              <select
                name="status"
                id="status"
                value={formData.status}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.status ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="habilitado">Habilitado</option>
                <option value="proximamente">Próximamente</option>
                <option value="cerrado">Cerrado</option>
              </select>
              {errors.status && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.status}
                </p>
              )}
            </div>
          </div>

          {/* Botones de Acción */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => { /* Lógica para limpiar formulario */
                setFormData({ versionNumber: "", versionName: "", registrationDeadline: "", status: "habilitado" });
                setErrors({});
              }}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={uiState.isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                uiState.isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              }`}
            >
              {uiState.isSubmitting ? "Registrando..." : "Registrar Versión"}
            </button>
          </div>
        </form>
      </div>

      {/* Lista de Olimpiadas Registradas */}
      <div className="mt-8 bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Versiones de Olimpiadas Registradas
          </h2>
          <button
            onClick={fetchOlimpiadas}
            disabled={isLoadingList}
            className="flex items-center px-3 py-1 text-sm bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 mr-1 ${isLoadingList ? 'animate-spin' : ''}`} />
            Actualizar
          </button>
        </div>
        
        <div className="p-6">
          {isLoadingList ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin mr-2 text-blue-500" />
              <span className="text-gray-600 dark:text-gray-400">Cargando olimpiadas...</span>
            </div>
          ) : olimpiadas.length === 0 ? (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              No hay versiones de olimpiadas registradas
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
                <thead className="bg-gray-50 dark:bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Versión
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Nombre
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Fecha Límite
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Estado
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                      Acciones
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                  {olimpiadas.map((olimpiada) => (
                    <tr key={olimpiada.version} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                        {olimpiada.version}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {olimpiada.nombre}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-600 dark:text-gray-300">
                        {new Date(olimpiada.fecha).toLocaleDateString('es-ES')}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusBadge(olimpiada.estado)}`}>
                          {olimpiada.estado}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm">
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEditClick(olimpiada)}
                            className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300"
                            title="Editar olimpiada"
                          >
                            <Edit className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(olimpiada)}
                            disabled={deletingId === olimpiada.version}
                            className="text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 disabled:opacity-50 disabled:cursor-not-allowed"
                            title="Eliminar olimpiada"
                          >
                            {deletingId === olimpiada.version ? (
                              <RefreshCw className="h-4 w-4 animate-spin" />
                            ) : (
                              <Trash2 className="h-4 w-4" />
                            )}
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Modal de confirmación de eliminación */}
      {showDeleteModal && olimpiadaToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl mx-4">
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white mb-2">
              Confirmar Eliminación
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center mb-4">
              ¿Está seguro que desea eliminar la versión <strong>{olimpiadaToDelete.version}</strong> - <strong>{olimpiadaToDelete.nombre}</strong>?
            </p>
            <p className="text-xs text-red-600 dark:text-red-400 text-center mb-4">
              Esta acción no se puede deshacer y eliminará todas las inscripciones asociadas.
            </p>
            <div className="flex justify-center space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setOlimpiadaToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
              >
                Cancelar
              </button>
              <button
                onClick={confirmDelete}
                disabled={deletingId === olimpiadaToDelete.version}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              >
                {deletingId === olimpiadaToDelete.version ? "Eliminando..." : "Eliminar"}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal de edición */}
      {showEditModal && olimpiadaToEdit && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-md w-full shadow-xl mx-4">
            <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white mb-4">
              Editar Olimpiada - Versión {olimpiadaToEdit.version}
            </h3>
            
            <form onSubmit={handleEditSubmit} className="space-y-4">
              {/* Campo Nombre */}
              <div>
                <label htmlFor="edit-nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Nombre <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="nombre"
                  id="edit-nombre"
                  value={editFormData.nombre}
                  onChange={handleEditChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    editErrors.nombre ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {editErrors.nombre && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {editErrors.nombre}
                  </p>
                )}
              </div>

              {/* Campo Fecha */}
              <div>
                <label htmlFor="edit-fecha" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Fecha Límite <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="fecha"
                  id="edit-fecha"
                  value={editFormData.fecha}
                  onChange={handleEditChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    editErrors.fecha ? "border-red-500" : "border-gray-300"
                  }`}
                />
                {editErrors.fecha && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {editErrors.fecha}
                  </p>
                )}
              </div>

              {/* Campo Estado */}
              <div>
                <label htmlFor="edit-estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  name="estado"
                  id="edit-estado"
                  value={editFormData.estado}
                  onChange={handleEditChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    editErrors.estado ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="habilitado">Habilitado</option>
                  <option value="proximamente">Próximamente</option>
                  <option value="cerrado">Cerrado</option>
                </select>
                {editErrors.estado && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {editErrors.estado}
                  </p>
                )}
              </div>

              <div className="flex justify-center space-x-3 pt-4">
                <button
                  type="button"
                  onClick={() => {
                    setShowEditModal(false);
                    setOlimpiadaToEdit(null);
                    setEditErrors({});
                  }}
                  className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={isUpdating}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {isUpdating ? "Actualizando..." : "Actualizar"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODALES: Aquí es donde renderizarías tus modales de éxito/error */}
      {uiState.showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl">
            <div className="flex items-center justify-center mb-4">
              <Check className="h-10 w-10 text-green-500" />
            </div>
            <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white mb-2">
              ¡Versión registrada con éxito!
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {uiState.modalMessage || "La nueva versión de la olimpiada ha sido registrada correctamente."}
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
      {uiState.showErrorModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl"> {/* CORREGIDO: Se añadió "full shadow-xl" y la comilla de cierre */}
            <div className="flex items-center justify-center mb-4">
              <AlertCircle className="h-10 w-10 text-red-500" />
            </div>
            <h3 className="text-lg font-medium text-center text-gray-900 dark:text-white mb-2">
              Ocurrió un error
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 text-center">
              {uiState.modalMessage || "Ha ocurrido un error inesperado. Por favor, intenta nuevamente más tarde."}
            </p>
            <div className="mt-4 flex justify-center">
              <button
                onClick={closeModal}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors"
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default OlympiadVersionRegistration;