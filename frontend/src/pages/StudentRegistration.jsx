import { useState, useEffect } from "react";
import { X, Check, ArrowLeft, Upload, Download } from "lucide-react";
import { useNavigate, useLocation } from "react-router-dom";
import { api } from '../api/apiClient'; // Importar apiClient

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
    // Nuevo manejo de selecciones de área
    selections: [], // Array de objetos: { name, category, id, cost }
  });

  const [uiState, setUiState] = useState({
    isSubmitting: false,
    showPaymentModal: false,
    showSuccessModal: false,
    paymentData: null
  });

  const [errors, setErrors] = useState({});

  const departmentOptions = ["Cochabamba", "La Paz", "Santa Cruz", "Oruro", "Potosí", "Chuquisaca", "Tarija", "Beni", "Pando"];
  
  const provinceOptions = {
    "Cochabamba": ["Cercado", "Quillacollo", "Chapare", "Ayopaya", "Esteban Arce", "Arani", "Arque", "Capinota", "Germán Jordán", "Mizque", "Punata", "Tiraque"],
    "La Paz": ["Murillo", "Los Andes", "Larecaja", "Ingavi", "Sud Yungas", "Norte de La Paz", "Sur de La Paz"],
    "Santa Cruz": ["Andrés Ibáñez", "Cordillera", "Florida", "Ichilo", "Obispo Santistevan", "Sara", "Vallegrande"],
    "Oruro": ["Oruro", "Poopó", "Sajama", "San Pedro de Totora", "Soracachi"],
    "Potosí": ["Potosí", "Chayanta", "Cornelio Saavedra", "Daniel Campos", "D. Antonio Quijarro", "Nor Chichas"],
    "Chuquisaca": ["Chuquisaca", "Azurduy", "Cañada de Gómez", "Hernando Siles", "La Laguna", "Mojocoya"],
    "Tarija": ["Tarija", "Avilés", "Cercado", "Eustaquio Méndez", "Gran Chaco", "San Lorenzo"],
    "Beni": ["Beni", "Cercado", "Mamoré", "Yacuma"],
    "Pando": ["Pando", "Abuná", "Manuripi"]
  };

  // Estados para la lógica de áreas desde API
  const [allAreasFromApi, setAllAreasFromApi] = useState([]);
  const [uniqueAreaNamesForDisplay, setUniqueAreaNamesForDisplay] = useState([]);
  const [categoriesForAreaNameMap, setCategoriesForAreaNameMap] = useState({});


  useEffect(() => {
    const fetchAndProcessAreas = async () => {
      try {
        const areasData = await api.get('/areas'); // Usar /areas para obtener todas
        if (areasData && Array.isArray(areasData)) {
          setAllAreasFromApi(areasData);

          const uniqueNames = [...new Set(areasData.map(a => a.nombre))].sort();
          setUniqueAreaNamesForDisplay(uniqueNames);

          const catMap = {};
          areasData.forEach(area => {
            if (!catMap[area.nombre]) {
              catMap[area.nombre] = [];
            }
            // Guardar objeto completo para fácil acceso a id y costo luego
            if (!catMap[area.nombre].find(c => c.category === area.categoria)) {
              catMap[area.nombre].push({ 
                category: area.categoria, 
                id: area.id, 
                cost: area.costo 
              });
            }
          });
          // Ordenar categorías dentro de cada mapa si es necesario
          for (const areaName in catMap) {
            catMap[areaName].sort((a, b) => a.category.localeCompare(b.category));
          }
          setCategoriesForAreaNameMap(catMap);
          
          // Preselección si viene de location.state.area
          if (location.state?.area) {
            const preselected = location.state.area;
            // Asegurarse que la preselección es válida con los datos cargados
            const isValidPreselection = areasData.some(a => a.id === preselected.id && a.nombre === preselected.nombre && a.categoria === preselected.categoria);
            if (isValidPreselection) {
              setFormData(prev => ({
                ...prev,
                selections: [{
                  name: preselected.nombre,
                  category: preselected.categoria,
                  id: preselected.id,
                  cost: preselected.costo
                }]
              }));
            } else {
              console.warn("Área preseleccionada de location.state no es válida o no encontrada.");
            }
          }

        } else {
          console.error('Formato de datos de áreas inesperado:', areasData);
          setAllAreasFromApi([]); // Fallback a vacío
        }
      } catch (error) {
        console.error('Error al cargar áreas:', error);
        setAllAreasFromApi([]); // Fallback a vacío
      }
    };

    fetchAndProcessAreas();
  }, [location.state]);


  // Ya no se usa directamente areaToCategories, se usa categoriesForAreaNameMap
  // const areaToCategories = { ... };

  const validateSection = (section) => {
    const newErrors = {};
    
    if (section === 1) {
      // Validacion para correo electronico
      if (!formData.email) {
        newErrors.email = "Correo electrónico requerido";
      } else {
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if (!emailRegex.test(formData.email)) {
          newErrors.email = "Formato de correo electrónico inválido";
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
        const phone = formData.tutorPhone.trim();
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
      if (formData.selections.length === 0) {
        newErrors.areas = "Debe seleccionar al menos un área";
      } else if (formData.selections.length > 2) {
        newErrors.areas = "Máximo 2 áreas por postulante";
      } else {
        // Validar que todas las áreas seleccionadas tengan categoría
        formData.selections.forEach(selection => {
          if (!selection.category) {
            newErrors[`category_${selection.name.replace(/\s+/g, '_')}`] = `Seleccione categoría para ${selection.name}`;
          }
        });

        // Validación específica para Robótica
        const hasRobotics = formData.selections.some(s => s.name === "ROBÓTICA");
        if (hasRobotics && formData.selections.length > 1) {
          newErrors.areas = "Si postulas a ROBÓTICA, no puedes postular a otra área";
        }
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
    }
  };

  const handleAreaSelection = (areaName) => {
    setErrors(prev => ({ ...prev, areas: "", [`category_${areaName.replace(/\s+/g, '_')}`]: "" }));
    
    const isCurrentlySelected = formData.selections.some(s => s.name === areaName);

    if (isCurrentlySelected) {
      setFormData(prev => ({
        ...prev,
        selections: prev.selections.filter(s => s.name !== areaName)
      }));
    } else {
      if (formData.selections.length >= 2) {
        setErrors(prev => ({ ...prev, areas: "Máximo 2 áreas por postulante" }));
        return;
      }

      const isRoboticsAlreadySelected = formData.selections.some(s => s.name === "ROBÓTICA");
      if (areaName === "ROBÓTICA" && formData.selections.length > 0) {
        setErrors(prev => ({ ...prev, areas: "Si postulas a ROBÓTICA, no puedes seleccionar otra área." }));
        return;
      }
      if (isRoboticsAlreadySelected) {
        setErrors(prev => ({ ...prev, areas: "Ya has seleccionado ROBÓTICA, no puedes añadir otra área." }));
        return;
      }

      setFormData(prev => ({
        ...prev,
        selections: [...prev.selections, { name: areaName, category: "", id: null, cost: null }]
      }));
    }
  };
  
  const handleCategoryChange = (areaName, selectedCategoryValue) => {
    setErrors(prev => ({ ...prev, [`category_${areaName.replace(/\s+/g, '_')}`]: "" }));

    setFormData(prev => {
      const newSelections = prev.selections.map(selection => {
        if (selection.name === areaName) {
          if (selectedCategoryValue === "") { // Deseleccionando categoría
            return { ...selection, category: "", id: null, cost: null };
          }
          // Encontrar el detalle del área (incluye id, costo) para esta categoría específica
          const areaCategoryDetail = categoriesForAreaNameMap[areaName]?.find(
            catDetail => catDetail.category === selectedCategoryValue
          );
          
          return {
            ...selection,
            category: selectedCategoryValue,
            id: areaCategoryDetail ? areaCategoryDetail.id : null,
            cost: areaCategoryDetail ? areaCategoryDetail.cost : null
          };
        }
        return selection;
      });
      return { ...prev, selections: newSelections };
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateSection(3)) return; 
    
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    setErrors({}); 

    // Calcular monto total basado en las selecciones
    const totalAmount = formData.selections.reduce((sum, sel) => sum + (sel.cost || 0), 0);
    
    try {
      const area1Selection = formData.selections[0];
      let area2Selection = formData.selections[1];

      // Si la primera área es Robótica, la segunda no debe existir
      if (area1Selection?.name === "ROBÓTICA") {
        area2Selection = undefined;
      }

      const payload = {
        estudiante: {
          nombres: formData.firstName,
          apellidos: formData.lastName,
          ci: formData.ci,
          fecha_nacimiento: formData.birthDate,
          correo: formData.email, 
          curso: formData.grade, 
        },
        contacto: { 
          nombre: formData.tutorName,
          correo: formData.tutorEmail, 
          celular: formData.tutorPhone,
          relacion: formData.tutorRelation, 
        },
        colegio: {
          nombre: formData.school,
          departamento: formData.department,
          provincia: formData.province,
        },
        // CAMBIO PRINCIPAL: Enviar IDs en lugar de nombres
        area1_id: area1Selection ? area1Selection.id : null,
        area1_categoria: area1Selection ? area1Selection.category : null,
        area2_id: area2Selection ? area2Selection.id : null,
        area2_categoria: area2Selection ? area2Selection.category : null,
        olimpiada_version: 2024, 
        fecha: new Date().toISOString().split('T')[0], 
        estado: 'pendiente', 
      };
      
      // Eliminar area2 si no existe o si area1 es Robótica
      if (!area2Selection || area1Selection?.name === "ROBÓTICA") {
        delete payload.area2_id;
        delete payload.area2_categoria;
      }


      console.log("Enviando payload con IDs de áreas:", JSON.stringify(payload, null, 2));

      // 2. Enviar a la API. apiClient devuelve datos JSON parseados o null (para 204), o lanza error.
      const responseData = await api.post('/inscripción', payload); 

      console.log("Datos recibidos de api.post:", responseData);

      // 3. Procesar respuesta (responseData ya son los datos o null)
      if (responseData === null) { 
        // Caso 204 No Content (manejado por apiClient)
        console.warn("Inscripción creada (204), pero sin datos devueltos.");
        throw new Error("La inscripción fue creada (204), pero el servidor no devolvió detalles. No se puede generar la orden de pago.");

      } else if (responseData && responseData.registro_id_display) { // Usar registro_id_display
        // Caso 200/201 con datos JSON y ID de display
        console.log("Inscripción creada con ID de Display:", responseData.registro_id_display);
        
        const paymentInfo = {
          registrationId: responseData.registro_id_display, // Usar el ID de display para el PDF
          amount: responseData.monto_total || totalAmount, // Usar monto del backend o el calculado
          studentName: `${responseData.estudiante?.nombres || formData.firstName} ${responseData.estudiante?.apellidos || formData.lastName}`, 
          tutorName: responseData.contacto?.nombre || formData.tutorName, 
          areas: formData.selections.map(s => `${s.name} (${s.category || 'N/A'})`).join(", "),
          paymentDeadline: responseData.fecha_limite_pago ? new Date(responseData.fecha_limite_pago + 'T00:00:00') : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000),
          paymentCode: responseData.codigo_pago
        };
        
        setUiState(prev => ({ 
          ...prev, 
          showPaymentModal: true,
          paymentData: paymentInfo, 
          isSubmitting: false
        }));

      } else {
        // Caso inesperado: respuesta exitosa pero sin ID de display o datos inválidos
        console.error(`Respuesta exitosa pero sin datos válidos o ID de display:`, responseData);
        throw new Error(`El servidor respondió con éxito, pero no devolvió la información necesaria (ID de display).`);
      }
      
    } catch (error) {
      // apiClient ya lanza un error formateado para respuestas !response.ok
      console.error("Error durante el envío o procesamiento:", error);
      
      let userErrorMessage = error.message || "Ocurrió un error inesperado.";
      let validationErrors = {};

      // Intentar extraer errores de validación si el error los contiene (lanzado por apiClient para 422)
      // Asumiendo que apiClient adjunta el cuerpo del error en error.data o similar
      // Nota: La implementación actual de apiClient no parece adjuntar el cuerpo del error explícitamente.
      // Vamos a confiar en el mensaje por ahora, pero podríamos mejorar apiClient si es necesario.
      if (error.status === 409 ||
        (typeof error.message === "string" && error.message.toLowerCase().includes("ci ya registrado"))
      ) {
        setErrors(prev => ({
          ...prev,
          ci: "Ya existe un estudiante registrado con este CI."
        }));
        setUiState(prev => ({ ...prev, isSubmitting: false }));
        return;
      }
      // Simplificación: Si el mensaje contiene "Error 422", asumimos validación.
      if (error.status === 422 || (typeof error.message === 'string' && error.message.includes('422'))) {
          userErrorMessage = `Error de validación (422). Por favor revise los campos marcados.`;
          // Idealmente, apiClient debería parsear y adjuntar los errores de Laravel
          // para poder mapearlos aquí como se hacía antes.
          // Por ahora, mostramos un mensaje genérico 422 y no mapeamos campos.
          // TODO: Mejorar apiClient para adjuntar error.data.errors si es 422.
          
          // Ejemplo de cómo sería si apiClient adjuntara los errores:
          /* 
          if (error.status === 422 && error.data?.errors) {
              validationErrors = error.data.errors;
              const mappedErrors = {};
              // ... (lógica de mapeo como antes) ...
              setErrors(mappedErrors);
              userErrorMessage = `Error de validación (422). Por favor revise los campos marcados.`;
          } 
          */
      } else if (error instanceof TypeError) { 
          userErrorMessage = "Error de red o CORS. No se pudo conectar con el servidor.";
      }
      // Otros errores usarán error.message directamente.
      
      alert(userErrorMessage); 
      
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setUiState(prev => ({ ...prev, isSubmitting: true }));
      
      if (!uiState.paymentData) {
        throw new Error("No hay datos de pago disponibles");
      }

      const { registrationId, tutorName, studentName, amount, paymentCode, paymentDeadline } = uiState.paymentData;
      
      // Importación dinámica de jsPDF
      const { jsPDF } = await import('jspdf');
      
      // Crear nuevo documento PDF
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      // Configuración inicial
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      
      // Título
      doc.setFontSize(18);
      doc.setTextColor(33, 37, 41);
      doc.setFont('helvetica', 'bold');
      doc.text('ORDEN DE PAGO', pageWidth / 2, 30, { align: 'center' });
      
      // Línea divisoria
      doc.setDrawColor(13, 110, 253);
      doc.setLineWidth(0.5);
      doc.line(margin, 35, pageWidth - margin, 35);
      
      // Datos principales
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      let yPosition = 45;
      
      // Función para agregar campo con valor
      const addField = (label, value) => {
        doc.setTextColor(33, 37, 41);
        doc.text(`${label}:`, margin, yPosition);
        doc.setTextColor(13, 110, 253);
        // Asegurarse de que el valor sea una cadena antes de pasarlo a doc.text
        doc.text(String(value), margin + 50, yPosition); // Convertir value a String
        yPosition += 7;
      };
      
      addField('ID de Registro', registrationId);
      addField('Fecha de Emisión', new Date().toLocaleDateString());
      addField('Estudiante', studentName);
      addField('Tutor', tutorName);
      addField('Áreas', uiState.paymentData.areas);
      addField('Monto Total', `${amount} Bs.`); // Ya es string por template literal
      addField('Código de Pago', paymentCode);
      addField('Fecha Límite de Pago', paymentDeadline.toLocaleDateString()); // Ya es string
      
      // Instrucciones
      yPosition += 10;
      doc.setTextColor(33, 37, 41);
      doc.setFont('helvetica', 'bold');
      doc.text('Instrucciones para el Pago:', margin, yPosition);
      yPosition += 7;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(108, 117, 125);
      const instructions = [
        '1. Presente esta orden en las cajas autorizadas de la FCyT.',
        '2. Realice el pago correspondiente en efectivo o transferencia.',
        '3. Guarde el comprobante de pago proporcionado por la caja.'
      ];
      
      instructions.forEach(instruction => {
        doc.text(instruction, margin + 5, yPosition);
        yPosition += 7;
      });
      
      // Tabla de resumen
      yPosition += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen de Inscripción', margin, yPosition);
      yPosition += 7;
      
      // Encabezado de tabla
      doc.setFillColor(233, 236, 239);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
      doc.setTextColor(33, 37, 41);
      doc.text('Concepto', margin + 5, yPosition + 5);
      doc.text('Cantidad', pageWidth - margin - 40, yPosition + 5, { align: 'right' });
      doc.text('Total', pageWidth - margin - 10, yPosition + 5, { align: 'right' });
      yPosition += 8;
      
      // Contenido de tabla
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(73, 80, 87);
      doc.text('Inscripción por área(s)', margin + 5, yPosition + 5);
      doc.text(formData.selections.length.toString(), pageWidth - margin - 40, yPosition + 5, { align: 'right' });
      // doc.text('15 Bs.', pageWidth - margin - 25, yPosition + 5, { align: 'right' }); // Costo unitario no es fijo
      doc.text(`${amount} Bs.`, pageWidth - margin - 10, yPosition + 5, { align: 'right' });
      yPosition += 8;
      
      // Total
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL A PAGAR', margin + 5, yPosition + 5);
      doc.text(`${amount} Bs.`, pageWidth - margin - 10, yPosition + 5, { align: 'right' });
      
      // Pie de página
      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      doc.text('Sistema de Inscripciones - FCyT', pageWidth / 2, 285, { align: 'center' });
      
      // Generar el PDF como Blob
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      // Crear enlace de descarga
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `orden_pago_${registrationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      // Limpiar
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfUrl);
      }, 100);
      
      // Mostrar mensaje de éxito
      setUiState(prev => ({
        ...prev,
        showPaymentModal: false,
        showSuccessModal: true,
        isSubmitting: false
      }));
      
    } catch (error) {
      console.error("Error al generar PDF:", error);
      setUiState(prev => ({ ...prev, isSubmitting: false }));
      alert("Error al generar el PDF. Por favor intente nuevamente.");
    }
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
          {uniqueAreaNamesForDisplay.map((areaName) => {
            const isChecked = formData.selections.some(s => s.name === areaName);
            return (
              <div 
                key={areaName}
                onClick={() => handleAreaSelection(areaName)}
                className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                  isChecked 
                    ? "bg-blue-50 border-blue-500" 
                    : "border-gray-300 hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    checked={isChecked}
                    readOnly // El click en el div maneja la lógica
                    className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 pointer-events-none"
                  />
                  <span className="ml-2 text-sm font-medium text-gray-700">{areaName}</span>
                </div>
              </div>
            );
          })}
        </div>
        
        {/* Mostrar selectores de categoría para cada área seleccionada */}
        {formData.selections.map(selectedArea => (
          <div key={selectedArea.name} className="mt-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Categoría/Nivel para {selectedArea.name} <span className="text-red-500">*</span>
            </label>
            <select
              value={selectedArea.category || ""}
              onChange={(e) => handleCategoryChange(selectedArea.name, e.target.value)}
              className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                errors[`category_${selectedArea.name.replace(/\s+/g, '_')}`] ? "border-red-500" : "border-gray-300"
              }`}
            >
              <option value="">Seleccione categoría</option>
              {(categoriesForAreaNameMap[selectedArea.name] || []).map((catDetail, index) => (
                <option key={index} value={catDetail.category}>
                  {catDetail.category} (Costo: {catDetail.cost} Bs)
                </option>
              ))}
            </select>
            {errors[`category_${selectedArea.name.replace(/\s+/g, '_')}`] && (
              <p className="mt-1 text-sm text-red-600 flex items-center">
                <X className="h-4 w-4 mr-1" />
                {errors[`category_${selectedArea.name.replace(/\s+/g, '_')}`]}
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
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <Check className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-3">
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
                <span className="font-medium">Importante:</span> Debe presentar esta orden de pago en las cajas de la FCyT para completar su inscripción.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6">
          <button
            onClick={handleDownloadPDF}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Orden de Pago (PDF)
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
          {uiState.paymentData && (
            <div className="mt-3 p-2 bg-blue-50 rounded-md text-xs">
              <p className="font-medium">ID de Registro:</p>
              <p className="font-mono">{uiState.paymentData.registrationId}</p>
            </div>
          )}
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
<div className="max-w-4xl mx-auto px-4 py-6 bg-white dark:bg-gray-900 text-gray-900 dark:text-gray-100">
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
      {uiState.showSuccessModal && renderSuccessModal()}
    </div>
  );
};

export default StudentRegistration;