import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from '../api/apiClient'; // Asegúrate que la ruta sea correcta
import { ArrowLeft, Check, X, AlertCircle } from 'lucide-react';

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