import { useState, useEffect } from "react"
import { X, Check, ArrowLeft, List, ChevronDown, ChevronUp } from "lucide-react"
import { useNavigate } from "react-router-dom"
import { supabase } from '../supabaseClient'

const AreaRegistration = () => {
  const navigate = useNavigate()
  const [formData, setFormData] = useState({
    name: "",
    customName: "",
    categoryLevel: "",
    customCategory: "",
    cost: "",
    description: "",
    // Nuevos campos para restricciones
    maxCombination: 1, // Por defecto 1 (solo esta área)
    isExclusive: false, // Para áreas como Robótica que no permiten combinación
    allowedCombinations: [] // Áreas permitidas para combinación (vacío = todas)
  })

  const [uiState, setUiState] = useState({
    showCustomNameInput: false,
    showCustomCategoryInput: false,
    isSubmitting: false,
    showSuccessModal: false,
    showRestrictionsSection: false // Para mostrar/ocultar la sección de restricciones
  })

  const [errors, setErrors] = useState({})
  const [connectionStatus, setConnectionStatus] = useState({ message: "", type: "" })
  const [areaOptions, setAreaOptions] = useState([])
  const [areaToLevels, setAreaToLevels] = useState({})
  const [allAreas, setAllAreas] = useState([]) // Para el selector de combinaciones permitidas

  // Obtener opciones al cargar
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Obtener áreas existentes para las combinaciones
        const { data: existingAreas, error: areasError } = await supabase
          .from('area')
          .select('nombre')
          .order('nombre')
        
        if (areasError) throw areasError
        
        const uniqueAreas = [...new Set(existingAreas.map(a => a.nombre))]
        setAllAreas(uniqueAreas)
        
        // Opciones para el select principal
        const options = [...uniqueAreas, "Otro (especificar)"]
        setAreaOptions(options)
        
        // Obtener niveles por área
        const levelsMap = {}
        for (const area of uniqueAreas) {
          const { data: levels, error: levelsError } = await supabase
            .from('area')
            .select('nivel')
            .eq('nombre', area)
            .order('nivel')
          
          if (levelsError) throw levelsError
          
          levelsMap[area] = [...new Set(levels.map(l => l.nivel))]
        }
        
        setAreaToLevels(levelsMap)
        setConnectionStatus({ message: "Conexión exitosa", type: "success" })
      } catch (error) {
        console.error("Error cargando opciones:", error)
        setConnectionStatus({ message: "Error al obtener datos", type: "error" })
        setAreaOptions([
          "ASTRONOMÍA - ASTROFÍSICA", "BIOLOGÍA", "FÍSICA", "INFORMÁTICA", 
          "MATEMÁTICAS", "QUÍMICA", "ROBÓTICA", "Otro (especificar)"
        ])
      }
    }
    
    fetchOptions()
  }, [])

  // Cuando se selecciona Robótica, configurar como exclusiva automáticamente
  useEffect(() => {
    if (formData.name === "ROBÓTICA") {
      setFormData(prev => ({
        ...prev,
        isExclusive: true,
        maxCombination: 1,
        allowedCombinations: []
      }))
    }
  }, [formData.name])

  const getLevelOptions = () => {
    if (!formData.name || formData.name === "Otro (especificar)") return []
    return areaToLevels[formData.name] || []
  }

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
      customCategory: isOtherOption ? prev.customCategory : "",
      // Resetear restricciones al cambiar área (excepto si es Robótica)
      ...(value !== "ROBÓTICA" && {
        isExclusive: false,
        maxCombination: 1,
        allowedCombinations: []
      })
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

  // Nuevas funciones para manejar restricciones
  const handleRestrictionChange = (e) => {
    const { name, value, type, checked } = e.target
    
    // Si desmarcan exclusiva y es Robótica, no permitir
    if (name === "isExclusive" && formData.name === "ROBÓTICA" && !checked) {
      return
    }
    
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
      // Si marcan como exclusiva, resetear combinaciones
      ...(name === "isExclusive" && checked && {
        allowedCombinations: [],
        maxCombination: 1
      })
    }))
  }

  const handleAllowedCombinationChange = (area) => {
    setFormData(prev => {
      // No permitir cambios si es Robótica
      if (prev.name === "ROBÓTICA") return prev
      
      const newCombinations = prev.allowedCombinations.includes(area)
        ? prev.allowedCombinations.filter(a => a !== area)
        : [...prev.allowedCombinations, area]
      
      return {
        ...prev,
        allowedCombinations: newCombinations
      }
    })
  }

  useEffect(() => {
    const newErrors = {}
    const finalName = formData.name === "Otro (especificar)" ? formData.customName : formData.name
    const finalCategory = formData.categoryLevel === "Otro (especificar)" ? formData.customCategory : formData.categoryLevel
    
    // Validación del campo de área
    if (!finalName.trim()) newErrors.name = "Nombre de área requerido"

    if (formData.name === "Otro (especificar)"){
      const customName = formData.customName.trim()
      const onlyUppercase = /^[A-ZÁÉÍÓÚÑ ]+$/ // mayúsculas + espacios
  
      if (!customName){
        newErrors.name = "Debe ingresar un nombre"
      } else if (!onlyUppercase.test(customName)){
        newErrors.name = "Solo se permiten letras mayúsculas sin números ni caracteres especiales"
      }
    }
    
    // Validación del campo categoría/nivel
    if (!finalCategory) newErrors.categoryLevel = "Seleccione categoría/nivel"
    
    if (formData.categoryLevel === "Otro (especificar)") {
      const customCategory = formData.customCategory.trim()
      const lettersAndNumbers = /^[A-Za-zÁÉÍÓÚáéíóúÑñ0-9 ]+$/ // Letras (cualquier caso), números, espacios
  
      if (!customCategory) {
        newErrors.categoryLevel = "Debe ingresar una categoría/nivel"
      } else if (!lettersAndNumbers.test(customCategory)) {
        newErrors.categoryLevel = "Solo se permiten letras y números (sin caracteres especiales)"
      }
    }
    
    // Validación del campo costo
    if (!formData.cost || Number(formData.cost) <= 0) newErrors.cost = "Costo inválido (debe ser mayor a 0)"
    if (Number(formData.cost) > 10000) newErrors.cost = "Costo demasiado alto"

    // Validación del campo descripción
    if (formData.description && formData.description.length > 250){
      newErrors.description = "La descripción no puede exceder los 250 caracteres"
    }
    
    setErrors(newErrors)
  }, [formData])

  const handleSubmit = async (e) => {
    e.preventDefault()
    if (Object.keys(errors).length > 0) return
    
    setUiState(prev => ({ ...prev, isSubmitting: true }))
    
    try {
      const nombre = formData.name === "Otro (especificar)" ? formData.customName : formData.name
      const nivel = formData.categoryLevel === "Otro (especificar)" ? formData.customCategory : formData.categoryLevel
      
      // Configuración final para Robótica (asegurarse aunque ya está protegido en UI)
      const isRobotics = nombre === "ROBÓTICA"
      const finalIsExclusive = isRobotics ? true : formData.isExclusive
      const finalMaxCombination = isRobotics ? 1 : formData.maxCombination
      const finalAllowedCombinations = isRobotics ? [] : formData.allowedCombinations
      
      const { data, error } = await supabase
        .from('area')
        .insert([
          { 
            nombre,
            nivel,
            descripcion: formData.description,
            estado: 'ACTIVO',
            costo: Number(formData.cost),
            // Campos de restricciones
            max_combinacion: finalMaxCombination,
            es_exclusiva: finalIsExclusive,
            combinaciones_permitidas: finalAllowedCombinations.length > 0 
              ? finalAllowedCombinations 
              : null
          }
        ])
        .select()
      
      if (error) throw error
      
      setConnectionStatus({ message: "Área registrada correctamente", type: "success" })
      setUiState(prev => ({ ...prev, showSuccessModal: true }))
      resetForm()
      
      setTimeout(() => navigate('/areas'), 2000)
    } catch (error) {
      console.error("Error al registrar área:", error)
      setConnectionStatus({ message: "Error al registrar área", type: "error" })
    } finally {
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
      maxCombination: 1,
      isExclusive: false,
      allowedCombinations: []
    })
    setUiState(prev => ({
      ...prev,
      showCustomNameInput: false,
      showCustomCategoryInput: false,
      showRestrictionsSection: false
    }))
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      {/* Encabezado */}
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

      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden border border-gray-200 dark:border-gray-700">
        <div className="px-6 py-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Complete los datos del área
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Campo Área */}
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

            {/* Campo Categoría/Nivel */}
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

            {/* Campo Costo */}
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

              {/* Campo Descripción */}
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

          {/* Sección para restricciones de combinación */}
          <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="button"
              onClick={() => setUiState(prev => ({ ...prev, showRestrictionsSection: !prev.showRestrictionsSection }))}
              className="flex items-center justify-between w-full text-left text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
            >
              <span>Configurar restricciones de combinación (opcional)</span>
              {uiState.showRestrictionsSection ? <ChevronUp className="h-5 w-5" /> : <ChevronDown className="h-5 w-5" />}
            </button>
            
            {uiState.showRestrictionsSection && (
              <div className="mt-4 space-y-4 pl-2 border-l-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="isExclusive"
                    name="isExclusive"
                    checked={formData.isExclusive}
                    onChange={handleRestrictionChange}
                    disabled={formData.name === "ROBÓTICA"}
                    className={`h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600 ${
                      formData.name === "ROBÓTICA" ? "cursor-not-allowed opacity-50" : ""
                    }`}
                  />
                  <label htmlFor="isExclusive" className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                    Área exclusiva (no permite combinación con otras)
                    {formData.name === "ROBÓTICA" && (
                      <span className="ml-1 text-xs text-gray-500 dark:text-gray-400">
                        (Obligatorio para Robótica)
                      </span>
                    )}
                  </label>
                </div>
                
                {!formData.isExclusive && (
                  <>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Máximo de áreas combinables (incluyendo esta)
                      </label>
                      <select
                        name="maxCombination"
                        value={formData.maxCombination}
                        onChange={handleRestrictionChange}
                        disabled={formData.name === "ROBÓTICA"}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white ${
                          formData.name === "ROBÓTICA" ? "cursor-not-allowed opacity-50" : ""
                        }`}
                      >
                        <option value="1">1 (solo esta área)</option>
                        <option value="2">2 áreas</option>
                        <option value="3">3 áreas</option>
                        <option value="0">Sin límite (no recomendado)</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Áreas permitidas para combinación (dejar vacío para permitir todas)
                      </label>
                      <div className={`space-y-2 max-h-60 overflow-y-auto p-2 border border-gray-200 dark:border-gray-700 rounded-md ${
                        formData.name === "ROBÓTICA" ? "opacity-50 cursor-not-allowed" : ""
                      }`}>
                        {allAreas.filter(a => a !== formData.name).map(area => (
                          <div key={area} className="flex items-center">
                            <input
                              type="checkbox"
                              id={`combine-${area}`}
                              checked={formData.allowedCombinations.includes(area)}
                              onChange={() => handleAllowedCombinationChange(area)}
                              disabled={formData.name === "ROBÓTICA"}
                              className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded dark:bg-gray-700 dark:border-gray-600"
                            />
                            <label htmlFor={`combine-${area}`} className="ml-2 block text-sm text-gray-700 dark:text-gray-300">
                              {area}
                            </label>
                          </div>
                        ))}
                      </div>
                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                        Seleccione las áreas con las que esta área puede combinarse
                        {formData.name === "ROBÓTICA" && " (No aplica para Robótica)"}
                      </p>
                    </div>
                  </>
                )}
              </div>
            )}
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
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {uiState.isSubmitting ? "Registrando..." : "Registrar Área"}
            </button>
          </div>
        </form>
      </div>

      {/* Modal de éxito */}
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