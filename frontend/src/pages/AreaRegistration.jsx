import { useState, useEffect } from "react"
import { X, Check, ArrowLeft, List } from "lucide-react"
import { useNavigate } from "react-router-dom"
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
    estado: "activo",
    modo: "normal",
  })

  const [uiState, setUiState] = useState({
    showCustomNameInput: false,
    showCustomCategoryInput: false,
    isSubmitting: false,
    showSuccessModal: false
  })

  const [errors, setErrors] = useState({})
  const [connectionStatus, setConnectionStatus] = useState({ message: "", type: "" })
  const [areaOptions, setAreaOptions] = useState([])
  const [areaToLevels, setAreaToLevels] = useState({})

  // ============== API: Fetch Options ==============
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const allAreasData = await api.get('/areas')
        
        const uniqueAreaNamesApi = [...new Set(allAreasData.map(a => a.nombre))].sort()
        const optionsApi = [...uniqueAreaNamesApi, "Otro (especificar)"]
        setAreaOptions(optionsApi)

        const levelsMapApi = {}
        uniqueAreaNamesApi.forEach(name => {
          levelsMapApi[name] = [...new Set(
            allAreasData
              .filter(a => a.nombre === name && a.categoria)
              .map(a => a.categoria)
          )].sort()
        })
        setAreaToLevels(levelsMapApi)
      } catch (error) {
        console.error("Error loading options:", error)
        setConnectionStatus({ 
          message: `Error: ${error.response?.data?.message || error.message}`, 
          type: "error" 
        })
        // Fallback options
        setAreaOptions([
          "ASTRONOMÍA - ASTROFÍSICA",
          "BIOLOGÍA",
          "FÍSICA",
          "INFORMÁTICA",
          "MATEMÁTICAS",
          "QUÍMICA",
          "ROBÓTICA",
          "Otro (especificar)"
        ])
      }
    }
    
    fetchOptions()
  }, [])

  // ============== Form Handlers ==============
  const handleChange = (e) => {
    const { name, value } = e.target
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }))
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleNameChange = (e) => {
    const value = e.target.value
    const isOtherOption = value === "Otro (especificar)"
    
    setFormData(prev => ({ 
      ...prev, 
      name: value,
      customName: isOtherOption ? prev.customName : "",
      categoryLevel: isOtherOption ? "Otro (especificar)" : "",
      customCategory: isOtherOption ? prev.customCategory : ""
    }))
    
    setUiState(prev => ({
      ...prev,
      showCustomNameInput: isOtherOption,
      showCustomCategoryInput: isOtherOption
    }))
  }

  const handleCategoryLevelChange = (e) => {
    const value = e.target.value
    const isOtherOption = value === "Otro (especificar)"
    
    setFormData(prev => ({ 
      ...prev, 
      categoryLevel: value,
      customCategory: isOtherOption ? prev.customCategory : ""
    }))
    
    setUiState(prev => ({
      ...prev,
      showCustomCategoryInput: isOtherOption
    }))
  }

  // ============== Validation ==============
  useEffect(() => {
    const newErrors = {}
    const finalName = formData.name === "Otro (especificar)" ? formData.customName : formData.name
    const finalCategory = formData.categoryLevel === "Otro (especificar)" ? formData.customCategory : formData.categoryLevel
    
    if (!finalName.trim()) newErrors.name = "Nombre de área requerido"

    if (formData.name === "Otro (especificar)"){
      const customName = formData.customName.trim()
      const onlyUppercase = /^[A-ZÁÉÍÓÚÑ ]+$/
      if (!customName) newErrors.name = "Debe ingresar un nombre"
      else if (!onlyUppercase.test(customName)) newErrors.name = "Solo mayúsculas sin números/caracteres especiales"
    }
    
    if (!finalCategory) newErrors.categoryLevel = "Seleccione categoría/nivel"
    
    if (formData.categoryLevel === "Otro (especificar)") {
      const customCategory = formData.customCategory.trim()
      const lettersAndNumbers = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/
      if (!customCategory) newErrors.categoryLevel = "Debe ingresar una categoría/nivel"
      else if (!lettersAndNumbers.test(customCategory)) newErrors.categoryLevel = "Solo letras y números"
    }
    
    if (!formData.cost || Number(formData.cost) <= 0) newErrors.cost = "Costo inválido (debe ser > 0)"
    if (Number(formData.cost) > 10000) newErrors.cost = "Costo demasiado alto"

    if (formData.description && formData.description.length > 250){
      newErrors.description = "Máximo 250 caracteres"
    }

    if (!formData.modo) newErrors.modo = "Seleccione un modo"
    else if (!["normal", "especial"].includes(formData.modo)) newErrors.modo = "Modo inválido"
    
    setErrors(newErrors)
  }, [formData])

  // ============== Form Submission ==============
  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Object.keys(errors).length > 0) {
      setConnectionStatus({ message: "Corrija los errores del formulario", type: "error" })
      return
    }
    
    setUiState(prev => ({ ...prev, isSubmitting: true }))
    setConnectionStatus({ message: "", type: "" })
    
    try {
      const finalName = formData.name === "Otro (especificar)" ? formData.customName.trim() : formData.name
      const finalCategory = formData.categoryLevel === "Otro (especificar)" ? formData.customCategory.trim() : formData.categoryLevel

      const areaData = {
        nombre: finalName,
        categoria: finalCategory,
        costo: Number(formData.cost),
        descripcion: formData.description.trim() || null,
        estado: formData.estado,
        modo: formData.modo,
      }

      await api.post('/areas', areaData)
      
      setConnectionStatus({ 
        message: "Área registrada correctamente",
        type: "success" 
      })
      
      setUiState(prev => ({ ...prev, showSuccessModal: true, isSubmitting: false }))

      setTimeout(() => {
        navigate('/areas')
      }, 2000)
    } catch (error) {
      console.error("Registration error:", error)
      const errorMsg = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(' ') 
        : (error.response?.data?.message || error.message)
      setConnectionStatus({ 
        message: `Error: ${errorMsg}`, 
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
      estado: "activo",
      modo: "normal",
    })
    setUiState(prev => ({
      ...prev,
      showCustomNameInput: false,
      showCustomCategoryInput: false
    }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6 dark:bg-gray-900 min-h-screen">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white text-center sm:text-left">
          Registro de Áreas
        </h1>
        <button
          onClick={() => navigate('/areas')}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 transition-colors"
        >
          <List className="h-5 w-5 mr-1" />
          Ver listado
        </button>
      </div>

      {/* Connection Status */}
      {connectionStatus.message && (
        <div className={`mb-4 p-3 rounded-md text-sm ${
          connectionStatus.type === "success" 
            ? "bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200" 
            : "bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200"
        }`}>
          {connectionStatus.type === "success" ? (
            <Check className="h-4 w-4 inline mr-1" />
          ) : (
            <X className="h-4 w-4 inline mr-1" />
          )}
          {connectionStatus.message}
        </div>
      )}

      {/* Form */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700 transition-colors">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Complete los datos del área
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Area Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Área <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.name}
                onChange={handleNameChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
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
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                      errors.name ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              )}
              
              {errors.name && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.name}
                </p>
              )}
            </div>

            {/* Category Field */}
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría/Nivel <span className="text-red-500">*</span>
              </label>
              <select
                value={formData.categoryLevel}
                onChange={handleCategoryLevelChange}
                disabled={!formData.name}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
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
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                      errors.categoryLevel ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                </div>
              )}
              
              {errors.categoryLevel && (
                <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.categoryLevel}
                </p>
              )}
            </div>

            {/* Cost & Mode Fields */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Cost Field */}
              <div>
                <label htmlFor="cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Costo (Bs.) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                    Bs.
                  </span>
                  <input
                    type="number"
                    name="cost"
                    id="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    step="1"
                    min="0"
                    className={`pl-10 w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                      errors.cost ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0"
                  />
                </div>
                {errors.cost && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.cost}
                  </p>
                )}
              </div>
              
              {/* Mode Field */}
              <div>
                <label htmlFor="modo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Modo <span className="text-red-500">*</span>
                </label>
                <select
                  name="modo"
                  id="modo"
                  value={formData.modo}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                    errors.modo ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="normal">Normal</option>
                  <option value="especial">Especial</option>
                </select>
                {errors.modo && (
                  <p className="mt-1 text-sm text-red-600 dark:text-red-400 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors.modo}
                  </p>
                )}
              </div>
            </div>
            
            {/* Description Field */}
            <div>
              <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                name="description"
                id="description"
                value={formData.description}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white transition-colors ${
                  errors.description ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Descripción breve del área"
              />
              {errors.description && (
                <p className="text-red-600 dark:text-red-400 text-sm mt-1 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.description}
                </p>
              )}
            </div>
          </div>

          {/* Action Buttons */}
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
                  ? "bg-blue-400 dark:bg-blue-500 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-800"
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
          <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl animate-fade-in transition-colors">
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
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 transition-colors"
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