// src/pages/AreaRegistration.jsx
"use client"

import { useState, useEffect } from "react"
import { X, Edit, Trash2, ChevronLeft, ChevronRight } from "lucide-react"

const AreaRegistration = () => {
  // State for form fields
  const [formData, setFormData] = useState({
    name: "",
    level: "",
    cost: "",
    description: "",
  })

  // State management
  const [errors, setErrors] = useState({})
  const [isFormValid, setIsFormValid] = useState(false)
  const [areas, setAreas] = useState([
    { id: 1, name: "Matemáticas", level: "Básico", cost: 50, description: "Fundamentos de matemáticas" },
    { id: 2, name: "Robótica", level: "Intermedio", cost: 75, description: "Introducción a la robótica" },
    { id: 3, name: "Física", level: "Avanzado", cost: 100, description: "Física avanzada" },
  ])
  const [showModal, setShowModal] = useState(false)
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 10

  // Form validation
  useEffect(() => {
    const newErrors = {}
    if (!formData.name.trim()) newErrors.name = "Nombre requerido"
    if (!formData.level) newErrors.level = "Seleccione un nivel"
    if (!formData.cost || Number(formData.cost) <= 0) newErrors.cost = "Costo inválido"
    
    setErrors(newErrors)
    setIsFormValid(Object.keys(newErrors).length === 0)
  }, [formData])

  // Handlers
  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData(prev => ({ ...prev, [name]: value }))
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    if (!isFormValid) return

    const newArea = {
      id: areas.length + 1,
      name: formData.name,
      level: formData.level,
      cost: Number(formData.cost),
      description: formData.description,
    }

    setAreas([...areas, newArea])
    setShowModal(true)
    setFormData({ name: "", level: "", cost: "", description: "" })
    
    setTimeout(() => setShowModal(false), 3000)
  }

  const handleDelete = (id) => {
    setAreas(areas.filter(area => area.id !== id))
  }

  const handleEdit = (area) => {
    setFormData({
      name: area.name,
      level: area.level,
      cost: area.cost.toString(),
      description: area.description || "",
    })
    setAreas(areas.filter(a => a.id !== area.id))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Pagination
  const indexOfLastItem = currentPage * itemsPerPage
  const indexOfFirstItem = indexOfLastItem - itemsPerPage
  const currentAreas = areas.slice(indexOfFirstItem, indexOfLastItem)
  const totalPages = Math.ceil(areas.length / itemsPerPage)

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header Section */}
      <div className="bg-white border-b border-gray-200 py-6 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 flex items-center">
            <span className="bg-red-600 rounded-full p-2 mr-3">
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-white" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M10 3a1 1 0 00-1 1v5H4a1 1 0 100 2h5v5a1 1 0 102 0v-5h5a1 1 0 100-2h-5V4a1 1 0 00-1-1z" clipRule="evenodd"/>
              </svg>
            </span>
            Registro de Áreas
          </h1>
          <p className="text-gray-600 mt-1">Sistema de Olimpiadas Oh! SanSi</p>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
        {/* Form Card */}
        <div className="bg-white shadow-md rounded-lg mb-8 overflow-hidden border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Formulario de Registro</h2>
          </div>
          
          <div className="p-6">
            <form onSubmit={handleSubmit}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Name Field */}
                <div>
                  <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre del área <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="text"
                    id="name"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.name ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.name && <p className="mt-1 text-sm text-red-600">{errors.name}</p>}
                </div>

                {/* Level Field */}
                <div>
                  <label htmlFor="level" className="block text-sm font-medium text-gray-700 mb-1">
                    Nivel <span className="text-red-600">*</span>
                  </label>
                  <select
                    id="level"
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.level ? "border-red-500" : "border-gray-300"}`}
                  >
                    <option value="">Seleccione un nivel</option>
                    <option value="Básico">Básico</option>
                    <option value="Intermedio">Intermedio</option>
                    <option value="Avanzado">Avanzado</option>
                  </select>
                  {errors.level && <p className="mt-1 text-sm text-red-600">{errors.level}</p>}
                </div>

                {/* Cost Field */}
                <div>
                  <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                    Costo (Bs.) <span className="text-red-600">*</span>
                  </label>
                  <input
                    type="number"
                    id="cost"
                    name="cost"
                    value={formData.cost}
                    onChange={handleChange}
                    step="0.01"
                    min="0"
                    className={`w-full px-4 py-2 border rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.cost ? "border-red-500" : "border-gray-300"}`}
                  />
                  {errors.cost && <p className="mt-1 text-sm text-red-600">{errors.cost}</p>}
                </div>

                {/* Description Field */}
                <div className="md:col-span-2">
                  <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
                    Descripción (opcional)
                  </label>
                  <textarea
                    id="description"
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    rows={3}
                    className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Form Actions */}
              <div className="mt-6 flex justify-end">
                <button
                  type="submit"
                  disabled={!isFormValid}
                  className={`px-6 py-2 rounded-md text-white font-medium transition-colors ${isFormValid ? "bg-blue-600 hover:bg-blue-700" : "bg-gray-400 cursor-not-allowed"}`}
                >
                  Guardar Área
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* Areas Table Card */}
        <div className="bg-white shadow-md rounded-lg overflow-hidden border border-gray-200">
          <div className="px-6 py-5 border-b border-gray-200">
            <h2 className="text-lg font-semibold text-gray-900">Áreas Registradas</h2>
          </div>
          
          <div className="p-6">
            {areas.length > 0 ? (
              <>
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nombre</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Nivel</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Costo (Bs.)</th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Acciones</th>
                      </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                      {currentAreas.map((area) => (
                        <tr key={area.id} className="hover:bg-gray-50">
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="font-medium text-gray-900">{area.name}</div>
                            {area.description && (
                              <div className="text-sm text-gray-500 truncate max-w-xs">{area.description}</div>
                            )}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{area.level}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{area.cost.toFixed(2)}</td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                            <div className="flex space-x-2">
                              <button
                                onClick={() => handleEdit(area)}
                                className="text-blue-600 hover:text-blue-800 flex items-center"
                              >
                                <Edit className="h-4 w-4 mr-1" /> Editar
                              </button>
                              <button
                                onClick={() => handleDelete(area.id)}
                                className="text-red-600 hover:text-red-800 flex items-center"
                              >
                                <Trash2 className="h-4 w-4 mr-1" /> Eliminar
                              </button>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="mt-6 flex items-center justify-between">
                    <div className="text-sm text-gray-700">
                      Mostrando <span className="font-medium">{indexOfFirstItem + 1}</span> a{' '}
                      <span className="font-medium">{Math.min(indexOfLastItem, areas.length)}</span> de{' '}
                      <span className="font-medium">{areas.length}</span> áreas
                    </div>
                    
                    <div className="flex space-x-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                        disabled={currentPage === 1}
                        className={`px-3 py-1 rounded-md border ${currentPage === 1 ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        <ChevronLeft className="h-5 w-5" />
                      </button>
                      
                      {Array.from({ length: totalPages }, (_, i) => (
                        <button
                          key={i}
                          onClick={() => setCurrentPage(i + 1)}
                          className={`px-3 py-1 rounded-md border ${currentPage === i + 1 ? 'bg-blue-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                        >
                          {i + 1}
                        </button>
                      ))}
                      
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                        disabled={currentPage === totalPages}
                        className={`px-3 py-1 rounded-md border ${currentPage === totalPages ? 'bg-gray-100 text-gray-400 cursor-not-allowed' : 'bg-white text-gray-700 hover:bg-gray-50'}`}
                      >
                        <ChevronRight className="h-5 w-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="text-center py-8">
                <p className="text-gray-500">No hay áreas registradas</p>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* Success Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-bold text-gray-900">Éxito</h3>
              <button 
                onClick={() => setShowModal(false)} 
                className="text-gray-400 hover:text-gray-500"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="mb-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-4">
                <p className="text-green-800 text-center">Área registrada correctamente</p>
              </div>
            </div>
            <div className="bg-gray-50 px-4 py-3 rounded-b-lg">
              <p className="text-sm text-gray-500 text-center">
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