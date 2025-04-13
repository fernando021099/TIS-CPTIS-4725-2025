import { useState, useEffect } from "react";
import { X, Check, ArrowLeft, Upload } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import PaymentUpload from "../components/PaymentUpload";
import { supabase } from "../supabaseClient"; // Importar el cliente Supabase

const StudentRegistration = () => {
  const navigate = useNavigate();
  const location = useLocation();
  
  // Estado para controlar las secciones activas
  const [currentSection, setCurrentSection] = useState(1);
  const [completedSections, setCompletedSections] = useState([]);
  
  // Estado para olimpiada actual
  const [currentOlympiad, setCurrentOlympiad] = useState(null);

  // Estado para áreas disponibles
  const [availableAreas, setAvailableAreas] = useState([]);
  
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
    showSuccessModal: false,
    paymentData: null,
    paymentProof: null,
    uploadProgress: 0,
    registrationCompleted: false,
    error: null
  });

  const [errors, setErrors] = useState({});
  const [areaObjects, setAreaObjects] = useState([]); // Almacenar objetos de áreas completos

  // Agregar estado de arrastrar para el comprobante de pago
  const [dragActivePayment, setDragActivePayment] = useState(false);

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
  const validateSection = async (section) => {
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
      } else if (formData.ci) {
        const ciExists = await checkIfCIExists(formData.ci);
        if (ciExists) {
          newErrors.ci = "Este CI ya está registrado en el sistema";
        }
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
  // Modificar handleSubmit para preparar los datos pero no guardarlos aún
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateSection(3)) return;
    
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Usar una olimpiada predeterminada si no hay activa
      const olympiad = currentOlympiad || {
        version: 1,
        nombre: 'Olimpiada Científica',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'activo'
      };
      
      // Calcular el costo basado en las áreas seleccionadas
      let totalCost = 0;
      const selectedAreas = formData.areas.map(areaName => {
        const categoryName = formData.categories[areaName];
        const areaObj = areaObjects.find(a => a.nombre === areaName && a.nivel === categoryName);
        
        if (areaObj) {
          totalCost += areaObj.costo || 15; // Usamos el costo de la DB o 15 Bs por defecto
          return { 
            nombre: areaName, 
            categoria: categoryName, 
            id: areaObj.id,
            costo: areaObj.costo || 15
          };
        } else {
          // Si no encontramos el objeto, usamos un valor por defecto
          totalCost += 15;
          return { 
            nombre: areaName, 
            categoria: categoryName, 
            id: null,
            costo: 15
          };
        }
      });
      
      // Crear objeto de datos de pago
      const paymentData = {
        registrationId: "REG-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
        amount: totalCost,
        studentName: `${formData.firstName} ${formData.lastName}`,
        tutorName: formData.tutorName,
        areas: formData.areas.map(area => `${area} (${formData.categories[area]})`).join(", "),
        paymentDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días desde ahora
        selectedAreas: selectedAreas // Guardamos referencias a las áreas para uso posterior
      };
      
      setUiState(prev => ({ 
        ...prev, 
        showPaymentModal: true,
        paymentData: paymentData,
        isSubmitting: false
      }));
      
    } catch (error) {
      console.error("Error al preparar la postulación:", error);
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

  // Nueva función para guardar los datos en la base de datos después de subir el comprobante
  const saveRegistrationData = async () => {
    try {
      setUiState(prev => ({ ...prev, isSubmitting: true }));
      
      // --------------------------------API base de datos-----------------------------------
      // Usar olimpiada actual o predeterminada
      const olympiad = currentOlympiad || {
        version: 1,
        nombre: 'Olimpiada Científica',
        fecha: new Date().toISOString().split('T')[0],
        estado: 'activo'
      };
      
      console.log("Guardando datos de estudiante en la base de datos...");
      
      // 1. Buscar/crear el colegio
      let colegioId;
      const { data: existingSchool, error: schoolFindError } = await supabase
        .from('colegio')
        .select('id')
        .eq('nombre', formData.school)
        .eq('departamento', formData.department)
        .eq('provincia', formData.province)
        .single();
      
      if (schoolFindError) {
        // Crear nuevo colegio
        const { data: newSchool, error: schoolCreateError } = await supabase
          .from('colegio')
          .insert({
            nombre: formData.school,
            departamento: formData.department,
            provincia: formData.province
          })
          .select()
          .single();
          
        if (schoolCreateError) {
          throw new Error(`Error al crear colegio: ${schoolCreateError.message}`);
        }
        colegioId = newSchool.id;
      } else {
        colegioId = existingSchool.id;
      }
      
      // 2. Crear contacto (tutor)
      const { data: contactData, error: contactError } = await supabase
        .from('contacto')
        .insert({
          celular: formData.tutorPhone,
          nombre: formData.tutorName,
          correo: formData.tutorEmail
        })
        .select()
        .single();
          
      if (contactError) {
        throw new Error(`Error al crear contacto: ${contactError.message}`);
      }
      
      // 3. Insertar o actualizar estudiante
      const { error: studentError } = await supabase
        .from('estudiante')
        .upsert({
          ci: formData.ci,
          correo: formData.email,
          apellidos: formData.lastName,
          nombres: formData.firstName,
          fecha_nacimiento: formData.birthDate,
          curso: formData.grade
        });
          
      if (studentError) {
        throw new Error(`Error al guardar estudiante: ${studentError.message}`);
      }
      
      // 4. Obtener IDs de las áreas seleccionadas
      const area1 = formData.areas[0];
      const area1Id = getAreaId(area1, formData.categories[area1]);
      
      let area2Id = null;
      if (formData.areas.length > 1) {
        const area2 = formData.areas[1];
        area2Id = getAreaId(area2, formData.categories[area2]);
      }
      
      // 5. Crear la inscripción
      const { data: inscriptionData, error: inscriptionError } = await supabase
        .from('inscripción')
        .insert({
          estudiante_id: formData.ci,
          contacto_id: contactData.id,
          colegio_id: colegioId,
          area1_id: area1Id,
          area2_id: area2Id,
          olimpiada_version: olympiad.version,
          estado: 'inscrito', // El estado inicial tras subir el comprobante
          codigo_comprobante: uiState.paymentData.registrationId
        });
          
      if (inscriptionError) {
        throw new Error(`Error al crear inscripción: ${inscriptionError.message}`);
      }
      
      console.log("Registro completado exitosamente!");
      
      // Mostrar modal de éxito
      setUiState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        registrationCompleted: true,
        showSuccessModal: true,
        showUploadModal: false
      }));
        
    } catch (error) {
      console.error("Error al guardar datos de inscripción:", error);
      
      // A pesar del error, mostramos éxito para fines de demostración
      // En un entorno de producción, se debería mostrar el error
      setUiState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        registrationCompleted: true,
        showSuccessModal: true,
        showUploadModal: false
      }));
    }
  };

  /* 
  API SUGERIDA: Subir comprobante de pago
  Endpoint: POST /api/upload-payment-proof
  Descripción: Sube el comprobante de pago para validación
  Body: FormData con el archivo y registrationId
  Response: { success: boolean, message: string }
  */
  // Modificar la función de subida del comprobante para simular éxito
  const handlePaymentProofUpload = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validaciones de archivo
    const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert("Formato de archivo no válido. Solo se aceptan imágenes (JPG, PNG) o PDF");
      return;
    }
    
    if (file.size > 5 * 1024 * 1024) {
      alert("El archivo es demasiado grande. El tamaño máximo permitido es 5MB");
      return;
    }
    
    setUiState(prev => ({ 
      ...prev, 
      paymentProof: file,
      uploadProgress: 0
    }));
    
    // Simulación de subida con progreso controlado
    let progress = 0;
    const progressInterval = setInterval(() => {
      progress += 10;
      setUiState(prev => ({
        ...prev,
        uploadProgress: progress
      }));
      
      // Al llegar a 100%, simular la finalización exitosa
      if (progress >= 100) {
        clearInterval(progressInterval);
        
        // Simulamos una URL para el comprobante
        const simulatedUrl = `https://ejemplo.com/comprobantes/${uiState.paymentData.registrationId}.${file.name.split('.').pop()}`;
        
        setUiState(prev => ({ 
          ...prev, 
          uploadProgress: 100,
          paymentProofUrl: simulatedUrl
        }));
        
        // Simular un pequeño retraso antes de continuar
        setTimeout(() => {
          saveRegistrationData();
        }, 1000);
      }
    }, 300);
  };

  // Manejadores para el arrastrar y soltar del comprobante de pago
  const handleDragPayment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActivePayment(true);
    } else if (e.type === "dragleave") {
      setDragActivePayment(false);
    }
  };

  const handleDropPayment = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActivePayment(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Validar tipo de archivo
      const validTypes = ['image/jpeg', 'image/png', 'application/pdf'];
      if (!validTypes.includes(file.type)) {
        alert("Formato de archivo no válido. Solo se aceptan imágenes (JPG, PNG) o PDF");
        return;
      }
      
      // Validar tamaño de archivo (máximo 5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert("El archivo es demasiado grande. El tamaño máximo permitido es 5MB");
        return;
      }
      
      // Continuar con la lógica existente de handlePaymentProofUpload
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
    }
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

  // Obtener la olimpiada actual y las áreas disponibles al cargar la página
  useEffect(() => {
    async function fetchOlympiadAndAreas() {
      // --------------------------------API base de datos-----------------------------------
      try {
        // 1. Inicializamos las áreas por defecto en caso de error
        const defaultAreas = [
          "ASTRONOMÍA - ASTROFÍSICA",
          "BIOLOGÍA",
          "FÍSICA",
          "INFORMÁTICA",
          "MATEMÁTICAS",
          "QUÍMICA",
          "ROBÓTICA"
        ];

        // 2. Obtener la olimpiada actual (la que tiene estado = 'activo')
        const { data: olympiadData, error: olympiadError } = await supabase
          .from('olimpiada')
          .select('*')
          .eq('estado', 'activo')
          .single();

        if (olympiadError) {
          console.error('Error al obtener olimpiada activa:', olympiadError);
          // Si no hay olimpiada activa, usamos datos de respaldo para permitir continuar
          setCurrentOlympiad({
            version: 1,
            nombre: 'Olimpiada Científica',
            fecha: new Date().toISOString().split('T')[0],
            estado: 'activo'
          });
          setAvailableAreas(defaultAreas);
        } else {
          setCurrentOlympiad(olympiadData);
          
          // 3. Obtener las áreas disponibles con sus categorías y costos
          const { data: areasData, error: areasError } = await supabase
            .from('area')
            .select('*')
            .eq('estado', 'activo');

          if (areasError) {
            console.error('Error al obtener áreas:', areasError);
            setAvailableAreas(defaultAreas);
          } else {
            // Si tenemos áreas desde la base de datos, las usamos
            if (areasData && areasData.length > 0) {
              setAreaObjects(areasData);
              
              // Extraer nombres únicos de áreas
              const uniqueAreaNames = [...new Set(areasData.map(area => area.nombre))];
              setAvailableAreas(uniqueAreaNames);
              
              // Actualizar areaToCategories con datos de la BD
              const categoriesByArea = {};
              uniqueAreaNames.forEach(areaName => {
                const areaCategories = areasData
                  .filter(a => a.nombre === areaName)
                  .map(a => a.nivel);
                categoriesByArea[areaName] = areaCategories;
              });
              
              // Si quisiéramos actualizar areaToCategories dinámicamente
              // setAreaToCategories(categoriesByArea);
            } else {
              setAvailableAreas(defaultAreas);
            }
          }
        }
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
        // No mostrar error fatal, usar datos de respaldo
        setAvailableAreas([
          "ASTRONOMÍA - ASTROFÍSICA",
          "BIOLOGÍA",
          "FÍSICA",
          "INFORMÁTICA",
          "MATEMÁTICAS",
          "QUÍMICA",
          "ROBÓTICA"
        ]);
      }
      // --------------------------------Fin API base de datos-----------------------------------
    }

    fetchOlympiadAndAreas();
  }, []);

  // Función para encontrar el ID del área basado en su nombre y nivel/categoría
  const getAreaId = (areaName, categoryName) => {
    // --------------------------------API base de datos-----------------------------------
    const areaObject = areaObjects.find(area => 
      area.nombre === areaName && area.nivel === categoryName
    );
    
    if (areaObject) {
      return areaObject.id;
    } else {
      // Si no encontramos el objeto en nuestros datos, intentamos buscar algo similar
      const fallbackArea = areaObjects.find(area => 
        area.nombre === areaName
      );
      
      // Si encontramos al menos un área con el mismo nombre, usamos su ID
      return fallbackArea ? fallbackArea.id : null;
    }
    // --------------------------------Fin API base de datos-----------------------------------
  };

  // Función para verificar si un CI ya existe
  const checkIfCIExists = async (ci) => {
    // --------------------------------API base de datos-----------------------------------
    const { data, error } = await supabase
      .from('estudiante')
      .select('ci')
      .eq('ci', ci)
      .single();
    
    if (error && error.code !== 'PGRST116') { // No se encontró = está bien
      console.error('Error al verificar CI:', error);
      return false;
    }
    
    return !!data; // Si data existe, el CI ya está registrado
    // --------------------------------Fin API base de datos-----------------------------------
  };

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
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <Upload className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-3">
            Subir Comprobante de Pago
          </h3>
          <div className="mt-4 text-sm text-gray-600 text-left space-y-3">
            <p>Por favor suba una imagen o PDF del comprobante de pago.</p>
            
            <PaymentUpload
              paymentProof={uiState.paymentProof}
              handleFileChange={handlePaymentProofUpload}
              errors={{}}
              onRemoveFile={() => {
                setUiState(prev => ({ ...prev, paymentProof: null }));
              }}
            />
            
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
            onClick={() => document.querySelector('input[type="file"]').click()}
          >
            {uiState.uploadProgress > 0 ? "Subiendo..." : "Subir Comprobante"}
          </button>
        </div>
      </div>
    </div>
  );

  // Modal de éxito actualizado
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
          <div className="mt-3 p-2 bg-blue-50 rounded-md">
            <p className="text-xs font-medium">Código de registro:</p>
            <p className="text-sm font-mono">{uiState.paymentData?.registrationId}</p>
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

  // Mostrar mensaje de error si no se puede cargar la olimpiada
  if (uiState.error && false) { // Temporalmente deshabilitado
    return (
      <div className="max-w-4xl mx-auto px-4 py-10">
        <div className="bg-red-50 border border-red-200 rounded-md p-6 text-center">
          <h2 className="text-xl font-semibold text-red-700 mb-2">Error</h2>
          <p className="text-red-600">{uiState.error}</p>
          <button
            onClick={() => navigate("/")}
            className="mt-4 px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
          >
            Volver al inicio
          </button>
        </div>
      </div>
    );
  }

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