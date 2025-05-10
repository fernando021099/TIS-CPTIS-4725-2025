import { useState, useRef } from "react";
import { X, Check, ArrowLeft, Upload, Download, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExcelJS from 'exceljs';
import { api } from '../api/apiClient'; // Importar apiClient

const StudentGroupRegistration = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  const [currentSection, setCurrentSection] = useState(1);
  const [completedSections, setCompletedSections] = useState([]);
  const [registrationMethod, setRegistrationMethod] = useState(null);
  
  const [tutorData, setTutorData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  const [students, setStudents] = useState([
    {
      id: Date.now(),
      lastName: "",
      firstName: "",
      ci: "",
      birthDate: "",
      school: "",
      grade: "",
      department: "Cochabamba",
      province: "",
      areas: [],
      categories: {}
    }
  ]);

  const [excelData, setExcelData] = useState(null);
  const [excelFileName, setExcelFileName] = useState("");
  const [excelErrors, setExcelErrors] = useState([]);
  
  const [uiState, setUiState] = useState({
    isSubmitting: false,
    showSuccessModal: false,
    showPaymentModal: false,
    showErrorsModal: false,
    paymentData: null
  });

  const [errors, setErrors] = useState({});

  const departmentOptions = ["Cochabamba", "La Paz", "Santa Cruz", "Oruro", "Potosí", "Chuquisaca", "Tarija", "Beni", "Pando"];
  
  const provinceOptions = {
    "Cochabamba": ["Cercado", "Quillacollo", "Chapare", "Ayopaya", "Esteban Arce", "Arani", "Arque", "Capinota", "Germán Jordán", "Mizque", "Punata", "Tiraque"],
    "La Paz": ["Murillo", "Omasuyos", "Camacho", "Muñecas", "Larecaja", "Franz Tamayo", "Ingavi", "Loayza", "Inquisivi", "Sud Yungas", "Los Andes", "Aroma"],
    "Santa Cruz": ["Andrés Ibáñez", "Warnes", "Velasco", "Ichilo", "Chiquitos", "Sara", "Cordillera", "Vallegrande", "Florida", "Obispo Santistevan", "Ñuflo de Chávez", "Ángel Sandoval"],
  };

  const areaOptions = [ // Mantener como referencia o fallback
    "ASTRONOMÍA - ASTROFÍSICA",
    "BIOLOGÍA",
    "FÍSICA",
    "INFORMÁTICA",
    "MATEMÁTICAS",
    "QUÍMICA",
    "ROBÓTICA"
  ];

  const areaToCategories = { // Mantener como referencia o fallback
    "ASTRONOMÍA - ASTROFÍSICA": ["3P", "4P", "5P", "6P", "1S", "2S", "3S", "4S", "5S", "6S"],
    "BIOLOGÍA": ["2S", "3S", "4S", "5S", "6S"],
    "FÍSICA": ["4S", "5S", "6S"],
    "INFORMÁTICA": ["Guacamayo", "Guanaco", "Londra", "Jucumari", "Bufeo", "Puma"],
    "MATEMÁTICAS": ["Primer Nivel", "Segundo Nivel", "Tercer Nivel", "Cuarto Nivel", "Quinto Nivel", "Sexto Nivel"],
    "QUÍMICA": ["2S", "3S", "4S", "5S", "6S"],
    "ROBÓTICA": ["Builders P", "Builders S", "Lego P", "Lego S"]
  };

  const handleTutorChange = (e) => {
    const { name, value } = e.target;
    
    // Validación adicional para el nombre (solo letras y espacios)
    if (name === "name") {
      const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
      if (value && !onlyLetters.test(value)) {
        return; // No actualiza el estado si no son solo letras
      }
    }

    // Validación adicional para el teléfono (solo números y máximo 8 dígitos)
  if (name === "phone") {
    const onlyNumbers = /^[0-9]*$/;
    if (value && (!onlyNumbers.test(value) || value.length > 8)) {
      return; // No actualiza el estado si no son solo números o tiene más de 8 dígitos
    }
  }
    setTutorData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleStudentChange = (id, e) => {
    const { name, value } = e.target;
  
    // Validación para campos de solo letras (nombres y apellidos)
    if (name === 'firstName' || name === 'lastName') {
      const onlyLetters = /^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/;
      if (value && !onlyLetters.test(value)) {
        return; // No actualiza el estado si no son solo letras
      }
    }
  
    // Validación para CI (solo números y máximo 7 dígitos)
    if (name === 'ci') {
      const onlyNumbers = /^[0-9]*$/;
      if (value && (!onlyNumbers.test(value) || value.length > 7)) {
        return; // No actualiza el estado si no son solo números o tiene más de 7 dígitos
      }
    }
  
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, [name]: value } : student
    ));
  };

  const handleStudentAreaSelection = (studentId, area) => {
    setStudents(prev => prev.map(student => {
      if (student.id !== studentId) return student;
      
      if (student.areas.includes(area)) {
        const newCategories = { ...student.categories };
        delete newCategories[area];
        
        return {
          ...student,
          areas: student.areas.filter(a => a !== area),
          categories: newCategories
        };
      }
      
      if (student.areas.length < 2) {
        return {
          ...student,
          areas: [...student.areas, area],
          categories: {
            ...student.categories,
            [area]: ""
          }
        };
      }
      
      return student;
    }));
  };

  const handleStudentCategoryChange = (studentId, area, category) => {
    setStudents(prev => prev.map(student => {
      if (student.id !== studentId) return student;
      
      return {
        ...student,
        categories: {
          ...student.categories,
          [area]: category
        }
      };
    }));
  };

  const addStudent = () => {
    if (students.length >= 20) return;
    setStudents(prev => [
      ...prev,
      {
        id: Date.now(),
        lastName: "",
        firstName: "",
        ci: "",
        birthDate: "",
        school: "",
        grade: "",
        department: "Cochabamba",
        province: "",
        areas: [],
        categories: {}
      }
    ]);
  };

  const removeStudent = (id) => {
    if (students.length <= 1) return;
    setStudents(prev => prev.filter(student => student.id !== id));
  };

  const validateSection = (section) => {
    const newErrors = {};
    
    if (section === 1) {
      if (!tutorData.name) newErrors.tutorName = "Nombre del tutor requerido";
      if (!tutorData.email) newErrors.tutorEmail = "Correo del tutor requerido";
      if (!tutorData.phone) newErrors.tutorPhone = "Teléfono del tutor requerido";
      
      if (tutorData.email && !/^\S+@\S+\.\S+$/.test(tutorData.email)) {
        newErrors.tutorEmail = "Correo electrónico inválido";
      }
      
      if (tutorData.phone && !/^[0-9+]+$/.test(tutorData.phone)) {
        newErrors.tutorPhone = "Teléfono inválido";
        if (!tutorData.name) newErrors.tutorName = "Nombre del tutor requerido";
        else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(tutorData.name)) {
          newErrors.tutorName = "El nombre solo debe contener letras";
        }

        if (!tutorData.phone) newErrors.tutorPhone = "Teléfono del tutor requerido";
        else if (!/^[0-9]{8}$/.test(tutorData.phone)) {
          newErrors.tutorPhone = "El teléfono debe tener exactamente 8 dígitos";
        }  
        
        
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateAllStudents = () => {
    const errorsList = [];
    
    students.forEach((student, index) => {
      const studentErrors = {};
      
      if (!student.lastName) {
        studentErrors.lastName = "Apellidos requeridos";
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(student.lastName)) {
        studentErrors.lastName = "Solo se permiten letras en los apellidos";
      }
      
      if (!student.firstName) {
        studentErrors.firstName = "Nombres requeridos";
      } else if (!/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(student.firstName)) {
        studentErrors.firstName = "Solo se permiten letras en los nombres";
      }
      
      if (!student.ci) {
        studentErrors.ci = "CI requerido";
      } else if (!/^[0-9]{7}$/.test(student.ci)) {
        studentErrors.ci = "El CI debe tener exactamente 7 dígitos";
      }
      
      // Resto de las validaciones...
      if (!student.school) studentErrors.school = "Colegio requerido";
      if (!student.grade) studentErrors.grade = "Curso requerido";
      if (!student.department) studentErrors.department = "Departamento requerido";
      if (!student.province) studentErrors.province = "Provincia requerida";
      
      if (student.areas.length === 0) {
        studentErrors.areas = "Debe seleccionar al menos un área";
      } else if (student.areas.length > 2) {
        studentErrors.areas = "Máximo 2 áreas por estudiante";
      }
      
      const hasRobotics = student.areas.includes("ROBÓTICA");
      if (hasRobotics && student.areas.length > 1) {
        studentErrors.areas = "Si postula a ROBÓTICA, no puede postular a otra área";
      }
      
      student.areas.forEach(area => {
        if (!student.categories[area]) {
          studentErrors[`category_${area}`] = `Seleccione categoría para ${area}`;
        }
      });
      
      if (Object.keys(studentErrors).length > 0) {
        errorsList.push({
          studentIndex: index + 1,
          errors: studentErrors
        });
      }
    });
    
    return errorsList;
  };

  const validateExcelData = (data) => {
    const errorsList = [];
    
    data.forEach((row, index) => {
      const rowErrors = {};
      
      // Validación de campos requeridos
      if (!row.Correo) rowErrors.email = "Correo requerido";
      if (!row.Apellidos) rowErrors.lastName = "Apellidos requeridos";
      if (!row.Nombres) rowErrors.firstName = "Nombres requeridos";
      if (!row.Ci_Competidor) rowErrors.ciCompetitor = "CI/Competidor requerido";
      if (!row['Fecha de Nacimiento']) rowErrors.birthDate = "Fecha de nacimiento requerida";
      if (!row.Colegio) rowErrors.school = "Colegio requerido";
      if (!row.Curso) rowErrors.grade = "Curso requerido";
      if (!row.Departamento) rowErrors.department = "Departamento requerido";
      if (!row.Provincia) rowErrors.province = "Provincia requerida";
      if (!row['Area 1']) rowErrors.area1 = "Área 1 requerida";
      if (row['Area 1'] && !row['Nivel 1']) rowErrors.level1 = "Nivel 1 requerido para Área 1";

      // Validación de formato de correo
      if (row.Correo && !/^\S+@\S+\.\S+$/.test(row.Correo)) {
        rowErrors.email = "Correo electrónico inválido";
      }
       // Validación de CI (solo números) 
    if (row.Ci_Competidor) {
      // Separar el CI del tipo de competidor si está en formato "1234567|Tipo"
      const [ciPart] = row.Ci_Competidor.split('|').map(item => item.trim());
      
      if (!/^[0-9]+$/.test(ciPart)) {
        rowErrors.ciCompetitor = "La parte del CI debe contener solo números";
      }
    }
      
      // Validación de competidor (valores esperados)
      if (row.Competidor && !['Individual', 'Grupal', 'Regular'].includes(row.Competidor)) {
        rowErrors.competitorType = "Tipo de competidor inválido (Individual/Grupal/Regular)";
      }

      // Validación de Nombres (solo letras, espacios y acentos)
    if (row.Nombres && !/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(row.Nombres)) {
      rowErrors.firstName = "Nombres solo debe contener letras y espacios";
    }
    
    // Validación de Apellidos (solo letras, espacios y acentos)
    if (row.Apellidos && !/^[A-Za-zÁÉÍÓÚáéíóúñÑ\s]+$/.test(row.Apellidos)) {
      rowErrors.lastName = "Apellidos solo debe contener letras y espacios";
    }
      
      // Validación de fecha de nacimiento (formato aproximado)
      const birthDateValue = row['Fecha de Nacimiento'];
      console.log(`Fila ${index + 2} - Valor Fecha de Nacimiento: '${birthDateValue}'`); // Para depuración

      if (birthDateValue) {
        // Expresión regular más tolerante a espacios alrededor de las barras
        if (!/^\d{1,2}\s*\/\s*\d{1,2}\s*\/\s*\d{4}$/.test(birthDateValue)) {
          rowErrors.birthDate = "Formato de fecha debe ser DD/MM/AAAA";
        } else {
          // Opcional: Validar que la fecha sea lógica (ej. día <= 31, mes <= 12)
          const parts = birthDateValue.split('/');
          const day = parseInt(parts[0], 10);
          const month = parseInt(parts[1], 10);
          // const year = parseInt(parts[2], 10); // Año ya validado por \d{4}
          if (day < 1 || day > 31 || month < 1 || month > 12) {
            rowErrors.birthDate = "Fecha inválida (día o mes fuera de rango)";
          }
        }
      } else {
        // Si es requerido y no está presente (ya cubierto por la validación de campos requeridos)
        // rowErrors.birthDate = "Fecha de nacimiento requerida"; 
      }
      
      // Validación de áreas y niveles (el resto se mantiene igual)
      // ... (código existente de validación de áreas)
      
      if (Object.keys(rowErrors).length > 0) {
        errorsList.push({
          rowNumber: index + 2,
          errors: rowErrors
        });
      }
    });
    
    return errorsList;
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

  const selectRegistrationMethod = (method) => {
    setRegistrationMethod(method);
    goToNextSection();
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    const validTypes = [
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', 
      'application/vnd.ms-excel'
    ];
    
    if (!validTypes.includes(file.type)) {
      setExcelErrors([{ message: "Formato de archivo no válido. Solo se aceptan archivos Excel (.xlsx, .xls)" }]);
      setExcelData(null);
      setExcelFileName("");
      return;
    }
    
    setExcelFileName(file.name);
    setExcelErrors([]);
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const buffer = await file.arrayBuffer();
      const workbook = new ExcelJS.Workbook();
      await workbook.xlsx.load(buffer);
      
      const worksheet = workbook.worksheets[0];
      const jsonData = [];
      
      const headers = [];
      worksheet.getRow(1).eachCell((cell) => {
        headers.push(cell.value?.toString().trim());
      });
      
      const requiredColumns = [
    'Correo', 'Apellidos', 'Nombres', 'Ci_Competidor', 'Fecha de Nacimiento', 'Colegio', 
        'Curso', 'Departamento', 'Provincia', 'Area 1', 'Nivel 1', 'Area 2', 'Nivel 2'
      ];
      
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        throw new Error(`El archivo no tiene el formato correcto. Faltan las columnas: ${missingColumns.join(', ')}`);
      }
      
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return;
        
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header && requiredColumns.includes(header)) {
            // --- INICIO DE MODIFICACIÓN ---
            if (header === 'Fecha de Nacimiento' && cell.value instanceof Date) {
              const date = cell.value;
              // Ajustar la fecha por la zona horaria si es necesario.
              // ExcelJS podría devolver la fecha en UTC. Si la fecha en Excel es 15/05/2008
              // y obtienes 14/05/2008 20:00:00 GMT-0400, significa que la fecha es correcta
              // pero la conversión a string local la muestra un día antes debido a la zona horaria.
              // Para obtener DD/MM/AAAA de la fecha tal como está en Excel (sin corrimiento por zona horaria local):
              const day = date.getDate();
              const month = date.getMonth() + 1; // Meses son 0-indexados
              const year = date.getFullYear();
              rowData[header] = `${day}/${month}/${year}`;
            } else {
              rowData[header] = cell.value?.toString().trim() || "";
            }
            // --- FIN DE MODIFICACIÓN ---
          }
        });
        
        if (Object.keys(rowData).length > 0) {
          jsonData.push(rowData);
        }
      });
      
      if (jsonData.length === 0) {
        throw new Error("El archivo no contiene datos de estudiantes");
      }
      
      const excelErrors = validateExcelData(jsonData);
      
      if (excelErrors.length > 0) {
        setExcelErrors(excelErrors);
        setExcelData(null);
      } else {
        setExcelData(jsonData);
      }
      
    } catch (error) {
      console.error("Error al leer el archivo Excel:", error);
      setExcelErrors([{ message: error.message }]);
      setExcelData(null);
    } finally {
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const generateExcelFromForm = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Sistema de Inscripciones";
      workbook.lastModifiedBy = tutorData.name;
      workbook.created = new Date();
      workbook.modified = new Date();
      
      const worksheet = workbook.addWorksheet("Estudiantes");
      
      worksheet.columns = [
        { header: "Apellidos", key: "Apellidos", width: 25, style: { font: { bold: true } } },
        { header: "Nombres", key: "Nombres", width: 25 },
        { header: "CI", key: "CI", width: 15 },
        { header: "Fecha Nacimiento", key: "Fecha Nacimiento", width: 15 },
        { header: "Colegio", key: "Colegio", width: 30 },
        { header: "Curso", key: "Curso", width: 15 },
        { header: "Departamento", key: "Departamento", width: 15 },
        { header: "Provincia", key: "Provincia", width: 15 },
        { header: "Áreas", key: "Áreas", width: 30 },
        { header: "Categorías", key: "Categorías", width: 30 }
      ];
      
      students.forEach(student => {
        worksheet.addRow({
          "Apellidos": student.lastName,
          "Nombres": student.firstName,
          "CI": student.ci,
          "Fecha Nacimiento": student.birthDate,
          "Colegio": student.school,
          "Curso": student.grade,
          "Departamento": student.department,
          "Provincia": student.province,
          "Áreas": student.areas.join(", "),
          "Categorías": Object.entries(student.categories).map(([area, cat]) => `${area}: ${cat}`).join(", ")
        });
      });
      
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell(cell => {
        cell.font = { 
          bold: true, 
          color: { argb: 'FFFFFFFF' },
          size: 12
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4F81BD' }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        cell.alignment = { 
          vertical: 'middle', 
          horizontal: 'center',
          wrapText: true
        };
      });
      
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) {
          row.eachCell(cell => {
            cell.border = {
              top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
              left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
              bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
              right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
            };
            cell.alignment = { 
              vertical: 'middle',
              wrapText: true 
            };
          });
        }
      });
      
      worksheet.columns.forEach(column => {
        if (column.values) {
          const maxLength = column.values.reduce((max, value) => {
            if (value && typeof value.toString === 'function') {
              const length = value.toString().length;
              return Math.max(max, length);
            }
            return max;
          }, column.header.length);
          
          column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        }
      });
      
      workbook.properties.company = tutorData.name;
      workbook.properties.manager = tutorData.email;
      
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = `Inscripcion_Grupal_${tutorData.name.replace(/\s+/g, '_')}_${new Date().toISOString().slice(0,10)}.xlsx`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Error al generar Excel:", error);
      setErrors(prev => ({ ...prev, excelGeneration: "Error al generar el archivo Excel" }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Asegurarse que la sección 1 (tutor) esté validada si se avanza desde ahí
    if (!completedSections.includes(1) && !validateSection(1)) return; 
    
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    setExcelErrors([]); // Limpiar errores previos
    
    try {
      let validationErrors = [];
      let studentsDataForApi = [];
      
      // 1. Validar datos de estudiantes según el método
      if (registrationMethod === "form") {
        validationErrors = validateAllStudents();
        if (validationErrors.length === 0) {
          studentsDataForApi = students.map(student => ({
            // Mapear a la estructura esperada por la API de inscripción individual
            // (Asumiendo que el endpoint grupal acepta un array de estas estructuras)
            estudiante: {
              nombres: student.firstName,
              apellidos: student.lastName,
              ci: student.ci,
              fecha_nacimiento: student.birthDate,
            },
            colegio: {
              nombre: student.school,
              departamento: student.department,
              provincia: student.province,
              // Podrías necesitar buscar o crear el colegio en el backend
            },
            // area1_id y area2_id necesitarían buscarse en el backend
            // basado en student.areas y student.categories
            // Esto es complejo de hacer aquí, el backend debería manejarlo
            // Enviamos los nombres por ahora para que el backend los procese
            area1_nombre: student.areas[0] || null,
            area1_categoria: student.categories[student.areas[0]] || null,
            area2_nombre: student.areas[1] || null,
            area2_categoria: student.categories[student.areas[1]] || null,
            // Asumir que la olimpiada se define en el backend o se pasa de otra forma
            // olimpiada_version: ??? 
          }));
        }
      } else if (registrationMethod === "excel") {
        if (!excelData) {
          throw new Error("No se ha cargado o validado ningún archivo Excel");
        }
        // La validación ya se hizo al cargar, pero podemos re-validar si es necesario
        validationErrors = validateExcelData(excelData); 
        if (validationErrors.length === 0) {
           // En la función handleSubmit, donde se procesan los datos del Excel:
studentsDataForApi = excelData.map(row => {
  const [ci, competitorType] = row.Ci_Competidor.split('|').map(item => item.trim());
  
  return {
    estudiante: {
      nombres: row.Nombres,
      apellidos: row.Apellidos,
      ci: ci,
      email: row.Correo,
      fecha_nacimiento: row['Fecha de Nacimiento'],
      tipo_competidor: competitorType
    },
    colegio: {
      nombre: row.Colegio,
      departamento: row.Departamento,
      provincia: row.Provincia
    },
    area1_nombre: row['Area 1'],
    area1_categoria: row['Nivel 1'],
    area2_nombre: row['Area 2'] || null,
    area2_categoria: row['Nivel 2'] || null
  };
});
}
      } else {
         throw new Error("Método de registro no seleccionado");
      }
      
      // 2. Si hay errores de validación, mostrarlos
      if (validationErrors.length > 0) {
        setExcelErrors(validationErrors); // Usar el estado excelErrors para mostrar
        setUiState(prev => ({ 
          ...prev, 
          isSubmitting: false,
          showErrorsModal: true // Mostrar modal de errores
        }));
        return; // Detener el envío
      }
      
      // 3. Preparar payload para la API
      const payload = {
        contacto_tutor: { // Datos del tutor
          nombre: tutorData.name,
          email: tutorData.email,
          celular: tutorData.phone,
          // relacion: 'Tutor Grupal' // Podrías añadir un campo para identificar
        },
        inscripciones: studentsDataForApi // Array de datos de estudiantes
        // Podrías necesitar enviar la versión de la olimpiada aquí también
        // olimpiada_version: ??? 
      };

      // 4. Enviar a la API (Endpoint hipotético: /inscripciones/grupo)
      // >>>>> LLAMADA API REAL <<<<<
      const responseData = await api.post('/inscripciones/grupo', payload);

      // >>>>> LÓGICA MOCK (COMENTADA) <<<<<
      /*
      await new Promise(resolve => setTimeout(resolve, 1500));
      const mockPaymentData = { ... }; // Datos mock existentes
      */

      // 5. Procesar respuesta de la API y mostrar modal de pago/éxito
      // Asumiendo que la API devuelve algo similar a mockPaymentData
      const paymentInfo = {
        registrationId: responseData.registro_grupal_id || "GRP-" + Date.now(), // Usar ID de la API si existe
        amount: responseData.monto_total || studentsDataForApi.length * 15, // Usar monto de la API
        tutorName: tutorData.name,
        studentCount: responseData.cantidad_estudiantes || studentsDataForApi.length, // Usar cantidad de la API
        paymentDeadline: responseData.fecha_limite_pago ? new Date(responseData.fecha_limite_pago) : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // Usar fecha de la API
        paymentCode: responseData.codigo_pago || "PAGO-" + Math.random().toString(36).substr(2, 6).toUpperCase() // Usar código de la API
      };
      
      setUiState(prev => ({ 
        ...prev, 
        showPaymentModal: true,
        paymentData: paymentInfo, // Usar datos procesados de la API
        isSubmitting: false
      }));
      
    } catch (error) {
      console.error("Error al enviar postulación grupal:", error);
      // Mostrar error genérico o específico de la API
      setErrors(prev => ({ ...prev, form: `Error al enviar: ${error.message}` }));
      setUiState(prev => ({ ...prev, isSubmitting: false }));
      // Podrías mostrar el modal de errores también para errores de API
      // setExcelErrors([{ message: `Error de API: ${error.message}` }]);
      // setUiState(prev => ({ ...prev, showErrorsModal: true }));
    }
  };

  const handleDownloadPDF = async () => {
    try {
      setUiState(prev => ({ ...prev, isSubmitting: true }));
      
      const { registrationId, tutorName, studentCount, amount, paymentCode, paymentDeadline } = uiState.paymentData;
      
      const { jsPDF } = await import('jspdf');
      
      const doc = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });
      
      const pageWidth = doc.internal.pageSize.getWidth();
      const margin = 20;
      
      doc.setFontSize(18);
      doc.setTextColor(33, 37, 41);
      doc.setFont('helvetica', 'bold');
      doc.text('ORDEN DE PAGO GRUPAL', pageWidth / 2, 30, { align: 'center' });
      
      doc.setDrawColor(13, 110, 253);
      doc.setLineWidth(0.5);
      doc.line(margin, 35, pageWidth - margin, 35);
      
      doc.setFontSize(12);
      doc.setFont('helvetica', 'normal');
      
      let yPosition = 45;
      
      const addField = (label, value) => {
        doc.setTextColor(33, 37, 41);
        doc.text(`${label}:`, margin, yPosition);
        doc.setTextColor(13, 110, 253);
        doc.text(value, margin + 50, yPosition);
        yPosition += 7;
      };
      
      addField('ID de Registro', registrationId);
      addField('Fecha de Emisión', new Date().toLocaleDateString());
      addField('Tutor Responsable', tutorName);
      addField('Número de Estudiantes', studentCount.toString());
      addField('Monto Total', `${amount} Bs.`);
      addField('Código de Pago', paymentCode);
      addField('Fecha Límite de Pago', paymentDeadline.toLocaleDateString());
      
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
      
      yPosition += 10;
      doc.setFont('helvetica', 'bold');
      doc.text('Resumen de Inscripción', margin, yPosition);
      yPosition += 7;
      
      doc.setFillColor(233, 236, 239);
      doc.rect(margin, yPosition, pageWidth - 2 * margin, 8, 'F');
      doc.setTextColor(33, 37, 41);
      doc.text('Concepto', margin + 5, yPosition + 5);
      doc.text('Cantidad', pageWidth - margin - 40, yPosition + 5, { align: 'right' });
      doc.text('Total', pageWidth - margin - 10, yPosition + 5, { align: 'right' });
      yPosition += 8;
      
      doc.setFont('helvetica', 'normal');
      doc.setTextColor(73, 80, 87);
      doc.text('Inscripción por estudiante', margin + 5, yPosition + 5);
      doc.text(studentCount.toString(), pageWidth - margin - 40, yPosition + 5, { align: 'right' });
      doc.text('15 Bs.', pageWidth - margin - 25, yPosition + 5, { align: 'right' });
      doc.text(`${amount} Bs.`, pageWidth - margin - 10, yPosition + 5, { align: 'right' });
      yPosition += 8;
      
      doc.setFont('helvetica', 'bold');
      doc.text('TOTAL A PAGAR', margin + 5, yPosition + 5);
      doc.text(`${amount} Bs.`, pageWidth - margin - 10, yPosition + 5, { align: 'right' });
      
      doc.setFontSize(10);
      doc.setTextColor(108, 117, 125);
      doc.text('Sistema de Inscripciones - FCyT', pageWidth / 2, 285, { align: 'center' });
      
      const pdfBlob = doc.output('blob');
      const pdfUrl = URL.createObjectURL(pdfBlob);
      
      const link = document.createElement('a');
      link.href = pdfUrl;
      link.download = `orden_pago_grupal_${registrationId}.pdf`;
      document.body.appendChild(link);
      link.click();
      
      setTimeout(() => {
        document.body.removeChild(link);
        URL.revokeObjectURL(pdfUrl);
      }, 100);
      
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

  const renderTutorDataSection = () => (
    <div className="space-y-4">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        1. Datos del tutor responsable
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Nombre completo del tutor <span className="text-red-500">*</span>
          </label>
          <input
            type="text"
            name="name"
            value={tutorData.name}
            onChange={handleTutorChange}
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
            Correo electrónico <span className="text-red-500">*</span>
          </label>
          <input
            type="email"
            name="email"
            value={tutorData.email}
            onChange={handleTutorChange}
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
            Teléfono <span className="text-red-500">*</span>
          </label>
          <input
            type="tel"
            name="phone"
            value={tutorData.phone}
            onChange={handleTutorChange}
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
      
      <div className="mt-6 flex justify-end">
        <button
          type="button"
          onClick={goToNextSection}
          className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
        >
          Siguiente: Método de Inscripción
        </button>
      </div>
    </div>
  );

  const renderMethodSelectionSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        2. Método de inscripción grupal
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div 
          onClick={() => selectRegistrationMethod("form")}
          className="border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors hover:bg-blue-50"
        >
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <Plus className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Formulario Manual</h4>
            <p className="text-sm text-gray-500">
              Ingresa los datos de cada estudiante uno por uno a través de nuestro formulario. 
              Al final podrás descargar un archivo Excel con todos los datos.
            </p>
          </div>
        </div>
        
        <div 
          onClick={() => selectRegistrationMethod("excel")}
          className="border-2 border-gray-200 rounded-lg p-6 cursor-pointer hover:border-blue-500 transition-colors hover:bg-blue-50"
        >
          <div className="flex flex-col items-center text-center">
            <div className="bg-blue-100 p-3 rounded-full mb-3">
              <Upload className="h-6 w-6 text-blue-600" />
            </div>
            <h4 className="font-medium text-gray-900 mb-2">Cargar Excel</h4>
            <p className="text-sm text-gray-500">
              Sube un archivo Excel con el formato requerido para inscribir a todos los estudiantes de una sola vez.
            </p>
          </div>
        </div>
      </div>
      
      <div className="mt-6 flex justify-start">
        <button
          type="button"
          onClick={goToPreviousSection}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Anterior
        </button>
      </div>
    </div>
  );

  const renderManualFormSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        3. Datos de los estudiantes (Manual)
      </h3>
      
      <div className="bg-blue-50 p-4 rounded-md mb-4">
        <p className="text-sm text-blue-800">
          Complete los datos de cada estudiante. Puede agregar hasta 20 estudiantes por grupo.
        </p>
      </div>
      
      <div className="space-y-6">
        {students.map((student, index) => (
          <div key={student.id} className="border border-gray-200 rounded-lg p-4">
            <div className="flex justify-between items-center mb-3">
              <h4 className="font-medium text-gray-900">Estudiante #{index + 1}</h4>
              {students.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeStudent(student.id)}
                  className="text-red-600 hover:text-red-800 flex items-center text-sm"
                >
                  <Trash2 className="h-4 w-4 mr-1" />
                  Eliminar
                </button>
              )}
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Apellidos <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={student.lastName}
                  onChange={(e) => handleStudentChange(student.id, e)}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`student${index}_lastName`] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Apellidos completos"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Nombres <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={student.firstName}
                  onChange={(e) => handleStudentChange(student.id, e)}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`student${index}_firstName`] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nombres completos"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  CI <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="ci"
                  value={student.ci}
                  onChange={(e) => handleStudentChange(student.id, e)}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`student${index}_ci`] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Número de CI"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Fecha Nacimiento <span className="text-red-500">*</span>
                </label>
                <input
                  type="date"
                  name="birthDate"
                  value={student.birthDate}
                  onChange={(e) => handleStudentChange(student.id, e)}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`student${index}_birthDate`] ? "border-red-500" : "border-gray-300"
                  }`}
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Colegio <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="school"
                  value={student.school}
                  onChange={(e) => handleStudentChange(student.id, e)}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`student${index}_school`] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Nombre del colegio"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Curso <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  name="grade"
                  value={student.grade}
                  onChange={(e) => handleStudentChange(student.id, e)}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`student${index}_grade`] ? "border-red-500" : "border-gray-300"
                  }`}
                  placeholder="Ej: 4to de secundaria"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Departamento <span className="text-red-500">*</span>
                </label>
                <select
                  name="department"
                  value={student.department}
                  onChange={(e) => handleStudentChange(student.id, e)}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`student${index}_department`] ? "border-red-500" : "border-gray-300"
                  }`}
                >
                  {departmentOptions.map((depto, i) => (
                    <option key={i} value={depto}>{depto}</option>
                  ))}
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Provincia <span className="text-red-500">*</span>
                </label>
                <select
                  name="province"
                  value={student.province}
                  onChange={(e) => handleStudentChange(student.id, e)}
                  disabled={!student.department}
                  className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                    errors[`student${index}_province`] ? "border-red-500" : "border-gray-300"
                  } ${
                    !student.department ? "bg-gray-100 cursor-not-allowed" : ""
                  }`}
                >
                  <option value="">{student.department ? "Seleccione provincia" : "Seleccione departamento primero"}</option>
                  {student.department && provinceOptions[student.department]?.map((prov, i) => (
                    <option key={i} value={prov}>{prov}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Áreas de competencia (Máximo 2) <span className="text-red-500">*</span>
                </label>
                
                {errors[`student${index}_areas`] && (
                  <p className="mb-2 text-sm text-red-600 flex items-center">
                    <X className="h-4 w-4 mr-1" />
                    {errors[`student${index}_areas`]}
                  </p>
                )}
                
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                  {areaOptions.map((area) => (
                    <div 
                      key={area}
                      onClick={() => handleStudentAreaSelection(student.id, area)}
                      className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                        student.areas.includes(area) 
                          ? "bg-blue-50 border-blue-500" 
                          : "border-gray-300 hover:bg-gray-50"
                      }`}
                    >
                      <div className="flex items-center">
                        <input
                          type="checkbox"
                          checked={student.areas.includes(area)}
                          readOnly
                          className="h-4 w-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500"
                        />
                        <span className="ml-2 text-sm font-medium text-gray-700">{area}</span>
                      </div>
                    </div>
                  ))}
                </div>
                
                {student.areas.map(area => (
                  <div key={area} className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Categoría/Nivel para {area} <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={student.categories[area] || ""}
                      onChange={(e) => handleStudentCategoryChange(student.id, area, e.target.value)}
                      className={`w-full px-3 py-2 border rounded-md text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${
                        errors[`student${index}_category_${area}`] ? "border-red-500" : "border-gray-300"
                      }`}
                    >
                      <option value="">Seleccione categoría</option>
                      {areaToCategories[area]?.map((cat, i) => (
                        <option key={i} value={cat}>{cat}</option>
                      ))}
                    </select>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ))}

      </div>
      
      <div className="flex justify-between items-center">
        <button
          type="button"
          onClick={addStudent}
          disabled={students.length >= 20}
          className={`flex items-center px-3 py-2 text-sm rounded-md ${
            students.length >= 20 
              ? "bg-gray-100 text-gray-400 cursor-not-allowed" 
              : "bg-blue-50 text-blue-600 hover:bg-blue-100"
          }`}
        >
          <Plus className="h-4 w-4 mr-1" />
          Agregar otro estudiante
        </button>
        
        <button
          type="button"
          onClick={generateExcelFromForm}
          className="flex items-center px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700"
        >
          <Download className="h-4 w-4 mr-2" />
          Generar Excel
        </button>
      </div>
      
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => {
            setCurrentSection(2);
            setRegistrationMethod(null);
          }}
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
          {uiState.isSubmitting ? "Validando..." : "Validar y Continuar"}
        </button>
      </div>
    </div>
  );

  const renderExcelUploadSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        3. Cargar archivo Excel
      </h3>
      
      <div className="bg-blue-50 p-4 rounded-md mb-4">
        <p className="text-sm text-blue-800">
          Por favor suba un archivo Excel con el formato requerido. 
          <a 
            href="#" 
            onClick={(e) => {
              e.preventDefault();
              generateTemplateExcel();
            }}
            className="text-blue-600 hover:text-blue-800 ml-1"
          >
            Descargar plantilla
          </a>
        </p>
      </div>
      
      <div 
        onClick={() => fileInputRef.current.click()}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
          excelData 
            ? "border-green-300 bg-green-50"
            : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
        }`}
      >
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileUpload}
          accept=".xlsx, .xls"
          className="hidden"
        />
        
        {excelData ? (
          <>
            <Check className="h-10 w-10 text-green-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Archivo cargado correctamente
            </p>
            <p className="text-xs text-gray-500">
              {excelFileName} - {excelData.length} estudiantes
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExcelData(null);
                setExcelFileName("");
                setExcelErrors([]);
              }}
              className="mt-3 text-xs text-red-600 hover:text-red-800 flex items-center justify-center"
            >
              <Trash2 className="h-3 w-3 mr-1" />
              Eliminar archivo
            </button>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              Arrastra y suelta tu archivo Excel aquí
            </p>
            <p className="text-xs text-gray-500">
              o haz clic para seleccionar un archivo
            </p>
            <p className="mt-2 text-xs text-gray-500">
              Formatos soportados: .xlsx, .xls
            </p>
          </>
        )}
      </div>
      
      {excelErrors.length > 0 && (
        <div className="border border-red-200 rounded-lg p-4 bg-red-50">
          <h4 className="text-sm font-medium text-red-800 mb-2">
            Errores encontrados en el archivo
          </h4>
          <div className="space-y-3">
            {excelErrors.map((error, i) => (
              <div key={i} className="text-sm text-red-600">
                {error.rowNumber ? (
                  <p><span className="font-medium">Fila {error.rowNumber}:</span> {Object.values(error.errors).join(", ")}</p>
                ) : (
                  <p>{error.message}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
      

      {excelData && (
  <div className="border border-gray-200 rounded-lg overflow-hidden">
    <div className="bg-gray-50 px-4 py-2 border-b border-gray-200">
      <h4 className="text-sm font-medium text-gray-700">
        Vista previa de datos ({excelData.length} estudiantes)
      </h4>
    </div>
    <div className="overflow-x-auto max-h-96">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50">
          <tr>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Correo</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Apellidos</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nombres</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Ci_Competidor</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Fecha Nac.</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Colegio</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Curso</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Departamento</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Provincia</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Area 1</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nivel 1</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Area 2</th>
            <th className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase">Nivel 2</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {excelData.slice(0, 5).map((row, i) => (
            <tr key={i}>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">{row.Correo}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row.Apellidos}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row.Nombres}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row.Ci_Competidor}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row['Fecha de Nacimiento']}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row.Colegio}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row.Curso}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row.Departamento}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row.Provincia}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row['Area 1']}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row['Nivel 1']}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row['Area 2'] || '-'}</td>
              <td className="px-3 py-2 whitespace-nowrap text-sm text-gray-500">{row['Nivel 2'] || '-'}</td>
            </tr>
          ))}
          {excelData.length > 5 && (
            <tr>
              <td colSpan={13} className="px-3 py-2 text-center text-xs text-gray-500">
                + {excelData.length - 5} estudiantes más...
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  </div>
)}
      
      <div className="mt-6 flex justify-between">
        <button
          type="button"
          onClick={() => {
            setCurrentSection(2);
            setRegistrationMethod(null);
          }}
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50"
        >
          Anterior
        </button>
        <button
          type="submit"
          disabled={!excelData || uiState.isSubmitting}
          className={`px-4 py-2 text-white rounded-md ${
            !excelData || uiState.isSubmitting
              ? "bg-blue-400 cursor-not-allowed"
              : "bg-blue-600 hover:bg-blue-700"
          }`}
        >
          {uiState.isSubmitting ? "Validando..." : "Validar y Continuar"}
        </button>
      </div>
    </div>
  );

  const generateTemplateExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Plantilla");
      
       worksheet.columns = [
      { header: "Correo", key: "Correo", width: 25 },
      { header: "Apellidos", key: "Apellidos", width: 25 },
      { header: "Nombres", key: "Nombres", width: 25 },
      { header: "Ci_Competidor", key: "Ci_Competidor", width: 25 },
      { header: "Fecha de Nacimiento", key: "Fecha de Nacimiento", width: 15 },
      { header: "Colegio", key: "Colegio", width: 30 },
      { header: "Curso", key: "Curso", width: 15 },
      { header: "Departamento", key: "Departamento", width: 15 },
      { header: "Provincia", key: "Provincia", width: 15 },
      { header: "Area 1", key: "Area 1", width: 20 },
      { header: "Nivel 1", key: "Nivel 1", width: 15 },
      { header: "Area 2", key: "Area 2", width: 20 },
      { header: "Nivel 2", key: "Nivel 2", width: 15, 
        note: "Opcional - dejar vacío si no aplica" }
    ];
      
      // Ejemplo de fila
    worksheet.addRow({
      "Correo": "ejemplo@email.com",
      "Apellidos": "Perez",
      "Nombres": "Juan",
      "Ci_Competidor": "1234567|Regular", // Formato: CI|TipoCompetidor
      "Fecha de Nacimiento": "15/05/2008",
      "Colegio": "Colegio Ejemplo",
      "Curso": "4to de secundaria",
      "Departamento": "Cochabamba",
      "Provincia": "Cercado",
      "Area 1": "MATEMÁTICAS",
      "Nivel 1": "Primer Nivel",
      "Area 2": "", // Opcional
      "Nivel 2": ""  // Opcional
    });
      
      const headerRow = worksheet.getRow(1);
      headerRow.eachCell(cell => {
        cell.font = { 
          bold: true, 
          color: { argb: 'FFFFFFFF' },
          size: 12
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FF4F81BD' }
        };
        cell.border = {
          top: { style: 'thin', color: { argb: 'FF000000' } },
          left: { style: 'thin', color: { argb: 'FF000000' } },
          bottom: { style: 'thin', color: { argb: 'FF000000' } },
          right: { style: 'thin', color: { argb: 'FF000000' } }
        };
        cell.alignment = { 
          vertical: 'middle', 
          horizontal: 'center',
          wrapText: true
        };
      });
      
      const exampleRow = worksheet.getRow(2);
      exampleRow.eachCell(cell => {
        cell.border = {
          top: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          left: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          bottom: { style: 'thin', color: { argb: 'FFD3D3D3' } },
          right: { style: 'thin', color: { argb: 'FFD3D3D3' } }
        };
        cell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFF2F2F2' }
        };
        cell.font = {
          italic: true
        };
      });
      
      worksheet.addRow([]);
      
      const noteRow = worksheet.addRow(["NOTA: Las áreas disponibles son: " + areaOptions.join(", ")]);
      noteRow.font = { italic: true, size: 10 };
      noteRow.getCell(1).alignment = { wrapText: true };
      worksheet.mergeCells(`A${noteRow.number}:H${noteRow.number}`);
      
      worksheet.columns.forEach(column => {
        if (column.values) {
          const maxLength = column.values.reduce((max, value) => {
            if (value && typeof value.toString === 'function') {
              const length = value.toString().length;
              return Math.max(max, length);
            }
            return max;
          }, column.header.length);
          
          column.width = Math.min(Math.max(maxLength + 2, 10), 50);
        }
      });
      
      const buffer = await workbook.xlsx.writeBuffer();
      const blob = new Blob([buffer], { 
        type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" 
      });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.href = url;
      link.download = "Plantilla_Inscripcion_Grupal.xlsx";
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Error al generar plantilla Excel:", error);
      alert("Error al generar la plantilla Excel");
    }
  };

  const renderErrorsModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-2xl w-full shadow-xl animate-fade-in max-h-[80vh] overflow-y-auto">
        <div className="text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Errores en los datos
          </h3>
          <div className="mt-4 text-sm text-gray-600 text-left">
            <p className="mb-4">Por favor corrija los siguientes errores antes de continuar:</p>
            
            {excelErrors.map((error, i) => (
              <div key={i} className="mb-4 p-3 bg-red-50 rounded-md">
                {registrationMethod === "excel" ? (
                  <p className="font-medium">Fila {error.rowNumber}:</p>
                ) : (
                  <p className="font-medium">Estudiante #{error.studentIndex}:</p>
                )}
                
                <ul className="list-disc pl-5 mt-1">
                  {Object.entries(error.errors).map(([field, message]) => (
                    <li key={field}>{message}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="mt-6">
          <button
            type="button"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => setUiState(prev => ({ ...prev, showErrorsModal: false }))}
          >
            Entendido, corregiré los errores
          </button>
        </div>
      </div>
    </div>
  );

  const renderPaymentModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-md w-full shadow-xl animate-fade-in">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100">
            <Check className="h-6 w-6 text-blue-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mt-3">
            Orden de Pago Grupal
          </h3>
          <div className="mt-4 text-sm text-gray-600 text-left space-y-3">
            <div className="flex justify-between">
              <span className="font-medium">Tutor:</span>
              <span>{uiState.paymentData.tutorName}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Estudiantes:</span>
              <span>{uiState.paymentData.studentCount}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Monto total:</span>
              <span className="font-bold">{uiState.paymentData.amount} Bs.</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Código de pago:</span>
              <span className="font-mono">{uiState.paymentData.paymentCode}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">ID de Registro:</span>
              <span className="font-mono">{uiState.paymentData.registrationId}</span>
            </div>
            <div className="flex justify-between">
              <span className="font-medium">Fecha límite:</span>
              <span>{uiState.paymentData.paymentDeadline.toLocaleDateString()}</span>
            </div>
            
            <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-md">
              <p className="text-yellow-700 text-sm">
                <span className="font-medium">Importante:</span> Debe presentar esta orden de pago en las cajas de la FCyT para completar la inscripción grupal.
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
            Inscripción Grupal Completada
          </h3>
          <div className="mt-2 text-sm text-gray-500">
            La inscripción grupal ha sido registrada correctamente. Recibirá un correo de confirmación con los detalles.
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
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <button 
          onClick={() => navigate(-1)}
          className="flex items-center text-gray-600 hover:text-gray-900"
        >
          <ArrowLeft className="h-5 w-5 mr-1" />
          Volver
        </button>
        <h1 className="text-xl font-bold text-gray-900">
          Inscripción Grupal de Estudiantes
        </h1>
        <div className="w-24"></div>
      </div>

      <div className="mb-6">
        <nav className="flex items-center justify-center">
          <ol className="flex items-center space-x-4">
            {[1, 2, 3, 4].map((step) => (
              <li key={step}>
                {step < currentSection || completedSections.includes(step) ? (
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 bg-blue-600 rounded-full">
                      <Check className="w-5 h-5 text-white" />
                    </span>
                    <span className="ml-2 text-sm font-medium text-blue-600">
                      {step === 1 ? "Tutor" : step === 2 ? "Método" : step === 3 ? "Estudiantes" : "Pago"}
                    </span>
                  </div>
                ) : step === currentSection ? (
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 border-2 border-blue-600 rounded-full">
                      <span className="text-blue-600">{step}</span>
                    </span>
                    <span className="ml-2 text-sm font-medium text-blue-600">
                      {step === 1 ? "Tutor" : step === 2 ? "Método" : step === 3 ? "Estudiantes" : "Pago"}
                    </span>
                  </div>
                ) : (
                  <div className="flex items-center">
                    <span className="flex items-center justify-center w-8 h-8 border-2 border-gray-300 rounded-full">
                      <span className="text-gray-500">{step}</span>
                    </span>
                    <span className="ml-2 text-sm font-medium text-gray-500">
                      {step === 1 ? "Tutor" : step === 2 ? "Método" : step === 3 ? "Estudiantes" : "Pago"}
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
          {currentSection === 1 && renderTutorDataSection()}
          {currentSection === 2 && renderMethodSelectionSection()}
          {currentSection === 3 && registrationMethod === "form" && renderManualFormSection()}
          {currentSection === 3 && registrationMethod === "excel" && renderExcelUploadSection()}
        </form>
      </div>

      {uiState.showErrorsModal && renderErrorsModal()}
      {uiState.showPaymentModal && renderPaymentModal()}
      {uiState.showSuccessModal && renderSuccessModal()}
    </div>
  );
};

export default StudentGroupRegistration;