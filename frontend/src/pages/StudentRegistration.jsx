import { useState, useEffect } from "react";
import { X, Check, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import PaymentUpload from "../components/PaymentUpload";

const StudentRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  const [formData, setFormData] = useState({
    // Datos del estudiante
    email: "",
    lastName: "",
    firstName: "",
    ci: "",
    birthDate: "",
    // Datos de contacto (se llenan según es mayor de edad o no)
    contactName: "",
    contactEmail: "",
    contactPhone: "",
    contactRelation: "Estudiante", // Estudiante, Padre/Madre, Tutor
    // Datos educativos
    school: "",
    grade: "",
    department: "Cochabamba",
    province: "",
    area: location.state?.area || "",
    category: "",
    paymentProof: null
  });

  const [uiState, setUiState] = useState({
    isSubmitting: false,
    showSuccessModal: false,
    isAdult: false // Calculado a partir de birthDate
  });

  const [errors, setErrors] = useState({});

  // Efecto para calcular si es mayor de edad
  useEffect(() => {
    if (formData.birthDate) {
      const birthDate = new Date(formData.birthDate);
      const today = new Date();
      const age = today.getFullYear() - birthDate.getFullYear();
      const monthDiff = today.getMonth() - birthDate.getMonth();
      
      const isAdult = age > 18 || (age === 18 && monthDiff >= 0);
      setUiState(prev => ({ ...prev, isAdult }));
      
      // Si es mayor de edad, establecer datos de contacto como los del estudiante
      if (isAdult) {
        setFormData(prev => ({
          ...prev,
          contactRelation: "Estudiante",
          contactName: `${prev.firstName} ${prev.lastName}`,
          contactEmail: prev.email,
          contactPhone: prev.phone
        }));
      }
    }
  }, [formData.birthDate, formData.firstName, formData.lastName, formData.email]);

  // Datos estáticos
  const departmentOptions = ["Cochabamba", "La Paz", "Santa Cruz", "Oruro", "Potosí", "Chuquisaca", "Tarija", "Beni", "Pando"];
  
  const provinceOptions = {
    "Cochabamba": ["Cercado", "Quillacollo", "Chapare", "Ayopaya", "Esteban Arce", "Arani", "Arque", "Capinota", "Germán Jordán", "Mizque", "Punata", "Tiraque"],
    // ... otras provincias
  };

  const [availableAreas] = useState([
    "ASTRONOMÍA - ASTROFÍSICA",
    "BIOLOGÍA",
    "FÍSICA",
    "INFORMÁTICA",
    "MATEMÁTICAS",
    "QUÍMICA",
    "ROBÓTICA"
  ]);

  const areaToCategories = {
    "ASTRONOMÍA - ASTROFÍSICA": ["3P", "4P", "5P", "6P", "1S", "2S", "3S", "4S", "5S", "6S"],
    "BIOLOGÍA": ["2S", "3S", "4S", "5S", "6S"],
    "FÍSICA": ["4S", "5S", "6S"],
    "INFORMÁTICA": ["Guacamayo", "Guanaco", "Londra", "Jucumari", "Bufeo", "Puma"],
    "MATEMÁTICAS": ["Primer Nivel", "Segundo Nivel", "Tercer Nivel", "Cuarto Nivel", "Quinto Nivel", "Sexto Nivel"],
    "QUÍMICA": ["2S", "3S", "4S", "5S", "6S"],
    "ROBÓTICA": ["Builders P", "Builders S", "Lego P", "Lego S"]
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));

    if (name === "area") {
      setFormData(prev => ({ ...prev, category: "" }));
    }

    if (name === "department") {
      setFormData(prev => ({ ...prev, province: "" }));
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, paymentProof: "El archivo no debe exceder 5MB" }));
        return;
      }
      if (!['image/jpeg', 'image/png', 'application/pdf'].includes(file.type)) {
        setErrors(prev => ({ ...prev, paymentProof: "Formato no válido (solo JPG, PNG o PDF)" }));
        return;
      }
      
      setFormData(prev => ({ ...prev, paymentProof: file }));
      setErrors(prev => ({ ...prev, paymentProof: "" }));
    }
  };

  const handleRemoveFile = () => {
    setFormData(prev => ({ ...prev, paymentProof: null }));
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Validación de datos del estudiante
    if (!formData.email) newErrors.email = "Correo electrónico requerido";
    if (!formData.lastName) newErrors.lastName = "Apellidos requeridos";
    if (!formData.firstName) newErrors.firstName = "Nombres requeridos";
    if (!formData.ci) newErrors.ci = "CI requerido";
    if (!formData.birthDate) newErrors.birthDate = "Fecha de nacimiento requerida";
    
    // Validación de datos de contacto
    if (!formData.contactName) newErrors.contactName = "Nombre de contacto requerido";
    if (!formData.contactEmail) newErrors.contactEmail = "Correo de contacto requerido";
    if (!formData.contactPhone) newErrors.contactPhone = "Teléfono de contacto requerido";
    
    // Validación de datos educativos
    if (!formData.school) newErrors.school = "Colegio requerido";
    if (!formData.grade) newErrors.grade = "Curso requerido";
    if (!formData.department) newErrors.department = "Departamento requerido";
    if (!formData.province) newErrors.province = "Provincia requerida";
    if (!formData.area) newErrors.area = "Área requerida";
    if (!formData.category) newErrors.category = "Categoría requerida";
    if (!formData.paymentProof) newErrors.paymentProof = "Comprobante de pago requerido";
    
    // Validaciones de formato
    if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
      newErrors.email = "Correo electrónico inválido";
    }
    
    if (formData.contactEmail && !/^\S+@\S+\.\S+$/.test(formData.contactEmail)) {
      newErrors.contactEmail = "Correo electrónico inválido";
    }
    
    if (formData.ci && !/^\d+$/.test(formData.ci)) {
      newErrors.ci = "CI debe contener solo números";
    }
    
    if (formData.contactPhone && !/^[0-9+]+$/.test(formData.contactPhone)) {
      newErrors.contactPhone = "Teléfono inválido";
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;
    
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Simular envío a la API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      setUiState(prev => ({ ...prev, showSuccessModal: true }));
      
      // Resetear formulario
      setFormData({
        email: "",
        lastName: "",
        firstName: "",
        ci: "",
        birthDate: "",
        contactName: "",
        contactEmail: "",
        contactPhone: "",
        contactRelation: "Estudiante",
        school: "",
        grade: "",
        department: "Cochabamba",
        province: "",
        area: location.state?.area || "",
        category: "",
        paymentProof: null
      });
      
    } catch (error) {
      console.error("Error al enviar postulación:", error);
    } finally {
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-6">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          Formulario de Postulación
        </h1>
        <div className="w-24"></div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">
            Complete los datos para postular a la Olimpiada
          </h2>
          <p className="text-sm text-gray-600 mt-1">
            Todos los campos marcados con <span className="text-red-500">*</span> son obligatorios.
          </p>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6">
          <div className="space-y-6">
            {/* Sección 1: Datos personales del estudiante */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Datos personales del estudiante
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="email"
                    value={formData.email}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.email ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="ejemplo@correo.com"
                  />
                  {errors.email && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.email}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Apellidos <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.lastName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Apellidos completos"
                  />
                  {errors.lastName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.lastName}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombres <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.firstName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nombres completos"
                  />
                  {errors.firstName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.firstName}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Carnet de Identidad <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="ci"
                    value={formData.ci}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.ci ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Número de CI"
                  />
                  {errors.ci && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.ci}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Fecha de Nacimiento <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="date"
                    name="birthDate"
                    value={formData.birthDate}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.birthDate ? "border-red-500" : "border-gray-300"
                    }`}
                  />
                  {errors.birthDate && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.birthDate}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sección 2: Datos de contacto */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Datos de contacto {uiState.isAdult ? "(Estudiante mayor de edad)" : "(Padre/Madre/Tutor)"}
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {!uiState.isAdult && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Relación con el estudiante <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="contactRelation"
                      value={formData.contactRelation}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                      <option value="Padre/Madre">Padre/Madre</option>
                      <option value="Tutor">Tutor</option>
                    </select>
                  </div>
                )}
                
                <div className={uiState.isAdult ? "md:col-span-2" : ""}>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Nombre completo {uiState.isAdult ? "del estudiante" : "del contacto"} <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="contactName"
                    value={formData.contactName}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contactName ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder={`Nombre completo ${uiState.isAdult ? "del estudiante" : "del contacto"}`}
                    readOnly={uiState.isAdult}
                  />
                  {errors.contactName && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.contactName}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Correo electrónico de contacto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    name="contactEmail"
                    value={formData.contactEmail}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contactEmail ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="correo@contacto.com"
                    readOnly={uiState.isAdult}
                  />
                  {errors.contactEmail && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.contactEmail}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Teléfono de contacto <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    name="contactPhone"
                    value={formData.contactPhone}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.contactPhone ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Número de contacto"
                  />
                  {errors.contactPhone && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.contactPhone}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sección 3: Datos educativos */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Datos educativos
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Colegio <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="school"
                    value={formData.school}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.school ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Nombre del colegio"
                  />
                  {errors.school && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.school}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Curso <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="grade"
                    value={formData.grade}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.grade ? "border-red-500" : "border-gray-300"
                    }`}
                    placeholder="Ej: 5to de secundaria"
                  />
                  {errors.grade && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.grade}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Departamento <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="department"
                    value={formData.department}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.department ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccione departamento</option>
                    {departmentOptions.map((depto, index) => (
                      <option key={index} value={depto}>{depto}</option>
                    ))}
                  </select>
                  {errors.department && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.department}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Provincia <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="province"
                    value={formData.province}
                    onChange={handleChange}
                    disabled={!formData.department}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.province ? "border-red-500" : "border-gray-300"
                    } ${
                      !formData.department ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">{formData.department ? "Seleccione provincia" : "Seleccione departamento primero"}</option>
                    {formData.department && provinceOptions[formData.department]?.map((prov, index) => (
                      <option key={index} value={prov}>{prov}</option>
                    ))}
                  </select>
                  {errors.province && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.province}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sección 4: Área de competencia */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Área de competencia
              </h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Área de competencia <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="area"
                    value={formData.area}
                    onChange={handleChange}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.area ? "border-red-500" : "border-gray-300"
                    }`}
                  >
                    <option value="">Seleccione área</option>
                    {availableAreas.map((area, index) => (
                      <option key={index} value={area}>{area}</option>
                    ))}
                  </select>
                  {errors.area && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.area}
                    </p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Categoría/Nivel <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    disabled={!formData.area}
                    className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                      errors.category ? "border-red-500" : "border-gray-300"
                    } ${
                      !formData.area ? "bg-gray-100 cursor-not-allowed" : ""
                    }`}
                  >
                    <option value="">{formData.area ? "Seleccione categoría" : "Seleccione área primero"}</option>
                    {formData.area && areaToCategories[formData.area]?.map((cat, index) => (
                      <option key={index} value={cat}>{cat}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600 flex items-center">
                      <X className="h-4 w-4 mr-1" />
                      {errors.category}
                    </p>
                  )}
                </div>
              </div>
            </div>
            
            {/* Sección 5: Comprobante de pago */}
            <div>
              <h3 className="text-md font-medium text-gray-900 mb-4 pb-2 border-b border-gray-200">
                Comprobante de pago
              </h3>
              
              <PaymentUpload 
                paymentProof={formData.paymentProof}
                handleFileChange={handleFileChange}
                errors={errors}
                onRemoveFile={handleRemoveFile}
              />
            </div>
          </div>

          <div className="mt-8 flex justify-center">
            <button
              type="submit"
              disabled={uiState.isSubmitting}
              className={`px-6 py-3 text-base font-medium text-white rounded-md transition-colors ${
                uiState.isSubmitting
                  ? "bg-blue-400 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700"
              }`}
            >
              {uiState.isSubmitting ? "Enviando postulación..." : "Enviar Postulación"}
            </button>
          </div>
        </form>
      </div>

      {uiState.showSuccessModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl animate-fade-in">
            <div className="flex items-center justify-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Postulación enviada
              </h3>
              <div className="mt-2 text-sm text-gray-500">
                Tu postulación ha sido registrada correctamente.
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="w-full px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-500"
                onClick={() => setUiState(prev => ({ ...prev, showSuccessModal: false }))}
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

export default StudentRegistration;