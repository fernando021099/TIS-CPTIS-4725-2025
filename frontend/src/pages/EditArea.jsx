import { useState, useEffect } from "react"
import { X, Check, ArrowLeft, List } from "lucide-react"
import { useNavigate, useParams } from "react-router-dom"
import { api } from '../api/apiClient'; // Importar apiClient

const EditArea = () => {
  const navigate = useNavigate()
  const { id } = useParams() // Obtener el ID del área desde la URL
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

  const [areaOptions, setAreaOptions] = useState([])
  const [areaToLevels, setAreaToLevels] = useState({})

  useEffect(() => {
    const fetchOptions = async () => {
      try {
        // Obtener todas las áreas desde la API
        const allAreasData = await api.get('/areas');
        
        // Procesar datos de la API para obtener opciones
        const uniqueAreaNames = [...new Set(allAreasData.map(a => a.nombre))].sort();
        const options = [...uniqueAreaNames, "Otro (especificar)"];
        setAreaOptions(options);

        const levelsMap = {};
        uniqueAreaNames.forEach(name => {
          levelsMap[name] = [...new Set(
            allAreasData
              .filter(a => a.nombre === name)
              .map(a => a.categoria) // Usar 'categoria' de la API
          )].sort();
        });
        setAreaToLevels(levelsMap);

        setConnectionStatus({ 
          message: "Opciones cargadas desde la API", 
          type: "success" 
        });
        
        // Obtener los datos del área que se va a editar
        const areaData = await api.get(`/areas/${id}`)
        setFormData({
          name: areaData.nombre,
          customName: areaData.nombre === "Otro (especificar)" ? areaData.nombre : "",
          categoryLevel: areaData.categoria,
          customCategory: areaData.categoria === "Otro (especificar)" ? areaData.categoria : "",
          cost: areaData.costo,
          description: areaData.descripcion,
        });
      } catch (error) {
        console.error("Error cargando opciones desde API:", error);
        setConnectionStatus({ 
          message: `Error al obtener datos: ${error.message}`, 
          type: "error" 
        });
      }
    };

    fetchOptions();
  }, [id]);

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
      const categoria = formData.categoryLevel === "Otro (especificar)" ? formData.customCategory : formData.categoryLevel
      const costo = Number(formData.cost)
      const descripcion = formData.description
      const estado = 'activo' // Estado por defecto para nuevas áreas
      const modo = 'normal' // Modo por defecto (o ajustar si es necesario)

      const areaData = {
        nombre,
        categoria,
        costo,
        descripcion,
        estado,
        modo
      }

      // Actualizar el área usando apiClient
      const updatedArea = await api.put(`/areas/${id}`, areaData)
      
      setConnectionStatus({ 
        message: "Área actualizada correctamente en la API", 
        type: "success" 
      })
      
      // Mostrar modal de éxito
      setUiState(prev => ({ ...prev, showSuccessModal: true }))

      // Redirigir después de 2 segundos
      setTimeout(() => {
        navigate('/areas') // Asegúrate que esta ruta sea correcta
      }, 2000)
    } catch (error) {
      console.error("Error al actualizar área vía API:", error)
      setConnectionStatus({ 
        message: `Error al actualizar área: ${error.message}`, 
        type: "error" 
      })
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
    })
    setUiState(prev => ({
      ...prev,
      showCustomNameInput: false,
      showCustomCategoryInput: false
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
          Editar Área
        </h1>
        <button
          onClick={() => navigate('/areas')}
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <List className="h-5 w-5" />
          Ver Áreas
        </button>
      </div>

      {/* Formulario */}
      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2">
          <div className="col-span-1">
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nombre del Área
            </label>
            <select
              id="name"
              name="name"
              value={formData.name}
              onChange={handleNameChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            >
              {areaOptions.map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
            </select>
            {errors.name && <p className="mt-2 text-sm text-red-600">{errors.name}</p>}
          </div>

          {/* Input para Nombre personalizado */}
          {uiState.showCustomNameInput && (
            <div className="col-span-1">
              <label htmlFor="customName" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Nombre personalizado
              </label>
              <input
                type="text"
                id="customName"
                name="customName"
                value={formData.customName}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              />
            </div>
          )}

          <div className="col-span-1">
            <label htmlFor="categoryLevel" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
              Nivel/Categoría
            </label>
            <select
              id="categoryLevel"
              name="categoryLevel"
              value={formData.categoryLevel}
              onChange={handleCategoryLevelChange}
              className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
            >
              {getLevelOptions().map((option, index) => (
                <option key={index} value={option}>{option}</option>
              ))}
              <option value="Otro (especificar)">Otro (especificar)</option>
            </select>
            {errors.categoryLevel && <p className="mt-2 text-sm text-red-600">{errors.categoryLevel}</p>}
          </div>

          {/* Input para Categoría personalizada */}
          {uiState.showCustomCategoryInput && (
            <div className="col-span-1">
              <label htmlFor="customCategory" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
                Categoría personalizada
              </label>
              <input
                type="text"
                id="customCategory"
                name="customCategory"
                value={formData.customCategory}
                onChange={handleChange}
                className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
              />
            </div>
          )}
        </div>

        {/* Campo de Costo */}
        <div>
          <label htmlFor="cost" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Costo
          </label>
          <input
            type="number"
            id="cost"
            name="cost"
            value={formData.cost}
            onChange={handleChange}
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
          />
          {errors.cost && <p className="mt-2 text-sm text-red-600">{errors.cost}</p>}
        </div>

        {/* Descripción */}
        <div>
          <label htmlFor="description" className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Descripción
          </label>
          <textarea
            id="description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring focus:ring-indigo-500 focus:ring-opacity-50"
          ></textarea>
          {errors.description && <p className="mt-2 text-sm text-red-600">{errors.description}</p>}
        </div>

        {/* Botones de Enviar y Cancelar */}
        <div className="flex justify-between">
          <button
            type="submit"
            disabled={uiState.isSubmitting}
            className="mt-4 inline-flex items-center justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:bg-gray-300"
          >
            {uiState.isSubmitting ? "Actualizando..." : "Actualizar"}
          </button>
          <button
            type="button"
            onClick={resetForm}
            className="mt-4 inline-flex items-center justify-center rounded-md border border-transparent bg-gray-200 py-2 px-4 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-300 focus:outline-none"
          >
            Resetear
          </button>
        </div>
      </form>

      {/* Modal de éxito */}
      {uiState.showSuccessModal && (
        <div className="fixed inset-0 flex items-center justify-center z-50">
          <div className="bg-white p-6 rounded-lg shadow-lg max-w-sm w-full">
            <div className="flex items-center justify-between">
              <Check className="h-6 w-6 text-green-500" />
              <button
                onClick={() => setUiState(prev => ({ ...prev, showSuccessModal: false }))}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>
            <p className="mt-4 text-center text-lg text-green-600">
              Área actualizada correctamente.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditArea;
