import { useState, useEffect } from "react"
import { X, Check, ArrowLeft } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { api } from '../api/apiClient';

const OlympiadVersionRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    versionNumber: "",
    versionName: "",
    registrationDeadline: "",
    status: "activa"
  })

  const [uiState, setUiState] = useState({
    isSubmitting: false,
    showSuccessModal: false
  })

  const [errors, setErrors] = useState({})
  const [connectionStatus, setConnectionStatus] = useState({ message: "", type: "" })

  const handleChange = (e) => {
    const { name, value } = e.target
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    const newErrors = {}
    
    if (!formData.versionNumber.trim()) {
      newErrors.versionNumber = "Número de versión requerido"
    } else if (!/^\d+$/.test(formData.versionNumber)) {
      newErrors.versionNumber = "Debe ser un número entero"
    }
    
    if (!formData.versionName.trim()) {
      newErrors.versionName = "Nombre de versión requerido"
    } else if (formData.versionName.length > 100) {
      newErrors.versionName = "No puede exceder los 100 caracteres"
    }
    
    if (!formData.registrationDeadline) {
      newErrors.registrationDeadline = "Fecha límite requerida"
    } else {
      const selectedDate = new Date(formData.registrationDeadline)
      const today = new Date()
      today.setHours(0, 0, 0, 0)
      
      if (selectedDate < today) {
        newErrors.registrationDeadline = "La fecha no puede ser en el pasado"
      }
    }
    
    setErrors(newErrors)
  }, [formData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Object.keys(errors).length > 0) {
      setConnectionStatus({ message: "Por favor corrija los errores del formulario.", type: "error" })
      return
    }

    setUiState(prev => ({ ...prev, isSubmitting: true }))
    setConnectionStatus({ message: "", type: "" })

    try {
      const olympiadData = {
        numero_version: formData.versionNumber,
        nombre_version: formData.versionName,
        fecha_limite_inscripcion: formData.registrationDeadline,
        estado: formData.status
      }

      // Aquí deberías implementar tu propia lógica de guardado
      // ya que no tienes la API disponible
      console.log("Datos a guardar:", olympiadData);
      // Simulamos un guardado exitoso
      await new Promise(resolve => setTimeout(resolve, 1000));

      setConnectionStatus({ 
        message: "Versión de olimpiada registrada correctamente.",
        type: "success" 
      })

      setUiState(prev => ({ ...prev, showSuccessModal: true, isSubmitting: false }))

      setTimeout(() => {
        setUiState(prev => ({ ...prev, showSuccessModal: false }))
        navigate('/') // Redirigimos a la página principal en lugar de a /olympiads
      }, 2000)

    } catch (error) {
      console.error("Error al registrar olimpiada:", error)
      setConnectionStatus({ 
        message: "Ocurrió un error al registrar la olimpiada. Por favor intente nuevamente.",
        type: "error" 
      })
      setUiState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const resetForm = () => {
    setFormData({
      versionNumber: "",
      versionName: "",
      registrationDeadline: "",
      status: "activa"
    })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
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
        <div className="w-24"></div> {/* Espacio vacío para mantener el layout */}
      </div>

      {/* Mostrar estado de conexión */}
      {connectionStatus.message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          connectionStatus.type === "success" 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
            : "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
        }`}>
          {connectionStatus.type === "success" ? (
            <Check className="h-4 w-4 inline mr-1" />
          ) : (
            <X className="h-4 w-4 inline mr-1" />
          )}
          {connectionStatus.message}
        </div>
      )}

      {/* Contenedor del formulario */}
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Número de Versión <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="versionNumber"
                value={formData.versionNumber}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.versionNumber ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ej: 5"
              />
              {errors.versionNumber && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.versionNumber}
                </p>
              )}
            </div>

            {/* Campo Nombre de Versión */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre de Versión <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="versionName"
                value={formData.versionName}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.versionName ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ej: Olimpiada Científica 2023"
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
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Fecha Límite de Inscripción <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="registrationDeadline"
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

            <input type="hidden" name="status" value="activa" />
          </div>

          {/* Botones de acción */}
          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={resetForm}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Limpiar
            </button>
            <button
              type="submit"
              disabled={Object.keys(errors).length > 0 || uiState.isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
                Object.keys(errors).length > 0 || uiState.isSubmitting
                  ? "bg-gray-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
              }`}
            >
              {uiState.isSubmitting ? "Registrando..." : "Registrar Versión"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de éxito */}
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
              La nueva versión de la olimpiada ha sido registrada correctamente.
            </p>
          </div>
        </div>
      )}
    </div>
  )
}

export default OlympiadVersionRegistration;