import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, X, List } from 'lucide-react'
import { api } from '../api/apiClient'

const AreaRegistration = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    customName: "",
    categoryLevel: "",
    customCategory: "",
    cost: "",
    description: "",
  })

  const [uiState, setUiState] = useState({
    showCustomNameInput: false,
    showCustomCategoryInput: false,
    isSubmitting: false,
    showSuccessModal: false
  })

  const [errors, setErrors] = useState({})
  const [connectionStatus, setConnectionStatus] = useState({ message: "", type: "" })
  
  // Datos de opciones para áreas y niveles
  const [areaOptions, setAreaOptions] = useState([])
  const [areaToLevels, setAreaToLevels] = useState({})

  // Integración API: Obtener opciones
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        setConnectionStatus({ message: "Cargando opciones desde la base de datos...", type: "info" })
        
        // Obtener áreas existentes para generar opciones
        const areasData = await api.get('/area')
        
        // Extraer nombres únicos de áreas
        const uniqueAreaNames = [...new Set(areasData.map(area => area.nombre))]
        setAreaOptions([...uniqueAreaNames, "Otro (especificar)"])
        
        // Mapear áreas a sus categorías/niveles
        const areaToLevelsMap = {}
        areasData.forEach(area => {
          if (!areaToLevelsMap[area.nombre]) {
            areaToLevelsMap[area.nombre] = []
          }
          if (!areaToLevelsMap[area.nombre].includes(area.categoria)) {
            areaToLevelsMap[area.nombre].push(area.categoria)
          }
        })
        
        setAreaToLevels(areaToLevelsMap)
        setConnectionStatus({ 
          message: "Opciones cargadas correctamente desde la base de datos", 
          type: "success" 
        })
        
        console.log('Opciones de áreas cargadas:', { uniqueAreaNames, areaToLevelsMap })
      } catch (error) {
        console.error('Error al cargar opciones de áreas:', error)
        setConnectionStatus({ 
          message: "Error al cargar opciones. Usando valores por defecto.", 
          type: "error" 
        })
        
        // Fallback a opciones hardcodeadas
        const fallbackAreas = [
          "ASTRONOMIA_ASTROFISICA", "BIOLOGIA", "FISICA", "INFORMATICA", 
          "MATEMATICAS", "QUIMICA", "ROBOTICA", "Otro (especificar)"
        ]
        setAreaOptions(fallbackAreas)
        
        const fallbackLevels = {
          "ASTRONOMIA_ASTROFISICA": ["3P", "4P", "5P", "6P", "1S", "2S", "3S", "4S", "5S", "6S"],
          "BIOLOGIA": ["2S", "3S", "4S", "5S", "6S"],
          "FISICA": ["4S", "5S", "6S"],
          "INFORMATICA": ["Guacamayo", "Guanaco", "Londra", "Jucumari", "Bufeo", "Puma"],
          "MATEMATICAS": ["Primer Nivel", "Segundo Nivel", "Tercer Nivel", "Cuarto Nivel", "Quinto Nivel", "Sexto Nivel"],
          "QUIMICA": ["2S", "3S", "4S", "5S", "6S"],
          "ROBOTICA": ["Builders P", "Builders S", "Lego P", "Lego S"]
        }
        setAreaToLevels(fallbackLevels)
      }
    }
    
    fetchOptions()
  }, [])

  const getLevelOptions = () => {
    if (!formData.name || formData.name === "Otro (especificar)") return []
    return areaToLevels[formData.name] || []
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: "" }))
    }
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNameChange = (e) => {
    const value = e.target.value
    setErrors(prev => ({ ...prev, name: "" }))
    
    setFormData(prev => ({ 
      ...prev, 
      name: value,
      categoryLevel: "", // Reset category when area changes
      customCategory: ""
    }))
    
    // Show/hide custom name input
    setUiState(prev => ({ 
      ...prev, 
      showCustomNameInput: value === "Otro (especificar)",
      showCustomCategoryInput: false // Reset custom category
    }))
  }

  const handleCategoryLevelChange = (e) => {
    const value = e.target.value
    setErrors(prev => ({ ...prev, categoryLevel: "" }))
    
    setFormData(prev => ({ ...prev, categoryLevel: value, customCategory: "" }))
    
    // Show/hide custom category input
    setUiState(prev => ({ 
      ...prev, 
      showCustomCategoryInput: value === "Otro (especificar)"
    }))
  }

  // Validate form in real time
  useEffect(() => {
    const newErrors = {}
    
    // Area name validation
    if (!formData.name) {
      newErrors.name = "Seleccione un área"
    } else if (formData.name === "Otro (especificar)" && !formData.customName.trim()) {
      newErrors.name = "Especifique el nombre del área"
    }
    
    // Category validation
    if (!formData.categoryLevel) {
      newErrors.categoryLevel = "Seleccione una categoría/nivel"
    } else if (formData.categoryLevel === "Otro (especificar)" && !formData.customCategory.trim()) {
      newErrors.categoryLevel = "Especifique la categoría/nivel"
    }
    
    // Cost validation
    if (!formData.cost) {
      newErrors.cost = "Ingrese el costo"
    } else if (isNaN(formData.cost) || parseFloat(formData.cost) < 0) {
      newErrors.cost = "El costo debe ser un número válido mayor o igual a 0"
    }
    
    setErrors(newErrors)
  }, [formData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    // Final validation
    if (Object.keys(errors).length > 0) {
      setConnectionStatus({ 
        message: "Por favor corrija los errores antes de continuar", 
        type: "error" 
      })
      return
    }
    
    setUiState(prev => ({ ...prev, isSubmitting: true }))
    setConnectionStatus({ message: "Registrando área...", type: "info" })
    
    try {
      // Prepare the data for API
      const areaData = {
        nombre: formData.name === "Otro (especificar)" ? formData.customName.trim() : formData.name,
        categoria: formData.categoryLevel === "Otro (especificar)" ? formData.customCategory.trim() : formData.categoryLevel,
        costo: parseFloat(formData.cost),
        descripcion: formData.description.trim() || null,
        estado: "activo" // Default status
      }
      
      console.log('Enviando datos del área:', areaData)
      
      // Send to API
      const response = await api.post('/area', areaData)
      
      console.log('Área registrada exitosamente:', response)
      
      setConnectionStatus({ 
        message: "Área registrada correctamente en la base de datos", 
        type: "success" 
      })
      
      setUiState(prev => ({ 
        ...prev, 
        isSubmitting: false, 
        showSuccessModal: true 
      }))
      
      // Reset form
      setTimeout(() => {
        resetForm()
      }, 2000)
      
    } catch (error) {
      console.error('Error al registrar área:', error)
      
      let errorMessage = "Error al registrar el área"
      if (error.status === 422 && error.data?.errors) {
        // Handle validation errors from backend
        const backendErrors = error.data.errors
        const errorMessages = Object.values(backendErrors).flat()
        errorMessage = errorMessages.join(", ")
      } else if (error.message) {
        errorMessage = error.message
      }
      
      setConnectionStatus({ 
        message: errorMessage, 
        type: "error" 
      })
      
      setUiState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const resetForm = () => {
    setFormData({
      name: "",
      customName: "",
      categoryLevel: "",
      customCategory: "",
      cost: "",
      description: "",
    })
    setUiState({
      showCustomNameInput: false,
      showCustomCategoryInput: false,
      isSubmitting: false,
      showSuccessModal: false
    })
    setErrors({})
    setConnectionStatus({ message: "", type: "" })
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Registro de Áreas
        </h1>
        <button
          onClick={() => navigate('/areas')}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <List className="h-5 w-5 mr-1" />
          Ver listado
        </button>
      </div>

      {/* Connection Status */}
      {connectionStatus.message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          connectionStatus.type === "success" 
            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200" 
            : connectionStatus.type === "error"
            ? "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200"
            : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
        }`}>
          {connectionStatus.type === "success" ? (
            <Check className="h-4 w-4 inline mr-1" />
          ) : connectionStatus.type === "error" ? (
            <X className="h-4 w-4 inline mr-1" />
          ) : (
            <div className="h-4 w-4 inline mr-1 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
          )}
          {connectionStatus.message}
        </div>
      )}

      {/* Main Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Complete los datos del área
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Area Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Área <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.name}
                onChange={handleNameChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.name ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="">Seleccione un área</option>
                {areaOptions.map((area, index) => (
                  <option key={index} value={area}>{area}</option>
                ))}
              </select>
              
              {uiState.showCustomNameInput && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={formData.customName}
                    onChange={handleChange}
                    name="customName"
                    placeholder="Nombre personalizado del área"
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              )}
              
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Category/Level Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría/Nivel <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryLevel}
                onChange={handleCategoryLevelChange}
                disabled={!formData.name}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.categoryLevel ? "border-red-500" : "border-gray-300"
                } ${
                  !formData.name ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed" : ""
                }`}
              >
                <option value="">
                  {formData.name === "Otro (especificar)" 
                    ? "Especifique abajo" 
                    : formData.name 
                      ? "Seleccione categoría/nivel" 
                      : "Seleccione área primero"}
                </option>
                {formData.name !== "Otro (especificar)" && getLevelOptions().map((level, index) => (
                  <option key={index} value={level}>{level}</option>
                ))}
                <option value="Otro (especificar)">Otro (especificar)</option>
              </select>
              
              {uiState.showCustomCategoryInput && (
                <div className="mt-2">
                  <input
                    type="text"
                    value={formData.customCategory}
                    onChange={handleChange}
                    name="customCategory"
                    placeholder="Categoría/nivel personalizado"
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.categoryLevel ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              )}
              
              {errors.categoryLevel && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.categoryLevel}
                </p>
              )}
            </div>

            {/* Cost and Description */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Costo (Bs.) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                    Bs.
                  </span>
                  <input
                    type="number"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`pl-10 w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.cost ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0.00"
                  />
                </div>
                {errors.cost && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.cost}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Descripción (opcional)
                </label>
                <textarea
                  name="description"
                  value={formData.description}
                  onChange={handleChange}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  placeholder="Descripción breve del área"
                />
                {errors.description && (
                  <p className="text-red-500 text-sm mt-1">{errors.description}</p>
                )}
              </div>
            </div>
          </div>

          {/* Form Actions */}
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
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {uiState.isSubmitting ? "Registrando..." : "Registrar Área"}
            </button>
          </div>
        </form>
      </div>

      {/* Success Modal */}
      {uiState.showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl animate-fade-in">
            <div className="flex items-center justify-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900 dark:text-white">
                Área registrada
              </h3>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                El área se ha registrado correctamente.
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                onClick={() => setUiState(prev => ({ ...prev, showSuccessModal: false }))}
              >
                Cerrar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AreaRegistration