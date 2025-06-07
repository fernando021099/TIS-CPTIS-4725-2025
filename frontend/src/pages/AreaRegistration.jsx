import { useState, useEffect } from "react"
import { X, Check, ArrowLeft, List } from "lucide-react"
import { useNavigate } from "react-router-dom"
// import { supabase } from '../supabaseClient' // Comentado: No se usa Supabase
import { api } from '../api/apiClient'; // Importar apiClient

const AreaRegistration = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "", // Corresponde a 'nombre' en el backend si no es "Otro"
    customName: "", // Usado si name es "Otro"
    categoryLevel: "", // Corresponde a 'categoria' en el backend si no es "Otro"
    customCategory: "", // Usado si categoryLevel es "Otro"
    cost: "", // Corresponde a 'costo'
    description: "", // Corresponde a 'descripcion'
    estado: "activo", // Por defecto 'activo' para nuevas áreas
    modo: "normal", // Por defecto 'normal', se añadirá como select
  })

  const [uiState, setUiState] = useState({
    showCustomNameInput: false,
    showCustomCategoryInput: false,
    isSubmitting: false,
    showSuccessModal: false
  })

  const [errors, setErrors] = useState({})
  const [connectionStatus, setConnectionStatus] = useState({ message: "", type: "" }) // Para mostrar estado de conexión
  
  // Datos de opciones para áreas y niveles
  const [areaOptions, setAreaOptions] = useState([])
  const [areaToLevels, setAreaToLevels] = useState({})

  // Integración API: Obtener opciones
  useEffect(() => {
    const fetchOptions = async () => {
      try {
        const allAreasData = await api.get('/areas'); // Obtener áreas existentes para prellenar opciones
        
        const uniqueAreaNamesApi = [...new Set(allAreasData.map(a => a.nombre))].sort();
        const optionsApi = [...uniqueAreaNamesApi, "Otro (especificar)"];
        setAreaOptions(optionsApi);

        const levelsMapApi = {};
        uniqueAreaNamesApi.forEach(name => {
          levelsMapApi[name] = [...new Set(
            allAreasData
              .filter(a => a.nombre === name && a.categoria) // Asegurar que categoria exista
              .map(a => a.categoria)
          )].sort();
        });
        setAreaToLevels(levelsMapApi);
        
        // setConnectionStatus({ 
        //   message: "Opciones cargadas desde la API",
        //   type: "success" 
        // });
      } catch (error) {
        console.error("Error cargando opciones desde API:", error);
        setConnectionStatus({ 
          message: `Error al obtener datos de áreas existentes: ${error.response?.data?.message || error.message}`, 
          type: "error" 
        });
        // Mantener valores por defecto en caso de error
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
    };
    
    fetchOptions();
  }, [])

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
      newErrors.description = "La descripción no puede exceder los 250 caracteres";
    }

    // Validación del campo modo
    if (!formData.modo) {
      newErrors.modo = "Seleccione un modo";
    } else if (!["normal", "especial"].includes(formData.modo)) {
      newErrors.modo = "Modo inválido";
    }
    
    setErrors(newErrors);
  }, [formData]);

  const handleSubmit = async (e) => {
  e.preventDefault();
  if (Object.keys(errors).length > 0) {
    setConnectionStatus({ message: "Por favor corrija los errores del formulario.", type: "error" });
    return;
  }

  setUiState(prev => ({ ...prev, isSubmitting: true }));
  setConnectionStatus({ message: "", type: "" }); // Limpiar mensajes previos

  try {
    const finalName = formData.name === "Otro (especificar)" ? formData.customName.trim() : formData.name;
    const finalCategory = formData.categoryLevel === "Otro (especificar)" ? formData.customCategory.trim() : formData.categoryLevel;

    const areaData = {
      nombre: finalName,
      categoria: finalCategory,
      costo: Number(formData.cost),
      descripcion: formData.description.trim() || null, // Enviar null si está vacío
      estado: formData.estado, 
      modo: formData.modo, // Se envía el valor seleccionado
    };

    // console.log("Enviando datos a la API:", areaData);
    await api.post('/areas', areaData);

    setConnectionStatus({ 
      message: "Área registrada correctamente en la API.",
      type: "success" 
    });

    setUiState(prev => ({ ...prev, showSuccessModal: true, isSubmitting: false }));
    // resetForm(); // Se resetea en el modal o al redirigir

    setTimeout(() => {
      setUiState(prev => ({ ...prev, showSuccessModal: false }));
      navigate('/areas'); // Redirigir a la lista de áreas
    }, 2000);

  } catch (error) {
    console.error("Error al registrar área vía API:", error);

    let finalUserMessage;

    if (error.response?.status === 422) {
      const errorsFromBackend = error.response.data?.errors;
      let isDuplicateError = false;

      if (errorsFromBackend) {
        // Comprobar mensajes de error de backend para palabras clave que indiquen duplicado
        for (const field in errorsFromBackend) {
          if (Array.isArray(errorsFromBackend[field])) {
            if (errorsFromBackend[field].some(msg => 
                msg.toLowerCase().includes("ya ha sido tomado") || 
                msg.toLowerCase().includes("already been taken") || 
                msg.toLowerCase().includes("ya existe")
            )) {
              isDuplicateError = true;
              break;
            }
          }
        }
      }

      // También verificar mensaje principal
      if (!isDuplicateError && error.response.data?.message?.toLowerCase().includes("ya existe")) {
          isDuplicateError = true;
      }

      if (isDuplicateError) {
        finalUserMessage = "Error: el área ya existe en la base de datos.";
      } else {
        const specificErrorMessages = errorsFromBackend 
          ? Object.values(errorsFromBackend).flat().join(' ') 
          : error.response.data?.message;
        finalUserMessage = `Error de validación (422): ${specificErrorMessages || "El área ya existe en la base de datos."}`;
      }
    } else {
      const genericErrorMsg = error.response?.data?.message || error.message || "Ocurrió un error desconocido.";
      finalUserMessage = `Error al registrar área: ${genericErrorMsg}`;
    }

    setConnectionStatus({ 
      message: finalUserMessage, 
      type: "error" 
    });
    setUiState(prev => ({ ...prev, isSubmitting: false }));
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
    estado: "activo", // Mantener valor por defecto
    modo: "normal",   // Mantener valor por defecto
  });
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

    {/* Contenedor del formulario */}
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

          {/* Campo Costo y Modo en una fila */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                  className={`pl-10 w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.cost ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="0"
                />
              </div>
              {errors.cost && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.cost}
                </p>
              )}
            </div>
            
            {/* Campo Modo */}
            <div>
              <label htmlFor="modo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Modo <span className="text-red-500">*</span>
              </label>
              <select
                name="modo"
                id="modo"
                value={formData.modo}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.modo ? "border-red-500" : "border-gray-300"
                }`}
              >
                <option value="normal">Normal</option>
                <option value="especial">Especial</option>
              </select>
              {errors.modo && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />
                  {errors.modo}
                </p>
              )}
            </div>
          </div>
          
          {/* Campo Descripción */}
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
              className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                errors.description ? "border-red-500" : "border-gray-300"
              }`}
              placeholder="Descripción breve del área"
            />
            {errors.description && (
              <p className="text-red-500 text-sm mt-1">{errors.description}</p>
            )}
          </div>
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
            disabled={Object.keys(errors).length > 0}
            className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors ${
              Object.keys(errors).length > 0
                ? "bg-gray-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-500 dark:hover:bg-blue-600"
            }`}
          >
            Guardar
          </button>
        </div>
      </form>
    </div>
  </div>
)
}

export default AreaRegistration