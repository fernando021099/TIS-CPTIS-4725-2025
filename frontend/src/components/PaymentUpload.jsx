import { Upload, X } from "lucide-react";
import { useState } from "react";

const PaymentUpload = ({ paymentProof, handleFileChange, errors, onRemoveFile }) => {
  const [dragActive, setDragActive] = useState(false);

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileChange({
        target: {
          files: e.dataTransfer.files
        }
      });
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Subir comprobante de pago <span className="text-red-500">*</span>
      </label>
      <div 
        className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
          dragActive 
            ? "border-blue-500 bg-blue-50"
            : errors.paymentProof 
              ? "border-red-500" 
              : paymentProof
                ? "border-green-300 bg-green-50"
                : "border-gray-300 dark:border-gray-600"
        }`}
        onDragEnter={handleDrag}
        onDragLeave={handleDrag}
        onDragOver={handleDrag}
        onDrop={handleDrop}
      >
        <div className="space-y-1 text-center">
          {paymentProof ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <Upload className="mx-auto h-12 w-12 text-green-500" />
              <p className="mt-2">Archivo seleccionado: {paymentProof.name}</p>
              <p className="text-xs text-gray-500 mt-1">
                {Math.round(paymentProof.size / 1024)} KB
              </p>
              <button
                type="button"
                onClick={onRemoveFile}
                className="mt-2 text-sm text-red-600 hover:text-red-500"
              >
                Cambiar archivo
              </button>
            </div>
          ) : (
            <>
              <div className="flex flex-col items-center justify-center text-sm text-gray-600 dark:text-gray-300">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <p className="text-sm font-medium">
                    {dragActive ? "Suelta el archivo aquí" : "Arrastra y suelta tu archivo aquí"}
                  </p>
                  <div className="flex justify-center mt-1">
                    <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none">
                      <span>o selecciona un archivo</span>
                      <input
                        type="file"
                        className="sr-only"
                        onChange={handleFileChange}
                        accept="image/*,.pdf"
                      />
                    </label>
                  </div>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                  PNG, JPG, PDF hasta 5MB
                </p>
              </div>
            </>
          )}
        </div>
      </div>
      {errors.paymentProof && (
        <p className="mt-1 text-sm text-red-600 flex items-center">
          <X className="h-4 w-4 mr-1" />
          {errors.paymentProof}
        </p>
      )}
    </div>
  );
};

export default PaymentUpload;