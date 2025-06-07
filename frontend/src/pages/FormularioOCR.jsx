import React, { useState } from 'react';
import { Upload, RefreshCw, FileText } from 'lucide-react';
import axios from 'axios';

const FormularioOCR = () => {
  const [imagen, setImagen] = useState(null);
  const [nombreImagen, setNombreImagen] = useState('');
  const [textoOCR, setTextoOCR] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!imagen) {
      setError('Por favor selecciona una imagen');
      return;
    }

    setIsProcessing(true);
    setError('');
    setTextoOCR('');

    const formData = new FormData();
    formData.append('imagen', imagen);

    try {
      const response = await axios.post('http://localhost:8000/api/ocr', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setTextoOCR(response.data.texto || 'No se detectó texto en la imagen');
    } catch (err) {
      console.error('Error al procesar OCR:', err);
      setError(err.response?.data?.message || 'Error al procesar la imagen');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;

    // Validar tipo de archivo
    if (!file.type.match('image.*')) {
      setError('Por favor selecciona un archivo de imagen válido');
      return;
    }

    // Validar tamaño (ejemplo: máximo 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError('La imagen es demasiado grande (máximo 5MB)');
      return;
    }

    setImagen(file);
    setNombreImagen(file.name);
    setError('');
    setTextoOCR('');
  };

  return (
    <div className="max-w-md mx-auto p-4 bg-white dark:bg-gray-800 rounded-lg shadow-md border border-gray-200 dark:border-gray-700">
      <h2 className="text-xl font-semibold text-gray-800 dark:text-white mb-4 text-center">
        Procesador de OCR
      </h2>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">
            Seleccionar imagen
          </label>
          
          <div 
            onClick={() => document.getElementById('file-input').click()}
            className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
              imagen 
                ? "border-green-300 dark:border-green-500 bg-green-50 dark:bg-green-900/20"
                : "border-gray-300 dark:border-gray-600 hover:border-blue-500 dark:hover:border-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/10"
            }`}
          >
            <input
              id="file-input"
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            
            {imagen ? (
              <>
                <FileText className="h-10 w-10 text-green-500 dark:text-green-400 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {nombreImagen}
                </p>
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    setImagen(null);
                    setNombreImagen('');
                  }}
                  className="mt-2 text-xs text-red-600 dark:text-red-400 hover:text-red-800 dark:hover:text-red-300 flex items-center justify-center"
                >
                  <X className="h-3 w-3 mr-1" />
                  Cambiar imagen
                </button>
              </>
            ) : (
              <>
                <Upload className="h-10 w-10 text-gray-400 dark:text-gray-500 mx-auto mb-2" />
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  Arrastra una imagen o haz clic para seleccionar
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Formatos soportados: JPG, PNG, BMP
                </p>
              </>
            )}
          </div>
        </div>

        {error && (
          <div className="p-3 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-700 rounded-md text-red-700 dark:text-red-300 text-sm">
            {error}
          </div>
        )}

        <button
          type="submit"
          disabled={!imagen || isProcessing}
          className={`w-full py-2 px-4 rounded-md text-white font-medium flex items-center justify-center ${
            !imagen || isProcessing
              ? 'bg-blue-400 dark:bg-blue-500 cursor-not-allowed'
              : 'bg-blue-600 dark:bg-blue-700 hover:bg-blue-700 dark:hover:bg-blue-800'
          }`}
        >
          {isProcessing ? (
            <>
              <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              Procesando...
            </>
          ) : (
            'Procesar OCR'
          )}
        </button>
      </form>

      {textoOCR && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-md border border-gray-200 dark:border-gray-600">
          <h3 className="text-lg font-medium text-gray-800 dark:text-white mb-2">
            Resultado del OCR:
          </h3>
          <div className="p-3 bg-white dark:bg-gray-800 rounded border border-gray-300 dark:border-gray-600">
            <pre className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
              {textoOCR}
            </pre>
          </div>
        </div>
      )}
    </div>
  );
};

export default FormularioOCR;