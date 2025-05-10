import { Upload } from "lucide-react";

const PaymentUpload = ({ paymentProof, handleFileChange, errors, onRemoveFile }) => {
  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
        Subir comprobante de pago <span className="text-red-500">*</span>
      </label>
      <div className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
        errors.paymentProof ? "border-red-500" : "border-gray-300 dark:border-gray-600"
      }`}>
        <div className="space-y-1 text-center">
          {paymentProof ? (
            <div className="text-sm text-gray-600 dark:text-gray-300">
              <p>Archivo seleccionado: {paymentProof.name}</p>
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
                <div className="flex mt-2">
                  <label className="relative cursor-pointer bg-white dark:bg-gray-800 rounded-md font-medium text-blue-600 dark:text-blue-400 hover:text-blue-500 dark:hover:text-blue-300 focus-within:outline-none">
                    <span>Seleccionar archivo</span>
                    <input
                      type="file"
                      className="sr-only"
                      onChange={handleFileChange}
                      accept="image/*,.pdf"
                    />
                  </label>
                  <p className="pl-1">o arrastrar aquí</p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
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