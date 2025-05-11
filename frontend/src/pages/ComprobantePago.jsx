import { useState, useRef, useEffect } from "react";
import { X, Check, Upload, Download, RefreshCw, AlertTriangle, Info, Search, UserCheck } from "lucide-react"; // Added Search, UserCheck
import { api } from '../api/apiClient';
import Tesseract from 'tesseract.js';
import { useNavigate } from 'react-router-dom'; // Added useNavigate

const ComprobantePago = ({ registrationId, onSuccess }) => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate(); // Added
  
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState([]);
  const [uiState, setUiState] = useState({
    isSubmitting: false,
    showSuccess: false,
    successMessage: "" // Added for custom success message
  });

  // Estados para OCR y comparación
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [extractedOcrData, setExtractedOcrData] = useState(null);
  const [showOcrSection, setShowOcrSection] = useState(false);
  const [inscriptionApiData, setInscriptionApiData] = useState(null); // Datos de la orden de pago original
  const [comparisonResult, setComparisonResult] = useState(null); // Resultado de comparación de montos
  const [ocrError, setOcrError] = useState("");

  // Nuevos estados para búsqueda por código de recibo
  const [foundInscriptionsByCode, setFoundInscriptionsByCode] = useState([]);
  const [isSearchingByCode, setIsSearchingByCode] = useState(false);
  const [searchByCodeError, setSearchByCodeError] = useState("");

  // Nuevo estado para logs de depuración en el frontend
  const [debugLog, setDebugLog] = useState([]);

  // Función para añadir entradas al log de depuración del frontend
  const addDebugEntry = (message, data = null) => {
    // const timestamp = new Date().toISOString();
    // setDebugLog(prevLog => [...prevLog, { timestamp, message, data }]);
  };

  useEffect(() => {
    addDebugEntry("Componente ComprobantePago montado/actualizado.", { registrationId });
    if (registrationId) {
      const fetchInscriptionData = async () => {
        try {
          // Esto obtiene datos de la orden de pago original (si registrationId se refiere a eso)
          // para mostrar el monto esperado.
          const data = await api.get(`/inscripción/${registrationId}?_relations=estudiante,contacto_tutor`); // CAMBIADO
          setInscriptionApiData({
            montoEsperado: parseFloat(data.monto_total) || 0,
            nombreEstudiante: data.estudiante ? `${data.estudiante.nombres} ${data.estudiante.apellidos}` : null,
            ciEstudiante: data.estudiante ? data.estudiante.ci : null,
            nombreTutor: data.contacto_tutor ? data.contacto_tutor.nombre : null,
          });
        } catch (error) {
          console.error("Error fetching original inscription data:", error);
          // No es crítico para el nuevo flujo si falla, pero se loguea.
        }
      };
      fetchInscriptionData();
    }
  }, [registrationId]);

  const processImageWithOCR = async (imageFile) => {
    if (!imageFile) return;
    addDebugEntry("Iniciando processImageWithOCR", { fileName: imageFile.name });
    setIsOcrProcessing(true);
    setOcrText("");
    setExtractedOcrData(null);
    setComparisonResult(null);
    setShowOcrSection(true);
    setOcrError("");
    setFoundInscriptionsByCode([]); // Limpiar inscripciones previas
    setSearchByCodeError("");   // Limpiar errores de búsqueda previos

    try {
      const { data: { text } } = await Tesseract.recognize(
        imageFile,
        'spa', // Español
        {
          // logger: m => console.log(m) // Opcional: para ver el progreso en la consola
        }
      );
      setOcrText(text);
      addDebugEntry("OCR completado, texto extraído.", { textLength: text.length });
      // ParseOcrText ahora también iniciará la búsqueda por código si se extrae.
      // PASO 1 (según descripción del usuario): Extraer código con OCR y parsearlo.
      parseOcrText(text); 
    } catch (err) {
      console.error("Error en OCR:", err);
      addDebugEntry("Error en OCR.", { error: err.message });
      setOcrError("Error durante el procesamiento OCR. Intente con una imagen más clara o verifique manualmente.");
      setComparisonResult({
        status: "error",
        message: "El OCR falló. Verifique el comprobante manualmente."
      });
    } finally {
      setIsOcrProcessing(false);
    }
  };

  const fetchInscriptionsByReceiptCode = async (receiptCode) => {
    addDebugEntry("Iniciando fetchInscriptionsByReceiptCode", { receiptCode, type: typeof receiptCode }); // Verificar tipo aquí
    console.log("Iniciando fetchInscriptionsByReceiptCode con:", `"${receiptCode}"`, "Tipo:", typeof receiptCode);
    if (!receiptCode) {
      addDebugEntry("fetchInscriptionsByReceiptCode: receiptCode está vacío.");
      console.log("fetchInscriptionsByReceiptCode: receiptCode está vacío, retornando.");
      return;
    }

    console.log("fetchInscriptionsByReceiptCode: Antes de setIsSearchingByCode(true)");
    setIsSearchingByCode(true);
    console.log("fetchInscriptionsByReceiptCode: Después de setIsSearchingByCode(true)");

    console.log("fetchInscriptionsByReceiptCode: Antes de setSearchByCodeError('')");
    setSearchByCodeError(""); // Limpiar error al iniciar nueva búsqueda
    console.log("fetchInscriptionsByReceiptCode: Después de setSearchByCodeError('')");

    console.log("fetchInscriptionsByReceiptCode: Antes de setFoundInscriptionsByCode([])");
    setFoundInscriptionsByCode([]); // Limpiar resultados anteriores
    console.log("fetchInscriptionsByReceiptCode: Después de setFoundInscriptionsByCode([])");

    console.log("fetchInscriptionsByReceiptCode: Antes del bloque try");
    try {
      addDebugEntry("fetchInscriptionsByReceiptCode: Antes de llamar a la API.", { url: `/inscripción/buscar-por-codigo-recibo?codigo=${receiptCode}`, codigoParaEnviar: receiptCode, tipoCodigo: typeof receiptCode });
      console.log("fetchInscriptionsByReceiptCode: Dentro del try, antes de api.get");
      // PASO 2 (según descripción del usuario): Usar el codigo_comprobante para buscar en la tabla inscripción.
      // El backend (InscripcionController@buscarPorCodigoRecibo) se encargará de esto
      // y de cargar los datos del estudiante relacionado.
      const response = await api.get(`/inscripción/buscar-por-codigo-recibo?codigo=${receiptCode}`);
      addDebugEntry("fetchInscriptionsByReceiptCode: Respuesta de API recibida.", { response });
      console.log("fetchInscriptionsByReceiptCode: Después de api.get, respuesta recibida:", response); // ESTE LOG ES CLAVE

      // Logs de depuración adicionales para la condición
      console.log("fetchInscriptionsByReceiptCode: Verificando response:", response);
      console.log("fetchInscriptionsByReceiptCode: Verificando typeof response:", typeof response);
      if (response) {
        console.log("fetchInscriptionsByReceiptCode: Verificando Array.isArray(response):", Array.isArray(response));
        console.log("fetchInscriptionsByReceiptCode: Verificando response.length:", response.length);
      }

      // Condición mejorada y logs más detallados
      if (response && Array.isArray(response)) {
        // La respuesta es un array (puede estar vacío o tener datos)
        addDebugEntry("fetchInscriptionsByReceiptCode: La respuesta es un array.", { length: response.length });
        console.log("fetchInscriptionsByReceiptCode: La respuesta es un array. Longitud:", response.length);
        if (response.length > 0) {
          // Array con datos: inscripciones encontradas
          addDebugEntry("fetchInscriptionsByReceiptCode: Inscripciones encontradas.", { count: response.length, data: response });
          console.log("fetchInscriptionsByReceiptCode: CONDICIÓN VERDADERA. Inscripciones encontradas, actualizando estado con:", response);
          // PASO 3 (según descripción del usuario): Mostrar datos del estudiante.
          // 'response' aquí ya debería contener los datos del estudiante anidados en cada inscripción.
          setFoundInscriptionsByCode(response);
          console.log("Detalle de inscripciones encontradas (para OCR):", response); // <--- NUEVO CONSOLE.LOG
          setSearchByCodeError(""); // Asegurarse de que no haya mensaje de error si se encontraron datos
        } else {
          // Array vacío: búsqueda exitosa, pero 0 resultados
          addDebugEntry("fetchInscriptionsByReceiptCode: No se encontraron inscripciones (array vacío).");
          console.log("fetchInscriptionsByReceiptCode: CONDICIÓN VERDADERA (array vacío). No se encontraron inscripciones.");
          setFoundInscriptionsByCode([]); // Asegurarse de que esté vacío
          setSearchByCodeError("No se encontraron inscripciones con el código de recibo proporcionado.");
        }
      } else {
        // La respuesta no es un array (inesperado, pero no necesariamente un error HTTP)
        addDebugEntry("fetchInscriptionsByReceiptCode: Respuesta inesperada (no es un array).", { response });
        console.log("fetchInscriptionsByReceiptCode: CONDICIÓN FALSA. Respuesta inesperada del servidor (no es un array). Response:", response);
        setFoundInscriptionsByCode([]); // Asegurarse de que esté vacío
        setSearchByCodeError("No se encontraron inscripciones con el código de recibo proporcionado.");
      }
    } catch (error) {
      addDebugEntry("fetchInscriptionsByReceiptCode: Error en catch.", { message: error.message, response: error.response?.data });
      console.error("fetchInscriptionsByReceiptCode: Error en el bloque catch:", error);
      console.error("fetchInscriptionsByReceiptCode: Error response:", error.response);
      setFoundInscriptionsByCode([]); // Limpiar por si acaso en error
      setSearchByCodeError(error.response?.data?.message || "Error al buscar inscripciones. Verifique el código o intente más tarde.");
    } finally {
      addDebugEntry("fetchInscriptionsByReceiptCode: Bloque finally ejecutado.");
      console.log("fetchInscriptionsByReceiptCode: Dentro del bloque finally");
      setIsSearchingByCode(false);
      console.log("fetchInscriptionsByReceiptCode: Después de setIsSearchingByCode(false) en finally");
    }
    console.log("fetchInscriptionsByReceiptCode: Fin de la función");
  };

  const parseOcrText = (text) => {
    addDebugEntry("Iniciando parseOcrText", { textLength: text.length });
    console.log("Texto completo del OCR recibido en parseOcrText:", text); // NUEVO CONSOLE.LOG
    let monto = null;
    let codigoRecibo = null;
    let fechaRecibo = null;

    // Intentar extraer TOTAL
    const totalRegex = /TOTAL\s*Bs\.?\s*([\d,]+\.?\d*)/i;
    const totalMatch = text.match(totalRegex);
    if (totalMatch && totalMatch[1]) {
      monto = parseFloat(totalMatch[1].replace(',', '')); // Quita comas de miles si existen
    } else {
        // Intento alternativo si "TOTAL Bs." no está, buscar solo TOTAL y un número cercano
        const altTotalRegex = /TOTAL\s*([\d,]+\.?\d*)/i;
        const altTotalMatch = text.match(altTotalRegex);
        if (altTotalMatch && altTotalMatch[1]) {
            monto = parseFloat(altTotalMatch[1].replace(',', ''));
        }
    }


    // Intentar extraer Código de Recibo (ej. Cod. XXXXXXXXXX)
    const codigoRegex = /Cod\.\s*([A-Za-z0-9]+)/i;
    const codigoMatch = text.match(codigoRegex);
    if (codigoMatch && codigoMatch[1]) {
      codigoRecibo = codigoMatch[1];
    }
    addDebugEntry("parseOcrText: Código de Recibo Extraído.", { codigoRecibo });
    console.log("Código Recibo Extraído en parseOcrText:", `"${codigoRecibo}"`); // Modificado para ver comillas

    // Intentar extraer Fecha (ej. Fecha: DD/MM/YYYY o DD-MM-YYYY)
    const fechaRegex = /Fecha:\s*(\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4})/i;
    const fechaMatch = text.match(fechaRegex);
    if (fechaMatch && fechaMatch[1]) {
      fechaRecibo = fechaMatch[1];
    }
    
    const parsedData = { monto, codigoRecibo, fechaRecibo };
    setExtractedOcrData(parsedData);
    addDebugEntry("parseOcrText: Datos parseados del OCR.", { parsedData });

    if (codigoRecibo) {
      // console.log("Llamando a fetchInscriptionsByReceiptCode desde parseOcrText con:", codigoRecibo); // Log anterior
      const codigoParaEnviar = codigoRecibo; // Crear una variable intermedia
      console.log("Valor de 'codigoParaEnviar' justo antes de llamar a fetchInscriptionsByReceiptCode:", `"${codigoParaEnviar}"`); // NUEVO CONSOLE.LOG
      fetchInscriptionsByReceiptCode(codigoParaEnviar); // Llama a la búsqueda después de extraer el código OCR
    } else {
      addDebugEntry("parseOcrText: No se extrajo codigoRecibo.");
      console.log("parseOcrText: No se extrajo codigoRecibo, no se llamará a fetchInscriptionsByReceiptCode."); // NUEVO CONSOLE.LOG
      setSearchByCodeError("No se pudo extraer un código de recibo del OCR para buscar inscripciones.");
    }

    // La comparación de montos puede seguir siendo útil si se quiere comparar el total del recibo
    // con el monto esperado de la orden de pago original (si `registrationId` la representa).
    if (inscriptionApiData) {
        performComparison(parsedData);
    }
  };

  const performComparison = (ocrData) => {
    if (!ocrData || !inscriptionApiData) {
      setComparisonResult({
        status: "idle",
        message: "Esperando datos para comparar..."
      });
      return;
    }

    if (ocrData.monto === null) {
        setComparisonResult({
            status: "warning",
            message: "No se pudo extraer el monto del comprobante. Verificación manual requerida."
        });
        return;
    }

    const montoOCR = ocrData.monto;
    const montoEsperado = inscriptionApiData.montoEsperado;

    if (Math.abs(montoOCR - montoEsperado) < 0.01) { // Comparación de flotantes con tolerancia
      setComparisonResult({
        status: "success",
        message: `El monto del comprobante (${montoOCR} Bs.) coincide con el monto esperado (${montoEsperado} Bs.).`
      });
    } else {
      setComparisonResult({
        status: "mismatch",
        message: `El monto del comprobante (${montoOCR} Bs.) NO coincide con el monto esperado (${montoEsperado} Bs.). Se requiere verificación manual.`
      });
    }
  };


  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    // Validar tipo de archivo
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(uploadedFile.type)) {
      setErrors([{ message: "Formato de archivo no válido. Solo se aceptan PNG, JPG o JPEG" }]);
      setFile(null);
      setFileName("");
      return;
    }
    
    // Validar tamaño (máximo 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (uploadedFile.size > maxSize) {
      setErrors([{ message: "El archivo es demasiado grande. El tamaño máximo es 5MB" }]);
      setFile(null);
      setFileName("");
      return;
    }
    
    setFileName(uploadedFile.name);
    setFile(uploadedFile);
    setErrors([]);
    // Iniciar OCR después de validar el archivo
    processImageWithOCR(uploadedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    addDebugEntry("Iniciando handleSubmit.");
    
    // El archivo 'file' ya no es estrictamente necesario para el submit, 
    // pero sí para el OCR. Mantenemos la lógica de carga de archivo para el OCR.
    if (!extractedOcrData?.codigoRecibo) {
      setErrors([{ message: "No se ha extraído un código de recibo del OCR. Procese una imagen primero." }]);
      return;
    }
    
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    setErrors([]);
    
    try {
      // Ya no se envía FormData con el archivo.
      // Solo se envía el código de recibo.
      const payload = {
        codigo_recibo: extractedOcrData.codigoRecibo,
      };
      addDebugEntry("handleSubmit: Payload para aprobar.", { payload });
      
      // Llamar a la nueva API para aprobar por código
      // Esta acción es para APROBAR, la búsqueda y muestra de datos ya ocurrió en fetchInscriptionsByReceiptCode.
      await api.post('/pagos/aprobar-por-codigo', payload); // No se necesita 'Content-Type' especial
      addDebugEntry("handleSubmit: Aprobación exitosa.");
      
      setUiState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        showSuccess: true,
        successMessage: "La inscripción se realizó con éxito." 
      }));
      
      if (onSuccess) onSuccess(); 
      
    } catch (error) {
      addDebugEntry("handleSubmit: Error al aprobar.", { message: error.message, response: error.response?.data });
      console.error("Error al aprobar inscripciones:", error);
      setErrors([{ message: error.response?.data?.message || "Error al procesar la aprobación." }]);
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const renderSuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl animate-fade-in">
        <div className="flex items-center justify-center">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
            <UserCheck className="h-6 w-6 text-green-600" /> {/* Icono cambiado */}
          </div>
        </div>
        <div className="mt-3 text-center">
          <h3 className="text-lg font-medium text-gray-900">
            Éxito
          </h3>
          <div className="mt-2 text-sm text-gray-500">
            {uiState.successMessage || "Operación completada exitosamente."}
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            onClick={() => {
              setUiState(prev => ({ ...prev, showSuccess: false, successMessage: "" }));
              navigate("/"); // Redirigir a HomePage
            }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-lg font-medium text-gray-900 mb-4 text-center"> {/* Centrado */}
        Verificar Pago con Comprobante y OCR
      </h2>
      {/* Mostrar datos de la orden de pago original si existen */}
      {inscriptionApiData && (
        <div className="mb-3 text-xs p-2 bg-blue-50 rounded-md">
            <p><strong>Monto Esperado (Orden Original):</strong> {inscriptionApiData.montoEsperado?.toFixed(2) || 'N/A'} Bs.</p>
            {inscriptionApiData.nombreEstudiante && <p><strong>Estudiante (Orden Original):</strong> {inscriptionApiData.nombreEstudiante}</p>}
            {inscriptionApiData.nombreTutor && <p><strong>Tutor (Orden Original):</strong> {inscriptionApiData.nombreTutor}</p>}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Comprobante (PNG o JPG) para OCR <span className="text-red-500">*</span>
          </label>
          
          <div 
            onClick={() => fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
              file 
                ? "border-green-300 bg-green-50"
                : "border-gray-300 hover:border-blue-500 hover:bg-blue-50"
            }`}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/png, image/jpeg, image/jpg"
              className="hidden"
            />
            
            {file ? (
              <>
                <Check className="h-10 w-10 text-green-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Archivo para OCR: {fileName}
                </p>
                <p className="text-xs text-gray-500">
                  {fileName}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setFile(null);
                    setFileName("");
                    setErrors([]);
                  }}
                  className="mt-3 text-xs text-red-600 hover:text-red-800 flex items-center justify-center"
                >
                  <X className="h-3 w-3 mr-1" />
                  Eliminar archivo
                </button>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 mb-1">
                  Arrastra y suelta tu comprobante para OCR
                </p>
                <p className="text-xs text-gray-500">
                  o haz clic para seleccionar un archivo
                </p>
                <p className="mt-2 text-xs text-gray-500">
                  Formatos soportados: .png, .jpg, .jpeg
                </p>
              </>
            )}
          </div>
          
          {errors.length > 0 && !uiState.isSubmitting && ( // Mostrar errores solo si no se está subiendo
            <div className="border border-red-200 rounded-lg p-3 bg-red-50">
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Error
              </h4>
              <div className="text-sm text-red-600">
                {errors[0].message}
              </div>
            </div>
          )}
        </div>

        {/* Sección de Resultados OCR y Búsqueda de Inscripciones */}
        {showOcrSection && (
          <div className="mt-4 p-4 border border-gray-200 rounded-md bg-gray-50">
            <h3 className="text-md font-semibold text-gray-800 mb-2 text-center">Análisis del Comprobante</h3> {/* Centrado */}
            
            {isOcrProcessing && (
              <div className="flex items-center justify-center text-blue-600"> {/* Centrado */}
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                <span>Procesando imagen con OCR...</span>
              </div>
            )}

            {ocrError && !isOcrProcessing && (
                <div className="p-3 bg-red-100 border border-red-300 rounded-md text-red-700 text-sm my-2">
                    <p>{ocrError}</p>
                </div>
            )}

            {!isOcrProcessing && extractedOcrData && (
              <div className="space-y-2 text-sm mt-2">
                <p><strong>Código Recibo Extraído (OCR):</strong> {extractedOcrData.codigoRecibo || <span className="text-orange-500">No detectado</span>}</p>
                <p><strong>Monto Extraído (OCR):</strong> {extractedOcrData.monto !== null ? `${extractedOcrData.monto.toFixed(2)} Bs.` : <span className="text-orange-500">No detectado</span>}</p>
                <p><strong>Fecha Recibo Extraída (OCR):</strong> {extractedOcrData.fechaRecibo || <span className="text-orange-500">No detectada</span>}</p>
                
                {/* Comparación de montos (si aplica) */}
                {comparisonResult && inscriptionApiData && (
                  <div className={`mt-3 p-2 rounded-md text-xs flex items-start ${
                    comparisonResult.status === 'success' ? 'bg-green-100 text-green-700 border border-green-300' :
                    comparisonResult.status === 'mismatch' ? 'bg-red-100 text-red-700 border border-red-300' :
                    comparisonResult.status === 'warning' ? 'bg-yellow-100 text-yellow-700 border border-yellow-300' :
                    'bg-blue-100 text-blue-700 border border-blue-300'
                  }`}>
                    {comparisonResult.status === 'success' && <Check className="h-4 w-4 mr-1 flex-shrink-0" />}
                    {comparisonResult.status === 'mismatch' && <X className="h-4 w-4 mr-1 flex-shrink-0" />}
                    {comparisonResult.status === 'warning' && <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0" />}
                    <p>{comparisonResult.message} (Comparado con orden original)</p>
                  </div>
                )}
                
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-gray-500 hover:text-gray-700">Ver texto OCR completo</summary>
                  <pre className="mt-1 p-2 bg-white border rounded-md max-h-40 overflow-auto whitespace-pre-wrap break-all">
                    {ocrText || "No se extrajo texto."}
                  </pre>
                </details>
              </div>
            )}

            {/* Resultados de la búsqueda por código de recibo */}
            {extractedOcrData?.codigoRecibo && (
              <div className="mt-4 pt-3 border-t">
                <h4 className="text-sm font-semibold text-gray-700 mb-2 text-center"> {/* Centrado */}
                  Inscripciones Encontradas por Código de Recibo: '{extractedOcrData.codigoRecibo}'
                </h4>
                {isSearchingByCode && (
                  <div className="flex items-center justify-center text-blue-600"> {/* Centrado */}
                    <Search className="h-4 w-4 mr-2 animate-pulse" />
                    <span>Buscando inscripciones...</span>
                  </div>
                )}
                {searchByCodeError && !isSearchingByCode && (
                  <div className="p-2 bg-yellow-100 border border-yellow-300 rounded-md text-yellow-700 text-xs">
                      <p>{searchByCodeError}</p>
                  </div>
                )}
                {/* Aquí se muestran los estudiantes encontrados */}
                {/* PASO 3 (continuación): Los datos del estudiante (nombre, ci, etc.) vienen en insc.estudiante */}
                {!isSearchingByCode && foundInscriptionsByCode.length > 0 && (
                  <ul className="space-y-2 text-xs list-disc pl-5">
                    {foundInscriptionsByCode.map(insc => (
                      <li key={insc.id_inscripcion}> 
                        <strong>{insc.estudiante?.nombres} {insc.estudiante?.apellidos}</strong> (CI: {insc.estudiante?.ci})
                        <br />
                        {insc.area1 && (
                          <>
                            Área 1: {insc.area1.nombre} {insc.area1.categoria ? `(${insc.area1.categoria})` : ''}
                            <br />
                          </>
                        )}
                        {insc.area2 && (
                          <>
                            Área 2: {insc.area2.nombre} {insc.area2.categoria ? `(${insc.area2.categoria})` : ''}
                          </>
                        )}
                        {/* Si no hay ni area1 ni area2, mostrar un mensaje o nada */}
                        {!insc.area1 && !insc.area2 && (
                            <span>Sin áreas asignadas</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {!isSearchingByCode && !searchByCodeError && foundInscriptionsByCode.length === 0 && extractedOcrData?.codigoRecibo && (
                    <p className="text-xs text-gray-500">No se encontraron inscripciones para este código de recibo.</p>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-center"> {/* Contenedor del botón centrado */}
          <button
            type="submit"
            disabled={!extractedOcrData?.codigoRecibo || uiState.isSubmitting || isOcrProcessing || isSearchingByCode || (foundInscriptionsByCode.length === 0 && !searchByCodeError && !isSearchingByCode && extractedOcrData?.codigoRecibo) } // Deshabilitar si no hay código o no hay inscripciones encontradas
            className={`px-4 py-2 text-white rounded-md flex items-center justify-center ${
              (!extractedOcrData?.codigoRecibo || uiState.isSubmitting || isOcrProcessing || isSearchingByCode || (foundInscriptionsByCode.length === 0 && !searchByCodeError && !isSearchingByCode && extractedOcrData?.codigoRecibo) )
                ? "bg-blue-300 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {uiState.isSubmitting ? (
              <><RefreshCw className="h-4 w-4 mr-2 animate-spin" /> Procesando Aprobación...</>
            ) : (
              <><UserCheck className="h-4 w-4 mr-2" /> Aprobar Inscripciones</>
            )}
          </button>
        </div>
      </form>
      
      {uiState.showSuccess && renderSuccessModal()}

      {/* Sección de Logs de Depuración del Frontend */}
      <details className="mt-6">
        <summary className="text-sm font-medium text-gray-600 cursor-pointer hover:text-gray-800">
          Ver Logs de Depuración del Proceso (Frontend) {/* Se mantiene activo por si se necesita */}
        </summary>
        <div className="mt-2 p-3 bg-gray-50 border border-gray-200 rounded-md max-h-96 overflow-auto">
          <pre className="text-xs whitespace-pre-wrap break-all">
            {JSON.stringify(debugLog, null, 2)}
          </pre>
          {debugLog.length === 0 && <p className="text-xs text-gray-500">No hay entradas de log todavía.</p>}
        </div>
      </details>
    </div>
  );
};

export default ComprobantePago;