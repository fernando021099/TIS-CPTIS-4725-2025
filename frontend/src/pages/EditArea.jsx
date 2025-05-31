import { useState, useEffect } from "react";
import { X, Check, ArrowLeft, List, Save } from "lucide-react";
import { useNavigate, useParams } from "react-router-dom";
import { api } from '../api/apiClient';
import LoadingSpinner from '../components/common/LoadingSpinner'; // Asumiendo que tienes este componente

const EditArea = () => {
  const navigate = useNavigate();
  const { id } = useParams(); // Obtener el ID del área de la URL

  const [formData, setFormData] = useState({
    nombre: "",
    categoria: "",
    costo: "",
    descripcion: "",
    estado: "activo",
    modo: "", // Campo "modo" restaurado en el estado
  });

  const [uiState, setUiState] = useState({
    isSubmitting: false,
    isLoading: true,
    showSuccessModal: false,
  });

  const [errors, setErrors] = useState({});
  const [connectionStatus, setConnectionStatus] = useState({ message: "", type: "" });
  
  // Para las opciones de select (si se necesitan cargar dinámicamente como en AreaRegistration)
  // const [areaOptions, setAreaOptions] = useState([]); 
  // const [areaToLevels, setAreaToLevels] = useState({});

  useEffect(() => {
    const fetchAreaDetails = async () => {
      setUiState(prev => ({ ...prev, isLoading: true }));
      try {
        const response = await api.get(`/areas/${id}`);
        const area = response;
        setFormData({
          nombre: area.nombre || "",
          categoria: area.categoria || "",
          costo: area.costo?.toString() || "",
          descripcion: area.descripcion || "",
          estado: area.estado || "activo",
          modo: area.modo || "", // Campo "modo" restaurado
        });
        setUiState(prev => ({ ...prev, isLoading: false }));
      } catch (error) {
        console.error("Error cargando detalles del área:", error);
        setConnectionStatus({ 
          message: `Error al cargar datos del área: ${error.response?.data?.message || error.message}`, 
          type: "error" 
        });
        setUiState(prev => ({ ...prev, isLoading: false }));
        navigate('/areas'); // Redirigir si no se puede cargar
      }
    };

    if (id) {
      fetchAreaDetails();
    }
    // Aquí podrías cargar también las opciones para los selects si fueran dinámicos
    // y no quieres que el usuario edite 'nombre' y 'categoria' como texto libre
    // si ya existen en otras áreas. Por simplicidad, aquí se asume edición directa.
  }, [id, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Validación (similar a AreaRegistration, pero adaptada para edición)
  useEffect(() => {
    const newErrors = {};
    if (!formData.nombre.trim()) newErrors.nombre = "Nombre de área requerido";
    if (!formData.categoria.trim()) newErrors.categoria = "Categoría/Nivel requerido";
    if (!formData.costo || Number(formData.costo) < 0) newErrors.costo = "Costo inválido (no puede ser negativo)";
    if (Number(formData.costo) > 100000) newErrors.costo = "Costo demasiado alto";
    if (formData.descripcion && formData.descripcion.length > 1000) {
      newErrors.description = "La descripción no puede exceder los 1000 caracteres";
    }
    if (!['activo', 'inactivo'].includes(formData.estado)) newErrors.estado = "Estado inválido";
    if (formData.modo && formData.modo.length > 20) newErrors.modo = "El modo no puede exceder los 20 caracteres";


    setErrors(newErrors);
  }, [formData]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (Object.keys(errors).length > 0) {
      setConnectionStatus({ message: "Por favor corrija los errores del formulario.", type: "error" });
      return;
    }
    
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    setConnectionStatus({ message: "", type: "" });
    
    try {
      const areaData = {
        nombre: formData.nombre.trim(),
        categoria: formData.categoria.trim(),
        costo: Number(formData.costo),
        descripcion: formData.descripcion.trim() || null,
        estado: formData.estado,
        modo: formData.modo.trim() || null, // Campo "modo" restaurado en el payload
      };

      await api.put(`/areas/${id}`, areaData);
      
      setConnectionStatus({ 
        message: "Área actualizada correctamente.",
        type: "success" 
      });
      
      setUiState(prev => ({ ...prev, showSuccessModal: true, isSubmitting: false }));

      setTimeout(() => {
        setUiState(prev => ({ ...prev, showSuccessModal: false }));
        navigate('/areas');
      }, 2000);

    } catch (error) {
      console.error("Error al actualizar área:", error);
      const errorMsg = error.response?.data?.errors 
        ? Object.values(error.response.data.errors).flat().join(' ') 
        : (error.response?.data?.message || error.message);
      setConnectionStatus({ 
        message: `Error al actualizar área: ${errorMsg}`, 
        type: "error" 
      });
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  if (uiState.isLoading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-6 flex justify-center items-center min-h-[300px]">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate('/areas')}
          className="flex items-center text-gray-600 dark:text-gray-300 hover:text-gray-900 dark:hover:text-white"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver al listado
        </button>
        <h1 className="text-xl font-bold text-gray-900 dark:text-white">
          Editar Área (ID: {id})
        </h1>
        <button
          onClick={() => navigate('/areas')} 
          className="flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
        >
          <List className="h-5 w-5 mr-1" />
          Ver Áreas
        </button>
      </div>

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
            Modifique los datos del área
          </h2>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-4">
            {/* Campo Nombre */}
            <div>
              <label htmlFor="nombre" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Nombre <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="nombre"
                id="nombre"
                value={formData.nombre}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.nombre ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.nombre && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />{errors.nombre}
                </p>
              )}
            </div>

            {/* Campo Categoría/Nivel */}
            <div>
              <label htmlFor="categoria" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Categoría/Nivel <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                name="categoria"
                id="categoria"
                value={formData.categoria}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.categoria ? "border-red-500" : "border-gray-300"
                }`}
              />
              {errors.categoria && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />{errors.categoria}
                </p>
              )}
            </div>
            
            {/* Campo Costo y Estado en una fila */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="costo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Costo (Bs.) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500 dark:text-gray-400">
                    Bs.
                  </span>
                  <input
                    type="number"
                    name="costo"
                    id="costo"
                    value={formData.costo}
                    onChange={handleChange}
                    step="1" // Costo es INT en BD
                    min="0"
                    className={`pl-10 w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                      errors.costo ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="0"
                  />
                </div>
                {errors.costo && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />{errors.costo}
                  </p>
                )}
              </div>
              <div>
                <label htmlFor="estado" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Estado <span className="text-red-500">*</span>
                </label>
                <select
                  name="estado"
                  id="estado"
                  value={formData.estado}
                  onChange={handleChange}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                    errors.estado ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  <option value="activo">Activo</option>
                  <option value="inactivo">Inactivo</option>
                </select>
                {errors.estado && (
                  <p className="mt-1 text-sm text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />{errors.estado}
                  </p>
                )}
              </div>
            </div>

            {/* Campo Descripción */}
            <div>
              <label htmlFor="descripcion" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Descripción (opcional)
              </label>
              <textarea
                name="descripcion"
                id="descripcion"
                value={formData.descripcion}
                onChange={handleChange}
                rows={3}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.descripcion ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Descripción breve del área"
              />
              {errors.descripcion && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />{errors.descripcion}
                </p>
              )}
            </div>

            {/* Campo Modo (opcional, si se necesita editar) - RESTAURADO */}
            <div>
              <label htmlFor="modo" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Modo (opcional)
              </label>
              <input
                type="text"
                name="modo"
                id="modo"
                value={formData.modo}
                onChange={handleChange}
                className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:text-white ${
                  errors.modo ? "border-red-500" : "border-gray-300"
                }`}
                placeholder="Ej: normal, unico"
              />
              {errors.modo && (
                <p className="mt-1 text-sm text-red-600 flex items-center">
                  <X className="h-4 w-4 mr-1" />{errors.modo}
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 flex justify-end space-x-3">
            <button
              type="button"
              onClick={() => navigate('/areas')}
              className="px-4 py-2 text-sm font-medium text-gray-700 dark:text-gray-200 bg-gray-100 dark:bg-gray-700 rounded-md hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={Object.keys(errors).length > 0 || uiState.isSubmitting}
              className={`px-4 py-2 text-sm font-medium text-white rounded-md transition-colors flex items-center justify-center ${
                Object.keys(errors).length > 0 || uiState.isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              <Save className="h-4 w-4 mr-2" />
              {uiState.isSubmitting ? "Guardando..." : "Guardar Cambios"}
            </button>
          </div>
        </form>
      </div>

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
                Área Actualizada
              </h3>
              <div className="mt-2 text-sm text-gray-500 dark:text-gray-400">
                Los cambios en el área se han guardado correctamente.
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300"
                onClick={() => {
                  setUiState(prev => ({ ...prev, showSuccessModal: false }));
                  navigate('/areas');
                }}
              >
                Aceptar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EditArea;
