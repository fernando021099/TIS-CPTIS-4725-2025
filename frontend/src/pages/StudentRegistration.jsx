import { useState, useEffect } from "react";
import { X, Check, ArrowLeft } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";

const StudentRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado para controlar las secciones activas
  const [currentSection, setCurrentSection] = useState(1);
  const [completedSections, setCompletedSections] = useState([]);
  
  const [formData, setFormData] = useState({
    // Datos del estudiante
    email: "",
    lastName: "",
    firstName: "",
    ci: "",
    birthDate: "",
    // Datos del tutor (siempre requeridos)
    tutorName: "",
    tutorEmail: "",
    tutorPhone: "",
    tutorRelation: "Padre/Madre",
    // Datos educativos
    school: "",
    grade: "",
    department: "Cochabamba",
    province: "",
    area: location.state?.area || "",
    category: "",
    // Para manejar múltiples áreas (máximo 2)
    areas: location.state?.area ? [location.state.area] : []
  });

  const [uiState, setUiState] = useState({
    isSubmitting: false,
    showSuccessModal: false,
    showPaymentModal: false,
    paymentData: null
  });

  const [errors, setErrors] = useState({});

  /* 
  API SUGERIDA: Obtener departamentos desde el backend
  Endpoint: GET /api/departments
  Descripción: Devuelve la lista de departamentos disponibles
  Ejemplo de implementación:
  
  useEffect(() => {
    const fetchDepartments = async () => {
      try {
        const response = await fetch('/api/departments');
        const data = await response.json();
        // Actualizar departmentOptions con los datos recibidos
      } catch (error) {
        console.error("Error al obtener departamentos:", error);
      }
    };
    fetchDepartments();
  }, []);
  */
  const departmentOptions = ["Cochabamba", "La Paz", "Santa Cruz", "Oruro", "Potosí", "Chuquisaca", "Tarija", "Beni", "Pando"];
  
  /* 
  API SUGERIDA: Obtener provincias por departamento desde el backend
  Endpoint: GET /api/provinces?department=<department>
  Descripción: Devuelve las provincias para un departamento específico
  Ejemplo de implementación:
  
  const fetchProvinces = async (department) => {
    try {
      const response = await fetch(`/api/provinces?department=${department}`);
      const data = await response.json();
      // Actualizar provinceOptions con los datos recibidos
    } catch (error) {
      console.error("Error al obtener provincias:", error);
    }
  };
  */
  const provinceOptions = {
    "Cochabamba": ["Cercado", "Quillacollo", "Chapare", "Ayopaya", "Esteban Arce", "Arani", "Arque", "Capinota", "Germán Jordán", "Mizque", "Punata", "Tiraque"],
    // ... otras provincias
  };

  /* 
  API SUGERIDA: Obtener áreas disponibles desde el backend
  Endpoint: GET /api/competition-areas
  Descripción: Devuelve las áreas de competencia disponibles
  Ejemplo de implementación:
  
  const [availableAreas, setAvailableAreas] = useState([]);
  
  useEffect(() => {
    const fetchAreas = async () => {
      try {
        const response = await fetch('/api/competition-areas');
        const data = await response.json();
        setAvailableAreas(data);
      } catch (error) {
        console.error("Error al obtener áreas:", error);
      }
    };
    fetchAreas();
  }, []);
  */
  const [availableAreas] = useState([
    "ASTRONOMÍA - ASTROFÍSICA",
    "BIOLOGÍA",
    "FÍSICA",
    "INFORMÁTICA",
    "MATEMÁTICAS",
    "QUÍMICA",
    "ROBÓTICA"
  ]);

  /* 
  API SUGERIDA: Obtener categorías por área desde el backend
  Endpoint: GET /api/competition-categories?area=<area>
  Descripción: Devuelve las categorías disponibles para un área específica
  Ejemplo de implementación:
  
  const fetchCategories = async (area) => {
    try {
      const response = await fetch(`/api/competition-categories?area=${area}`);
      const data = await response.json();
      // Actualizar areaToCategories con los datos recibidos
    } catch (error) {
      console.error("Error al obtener categorías:", error);
    }
  };
  */
  const areaToCategories = {
    "ASTRONOMÍA - ASTROFÍSICA": ["3P", "4P", "5P", "6P", "1S", "2S", "3S", "4S", "5S", "6S"],
    "BIOLOGÍA": ["2S", "3S", "4S", "5S", "6S"],
    "FÍSICA": ["4S", "5S", "6S"],
    "INFORMÁTICA": ["Guacamayo", "Guanaco", "Londra", "Jucumari", "Bufeo", "Puma"],
    "MATEMÁTICAS": ["Primer Nivel", "Segundo Nivel", "Tercer Nivel", "Cuarto Nivel", "Quinto Nivel", "Sexto Nivel"],
    "QUÍMICA": ["2S", "3S", "4S", "5S", "6S"],
    "ROBÓTICA": ["Builders P", "Builders S", "Lego P", "Lego S"]
  };

  /* 
  API SUGERIDA: Validar CI (opcional)
  Endpoint: POST /api/validate-ci
  Descripción: Verifica si el CI ya está registrado en el sistema
  Ejemplo de implementación:
  
  const validateCI = async (ci) => {
    try {
      const response = await fetch('/api/validate-ci', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ ci })
      });
      const data = await response.json();
      return data.isValid; // Asumiendo que el endpoint devuelve { isValid: boolean }
    } catch (error) {
      console.error("Error al validar CI:", error);
      return true; // En caso de error, asumir que es válido
    }
  };
  */

  // Validar sección actual
  const validateSection = (section) => {
    const newErrors = {};
    
    if (section === 1) {
      // Validación de datos del estudiante
      if (!formData.email) newErrors.email = "Correo electrónico requerido";
      if (!formData.lastName) newErrors.lastName = "Apellidos requeridos";
      if (!formData.firstName) newErrors.firstName = "Nombres requeridos";
      if (!formData.ci) newErrors.ci = "CI requerido";
      if (!formData.birthDate) newErrors.birthDate = "Fecha de nacimiento requerida";
      
      // Validaciones de formato
      if (formData.email && !/^\S+@\S+\.\S+$/.test(formData.email)) {
        newErrors.email = "Correo electrónico inválido";
      }
      
      if (formData.ci && !/^\d+$/.test(formData.ci)) {
        newErrors.ci = "CI debe contener solo números";
      }
    }
    
    if (section === 2) {
      // Validación de datos del tutor
      if (!formData.tutorName) newErrors.tutorName = "Nombre del tutor requerido";
      if (!formData.tutorEmail) newErrors.tutorEmail = "Correo del tutor requerido";
      if (!formData.tutorPhone) newErrors.tutorPhone = "Teléfono del tutor requerido";
      
      if (formData.tutorEmail && !/^\S+@\S+\.\S+$/.test(formData.tutorEmail)) {
        newErrors.tutorEmail = "Correo electrónico inválido";
      }
      
      if (formData.tutorPhone && !/^[0-9+]+$/.test(formData.tutorPhone)) {
        newErrors.tutorPhone = "Teléfono inválido";
      }
    }
    
    if (section === 3) {
      // Validación de datos educativos
      if (!formData.school) newErrors.school = "Colegio requerido";
      if (!formData.grade) newErrors.grade = "Curso requerido";
      if (!formData.department) newErrors.department = "Departamento requerido";
      if (!formData.province) newErrors.province = "Provincia requerida";
      
      // Validación de áreas de competencia
      if (formData.areas.length === 0) {
        newErrors.areas = "Debe seleccionar al menos un área";
      } else if (formData.areas.length > 2) {
        newErrors.areas = "Máximo 2 áreas por postulante";
      }
      
      // Validación específica para Robótica e Informática
      const hasRobotics = formData.areas.includes("ROBÓTICA");
      const hasInformatics = formData.areas.includes("INFORMÁTICA");
      
      if (hasRobotics && formData.areas.length > 1) {
        newErrors.areas = "Si postulas a ROBÓTICA, no puedes postular a otra área";
      }
      
      if (hasInformatics && hasRobotics) {
        newErrors.areas = "No puedes postular a INFORMÁTICA y ROBÓTICA simultáneamente";
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
    
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));

    if (name === "department") {
      setFormData(prev => ({ ...prev, province: "" }));
      /* 
      Llamar a API de provincias cuando se selecciona un departamento
      fetchProvinces(value);
      */
    }

    if (name === "area") {
      setFormData(prev => ({ ...prev, category: "" }));
      /* 
      Llamar a API de categorías cuando se selecciona un área
      fetchCategories(value);
      */
    }
  };

  const handleAreaSelection = (area) => {
    setErrors(prev => ({ ...prev, areas: "" }));
    
    setFormData(prev => {
      // Si el área ya está seleccionada, la quitamos
      if (prev.areas.includes(area)) {
        return {
          ...prev,
          areas: prev.areas.filter(a => a !== area),
          area: prev.area === area ? "" : prev.area,
          category: prev.area === area ? "" : prev.category
        };
      }
      
      // Si no está seleccionada y hay menos de 2, la agregamos
      if (prev.areas.length < 2) {
        return {
          ...prev,
          areas: [...prev.areas, area],
          area: prev.areas.length === 0 ? area : prev.area // Auto-seleccionar para edición
        };
      }
      
      return prev;
    });
  };

  const goToNextSection = () => {
    if (validateSection(currentSection)) {
      setCompletedSections(prev => [...prev, currentSection]);
      setCurrentSection(prev => prev + 1);
    }
  };

  const goToPreviousSection = () => {
    setCurrentSection(prev => prev - 1);
  };

  /* 
  API PRINCIPAL: Enviar formulario de registro
  Endpoint: POST /api/student-registration
  Descripción: Registra al estudiante en el sistema
  Body: Todos los datos del formulario (formData)
  Response: { success: boolean, message: string, registrationId?: string, paymentData?: {...} }
  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateSection(3)) return;
    
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Simular envío a la API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      /* 
      Ejemplo de cómo sería la llamada real a la API:
      
      const response = await fetch('/api/student-registration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(formData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Error al registrar');
      }
      
      const data = await response.json();
      
      // Mostrar modal de pago con los datos recibidos
      setUiState(prev => ({ 
        ...prev, 
        showPaymentModal: true,
        paymentData: data.paymentData // Asumiendo que la API devuelve paymentData
      }));
      */
      
      // Datos simulados mientras la API no esté disponible
      const mockPaymentData = {
        registrationId: "REG-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
        amount: formData.areas.length * 15, // 15 Bs por área
        studentName: `${formData.firstName} ${formData.lastName}`,
        tutorName: formData.tutorName,
        areas: formData.areas.join(", "),
        paymentDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 días desde ahora
      };
      
      setUiState(prev => ({ 
        ...prev, 
        showPaymentModal: true,
        paymentData: mockPaymentData
      }));
      
    } catch (error) {
      console.error("Error al enviar postulación:", error);
      setErrors(prev => ({ ...prev, form: error.message }));
    } finally {
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  /* 
  API SUGERIDA: Generar PDF de orden de pago
  Endpoint: POST /api/generate-payment-pdf
  Descripción: Genera y devuelve un PDF con la orden de pago
  Body: { registrationId, studentName, tutorName, areas, amount }
  Response: PDF file
  */
  const handleDownloadPDF = () => {
    console.log("Generando PDF de orden de pago...");
    // Simulación de descarga mientras la API no esté disponible
    const link = document.createElement('a');
    link.href = '#';
    link.download = `orden_pago_${uiState.paymentData.registrationId}.pdf`;
    link.click();
    
    /*
    Ejemplo de implementación real:
    
    fetch('/api/generate-payment-pdf', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        registrationId: uiState.paymentData.registrationId,
        studentName: uiState.paymentData.studentName,
        tutorName: uiState.paymentData.tutorName,
        areas: uiState.paymentData.areas,
        amount: uiState.paymentData.amount
      })
    })
    .then(response => response.blob())
    .then(blob => {
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `orden_pago_${uiState.paymentData.registrationId}.pdf`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
    })
    .catch(error => {
      console.error("Error al generar PDF:", error);
    });
    */
  };

  /* 
  API SUGERIDA: Verificar estado de pago
  Endpoint: GET /api/payment-status/:registrationId
  Descripción: Verifica si el pago ya fue realizado
  Ejemplo de implementación:
  
  const checkPaymentStatus = async (registrationId) => {
    try {
      const response = await fetch(`/api/payment-status/${registrationId}`);
      const data = await response.json();
      return data.paid; // Asumiendo que devuelve { paid: boolean }
    } catch (error) {
      console.error("Error al verificar estado de pago:", error);
      return false;
    }
  };
  */

  /* 
  API SUGERIDA: Subir comprobante de pago
  Endpoint: POST /api/upload-payment-proof
  Descripción: Sube el comprobante de pago para validación
  Body: FormData con el archivo y registrationId
  Response: { success: boolean, message: string }
  Ejemplo de implementación:
  
  const uploadPaymentProof = async (file, registrationId) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('registrationId', registrationId);
    
    try {
      const response = await fetch('/api/upload-payment-proof', {
        method: 'POST',
        body: formData
      });
      return await response.json();
    } catch (error) {
      console.error("Error al subir comprobante:", error);
      return { success: false, message: "Error de conexión" };
    }
  };
  */

  // Sección 1: Datos personales del estudiante
  const renderStudentDataSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        1. Datos personales del estudiante
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
      
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={goToNextSection}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Siguiente: Datos del Tutor
        </button>
      </div>
    </div>
  );

  // Sección 2: Datos del tutor
  const renderTutorDataSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        2. Datos del tutor (Padre/Madre/Tutor)
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Relación con el estudiante <span className="text-red-500">*</span>
          </label>
          <select
            name="tutorRelation"
            value={formData.tutorRelation}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="Padre/Madre">Padre/Madre</option>
            <option value="Tutor">Tutor</option>
          </select>
        </div>
        
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo del tutor <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="tutorName"
            value={formData.tutorName}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.tutorName ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Nombre completo del tutor"
          />
          {errors.tutorName && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <X className="h-4 w-4 mr-1" />
              {errors.tutorName}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Correo electrónico del tutor <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="tutorEmail"
            value={formData.tutorEmail}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.tutorEmail ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="correo@tutor.com"
          />
          {errors.tutorEmail && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <X className="h-4 w-4 mr-1" />
              {errors.tutorEmail}
            </p>
          )}
        </div>
        
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Teléfono del tutor <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="tutorPhone"
            value={formData.tutorPhone}
            onChange={handleChange}
            className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
              errors.tutorPhone ? "border-red-500" : "border-gray-300"
            }`}
            placeholder="Número de contacto"
          />
          {errors.tutorPhone && (
            <p className="mt-1 text-sm text-red-600 flex items-center">
              <X className="h-4 w-4 mr-1" />
              {errors.tutorPhone}
            </p>
          )}
        </div>
      </div>
      
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={goToPreviousSection}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Anterior
        </button>
        <button
          type="button"
          onClick={goToNextSection}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Siguiente: Datos Educativos
        </button>
      </div>
    </div>
  );

  // Sección 3: Datos educativos y de competencia
  const renderEducationDataSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        3. Datos educativos y de competencia
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
      
      {/* Selección de áreas */}
      <div className="mt-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Áreas de competencia (Máximo 2) <span className="text-red-500">*</span>
        </label>
        
        {errors.areas && (
          <p className="mb-2 text-sm text-red-600 flex items-center">
            <X className="h-4 w-4 mr-1" />
            {errors.areas}
          </p>
        )}
        
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
          {availableAreas.map((area) => (
            <div 
              key={area}
              onClick={() => handleAreaSelection(area)}
              className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                formData.areas.includes(area) 
                  ? "bg-blue-50 border-blue-500" 
                  : "border-gray-300 hover:bg-gray-50"
              }`}
            >
              <div className="flex items-center">
                <input
                  type="checkbox"
                  checked={formData.areas.includes(area)}
                  readOnly
                  className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                />
                <span className="ml-2 text-sm font-medium text-gray-700">{area}</span>
              </div>
            </div>
          ))}
        </div>
        
        {/* Mostrar categorías para el área seleccionada (si solo hay una) */}
        {formData.areas.length === 1 && (
          <div className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría/Nivel para {formData.areas[0]} <span className="text-red-500">*</span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors.category ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Seleccione categoría</option>
              {areaToCategories[formData.areas[0]]?.map((cat, index) => (
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
        )}
      </div>
      
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={goToPreviousSection}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Anterior
        </button>
        <button
          type="submit"
          disabled={uiState.isSubmitting}
          className={`px-4 py-2 text-white rounded-md ${
            uiState.isSubmitting
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uiState.isSubmitting ? "Enviando..." : "Enviar Postulación"}
        </button>
      </div>
    </div>
  );

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

      {/* Indicador de pasos */}
      <div className="mb-6">
        <nav className="flex items-center justify-center">
          <ol className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <li key={step}>
                {step < currentSection || completedSections.includes(step) ? (
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                      <Check className="w-5 h-5 text-white" />
                    </span>
                    <span className="ml-2 text-sm font-medium text-blue-600">
                      {step === 1 ? "Datos Estudiante" : step === 2 ? "Datos Tutor" : "Datos Educativos"}
                    </span>
                  </div>
                ) : step === currentSection ? (
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 border-2 border-blue-600 rounded-full">
                      <span className="text-blue-600">{step}</span>
                    </span>
                    <span className="ml-2 text-sm font-medium text-blue-600">
                      {step === 1 ? "Datos Estudiante" : step === 2 ? "Datos Tutor" : "Datos Educativos"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 border-2 border-gray-300 rounded-full">
                      <span className="text-gray-500">{step}</span>
                    </span>
                    <span className="ml-2 text-sm font-medium text-gray-500">
                      {step === 1 ? "Datos Estudiante" : step === 2 ? "Datos Tutor" : "Datos Educativos"}
                    </span>
                  </div>
                )}
              </li>
            ))}
          </ol>
        </nav>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden border border-gray-200">
        <form onSubmit={handleSubmit} className="p-6">
          {currentSection === 1 && renderStudentDataSection()}
          {currentSection === 2 && renderTutorDataSection()}
          {currentSection === 3 && renderEducationDataSection()}
        </form>
      </div>

      {/* Modal de éxito */}
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

      {/* Modal de pago (simulado) */}
      {uiState.showPaymentModal && uiState.paymentData && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl animate-fade-in">
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Orden de Pago Generada
              </h3>
              <div className="mt-4 text-sm text-gray-600 text-left space-y-2">
                <p><span className="font-medium">Estudiante:</span> {uiState.paymentData.studentName}</p>
                <p><span className="font-medium">Tutor:</span> {uiState.paymentData.tutorName}</p>
                <p><span className="font-medium">Áreas:</span> {uiState.paymentData.areas}</p>
                <p><span className="font-medium">Monto a pagar:</span> {uiState.paymentData.amount} Bs.</p>
                <p><span className="font-medium">ID de Registro:</span> {uiState.paymentData.registrationId}</p>
                <p><span className="font-medium">Fecha límite de pago:</span> {uiState.paymentData.paymentDeadline.toLocaleDateString()}</p>
                
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
                  <p className="text-yellow-700 text-sm">
                    <span className="font-medium">Importante:</span> Debe presentar esta orden de pago en las cajas de la FCyT para completar su inscripción. Posteriormente, deberá subir el comprobante de pago en el sistema.
                  </p>
                </div>
              </div>
            </div>
            <div className="mt-6 flex flex-col space-y-2">
              <button
                onClick={handleDownloadPDF}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Descargar Orden de Pago (PDF)
              </button>
              <button
                onClick={() => setUiState(prev => ({ ...prev, showPaymentModal: false, showSuccessModal: true }))}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
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