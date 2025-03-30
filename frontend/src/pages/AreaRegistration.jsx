"use client"
import { useState, useEffect } from "react"
import { X, Edit, Trash2, ChevronLeft, ChevronRight, Plus, Check } from "lucide-react"

const AreaRegistration = ({ onBack }) => {
  const [formData, setFormData] = useState({
    id: null,
    categoryLevel: "",
    name: "",
    customName: "",
    cost: "",
    description: "",
  })

  const [showCustomNameInput, setShowCustomNameInput] = useState(false)
  const [errors, setErrors] = useState({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [areas, setAreas] = useState([
    { 
      id: 1, 
      name: "Matemáticas", 
      categoryLevel: "Ciencias Exactas - Básico",
      cost: 50, 
      description: "Fundamentos de matemáticas",
      isActive: true
    },
    { 
      id: 2, 
      name: "Robótica", 
      categoryLevel: "Tecnología - Intermedio",
      cost: 75, 
      description: "Introducción a la robótica",
      isActive: true
    },
  ])
  
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 8
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedLevels, setSelectedLevels] = useState([])

  const categoryLevelOptions = [
    "Ciencias Exactas - Básico",
    "Ciencias Exactas - Intermedio",
    "Tecnología - Básico",
    "Tecnología - Intermedio",
    "Tecnología - Avanzado",
    "Informática - Básico",
    "Informática - Intermedio",
    "Informática - Avanzado",
    "Ciencias Naturales - Básico",
    "Ciencias Naturales - Intermedio",
    "Ingeniería - Básico",
    "Ingeniería - Intermedio"
  ]

  const categoryToAreas = {
    "Ciencias Exactas": ["Matemáticas", "Física", "Química"],
    "Tecnología": ["Robótica", "Programación", "Electrónica"],
    "Informática": ["Algoritmos", "Bases de Datos", "Redes"],
    "Ciencias Naturales": ["Biología", "Geología", "Ecología"],
    "Ingeniería": ["Civil", "Mecánica", "Eléctrica"]
  }

  const getAreaOptions = () => {
    if (!formData.categoryLevel) return []
    const category = formData.categoryLevel.split(" - ")[0]
    return categoryToAreas[category] || []
  }

  const filteredAreas = areas.filter(area => {
    const matchesSearch = area.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                         area.description.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesLevel = selectedLevels.length === 0 || 
                        selectedLevels.some(level => area.categoryLevel.includes(level))
    return matchesSearch && matchesLevel
  })

  const handleCategoryLevelChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ 
      ...prev, 
      categoryLevel: value,
      name: "",
      customName: ""
    }))
    setShowCustomNameInput(false)
  }

  const handleNameChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ 
      ...prev, 
      name: value,
      customName: value === "Otro" ? prev.customName : ""
    }))
    setShowCustomNameInput(value === "Otro")
  }

  const handleCustomNameChange = (e) => {
    const value = e.target.value
    setFormData(prev => ({ ...prev, customName: value }))
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  useEffect(() => {
    const newErrors = {}
    const finalName = formData.name === "Otro" ? formData.customName : formData.name
    
    if (!formData.categoryLevel) {
      newErrors.categoryLevel = "Seleccione categoría/nivel"
    }
    
    if (!finalName.trim()) {
      newErrors.name = "Nombre de área requerido"
    } else if (
      formData.name === "Otro" && 
      !formData.customName.trim()
    ) {
      newErrors.name = "Debe ingresar un nombre"
    } else if (
      areas.some(a => 
        a.id !== formData.id && 
        a.name.toLowerCase() === finalName.toLowerCase() &&
        a.categoryLevel === formData.categoryLevel
      )
    ) {
      newErrors.name = "Ya existe un área con este nombre y categoría"
    }
    
    if (!formData.cost || Number(formData.cost) <= 0) {
      newErrors.cost = "Costo inválido"
    }
    
    setErrors(newErrors)
    setIsFormValid(Object.keys(newErrors).length === 0)
  }, [formData, areas])

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isFormValid) return

    const finalName = formData.name === "Otro" ? formData.customName : formData.name

    const newArea = {
      id: formData.id || areas.length + 1,
      name: finalName,
      categoryLevel: formData.categoryLevel,
      cost: Number(formData.cost),
      description: formData.description,
      isActive: true
    }

    if (formData.id) {
      setAreas(areas.map(area => 
        area.id === formData.id ? newArea : area
      ))
    } else {
      setAreas([...areas, newArea])
    }

    setShowModal(true)
    setFormData({ 
      id: null,
      categoryLevel: "",
      name: "", 
      customName: "",
      cost: "", 
      description: "" 
    })
    setShowCustomNameInput(false)
    
    setTimeout(() => setShowModal(false), 3000)
  }

  const handleDelete = (id) => {
    setAreas(areas.filter(area => area.id !== id))
  }

  const handleEdit = (area) => {
    const categoryParts = area.categoryLevel.split(" - ")
    const category = categoryParts[0]
    const areaOptions = categoryToAreas[category] || []
    const isPredefinedArea = areaOptions.includes(area.name)
    
    setFormData({
      id: area.id,
      categoryLevel: area.categoryLevel,
      name: isPredefinedArea ? area.name : "Otro",
      customName: isPredefinedArea ? "" : area.name,
      cost: area.cost.toString(),
      description: area.description || "",
    })
    setShowCustomNameInput(!isPredefinedArea)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const toggleAreaStatus = (id) => {
    setAreas(areas.map(area => 
      area.id === id ? { ...area, isActive: !area.isActive } : area
    ))
  }

  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentAreas = filteredAreas.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(filteredAreas.length / itemsPerPage)

  const uniqueLevels = [...new Set(
    categoryLevelOptions.map(opt => {
      const parts = opt.split(" - ")
      return parts.length > 1 ? parts[1] : opt
    })
  )]

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-900 transition-colors duration-200">
      <main className="flex-grow pt-12 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2">
          
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 py-3 px-4 sm:px-6 lg:px-8 mb-3 rounded-lg">
            <div className="flex justify-between items-center">
              <div className="flex items-center">
                <span className="bg-red-600 rounded-full p-1 mr-2">
                  <Plus className="h-5 w-5 text-white" />
                </span>
                <h1 className="text-xl font-bold text-gray-900 dark:text-white">
                  Gestión de Áreas de Competencia
                </h1>
              </div>
              <button 
                onClick={onBack}
                className="text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white px-3 py-1 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                Volver al inicio
              </button>
            </div>
            <p className="text-gray-600 dark:text-gray-300 mt-1 ml-10 text-sm">
              Olimpiadas Oh! SanSi - {filteredAreas.length} áreas registradas
            </p>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg mb-3 overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-md font-semibold text-gray-900 dark:text-white">
                {formData.id ? "Editar Área" : "Nueva Área de Competencia"}
              </h2>
            </div>
            
            <div className="p-4">
              <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Categoría/Nivel <span className="text-red-600">*</span>
                    </label>
                    <select
                      name="categoryLevel"
                      value={formData.categoryLevel}
                      onChange={handleCategoryLevelChange}
                      className={`w-full px-3 py-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.categoryLevel ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Seleccione categoría/nivel</option>
                      {categoryLevelOptions.map((option, index) => (
                        <option key={index} value={option}>{option}</option>
                      ))}
                    </select>
                    {errors.categoryLevel && (
                      <p className="mt-1 text-xs text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.categoryLevel}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Área <span className="text-red-600">*</span>
                    </label>
                    <select
                      value={formData.name}
                      onChange={handleNameChange}
                      name="name"
                      disabled={!formData.categoryLevel}
                      className={`w-full px-3 py-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.name ? "border-red-500" : "border-gray-300"
                      } ${
                        !formData.categoryLevel ? "bg-gray-100 dark:bg-gray-600 cursor-not-allowed" : ""
                      }`}
                    >
                      <option value="">{formData.categoryLevel ? "Seleccione un área" : "Seleccione categoría primero"}</option>
                      {getAreaOptions().map((area, index) => (
                        <option key={index} value={area}>{area}</option>
                      ))}
                      <option value="Otro">Otro (especificar)</option>
                    </select>
                    
                    {showCustomNameInput && (
                      <div className="mt-2">
                        <input
                          type="text"
                          value={formData.customName}
                          onChange={handleCustomNameChange}
                          name="customName"
                          placeholder="Ingrese el nombre del área"
                          className={`w-full px-3 py-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                            errors.name && formData.name === "Otro" ? "border-red-500" : "border-gray-300"
                          }`}
                        />
                      </div>
                    )}
                    
                    {errors.name && (
                      <p className="mt-1 text-xs text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.name}
                        {errors.name.includes("ya existe") && (
                          <button
                            type="button"
                            onClick={() => {
                              const finalName = formData.name === "Otro" ? formData.customName : formData.name
                              const existing = areas.find(a => 
                                a.name.toLowerCase() === finalName.toLowerCase() &&
                                a.categoryLevel === formData.categoryLevel
                              )
                              if (existing) handleEdit(existing)
                            }}
                            className="ml-2 text-xs text-blue-600 hover:underline"
                          >
                            ¿Editar área existente?
                          </button>
                        )}
                      </p>
                    )}
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Costo (Bs.) <span className="text-red-600">*</span>
                    </label>
                    <input
                      type="number"
                      name="cost"
                      value={formData.cost}
                      onChange={handleChange}
                      step="0.01"
                      min="0"
                      className={`w-full px-3 py-1 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                        errors.cost ? "border-red-500" : "border-gray-300"
                      }`}
                      placeholder="Ej: 50.00"
                    />
                    {errors.cost && (
                      <p className="mt-1 text-xs text-red-600 flex items-center">
                        <X className="h-3 w-3 mr-1" />
                        {errors.cost}
                      </p>
                    )}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Descripción (opcional)
                    </label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      rows={2}
                      className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                      placeholder="Breve descripción del área de competencia"
                    />
                  </div>
                </div>

                <div className="mt-3 flex justify-end space-x-2">
                  {formData.id && (
                    <button
                      type="button"
                      onClick={() => {
                        setFormData({
                          id: null,
                          categoryLevel: "",
                          name: "",
                          customName: "",
                          cost: "",
                          description: "",
                        })
                        setShowCustomNameInput(false)
                      }}
                      className="px-4 py-1 rounded-md text-sm font-medium bg-gray-200 dark:bg-gray-700 text-gray-800 dark:text-gray-200 hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                    >
                      Cancelar
                    </button>
                  )}
                  <button
                    type="submit"
                    disabled={!isFormValid}
                    className={`px-4 py-1 rounded-md text-sm font-medium transition-colors ${
                      isFormValid 
                        ? "bg-blue-600 hover:bg-blue-700 text-white" 
                        : "bg-gray-400 cursor-not-allowed"
                    }`}
                  >
                    {formData.id ? "Actualizar Área" : "Guardar Área"}
                  </button>
                </div>
              </form>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 shadow-md rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
            <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
              <h2 className="text-md font-semibold text-gray-900 dark:text-white">
                Áreas Registradas
              </h2>
              
              <div className="flex flex-col md:flex-row gap-2 w-full md:w-auto">
                <div className="relative flex-grow">
                  <input
                    type="text"
                    placeholder="Buscar áreas..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:text-white"
                  />
                </div>
                
                <div className="flex flex-wrap gap-1 md:gap-2">
                  {uniqueLevels.map(level => (
                    <button
                      key={level}
                      onClick={() => {
                        if (selectedLevels.includes(level)) {
                          setSelectedLevels(selectedLevels.filter(l => l !== level))
                        } else {
                          setSelectedLevels([...selectedLevels, level])
                        }
                      }}
                      className={`px-2 py-1 rounded-md text-xs flex items-center ${
                        selectedLevels.includes(level)
                          ? 'bg-blue-100 dark:bg-blue-900 text-blue-800 dark:text-blue-200'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-200'
                      }`}
                    >
                      {selectedLevels.includes(level) && (
                        <Check className="h-3 w-3 mr-1" />
                      )}
                      {level}
                    </button>
                  ))}
                </div>
              </div>
            </div>
            
            <div className="p-2">
              {filteredAreas.length > 0 ? (
                <>
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700 text-sm">
                      <thead className="bg-gray-50 dark:bg-gray-700">
                        <tr>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Nombre
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Categoría/Nivel
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Costo (Bs.)
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Estado
                          </th>
                          <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 dark:text-gray-300 uppercase tracking-wider">
                            Acciones
                          </th>
                        </tr>
                      </thead>
                      <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
                        {currentAreas.map((area) => (
                          <tr key={area.id} className="hover:bg-gray-50 dark:hover:bg-gray-700">
                            <td className="px-3 py-2 whitespace-nowrap">
                              <div className="font-medium text-gray-900 dark:text-white">
                                {area.name}
                              </div>
                              {area.description && (
                                <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-xs">
                                  {area.description}
                                </div>
                              )}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-500 dark:text-gray-400">
                              {area.categoryLevel}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-gray-500 dark:text-gray-400">
                              {area.cost.toFixed(2)}
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap">
                              <button
                                onClick={() => toggleAreaStatus(area.id)}
                                className={`px-2 py-1 rounded-full text-xs font-medium ${
                                  area.isActive
                                    ? 'bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-200'
                                    : 'bg-red-100 dark:bg-red-900 text-red-800 dark:text-red-200'
                                }`}
                              >
                                {area.isActive ? 'Activo' : 'Inactivo'}
                              </button>
                            </td>
                            <td className="px-3 py-2 whitespace-nowrap text-sm font-medium">
                              <div className="flex space-x-1">
                                <button
                                  onClick={() => handleEdit(area)}
                                  className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 flex items-center text-xs"
                                >
                                  <Edit className="h-3 w-3 mr-1" /> Editar
                                </button>
                                <button
                                  onClick={() => handleDelete(area.id)}
                                  className="text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center text-xs"
                                >
                                  <Trash2 className="h-3 w-3 mr-1" /> Eliminar
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {totalPages > 1 && (
                    <div className="mt-2 flex items-center justify-between px-2 py-1">
                      <div className="text-xs text-gray-700 dark:text-gray-300">
                        Mostrando {indexOfFirstItem + 1} a {Math.min(indexOfLastItem, filteredAreas.length)} de {filteredAreas.length} áreas
                      </div>
                      
                      <div className="flex space-x-1">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className={`px-2 py-1 rounded-md border text-xs ${
                            currentPage === 1 
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          <ChevronLeft className="h-4 w-4" />
                        </button>
                        
                        {Array.from({ length: totalPages }, (_, i) => (
                          <button
                            key={i}
                            onClick={() => setCurrentPage(i + 1)}
                            className={`px-2 py-1 rounded-md border text-xs ${
                              currentPage === i + 1 
                                ? 'bg-blue-600 dark:bg-blue-700 text-white' 
                                : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                            }`}
                          >
                            {i + 1}
                          </button>
                        ))}
                        
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className={`px-2 py-1 rounded-md border text-xs ${
                            currentPage === totalPages 
                              ? 'bg-gray-100 dark:bg-gray-700 text-gray-400 cursor-not-allowed' 
                              : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-200 hover:bg-gray-50 dark:hover:bg-gray-600'
                          }`}
                        >
                          <ChevronRight className="h-4 w-4" />
                        </button>
                      </div>
                    </div>
                  )}
                </>
              ) : (
                <div className="text-center py-6 text-sm">
                  <p className="text-gray-500 dark:text-gray-400">
                    {searchTerm || selectedLevels.length > 0
                      ? "No se encontraron áreas con los filtros aplicados"
                      : "No hay áreas registradas"}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 max-w-md w-full shadow-xl text-sm">
            <div className="flex justify-between items-center mb-2">
              <h3 className="text-md font-bold text-gray-900 dark:text-white">
                {formData.id ? "Área actualizada" : "Área registrada"}
              </h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-500 dark:hover:text-gray-300"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <div className="mb-2">
              <div className="bg-green-50 dark:bg-green-900 border border-green-200 dark:border-green-700 rounded-md p-2">
                <p className="text-green-800 dark:text-green-200 text-center">
                  {formData.id 
                    ? "El área ha sido actualizada correctamente" 
                    : "Nueva área registrada exitosamente"}
                </p>
              </div>
            </div>
            <div className="bg-gray-50 dark:bg-gray-700 px-3 py-2 rounded-b-lg">
              <p className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Redirigiendo en 3 segundos...
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default AreaRegistration