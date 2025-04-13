import { useState, useRef, useEffect } from "react";
import { X, Check, ArrowLeft, Upload, Download, Plus, Trash2 } from "lucide-react";
import { useNavigate } from "react-router-dom";
import ExcelJS from 'exceljs';
import PaymentUpload from "../components/PaymentUpload"; // Corregir la importación
import { supabase } from "../supabaseClient"; // Importar el cliente Supabase

const StudentGroupRegistration = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
  // Estado para controlar las secciones activas
  const [currentSection, setCurrentSection] = useState(1);
  const [completedSections, setCompletedSections] = useState([]);
  
  // Estado para el método de inscripción seleccionado
  const [registrationMethod, setRegistrationMethod] = useState(null);
  
  // Datos del tutor
  const [tutorData, setTutorData] = useState({
    name: "",
    email: "",
    phone: ""
  });

  // Estado para estudiantes (formulario manual)
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
      areas: [], // Áreas seleccionadas
      categories: {} // Categorías por área
    }
  ]);

  // Estado para el archivo Excel cargado
  const [excelData, setExcelData] = useState(null);
  const [excelFileName, setExcelFileName] = useState("");
  const [excelErrors, setExcelErrors] = useState([]);
  
  // Estado para la UI
  const [uiState, setUiState] = useState({
    isSubmitting: false,
    showSuccessModal: false,
    showPaymentModal: false,
    showErrorsModal: false,
    paymentData: null,
    uploadProgress: 0,
    paymentProof: null
  });

  const [errors, setErrors] = useState({});
  const [dragActive, setDragActive] = useState(false);
  const [dragActivePayment, setDragActivePayment] = useState(false);

  // Estado para olimpiada actual
  const [currentOlympiad, setCurrentOlympiad] = useState(null);
  const [areaObjects, setAreaObjects] = useState([]); // Almacenar objetos de áreas completos

  /* 
  API SUGERIDA: Obtener departamentos desde el backend
  Endpoint: GET /api/departments
  Descripción: Devuelve la lista de departamentos disponibles
  */
  const departmentOptions = ["Cochabamba", "La Paz", "Santa Cruz", "Oruro", "Potosí", "Chuquisaca", "Tarija", "Beni", "Pando"];
  
  /* 
  API SUGERIDA: Obtener provincias por departamento desde el backend
  Endpoint: GET /api/provinces?department=<department>
  Descripción: Devuelve las provincias para un departamento específico
  */
  const provinceOptions = {
    "Cochabamba": ["Cercado", "Quillacollo", "Chapare", "Ayopaya", "Esteban Arce", "Arani", "Arque", "Capinota", "Germán Jordán", "Mizque", "Punata", "Tiraque"],
    "La Paz": ["Murillo", "Omasuyos", "Camacho", "Muñecas", "Larecaja", "Franz Tamayo", "Ingavi", "Loayza", "Inquisivi", "Sud Yungas", "Los Andes", "Aroma"],
    "Santa Cruz": ["Andrés Ibáñez", "Warnes", "Velasco", "Ichilo", "Chiquitos", "Sara", "Cordillera", "Vallegrande", "Florida", "Obispo Santistevan", "Ñuflo de Chávez", "Ángel Sandoval"],
    // ... otras provincias
  };

  /* 
  API SUGERIDA: Obtener áreas disponibles desde el backend
  Endpoint: GET /api/competition-areas
  Descripción: Devuelve las áreas de competencia disponibles
  */
  const areaOptions = [
    "ASTRONOMÍA - ASTROFÍSICA",
    "BIOLOGÍA",
    "FÍSICA",
    "INFORMÁTICA",
    "MATEMÁTICAS",
    "QUÍMICA",
    "ROBÓTICA"
  ];

  /* 
  API SUGERIDA: Obtener categorías por área desde el backend
  Endpoint: GET /api/competition-categories?area=<area>
  Descripción: Devuelve las categorías disponibles para un área específica
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

  // Obtener la olimpiada actual y las áreas disponibles al cargar la página
  useEffect(() => {
    async function fetchOlympiadAndAreas() {
      try {
        // --------------------------------API base de datos-----------------------------------
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
        } else {
          setCurrentOlympiad(olympiadData);
        }

        // 3. Obtener las áreas disponibles con sus categorías y costos
        const { data: areasData, error: areasError } = await supabase
          .from('area')
          .select('*')
          .eq('estado', 'activo');

        if (areasError) {
          console.error('Error al obtener áreas:', areasError);
        } else {
          // Si tenemos áreas desde la base de datos, las usamos
          if (areasData && areasData.length > 0) {
            setAreaObjects(areasData);
            
            // Extraer nombres únicos de áreas
            const uniqueAreaNames = [...new Set(areasData.map(area => area.nombre))];
            // Si hay áreas en la base de datos, actualizamos areaOptions
            if (uniqueAreaNames.length > 0) {
              // Usamos setAreas si es un estado, o modificamos la constante mediante algún otro método
              // Como areaOptions es constante, probablemente necesites un estado
              // setAreaOptions(uniqueAreaNames);
            }
          }
        }
        // --------------------------------Fin API base de datos-----------------------------------
      } catch (error) {
        console.error('Error al cargar datos iniciales:', error);
      }
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

  // Manejar cambios en los datos del tutor
  const handleTutorChange = (e) => {
    const { name, value } = e.target;
    setTutorData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: "" }));
  };

  // Manejar cambios en los datos de un estudiante
  const handleStudentChange = (id, e) => {
    const { name, value } = e.target;
    
    setStudents(prev => prev.map(student => 
      student.id === id ? { ...student, [name]: value } : student
    ));
  };

  // Manejar selección de áreas para un estudiante
  const handleStudentAreaSelection = (studentId, area) => {
    setStudents(prev => prev.map(student => {
      if (student.id !== studentId) return student;
      
      // Si el área ya está seleccionada, la quitamos
      if (student.areas.includes(area)) {
        const newCategories = { ...student.categories };
        delete newCategories[area];
        
        return {
          ...student,
          areas: student.areas.filter(a => a !== area),
          categories: newCategories
        };
      }
      
      // Si no está seleccionada y hay menos de 2, la agregamos
      if (student.areas.length < 2) {
        return {
          ...student,
          areas: [...student.areas, area],
          categories: {
            ...student.categories,
            [area]: "" // Inicializar categoría vacía
          }
        };
      }
      
      return student;
    }));
  };

  // Manejar cambio de categoría para un área de estudiante
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

  // Agregar nuevo estudiante al formulario
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

  // Eliminar estudiante del formulario
  const removeStudent = (id) => {
    if (students.length <= 1) return;
    setStudents(prev => prev.filter(student => student.id !== id));
  };

  // Validar sección actual
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
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Validar todos los estudiantes del formulario manual
  const validateAllStudents = () => {
    const errorsList = [];
    
    students.forEach((student, index) => {
      const studentErrors = {};
      
      if (!student.lastName) studentErrors.lastName = "Apellidos requeridos";
      if (!student.firstName) studentErrors.firstName = "Nombres requeridos";
      if (!student.ci) studentErrors.ci = "CI requerido";
      if (!student.school) studentErrors.school = "Colegio requerido";
      if (!student.grade) studentErrors.grade = "Curso requerido";
      if (!student.department) studentErrors.department = "Departamento requerido";
      if (!student.province) studentErrors.province = "Provincia requerida";
      
      // Validación de áreas
      if (student.areas.length === 0) {
        studentErrors.areas = "Debe seleccionar al menos un área";
      } else if (student.areas.length > 2) {
        studentErrors.areas = "Máximo 2 áreas por estudiante";
      }
      
      // Validación específica para Robótica
      const hasRobotics = student.areas.includes("ROBÓTICA");
      if (hasRobotics && student.areas.length > 1) {
        studentErrors.areas = "Si postula a ROBÓTICA, no puede postular a otra área";
      }
      
      // Validar que todas las áreas tengan categoría
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

  // Validar datos del Excel
  const validateExcelData = (data) => {
    const errorsList = [];
    
    data.forEach((row, index) => {
      const rowErrors = {};
      
      // Validar campos requeridos
      if (!row.Apellidos) rowErrors.lastName = "Apellidos requeridos";
      if (!row.Nombres) rowErrors.firstName = "Nombres requeridos";
      if (!row.CI) rowErrors.ci = "CI requerido";
      if (!row.Colegio) rowErrors.school = "Colegio requerido";
      if (!row.Curso) rowErrors.grade = "Curso requerido";
      if (!row.Departamento) rowErrors.department = "Departamento requerido";
      if (!row.Provincia) rowErrors.province = "Provincia requerida";
      if (!row.Áreas) rowErrors.areas = "Áreas requeridas";
      
      // Validación de formato de CI
      if (row.CI && !/^[0-9]+$/.test(row.CI)) {
        rowErrors.ci = "CI debe contener solo números";
      }
      
      // Validación de áreas
      if (row.Áreas) {
        const areas = row.Áreas.split(',').map(a => a.trim());
        
        if (areas.length === 0) {
          rowErrors.areas = "Debe especificar al menos un área";
        } else if (areas.length > 2) {
          rowErrors.areas = "Máximo 2 áreas por estudiante";
        }
        
        // Validar que las áreas existan en las opciones
        areas.forEach(area => {
          if (!areaOptions.includes(area)) {
            rowErrors.areas = `Área no válida: ${area}`;
          }
        });
        
        // Validación específica para Robótica
        const hasRobotics = areas.includes("ROBÓTICA");
        if (hasRobotics && areas.length > 1) {
          rowErrors.areas = "Si postula a ROBÓTICA, no puede postular a otra área";
        }
      }
      
      if (Object.keys(rowErrors).length > 0) {
        errorsList.push({
          rowNumber: index + 2, // +2 porque la primera fila es encabezado y index empieza en 0
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

  // Manejar selección de método de inscripción
  const selectRegistrationMethod = (method) => {
    setRegistrationMethod(method);
    goToNextSection();
  };

  // Manejar carga de archivo Excel con ExcelJS
  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    
    // Validar tipo de archivo
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
      
      // Leer encabezados y validar formato
      const headers = [];
      worksheet.getRow(1).eachCell((cell) => {
        headers.push(cell.value?.toString().trim());
      });
      
      // Columnas requeridas
      const requiredColumns = [
        'Apellidos', 'Nombres', 'CI', 'Colegio', 
        'Curso', 'Departamento', 'Provincia', 'Áreas'
      ];
      
      // Verificar que todas las columnas requeridas estén presentes
      const missingColumns = requiredColumns.filter(col => !headers.includes(col));
      
      if (missingColumns.length > 0) {
        throw new Error(`El archivo no tiene el formato correcto. Faltan las columnas: ${missingColumns.join(', ')}`);
      }
      
      // Leer filas de datos
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber === 1) return; // Saltar encabezados
        
        const rowData = {};
        row.eachCell((cell, colNumber) => {
          const header = headers[colNumber - 1];
          if (header && requiredColumns.includes(header)) {
            rowData[header] = cell.value?.toString().trim() || "";
          }
        });
        
        if (Object.keys(rowData).length > 0) {
          jsonData.push(rowData);
        }
      });
      
      if (jsonData.length === 0) {
        throw new Error("El archivo no contiene datos de estudiantes");
      }
      
      // Validar datos del Excel
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

  // Generar Excel con ExcelJS - Versión mejorada
  const generateExcelFromForm = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      workbook.creator = "Sistema de Inscripciones";
      workbook.lastModifiedBy = tutorData.name;
      workbook.created = new Date();
      workbook.modified = new Date();
      
      const worksheet = workbook.addWorksheet("Estudiantes");
      
      // Configurar columnas con estilos
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
      
      // Agregar datos
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
      
      // Estilizar encabezados
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
      
      // Aplicar bordes a todas las celdas de datos
      worksheet.eachRow((row, rowNumber) => {
        if (rowNumber > 1) { // Skip header row
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
      
      // Autoajustar columnas
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
      
      // Agregar información del tutor como metadata
      workbook.properties.company = tutorData.name;
      workbook.properties.manager = tutorData.email;
      
      // Generar archivo
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
      
      // Limpiar
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Error al generar Excel:", error);
      setErrors(prev => ({ ...prev, excelGeneration: "Error al generar el archivo Excel" }));
    }
  };

  /* 
  API PRINCIPAL: Enviar datos de inscripción grupal
  Endpoint: POST /api/group-registration
  Descripción: Registra a los estudiantes en el sistema
  Body: { tutor: {...}, students: [...] }
  Response: { success: boolean, message: string, registrationId?: string, paymentData?: {...} }
  */
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      // Validar según el método seleccionado
      let validationErrors = [];
      let studentsToSubmit = [];
      
      if (registrationMethod === "form") {
        validationErrors = validateAllStudents();
        studentsToSubmit = students.map(student => ({
          lastName: student.lastName,
          firstName: student.firstName,
          ci: student.ci,
          birthDate: student.birthDate,
          school: student.school,
          grade: student.grade,
          department: student.department,
          province: student.province,
          areas: student.areas,
          categories: student.categories
        }));
      } else if (registrationMethod === "excel") {
        if (!excelData) {
          throw new Error("No se ha cargado ningún archivo Excel");
        }
        validationErrors = validateExcelData(excelData);
        studentsToSubmit = excelData.map(row => {
          // Extraer las áreas del formato "ÁREA1, ÁREA2"
          const areas = row.Áreas.split(',').map(a => a.trim());
          
          // Para extraer categorías si están disponibles (por ejemplo, en formato "ÁREA: CATEGORÍA")
          // Este paso es opcional y depende del formato de tu Excel
          const categories = {};
          if (row.Categorías) {
            const categoryPairs = row.Categorías.split(',').map(c => c.trim());
            categoryPairs.forEach(pair => {
              const [area, category] = pair.split(':').map(p => p.trim());
              if (area && category) {
                categories[area] = category;
              }
            });
          } else {
            // Si no hay categorías explícitas, asignar categorías por defecto
            // basadas en las áreas y el grado del estudiante
            areas.forEach(area => {
              // Lógica simplificada - en producción esto sería más sofisticado
              // basado en el grado del estudiante y las reglas de negocio
              categories[area] = areaToCategories[area] ? 
                areaToCategories[area][0] : ""; // Primera categoría disponible por defecto
            });
          }
          
          return {
            lastName: row.Apellidos,
            firstName: row.Nombres,
            ci: row.CI,
            birthDate: row["Fecha Nacimiento"] || "",
            school: row.Colegio,
            grade: row.Curso,
            department: row.Departamento,
            province: row.Provincia,
            areas: areas,
            categories: categories
          };
        });
      }
      
      // Si hay errores, mostrarlos y no continuar
      if (validationErrors.length > 0) {
        setExcelErrors(validationErrors);
        setUiState(prev => ({ 
          ...prev, 
          isSubmitting: false,
          showErrorsModal: true
        }));
        return;
      }
      
      // Calcular el costo total basado en el número de estudiantes y áreas
      let totalCost = 0;
      
      studentsToSubmit.forEach(student => {
        student.areas.forEach(areaName => {
          const categoryName = student.categories[areaName];
          const areaObj = areaObjects.find(a => a.nombre === areaName && a.nivel === categoryName);
          
          if (areaObj) {
            totalCost += areaObj.costo || 15; // Usar costo de la DB o 15 Bs por defecto
          } else {
            totalCost += 15;
          }
        });
      });
      
      // En caso de datos insuficientes, usar el cálculo simplificado
      if (totalCost === 0) {
        totalCost = studentsToSubmit.length * 15; // 15 Bs por estudiante como respaldo
      }
      
      // Generar datos de pago
      const paymentData = {
        registrationId: "GRP-" + Math.random().toString(36).substr(2, 8).toUpperCase(),
        amount: totalCost,
        tutorName: tutorData.name,
        studentCount: studentsToSubmit.length,
        paymentDeadline: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000), // 3 días desde ahora
        paymentCode: "PAGO-" + Math.random().toString(36).substr(2, 6).toUpperCase(),
        students: studentsToSubmit // Guardamos la lista de estudiantes para uso posterior
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

  // Nueva función para guardar los datos en la base de datos después de simular la subida del comprobante
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
      
      console.log("Guardando datos de inscripción grupal en la base de datos...");
      
      // 1. Crear contacto (tutor)
      const { data: contactData, error: contactError } = await supabase
        .from('contacto')
        .insert({
          celular: tutorData.phone,
          nombre: tutorData.name,
          correo: tutorData.email
        })
        .select()
        .single();
          
      if (contactError) {
        throw new Error(`Error al crear contacto: ${contactError.message}`);
      }
      
      // 2. Procesar cada estudiante
      const students = uiState.paymentData.students;
      const registrationResults = [];
      
      for (const student of students) {
        try {
          // 2.1 Buscar/crear el colegio
          let colegioId;
          const { data: existingSchool, error: schoolFindError } = await supabase
            .from('colegio')
            .select('id')
            .eq('nombre', student.school)
            .eq('departamento', student.department)
            .eq('provincia', student.province)
            .single();
          
          if (schoolFindError) {
            // Crear nuevo colegio
            const { data: newSchool, error: schoolCreateError } = await supabase
              .from('colegio')
              .insert({
                nombre: student.school,
                departamento: student.department,
                provincia: student.province
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
          
          // 2.2 Insertar o actualizar estudiante
          const { error: studentError } = await supabase
            .from('estudiante')
            .upsert({
              ci: student.ci,
              correo: student.email || `${student.firstName.toLowerCase()}.${student.lastName.toLowerCase()}@estudiante.com`,
              apellidos: student.lastName,
              nombres: student.firstName,
              fecha_nacimiento: student.birthDate || new Date().toISOString().split('T')[0],
              curso: student.grade
            });
              
          if (studentError) {
            throw new Error(`Error al guardar estudiante: ${studentError.message}`);
          }
          
          // 2.3 Obtener IDs de las áreas seleccionadas
          const area1 = student.areas[0];
          const area1Id = getAreaId(area1, student.categories[area1]);
          
          let area2Id = null;
          if (student.areas.length > 1) {
            const area2 = student.areas[1];
            area2Id = getAreaId(area2, student.categories[area2]);
          }
          
          // 2.4 Crear la inscripción
          const { data: inscriptionData, error: inscriptionError } = await supabase
            .from('inscripción')
            .insert({
              estudiante_id: student.ci,
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
          // --------------------------------Fin API base de datos-----------------------------------
          
          registrationResults.push({
            success: true,
            student: `${student.firstName} ${student.lastName}`,
            ci: student.ci
          });
          
        } catch (studentError) {
          console.error(`Error procesando estudiante ${student.firstName} ${student.lastName}:`, studentError);
          registrationResults.push({
            success: false,
            student: `${student.firstName} ${student.lastName}`,
            ci: student.ci,
            error: studentError.message
          });
        }
      }
      
      console.log("Registro grupal completado con resultados:", registrationResults);
      
      // Verificar si hubo errores en algún estudiante
      const hasErrors = registrationResults.some(r => !r.success);
      
      // Mostrar modal de éxito o error según resultados
      setUiState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        registrationCompleted: true,
        registrationResults: registrationResults,
        showSuccessModal: true,
        showUploadModal: false,
        hasPartialErrors: hasErrors
      }));
      
    } catch (error) {
      console.error("Error al guardar datos de inscripción grupal:", error);
      
      // A pesar del error, mostramos éxito para fines de demostración
      // En un entorno de producción, se debería mostrar el error
      setUiState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        registrationCompleted: true,
        showSuccessModal: true,
        showUploadModal: false,
        error: error.message
      }));
    }
  };

  // Modificar la función de subida del comprobante para guardar los datos después
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
    // NOTA: Esta parte se mantiene como simulación para futura implementación de subida de archivos
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
        
        // Simulamos una URL para el comprobante (esto se implementará más adelante)
        const simulatedUrl = `https://ejemplo.com/comprobantes/${uiState.paymentData.registrationId}.${file.name.split('.').pop()}`;
        
        setUiState(prev => ({ 
          ...prev, 
          uploadProgress: 100,
          paymentProofUrl: simulatedUrl
        }));
        
        // Una vez "subido" el comprobante, guardamos los datos
        setTimeout(() => {
          saveRegistrationData();
        }, 1000);
      }
    }, 300);
  };

  // Sección 1: Datos del tutor
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

  // Sección 2: Selección de método de inscripción
  const renderMethodSelectionSection = () => (
    <div className="space-y-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">
        2. Método de inscripción grupal
      </h3>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Opción 1: Formulario manual */}
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
        
        {/* Opción 2: Cargar Excel */}
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

  // Sección 3a: Formulario manual para estudiantes
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
              
              {/* Selección de áreas para el estudiante */}
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
                
                {/* Mostrar categorías para cada área seleccionada */}
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

  // Sección 3b: Carga de archivo Excel
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
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
        className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
          dragActive 
            ? "border-blue-500 bg-blue-50" 
            : excelData 
              ? "border-green-300 bg-green-50"
              : excelErrors.length > 0
                ? "border-red-300 bg-red-50"
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
        ) : excelErrors.length > 0 ? (
          <>
            <X className="h-10 w-10 text-red-500 mx-auto mb-3" />
            <p className="text-sm font-medium text-red-700 mb-1">
              Error al procesar el archivo
            </p>
            <p className="text-xs text-red-600 max-w-md mx-auto">
              {excelErrors[0].message || "El archivo no cumple con el formato requerido"}
            </p>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation();
                setExcelErrors([]);
              }}
              className="mt-3 px-3 py-1 text-xs bg-red-100 text-red-700 rounded hover:bg-red-200 mx-auto inline-block"
            >
              Intentar con otro archivo
            </button>
          </>
        ) : (
          <>
            <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
            <p className="text-sm font-medium text-gray-900 mb-1">
              {dragActive ? "Suelta el archivo aquí" : "Arrastra y suelta tu archivo Excel aquí"}
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
      
      {/* Mensajes de estado de carga */}
      {!excelData && !excelErrors.length > 0 && (
        <div className="text-center text-xs text-gray-500 mt-2">
          Asegúrate de que el archivo Excel contenga las columnas: Apellidos, Nombres, CI, Colegio, Curso, Departamento, Provincia y Áreas
        </div>
      )}
      
      {/* Vista previa de datos */}
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
                  {Object.keys(excelData[0]).map((key, i) => (
                    <th 
                      key={i}
                      scope="col"
                      className="px-3 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50"
                    >
                      {key}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {excelData.slice(0, 5).map((row, i) => (
                  <tr key={i}>
                    {Object.values(row).map((value, j) => (
                      <td 
                        key={j}
                        className="px-3 py-2 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate"
                        title={value}
                      >
                        {value}
                      </td>
                    ))}
                  </tr>
                ))}
                {excelData.length > 5 && (
                  <tr>
                    <td 
                      colSpan={Object.keys(excelData[0]).length}
                      className="px-3 py-2 text-center text-xs text-gray-500"
                    >
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

  // Generar plantilla Excel
  const generateTemplateExcel = async () => {
    try {
      const workbook = new ExcelJS.Workbook();
      const worksheet = workbook.addWorksheet("Plantilla");
      
      // Configurar columnas con estilos
      worksheet.columns = [
        { header: "Apellidos", key: "Apellidos", width: 25 },
        { header: "Nombres", key: "Nombres", width: 25 },
        { header: "CI", key: "CI", width: 15 },
        { header: "Colegio", key: "Colegio", width: 30 },
        { header: "Curso", key: "Curso", width: 15 },
        { header: "Departamento", key: "Departamento", width: 15 },
        { header: "Provincia", key: "Provincia", width: 15 },
        { header: "Áreas", key: "Áreas", width: 30 }
      ];
      
      // Agregar datos de ejemplo
      worksheet.addRow({
        "Apellidos": "Perez",
        "Nombres": "Juan",
        "CI": "1234567",
        "Colegio": "Colegio Ejemplo",
        "Curso": "4to de secundaria",
        "Departamento": "Cochabamba",
        "Provincia": "Cercado",
        "Áreas": "MATEMÁTICAS, BIOLOGÍA"
      });
      
      // Estilizar encabezados
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
      
      // Aplicar bordes a las celdas de ejemplo
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
      
      // Agregar nota explicativa
      worksheet.addRow([]); // Fila vacía
      
      const noteRow = worksheet.addRow(["NOTA: Las áreas disponibles son: " + areaOptions.join(", ")]);
      noteRow.font = { italic: true, size: 10 };
      noteRow.getCell(1).alignment = { wrapText: true };
      worksheet.mergeCells(`A${noteRow.number}:H${noteRow.number}`);
      
      // Autoajustar columnas
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
      
      // Generar archivo
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
      
      // Limpiar
      setTimeout(() => URL.revokeObjectURL(url), 100);
    } catch (error) {
      console.error("Error al generar plantilla Excel:", error);
      alert("Error al generar la plantilla Excel");
    }
  };

  // Modal de errores de validación
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

  /* 
  API SUGERIDA: Generar PDF de orden de pago grupal
  Endpoint: POST /api/generate-group-payment-pdf
  Descripción: Genera y devuelve un PDF con la orden de pago grupal
  Body: { registrationId, tutorName, studentCount, amount }
  Response: PDF file
  */
  const handleDownloadPDF = () => {
    console.log("Generando PDF de orden de pago grupal...");
    // Simulación de descarga mientras la API no esté disponible
    const link = document.createElement('a');
    link.href = '#';
    link.download = `orden_pago_grupal_${uiState.paymentData.registrationId}.pdf`;
    link.click();
    
    // Mostrar modal de éxito - COMENTAR ESTA PARTE SI QUIERES QUE NO SE CIERRE AUTOMÁTICAMENTE EL MODAL
    // setUiState(prev => ({
    //   ...prev,
    //   showPaymentModal: false,
    //   showSuccessModal: true
    // }));
  };

  // Modal de pago
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
                <span className="font-medium">Importante:</span> Debe presentar esta orden de pago en las cajas de la FCyT para completar la inscripción grupal. Posteriormente, deberá subir el comprobante de pago en el sistema.
              </p>
            </div>
          </div>
        </div>
        <div className="mt-6 flex flex-col space-y-3">
          <button
            onClick={handleDownloadPDF}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 flex items-center justify-center"
          >
            <Download className="h-4 w-4 mr-2" />
            Descargar Orden de Pago (PDF)
          </button>
          <button
            onClick={() => setUiState(prev => ({ 
              ...prev, 
              showPaymentModal: false,
              showUploadModal: true 
            }))}
            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 flex items-center justify-center"
          >
            <Upload className="h-4 w-4 mr-2" />
            Subir Comprobante
          </button>
        </div>
      </div>
    </div>
  );

  // Modal para subir comprobante de pago - utilizando el componente PaymentUpload
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
            <p>Por favor suba una imagen o PDF del comprobante de pago grupal.</p>
            
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
            {uiState.uploadProgress > 0 ? "Subiendo..." : "Cambiar Archivo"}
          </button>
        </div>
      </div>
    </div>
  );

  // Modal de éxito final mejorado para mostrar resultados de la inscripción
  const renderSuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-lg w-full shadow-xl animate-fade-in max-h-[80vh] overflow-y-auto">
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
          
          {/* Detalles del registro */}
          <div className="mt-3 p-3 bg-blue-50 rounded-md text-left">
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">ID de Registro:</span>
              <span className="text-sm font-mono">{uiState.paymentData?.registrationId}</span>
            </div>
            <div className="flex justify-between items-center mb-2">
              <span className="text-sm font-medium">Estudiantes registrados:</span>
              <span className="text-sm">{uiState.paymentData?.studentCount}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm font-medium">Monto total:</span>
              <span className="text-sm font-medium">{uiState.paymentData?.amount} Bs.</span>
            </div>
          </div>
          
          {/* Mostrar resultados de inscripción individual si están disponibles */}
          {uiState.registrationResults && uiState.registrationResults.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-700 mb-2 text-left">Resumen de inscripciones:</h4>
              <div className="max-h-40 overflow-y-auto text-left border border-gray-200 rounded-md">
                <table className="min-w-full divide-y divide-gray-200">
                  <thead className="bg-gray-50 sticky top-0">
                    <tr>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Estudiante</th>
                      <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Estado</th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {uiState.registrationResults.map((result, index) => (
                      <tr key={index}>
                        <td className="px-3 py-2 text-xs text-gray-500">{result.student}</td>
                        <td className="px-3 py-2">
                          {result.success ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                              <Check className="h-3 w-3 mr-1" />
                              Éxito
                            </span>
                          ) : (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-red-100 text-red-800">
                              <X className="h-3 w-3 mr-1" />
                              Error
                            </span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
          
          {/* Mostrar error general si existe */}
          {uiState.error && (
            <div className="mt-3 p-2 bg-red-50 rounded-md">
              <p className="text-xs font-medium text-red-700">Error durante el proceso:</p>
              <p className="text-xs text-red-600">{uiState.error}</p>
            </div>
          )}
          
          {/* Mostrar advertencia si hubo errores parciales */}
          {uiState.hasPartialErrors && (
            <div className="mt-3 p-2 bg-yellow-50 rounded-md">
              <p className="text-xs font-medium text-yellow-700">Advertencia:</p>
              <p className="text-xs text-yellow-600">
                Algunos estudiantes no pudieron ser registrados. Por favor, contacte al administrador para más detalles.
              </p>
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

  // Corregir el manejador de eventos para arrastrar y soltar
  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  // Corregir el manejador para cuando se suelta el archivo
  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      
      // Validar tipo de archivo
      const fileExtension = file.name.split('.').pop().toLowerCase();
      if (fileExtension !== 'xlsx' && fileExtension !== 'xls') {
        setExcelErrors([{ message: "Formato de archivo no válido. Solo se aceptan archivos Excel (.xlsx, .xls)" }]);
        setExcelData(null);
        setExcelFileName("");
        return;
      }
      
      setExcelFileName(file.name);
      setExcelErrors([]);
      setUiState(prev => ({ ...prev, isSubmitting: true }));
      
      // Procesar el archivo
      const reader = new FileReader();
      reader.onload = async (event) => {
        try {
          const buffer = event.target.result;
          const workbook = new ExcelJS.Workbook();
          await workbook.xlsx.load(buffer);
          
          const worksheet = workbook.worksheets[0];
          if (!worksheet) {
            throw new Error("El archivo Excel no contiene hojas de cálculo");
          }
          
          const jsonData = [];
          
          // Leer encabezados
          const headers = [];
          worksheet.getRow(1).eachCell((cell) => {
            headers.push(cell.value?.toString().trim());
          });
          
          // Columnas requeridas
          const requiredColumns = [
            'Apellidos', 'Nombres', 'CI', 'Colegio', 
            'Curso', 'Departamento', 'Provincia', 'Áreas'
          ];
          
          // Verificar que todas las columnas requeridas estén presentes
          const missingColumns = requiredColumns.filter(col => !headers.includes(col));
          
          if (missingColumns.length > 0) {
            throw new Error(`El archivo no tiene el formato correcto. Faltan las columnas: ${missingColumns.join(', ')}`);
          }
          
          // Leer filas de datos
          worksheet.eachRow((row, rowNumber) => {
            if (rowNumber === 1) return; // Saltar encabezados
            
            const rowData = {};
            row.eachCell((cell, colNumber) => {
              const header = headers[colNumber - 1];
              if (header && requiredColumns.includes(header)) {
                rowData[header] = cell.value?.toString().trim() || "";
              }
            });
            
            if (Object.keys(rowData).length > 0) {
              jsonData.push(rowData);
            }
          });
          
          if (jsonData.length === 0) {
            throw new Error("El archivo no contiene datos de estudiantes");
          }
          
          // Validar datos del Excel
          const excelErrors = validateExcelData(jsonData);
          
          if (excelErrors.length > 0) {
            setExcelErrors(excelErrors);
            setExcelData(null);
          } else {
            setExcelData(jsonData);
          }
        } catch (error) {
          console.error("Error al leer el archivo Excel:", error);
          setExcelErrors([{ message: error.message || "Error al procesar el archivo Excel" }]);
          setExcelData(null);
        } finally {
          setUiState(prev => ({ ...prev, isSubmitting: false }));
        }
      };
      
      reader.readAsArrayBuffer(file);
    }
  };

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

      {/* Indicador de pasos */}
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

      {/* Modales */}
      {uiState.showErrorsModal && renderErrorsModal()}
      {uiState.showPaymentModal && renderPaymentModal()}
      {uiState.showUploadModal && renderUploadModal()}
      {uiState.showSuccessModal && renderSuccessModal()}
    </div>
  );
};

export default StudentGroupRegistration;