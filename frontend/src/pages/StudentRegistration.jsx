import { useState, useEffect } from "react";
import { X, Check, ArrowLeft, Upload, Download } from "lucide-react";
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
    showSuccessModal: false,
    paymentData: null
  });

  const [errors, setErrors] = useState({});

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

  const validateSection = (section) => {
    const newErrors = {};
    
    if (section === 1) {
      // ... (validaciones existentes para email)
  
      // Validación para Apellidos
      if (!formData.lastName) {
        newErrors.lastName = "Apellidos requeridos";
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.lastName)) {
        newErrors.lastName = "Solo se permiten letras";
      } else if (formData.lastName.length < 3 || formData.lastName.length > 50) {
        newErrors.lastName = "Los apellidos deben tener entre 3 y 50 caracteres";
      }
  
      // Validación para Nombres
      if (!formData.firstName) {
        newErrors.firstName = "Nombres requeridos";
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]+$/.test(formData.firstName)) {
        newErrors.firstName = "Solo se permiten letras";
      } else if (formData.firstName.length < 3 || formData.firstName.length > 20) {
        newErrors.firstName = "El nombre debe tener entre 3 y 20 caracteres";
      }
  
      // Validación para CI
      if (!formData.ci) {
        newErrors.ci = "CI requerido";
      } else if (!/^[0-9]{8}$/.test(formData.ci)) {
        newErrors.ci = "El CI debe tener exactamente 8 dígitos numéricos";
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
  
    // Validación para Nombres (solo letras)
    if (name === "firstName") {
      const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
      if (!onlyLetters.test(value)) return; // No actualiza si no son letras
    }
  
    // Validación para Apellidos (solo letras)
    if (name === "lastName") {
      const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúÑñ\s]*$/;
      if (!onlyLetters.test(value)) return; // No actualiza si no son letras
    }
  
    // Validación para CI (solo números y máximo 8 dígitos)
    if (name === "ci") {
      const onlyNumbers = /^[0-9]*$/;
      if (!onlyNumbers.test(value)) return; // No actualiza si no son números
      if (value.length > 8) return; // No permite más de 8 dígitos
    }
  
    setFormData(prev => ({ 
      ...prev, 
      [name]: value 
    }));
  
    if (name === "department") {
      setFormData(prev => ({ ...prev, province: "" }));
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

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateSection(3)) return;
    
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Simular envío a la API
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Datos simulados mientras la API no esté disponible
      const mockPaymentData = {
        registrationId: "REG-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
        amount: formData.areas.length * 15, // 15 Bs por área
        studentName: `${formData.firstName} ${formData.lastName}`,
        tutorName: formData.tutorName,
        areas: formData.areas.map(area => `${area} (${formData.categories[area]})`).join(", "),
        paymentDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días desde ahora
        paymentCode: "PAGO-" + Math.random().toString(36).substr(2, 6).toUpperCase()
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
        doc.text(value, margin + 50, yPosition);
        yPosition += 7;
      };
      
      addField('ID de Registro', registrationId);
      addField('Fecha de Emisión', new Date().toLocaleDateString());
      addField('Estudiante', studentName);
      addField('Tutor', tutorName);
      addField('Áreas', uiState.paymentData.areas);
      addField('Monto Total', `${amount} Bs.`);
      addField('Código de Pago', paymentCode);
      addField('Fecha Límite de Pago', paymentDeadline.toLocaleDateString());
      
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
      doc.text('Inscripción por área', margin + 5, yPosition + 5);
      doc.text(formData.areas.length.toString(), pageWidth - margin - 40, yPosition + 5, { align: 'right' });
      doc.text('15 Bs.', pageWidth - margin - 25, yPosition + 5, { align: 'right' });
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
            placeholder="Solo letras (ej: Pérez López)"
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
            placeholder="Solo letras (ej: Juan Carlos)"
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
            placeholder="8 dígitos (ej: 12345678)"
            maxLength={8}
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
      {uiState.showSuccessModal && renderSuccessModal()}
    </div>
  );
};

export default StudentRegistration;