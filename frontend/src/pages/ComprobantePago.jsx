import { useState, useRef, useEffect } from "react";
import { X, Check, Upload, Download, RefreshCw, AlertTriangle, Info, Search, UserCheck } from "lucide-react";
import { api } from '../api/apiClient';
import Tesseract from 'tesseract.js';
import { useNavigate } from 'react-router-dom';

const ComprobantePago = ({ registrationId, onSuccess }) => {
  const fileInputRef = useRef(null);
  const navigate = useNavigate();
  
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState([]);
  const [uiState, setUiState] = useState({
    isSubmitting: false,
    showSuccess: false,
    successMessage: ""
  });

  // Estados para OCR y comparación
  const [isOcrProcessing, setIsOcrProcessing] = useState(false);
  const [ocrText, setOcrText] = useState("");
  const [extractedOcrData, setExtractedOcrData] = useState(null);
  const [showOcrSection, setShowOcrSection] = useState(false);
  const [inscriptionApiData, setInscriptionApiData] = useState(null);
  const [comparisonResult, setComparisonResult] = useState(null);
  const [ocrError, setOcrError] = useState("");

  // Estados para búsqueda por código
  const [foundInscriptionsByCode, setFoundInscriptionsByCode] = useState([]);
  const [isSearchingByCode, setIsSearchingByCode] = useState(false);
  const [searchByCodeError, setSearchByCodeError] = useState("");

  useEffect(() => {
    if (registrationId) {
      const fetchInscriptionData = async () => {
        try {
          const data = await api.get(`/inscripción/${registrationId}?_relations=estudiante,contacto_tutor`);
          setInscriptionApiData({
            montoEsperado: parseFloat(data.monto_total) || 0,
            nombreEstudiante: data.estudiante ? `${data.estudiante.nombres} ${data.estudiante.apellidos}` : null,
            ciEstudiante: data.estudiante ? data.estudiante.ci : null,
            nombreTutor: data.contacto_tutor ? data.contacto_tutor.nombre : null,
          });
        } catch (error) {
          console.error("Error fetching original inscription data:", error);
        }
      };
      fetchInscriptionData();
    }
  }, [registrationId]);

  const processImageWithOCR = async (imageFile) => {
    if (!imageFile) return;
    
    setIsOcrProcessing(true);
    setOcrText("");
    setExtractedOcrData(null);
    setComparisonResult(null);
    setShowOcrSection(true);
    setOcrError("");
    setFoundInscriptionsByCode([]);
    setSearchByCodeError("");

    try {
      const { data: { text } } = await Tesseract.recognize(
        imageFile,
        'spa'
      );
      setOcrText(text);
      parseOcrText(text);
    } catch (err) {
      console.error("Error en OCR:", err);
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
    if (!receiptCode) return;

    setIsSearchingByCode(true);
    setSearchByCodeError("");
    setFoundInscriptionsByCode([]);

    try {
      const response = await api.get(`/inscripción/buscar-por-codigo-recibo?codigo=${receiptCode}`);

      if (response && Array.isArray(response)) {
        if (response.length > 0) {
          setFoundInscriptionsByCode(response);
          setSearchByCodeError("");
        } else {
          setFoundInscriptionsByCode([]);
          setSearchByCodeError("No se encontraron inscripciones con el código de recibo proporcionado.");
        }
      } else {
        setFoundInscriptionsByCode([]);
        setSearchByCodeError("No se encontraron inscripciones con el código de recibo proporcionado.");
      }
    } catch (error) {
      console.error("Error:", error);
      setFoundInscriptionsByCode([]);
      setSearchByCodeError(error.response?.data?.message || "Error al buscar inscripciones. Verifique el código o intente más tarde.");
    } finally {
      setIsSearchingByCode(false);
    }
  };

  const parseOcrText = (text) => {
    let monto = null;
    let codigoRecibo = null;
    let canceladoPor = null;

    // Extraer TOTAL
    const totalRegex = /TOTAL\s*Bs\.?\s*([\d,]+\.?\d*)/i;
    const totalMatch = text.match(totalRegex);
    if (totalMatch && totalMatch[1]) {
      monto = parseFloat(totalMatch[1].replace(',', ''));
    } else {
      const altTotalRegex = /TOTAL\s*([\d,]+\.?\d*)/i;
      const altTotalMatch = text.match(altTotalRegex);
      if (altTotalMatch && altTotalMatch[1]) {
          monto = parseFloat(altTotalMatch[1].replace(',', ''));
      }
    }

    // Extraer Código de Recibo
    const codigoRegex = /(IND-\d+|GRP-\d+-\d+)/i; 
    const codigoMatch = text.match(codigoRegex);
    if (codigoMatch && codigoMatch[0]) {
      codigoRecibo = codigoMatch[0]; 
    }

    // Extraer CANCELADO POR
    const canceladoPorRegex = /CANCELADO\s+POR\s*:?\s*([A-Za-zÀ-ÿ\u00f1\u00d1\s]+?)(?:\s+(?:NOMBRE|CONCEPTO|CANTIDAD|COSTO|TOTAL|FECHA|CI|C\.I\.|CARNET|DNI|RUT|DESCRIPCION|DESCRIPCIÓN|DETALLE|ITEM|ÍTEM|Bs\.|$))/i;
    const canceladoPorMatch = text.match(canceladoPorRegex);
    if (canceladoPorMatch && canceladoPorMatch[1]) {
      canceladoPor = canceladoPorMatch[1].trim();
    } else {
      const fallbackRegex = /CANCELADO\s+POR\s*:?\s*([A-Za-zÀ-ÿ\u00f1\u00d1]{2,}\s+[A-Za-zÀ-ÿ\u00f1\u00d1]{2,}(?:\s+[A-Za-zÀ-ÿ\u00f1\u00d1]{2,})*)/i;
      const fallbackMatch = text.match(fallbackRegex);
      if (fallbackMatch && fallbackMatch[1]) {
        canceladoPor = fallbackMatch[1].trim();
      }
    }
    
    const parsedData = { monto, codigoRecibo, canceladoPor };
    setExtractedOcrData(parsedData);

    if (codigoRecibo) {
      fetchInscriptionsByReceiptCode(codigoRecibo);
    } else {
      setSearchByCodeError("No se pudo extraer un código de recibo del OCR para buscar inscripciones.");
    }

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

    if (Math.abs(montoOCR - montoEsperado) < 0.01)
      setComparisonResult({
        status: "success",
        message: `El monto del comprobante (${montoOCR} Bs.) coincide con el monto esperado (${montoEsperado} Bs.).`
      });
    else
      setComparisonResult({
        status: "mismatch",
        message: `El monto del comprobante (${montoOCR} Bs.) NO coincide con el monto esperado (${montoEsperado} Bs.). Se requiere verificación manual.`
      });
  };

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (!uploadedFile) return;
    
    // Validaciones
    const validTypes = ['image/png', 'image/jpeg', 'image/jpg'];
    if (!validTypes.includes(uploadedFile.type)) {
      setErrors([{ message: "Formato de archivo no válido. Solo se aceptan PNG, JPG o JPEG" }]);
      setFile(null);
      setFileName("");
      return;
    }
    
    const maxSize = 5 * 1024 * 1024;
    if (uploadedFile.size > maxSize) {
      setErrors([{ message: "El archivo es demasiado grande. El tamaño máximo es 5MB" }]);
      setFile(null);
      setFileName("");
      return;
    }
    
    setFileName(uploadedFile.name);
    setFile(uploadedFile);
    setErrors([]);
    processImageWithOCR(uploadedFile);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!extractedOcrData?.codigoRecibo) {
      setErrors([{ message: "No se ha extraído un código de recibo del OCR. Procese una imagen primero." }]);
      return;
    }
    
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    setErrors([]);
    
    try {
      const payload = {
        codigo_recibo: extractedOcrData.codigoRecibo,
        nombre_pagador: extractedOcrData.canceladoPor || null,
      };
      
      const response = await api.post('/pagos/aprobar-por-codigo', payload);
      
      setUiState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        showSuccess: true,
        successMessage: response.nombre_pagador_guardado 
          ? `La inscripción se realizó con éxito. Pagador registrado: ${response.nombre_pagador_guardado}`
          : "La inscripción se realizó con éxito."
      }));
      
      if (onSuccess) onSuccess(); 
      
    } catch (error) {
      console.error("Error al aprobar inscripciones:", error);
      setErrors([{ message: error.response?.data?.message || "Error al procesar la aprobación." }]);
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  const renderSuccessModal = () => (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white dark:bg-gray-800 rounded-lg p-6 max-w-sm w-full shadow-xl animate-fade-in">
        <div className="flex items-center justify-center">
          <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center">
            <UserCheck className="h-6 w-6 text-green-600 dark:text-green-300" />
          </div>
        </div>
        <div className="mt-3 text-center">
          <h3 className="text-lg font-medium text-gray-900 dark:text-white">
            Éxito
          </h3>
          <div className="mt-2 text-sm text-gray-500 dark:text-gray-300">
            {uiState.successMessage || "Operación completada exitosamente."}
          </div>
        </div>
        <div className="mt-4">
          <button
            type="button"
            className="w-full px-4 py-2 bg-blue-600 dark:bg-blue-700 text-white rounded-md hover:bg-blue-700 dark:hover:bg-blue-800"
            onClick={() => {
              setUiState(prev => ({ ...prev, showSuccess: false, successMessage: "" }));
              navigate("/");
            }}
          >
            Aceptar
          </button>
        </div>
      </div>
    </div>
  );

  return (
    <div className="max-w-md mx-auto p-6 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-lg font-medium text-gray-900 dark:text-white mb-4 text-center">
        Verificar Pago con Comprobante y OCR
      </h2>
      
      {inscriptionApiData && (
        <div className="mb-3 text-xs p-2 bg-blue-50 dark:bg-blue-900 rounded-md">
            <p className="dark:text-blue-200"><strong>Monto Esperado (Orden Original):</strong> {inscriptionApiData.montoEsperado?.toFixed(2) || 'N/A'} Bs.</p>
            {inscriptionApiData.nombreEstudiante && <p className="dark:text-blue-200"><strong>Estudiante (Orden Original):</strong> {inscriptionApiData.nombreEstudiante}</p>}
            {inscriptionApiData.nombreTutor && <p className="dark:text-blue-200"><strong>Tutor (Orden Original):</strong> {inscriptionApiData.nombreTutor}</p>}
        </div>
      )}
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Comprobante (PNG o JPG) para OCR <span className="text-red-500">*</span>
          </label>
          
          <div 
            onClick={() => fileInputRef.current.click()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer ${
              file 
                ? "border-green-300 dark:border-green-500 bg-green-50 dark:bg-green-900/30"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
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
                <Check className="h-10 w-10 text-green-500 dark:text-green-400 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Archivo para OCR: {fileName}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
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
                  className="mt-3 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center justify-center"
                >
                  <X className="h-3 w-3 mr-1" />
                  Eliminar archivo
                </button>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-3" />
                <p className="text-sm font-medium text-gray-900 dark:text-white mb-1">
                  Arrastra y suelta tu comprobante para OCR
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  o haz clic para seleccionar un archivo
                </p>
                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  Formatos soportados: .png, .jpg, .jpeg
                </p>
              </>
            )}
          </div>
          
          {errors.length > 0 && !uiState.isSubmitting && (
            <div className="border border-red-200 dark:border-red-800 rounded-lg p-3 bg-red-50 dark:bg-red-900/20">
              <h4 className="text-sm font-medium text-red-800 dark:text-red-200 mb-1">
                Error
              </h4>
              <div className="text-sm text-red-600 dark:text-red-300">
                {errors[0].message}
              </div>
            </div>
          )}
        </div>

        {showOcrSection && (
          <div className="mt-4 p-4 border border-gray-200 dark:border-gray-700 rounded-md bg-gray-50 dark:bg-gray-700">
            <h3 className="text-md font-semibold text-gray-800 dark:text-white mb-2 text-center">Análisis del Comprobante</h3>
            
            {isOcrProcessing && (
              <div className="flex items-center justify-center text-blue-600 dark:text-blue-400">
                <RefreshCw className="h-5 w-5 mr-2 animate-spin" />
                <span>Procesando imagen con OCR...</span>
              </div>
            )}

            {ocrError && !isOcrProcessing && (
                <div className="p-3 bg-red-100 dark:bg-red-900/30 border border-red-300 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm my-2">
                    <p>{ocrError}</p>
                </div>
            )}

            {!isOcrProcessing && extractedOcrData && (
              <div className="space-y-2 text-sm mt-2 dark:text-gray-300">
                <p><strong>Código Recibo Extraído (OCR):</strong> {extractedOcrData.codigoRecibo || <span className="text-orange-500 dark:text-orange-400">No detectado</span>}</p>
                <p><strong>Monto Extraído (OCR):</strong> {extractedOcrData.monto !== null ? `${extractedOcrData.monto.toFixed(2)} Bs.` : <span className="text-orange-500 dark:text-orange-400">No detectado</span>}</p>
                <p><strong>Cancelado por (OCR):</strong> {extractedOcrData.canceladoPor || <span className="text-orange-500 dark:text-orange-400">No detectado</span>}</p>
                
                {comparisonResult && inscriptionApiData && (
                  <div className={`mt-3 p-2 rounded-md text-xs flex items-start ${
                    comparisonResult.status === 'success' ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 border border-green-300 dark:border-green-700' :
                    comparisonResult.status === 'mismatch' ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 border border-red-300 dark:border-red-700' :
                    comparisonResult.status === 'warning' ? 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300 border border-yellow-300 dark:border-yellow-700' :
                    'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 border border-blue-300 dark:border-blue-700'
                  }`}>
                    {comparisonResult.status === 'success' && <Check className="h-4 w-4 mr-1 flex-shrink-0" />}
                    {comparisonResult.status === 'mismatch' && <X className="h-4 w-4 mr-1 flex-shrink-0" />}
                    {comparisonResult.status === 'warning' && <AlertTriangle className="h-4 w-4 mr-1 flex-shrink-0" />}
                    <p>{comparisonResult.message} (Comparado con orden original)</p>
                  </div>
                )}
                
                <details className="mt-2 text-xs">
                  <summary className="cursor-pointer text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">Ver texto OCR completo</summary>
                  <pre className="mt-1 p-2 bg-white dark:bg-gray-800 border dark:border-gray-700 rounded-md max-h-40 overflow-auto whitespace-pre-wrap break-all">
                    {ocrText || "No se extrajo texto."}
                  </pre>
                </details>
              </div>
            )}

            {extractedOcrData?.codigoRecibo && (
              <div className="mt-4 pt-3 border-t border-gray-200 dark:border-gray-600">
                <h4 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-2 text-center">
                  Inscripciones Encontradas por Código de Recibo: '{extractedOcrData.codigoRecibo}'
                </h4>
                {isSearchingByCode && (
                  <div className="flex items-center justify-center text-blue-600 dark:text-blue-400">
                    <Search className="h-4 w-4 mr-2 animate-pulse" />
                    <span>Buscando inscripciones...</span>
                  </div>
                )}
                {searchByCodeError && !isSearchingByCode && (
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/30 border border-yellow-300 dark:border-yellow-700 rounded-md text-yellow-700 dark:text-yellow-300 text-xs">
                      <p>{searchByCodeError}</p>
                  </div>
                )}
                {!isSearchingByCode && foundInscriptionsByCode.length > 0 && (
                  <ul className="space-y-2 text-xs list-disc pl-5 dark:text-gray-300">
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
                        {!insc.area1 && !insc.area2 && (
                            <span>Sin áreas asignadas</span>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
                {!isSearchingByCode && !searchByCodeError && foundInscriptionsByCode.length === 0 && extractedOcrData?.codigoRecibo && (
                    <p className="text-xs text-gray-500 dark:text-gray-400">No se encontraron inscripciones para este código de recibo.</p>
                )}
              </div>
            )}
          </div>
        )}
        
        <div className="flex justify-center">
          <button
            type="submit"
            disabled={!extractedOcrData?.codigoRecibo || uiState.isSubmitting || isOcrProcessing || isSearchingByCode || (foundInscriptionsByCode.length === 0 && !searchByCodeError && !isSearchingByCode && extractedOcrData?.codigoRecibo) }
            className={`px-4 py-2 text-white rounded-md flex items-center justify-center ${
              (!extractedOcrData?.codigoRecibo || uiState.isSubmitting || isOcrProcessing || isSearchingByCode || (foundInscriptionsByCode.length === 0 && !searchByCodeError && !isSearchingByCode && extractedOcrData?.codigoRecibo) )
                ? "bg-blue-300 dark:bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800"
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
    </div>
  );
};

export default ComprobantePago;