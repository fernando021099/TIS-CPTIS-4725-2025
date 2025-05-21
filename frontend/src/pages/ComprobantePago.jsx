import { useState, useRef } from "react";
import { X, Check, Upload, Download } from "lucide-react";
import { api } from '../api/apiClient';
import Tesseract from 'tesseract.js';

const ComprobantePago = ({ registrationId, onSuccess }) => {
  const fileInputRef = useRef(null);
  
  const [file, setFile] = useState(null);
  const [fileName, setFileName] = useState("");
  const [errors, setErrors] = useState([]);
  const [uiState, setUiState] = useState({
    isSubmitting: false,
    showSuccess: false
  });
  const [textoDetectado, setTextoDetectado] = useState('');
  const [procesando, setProcesando] = useState(false);

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

    setTextoDetectado('');
    setProcesando(true);

    // Ejecutar OCR usando tesseract.js
    const imageUrl = URL.createObjectURL(uploadedFile);

    Tesseract.recognize(imageUrl, 'spa', {
      logger: m => console.log(m) // Opcional: para ver el progreso
    }).then(({ data: { text } }) => {
      setTextoDetectado(text);
      setProcesando(false);
    }).catch(err => {
      setProcesando(false);
      setErrors([{ message: "Error al procesar OCR: " + err.message }]);
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      setErrors([{ message: "Por favor seleccione un archivo" }]);
      return;
    }
    
    setUiState(prev => ({ ...prev, isSubmitting: true }));
    
    try {
      const formData = new FormData();
      formData.append('comprobante', file);
      formData.append('registrationId', registrationId);
      
      // Enviar a la API
      await api.post('/pagos/subir-comprobante', formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });
      
      setUiState(prev => ({ 
        ...prev, 
        isSubmitting: false,
        showSuccess: true 
      }));
      
      // Llamar a la función de éxito si existe
      if (onSuccess) onSuccess();
      
    } catch (error) {
      console.error("Error al subir comprobante:", error);
      setErrors([{ message: error.response?.data?.message || "Error al subir el comprobante" }]);
      setUiState(prev => ({ ...prev, isSubmitting: false }));
    }
  };

  return (
    <div className="max-w-md mx-auto p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-lg font-medium text-gray-900 mb-4">
        Subir comprobante de pago
      </h2>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700">
            Comprobante (PNG o JPG) <span className="text-red-500">*</span>
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
                  Archivo cargado correctamente
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
                  Arrastra y suelta tu comprobante aquí
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
          
          {errors.length > 0 && (
            <div className="border border-red-200 rounded-lg p-3 bg-red-50">
              <h4 className="text-sm font-medium text-red-800 mb-1">
                Error al cargar el archivo
              </h4>
              <div className="text-sm text-red-600">
                {errors[0].message}
              </div>
            </div>
          )}
        </div>
        
        <div className="flex justify-end">
          <button
            type="submit"
            disabled={!file || uiState.isSubmitting}
            className={`px-4 py-2 text-white rounded-md ${
              !file || uiState.isSubmitting
                ? "bg-blue-400 cursor-not-allowed"
                : "bg-blue-600 hover:bg-blue-700"
            }`}
          >
            {uiState.isSubmitting ? "Subiendo..." : "Subir Comprobante"}
          </button>
        </div>
      </form>
      
      {uiState.showSuccess && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm w-full shadow-xl animate-fade-in">
            <div className="flex items-center justify-center">
              <div className="flex-shrink-0 h-12 w-12 rounded-full bg-green-100 flex items-center justify-center">
                <Check className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="mt-3 text-center">
              <h3 className="text-lg font-medium text-gray-900">
                Comprobante subido
              </h3>
              <div className="mt-2 text-sm text-gray-500">
                Tu comprobante de pago ha sido recibido correctamente. 
                Será verificado por nuestro equipo en un plazo máximo de 24 horas.
              </div>
              <div className="mt-3 p-2 bg-blue-50 rounded-md text-xs">
                <p className="font-medium">ID de Registro:</p>
                <p className="font-mono">{registrationId}</p>
              </div>
            </div>
            <div className="mt-4">
              <button
                type="button"
                className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                onClick={() => setUiState(prev => ({ ...prev, showSuccess: false }))}
              >
                Aceptar
              </button>
              {procesando && (
  <div className="text-sm text-blue-600 mt-2">Procesando OCR, por favor espera...</div>
)}

{textoDetectado && (
  <div className="mt-4 p-3 bg-gray-100 rounded-md border text-sm whitespace-pre-wrap">
    <h4 className="font-semibold mb-2 text-gray-700">Texto detectado por OCR:</h4>
    <pre>{textoDetectado}</pre>
  </div>
)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ComprobantePago;