import { useState, useEffect } from "react";
import { X, Check, ArrowLeft, Upload } from "lucide-react";
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
    // Para manejar múltiples áreas (máximo 2)
    areas: location.state?.area ? [location.state.area] : [],
    categories: {} // { "ÁREA": "CATEGORÍA" }
  });

  const [uiState, setUiState] = useState({
    isSubmitting: false,
    showPaymentModal: false,
    showUploadModal: false,
    paymentData: null,
    paymentProof: null,
    uploadProgress: 0
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
      // Validacion para correo electronico
      if (!formData.email) {
        newErrors.email = "Correo electrónico requerido";  // Verifica que no esté vacío
      } else {
        // Expresión regular para verificar formato de correo electrónico válido
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
      
        if (!emailRegex.test(formData.email)) {
          newErrors.email = "Formato de correo electrónico inválido"; // Rechaza formatos incorrectos
        }
      }

      //Validacion para el Apellido del estudiante 
      if (!formData.lastName) {
        newErrors.lastName = "Apellidos requeridos";
      } else {
        const onlyLettersAndSpaces = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
      
        if (!onlyLettersAndSpaces.test(formData.lastName)) {
          newErrors.lastName = "Solo se permiten letras y espacios";
        } else if (formData.lastName.length < 3 || formData.lastName.length > 50) {
          newErrors.lastName = "Los apellidos deben tener entre 3 y 50 caracteres";
        }
      }

      //Validaciones para el nombre del estudiante
      if (!formData.firstName) {
        newErrors.firstName = "Nombres requeridos";
      } else {
        const onlyLettersAndSpaces = /^[A-Za-zÁÉÍÓÚáéíóúÑñ ]+$/;
      
        if (!onlyLettersAndSpaces.test(formData.firstName)) {
          newErrors.firstName = "Solo se permiten letras y espacios";
        } else if (formData.firstName.length < 3 || formData.firstName.length > 20) {
          newErrors.firstName = "El nombre debe tener entre 3 y 20 caracteres";
        }
      }

      //Validaciones para CI
      if (!formData.ci || formData.ci.trim() === "") {
        newErrors.ci = "CI requerido";
      } else {
        const trimmedCI = formData.ci.trim();
        const onlyDigits = /^\d+$/;
      
        if (!onlyDigits.test(trimmedCI)) {
          newErrors.ci = "Solo se permiten caracteres numéricos, sin letras ni símbolos";
        } else if (trimmedCI.length < 5 || trimmedCI.length > 12) {
          newErrors.ci = "El CI debe tener entre 5 y 12 dígitos";
        }
      }
      
      // Validar fecha de nacimiento 
      if (!formData.birthDate) {
        newErrors.birthDate = "Debe ingresar una fecha válida en el formato correcto (dd/mm/aaaa)";
      } else {
        const [year, month, day] = formData.birthDate.split("-").map(Number);
        const birthDate = new Date(year, month - 1, day);
        const today = new Date();
      
        const isValidDate =
          birthDate.getFullYear() === year &&
          birthDate.getMonth() === month - 1 &&
          birthDate.getDate() === day;
      
        // Calcular edad
        let age = today.getFullYear() - birthDate.getFullYear();
        const monthDiff = today.getMonth() - birthDate.getMonth();
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
          age--;
        }
      
        if (!isValidDate) {
          newErrors.birthDate = "La fecha ingresada no es válida (puede no existir en el calendario)";
        } else if (birthDate > today) {
          newErrors.birthDate = "La fecha no puede estar en el futuro";
        } else if (age < 6 || age > 18) {
          newErrors.birthDate = "Edad fuera del rango permitido (debe tener entre 6 y 18 años)";
        }
      }
    }
    
    if (section === 2) {
      // Validación de datos del tutor
      if (!formData.tutorName) {
        newErrors.tutorName = "Nombre del tutor requerido";
      } else {
        const nameRegex = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/;
        if (!nameRegex.test(formData.tutorName)) {
          newErrors.tutorName = "El nombre solo debe contener letras y espacios, sin números ni caracteres especiales";
        } else if (formData.tutorName.length < 5) {
          newErrors.tutorName = "El nombre debe tener al menos 5 caracteres";
        } else if (formData.tutorName.length > 100) {
          newErrors.tutorName = "El nombre no debe exceder los 100 caracteres";
        }
      }

      //Validación para el correo electronico del tutor
      if (!formData.tutorEmail) {
        newErrors.tutorEmail = "Correo del tutor requerido";
      } else {
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
        if (!emailRegex.test(formData.tutorEmail)) {
          newErrors.tutorEmail = "Correo electrónico inválido. Use un formato válido como ejemplo@dominio.com";
        }
      }

      //Validación para Teléfono
      if (!formData.tutorPhone) {
        newErrors.tutorPhone = "Teléfono del tutor requerido"; 
      } else {
        const phone = formData.tutorPhone.trim(); // Eliminar espacios innecesarios
        if (!/^[0-9]+$/.test(phone)) {
          newErrors.tutorPhone = "El teléfono solo debe contener números sin espacios ni caracteres especiales";
        }
        else if (/^(?:\d)\1{7}$/.test(phone) || phone === "12345678" || phone === "01234567") {
          newErrors.tutorPhone = "Número de teléfono no válido (secuencial o repetido)";
        }
        else if (phone.length !== 8) {
          newErrors.tutorPhone = "El teléfono debe tener exactamente 8 dígitos";
        }
        else if (!/^[67]/.test(phone)) {
          newErrors.tutorPhone = "El teléfono debe comenzar con 6 o 7";
        }
      }
    }
    
    if (section === 3) {
      // Validación para Colegio
      if (!formData.school) {
        newErrors.school = "Colegio requerido";
      } else {
        const schoolName = formData.school.trim();
        if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ\s]+$/.test(schoolName)) {
          newErrors.school = "El nombre del colegio solo debe contener letras y espacios (sin números ni símbolos)";
        } else if (schoolName.length < 3 || schoolName.length > 100) {
          newErrors.school = "El nombre del colegio debe tener entre 3 y 100 caracteres";
        }
      }

      //Validación para Curso
      if (!formData.grade) {
        newErrors.grade = "Curso requerido";
      } else {
        const gradeText = formData.grade.trim();
        if (!/^[A-Za-zÁÉÍÓÚÑáéíóúñ0-9\s]+$/.test(gradeText)) {
          newErrors.grade = "El curso solo debe contener letras, números y espacios";
        } else if (gradeText.length < 3 || gradeText.length > 30) {
          newErrors.grade = "El curso debe tener entre 3 y 30 caracteres";
        }
      }
      //Validaciones para departamento y provincia
      if (!formData.department) newErrors.department = "Departamento requerido";
      if (!formData.province) newErrors.province = "Provincia requerida";
      
      // Validación de áreas de competencia
      if (formData.areas.length === 0) {
        newErrors.areas = "Debe seleccionar al menos un área";
      } else if (formData.areas.length > 2) {
        newErrors.areas = "Máximo 2 áreas por postulante";
      }
      
      // Validación específica para Robótica (solo 1 área si es Robótica)
      const hasRobotics = formData.areas.includes("ROBÓTICA");
      
      if (hasRobotics && formData.areas.length > 1) {
        newErrors.areas = "Si postulas a ROBÓTICA, no puedes postular a otra área";
      }
      
      // Validar que todas las áreas tengan categoría seleccionada
      formData.areas.forEach(area => {
        if (!formData.categories[area]) {
          newErrors[`category_${area}`] = `Seleccione categoría para ${area}`;
        }
      });
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
  };

  const handleAreaSelection = (area) => {
    setErrors(prev => ({ ...prev, areas: "" }));
    
    setFormData(prev => {
      // Si el área ya está seleccionada, la quitamos
      if (prev.areas.includes(area)) {
        const newCategories = { ...prev.categories };
        delete newCategories[area];
        
        return {
          ...prev,
          areas: prev.areas.filter(a => a !== area),
          categories: newCategories
        };
      }
      
      // Si no está seleccionada y hay menos de 2, la agregamos
      if (prev.areas.length < 2) {
        return {
          ...prev,
          areas: [...prev.areas, area],
          categories: {
            ...prev.categories,
            [area]: "" // Inicializar categoría vacía
          }
        };
      }
      
      return prev;
    });
  };

  const handleCategoryChange = (area, category) => {
    setErrors(prev => ({ ...prev, [`category_${area}`]: "" }));
    
    setFormData(prev => ({
      ...prev,
      categories: {
        ...prev.categories,
        [area]: category
      }
    }));
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
        areas: formData.areas.map(area => `${area} (${formData.categories[area]})`).join(", "),
        paymentDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000) // 3 días desde ahora
      };
      
      setUiState(prev => ({ 
        ...prev, 
        showPaymentModal: true,
        paymentData: mockPaymentData,
        isSubmitting: false
      }));
      
    } catch (error) {
      console.error("Error al enviar postulación:", error);
      setErrors(prev => ({ ...prev, form: error.message }));
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
  API SUGERIDA: Subir comprobante de pago
  Endpoint: POST /api/upload-payment-proof
  Descripción: Sube el comprobante de pago para validación
  Body: FormData con el archivo y registrationId
  Response: { success: boolean, message: string }
  */
  const handlePaymentProofUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    setUiState(prev => ({ 
      ...prev, 
      paymentProof: file,
      uploadProgress: 0
    }));
    
    // Simular subida a la API
    const interval = setInterval(() => {
      setUiState(prev => {
        const newProgress = prev.uploadProgress + 10;
        if (newProgress >= 100) {
          clearInterval(interval);
          
          /* 
          En una implementación real, aquí se enviaría el archivo:
          
          const formData = new FormData();
          formData.append('file', file);
          formData.append('registrationId', uiState.paymentData.registrationId);
          
          fetch('/api/upload-payment-proof', {
            method: 'POST',
            body: formData
          })
          .then(response => response.json())
          .then(data => {
            if (data.success) {
              setUiState(prev => ({ 
                ...prev, 
                uploadProgress: 100,
                showPaymentModal: false,
                showUploadModal: false,
                showSuccessModal: true
              }));
            } else {
              throw new Error(data.message || 'Error al subir comprobante');
            }
          })
          .catch(error => {
            console.error("Error al subir comprobante:", error);
            setUiState(prev => ({ ...prev, uploadProgress: 0 }));
            alert("Error al subir comprobante: " + error.message);
          });
          */
          
          return { 
            ...prev, 
            uploadProgress: 100,
            showPaymentModal: false,
            showUploadModal: false,
            showSuccessModal: true
          };
        }
        return { ...prev, uploadProgress: newProgress };
      });
    }, 300);
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
        
        {/* Mostrar categorías para cada área seleccionada */}
        {formData.areas.map(area => (
          <div key={area} className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría/Nivel para {area} <span className="text-red-500">*</span>
            </label>
            <select
              value={formData.categories[area] || ""}
              onChange={(e) => handleCategoryChange(area, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors[`category_${area}`] ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Seleccione categoría</option>
              {areaToCategories[area]?.map((cat, index) => (
                <option key={index} value={cat}>{cat}</option>
              ))}
            </select>
            {errors[`category_${area}`] && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <X className="h-4 w-4 mr-1" />
                {errors[`category_${area}`]}
              </p>
            )}
          </div>
        ))}
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

  // Modal de orden de pago
  const renderPaymentModal = () => (
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
            onClick={() => setUiState(prev => ({ 
              ...prev, 
              showPaymentModal: false,
              showUploadModal: true 
            }))}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Continuar con Comprobante
          </button>
        </div>
      </div>
    </div>
  );

  // Modal para subir comprobante de pago
  const renderUploadModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl animate-fade-in">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Subir Comprobante de Pago
          </h3>
          <div className="mt-4 text-sm text-gray-600 text-left space-y-2">
            <p>Por favor suba una imagen o PDF del comprobante de pago.</p>
            
            <div className="mt-4 border-2 border-dashed border-gray-300 rounded-lg p-8 text-center">
              <input
                type="file"
                onChange={handlePaymentProofUpload}
                accept="image/*,.pdf"
                className="hidden"
                id="paymentProofInput"
              />
              <label htmlFor="paymentProofInput" className="cursor-pointer">
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  {uiState.paymentProof 
                    ? uiState.paymentProof.name 
                    : "Haga clic para seleccionar archivo"}
                </p>
                <p className="text-xs text-gray-500">
                  Formatos soportados: JPG, PNG, PDF
                </p>
              </label>
            </div>
            
            {/* Barra de progreso */}
            {uiState.uploadProgress > 0 && (
              <div className="pt-4">
                <div className="flex justify-between text-sm text-gray-600 mb-1">
                  <span>Subiendo archivo...</span>
                  <span>{uiState.uploadProgress}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2.5">
                  <div 
                    className="bg-blue-600 h-2.5 rounded-full" 
                    style={{ width: `${uiState.uploadProgress}%` }}
                  ></div>
                </div>
              </div>
            )}
          </div>
        </div>
        <div className="mt-6 flex justify-between">
          <button
            onClick={() => setUiState(prev => ({ 
              ...prev, 
              showUploadModal: false,
              showPaymentModal: true 
            }))}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
          >
            Volver
          </button>
          <button
            disabled={!uiState.paymentProof || uiState.uploadProgress > 0}
            className={`px-4 py-2 text-white rounded-md ${
              !uiState.paymentProof || uiState.uploadProgress > 0
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
            onClick={() => document.getElementById('paymentProofInput').click()}
          >
            {uiState.uploadProgress > 0 ? "Subiendo..." : "Subir Comprobante"}
          </button>
        </div>
      </div>
    </div>
  );

  // Modal de éxito final
  const renderSuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl animate-fade-in">
        <div className="flex items-center justify-center">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <Check className="h-6 w-6 text-green-600" />
          </div>
        </div>
        <div className="mt-3 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Inscripción Completada
          </h3>
          <div className="mt-2 text-sm text-gray-500">
            Su inscripción ha sido registrada correctamente. Recibirá un correo de confirmación con los detalles.
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => {
              setUiState(prev => ({ ...prev, showSuccessModal: false }));
              navigate("/");
            }}
          >
            Finalizar
          </button>
        </div>
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

      {/* Modales */}
      {uiState.showPaymentModal && renderPaymentModal()}
      {uiState.showUploadModal && renderUploadModal()}
      {uiState.showSuccessModal && renderSuccessModal()}
    </div>
  );
};

export default StudentRegistration;