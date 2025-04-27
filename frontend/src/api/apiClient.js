const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/**
 * Realiza una solicitud fetch a la API.
 * @param {string} endpoint - El endpoint de la API (ej. '/areas', '/olimpiadas/2024').
 * @param {object} [options={}] - Opciones adicionales para fetch (method, headers, body, etc.).
 * @returns {Promise<any>} - Promesa que resuelve con los datos JSON de la respuesta.
 * @throws {Error} - Lanza un error si la respuesta no es ok (status code no es 2xx).
 */
async function apiClient(endpoint, options = {}) {
  // Comprobar si endpoint ya es una URL completa
  const isFullUrl = endpoint.startsWith('http://') || endpoint.startsWith('https://');
  
  // URL base para la API (asegúrate de que termine sin barra)
  // Modificamos para usar explícitamente la URL completa - ajusta este valor según tu configuración
  const API_BASE_URL = 'http://127.0.0.1:8000/api';
  
  // Construir la URL completa
  const url = isFullUrl ? endpoint : `${API_BASE_URL}${endpoint.startsWith('/') ? endpoint : '/' + endpoint}`;
  
  // Configuración por defecto
  const config = {
    method: 'GET',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    },
    ...options,
  };

  // Si hay un body y es un objeto, lo convertimos a JSON string
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    // Si la respuesta no es OK (ej. 404, 500), lanzar un error
    if (!response.ok) {
      let errorMessage = `Error ${response.status}: ${response.statusText}`;
      try {
        // Intenta obtener más detalles del cuerpo del error si es JSON
        const errorBody = await response.json();
        errorMessage = errorBody.message || JSON.stringify(errorBody);
      } catch (e) {
        // Si el cuerpo del error no es JSON, usa el statusText
      }
      const error = new Error(errorMessage);
      error.status = response.status;
      throw error;
    }

    // Si la respuesta es 204 No Content, no hay cuerpo para parsear
    if (response.status === 204) {
      return null;
    }

    // Parsear la respuesta como JSON
    return await response.json();

  } catch (error) {
    console.error(`API call failed: ${error.message}`);
    // Re-lanzar el error para que pueda ser manejado por el código que llama
    throw error;
  }
}

// Exportar funciones específicas para métodos comunes (opcional pero útil)
export const api = {
  get: (endpoint, options) => apiClient(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'PUT', body }),
  patch: (endpoint, body, options) => apiClient(endpoint, { ...options, method: 'PATCH', body }),
  delete: (endpoint, options) => apiClient(endpoint, { ...options, method: 'DELETE' }),
};

// También puedes exportar la función base si prefieres
// export default apiClient;
