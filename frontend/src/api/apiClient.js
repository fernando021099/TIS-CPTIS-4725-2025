const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Definir la URL base de tu API aquí
// const API_BASE_URL = 'http://127.0.0.1:8000/api'; // Ajusta si tu backend está en otro puerto o URL

/**
 * Realiza una solicitud fetch a la API.
 * @param {string} endpoint - El endpoint de la API (ej. '/areas', '/olimpiadas/2024').
 * @param {object} [options={}] - Opciones adicionales para fetch (method, headers, body, etc.).
 * @returns {Promise<any>} - Promesa que resuelve con los datos JSON de la respuesta.
 * @throws {Error} - Lanza un error si la respuesta no es ok (status code no es 2xx).
 */
const apiClient = async (endpoint, method = 'GET', body = null, customHeaders = {}) => {
  const url = `${API_BASE_URL}${endpoint}`;
  const token = localStorage.getItem('authToken');

  const headers = {
    'Accept': 'application/json',
    ...customHeaders, // Permite sobrescribir o añadir cabeceras
  };

  // Solo añadir Content-Type si hay cuerpo y no es FormData
  if (body && !(body instanceof FormData)) {
    headers['Content-Type'] = 'application/json';
  }

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const config = {
    method,
    headers,
  };

  if (body) {
    config.body = (body instanceof FormData) ? body : JSON.stringify(body);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      let errorData;
      try {
        // Intentar parsear el cuerpo del error como JSON
        errorData = await response.json();
      } catch (e) {
        // Si el cuerpo no es JSON o está vacío
        errorData = { message: response.statusText || `Error HTTP ${response.status}` };
      }
      
      // Crear un objeto de error que incluya status y data
      const error = new Error(errorData.message || `Error ${response.status}`);
      error.status = response.status;
      error.data = errorData; // Aquí errorData contiene { message: "...", errors: { ... } } de Laravel
      
      console.error('API call failed:', error.message, 'Status:', error.status, 'Data:', error.data);
      throw error; // Lanzar el error enriquecido
    }

    // Si la respuesta es 204 No Content, no hay cuerpo para parsear
    if (response.status === 204) {
      return null; 
    }

    // Para otras respuestas exitosas, parsear JSON
    return await response.json();

  } catch (error) {
    // Si el error ya fue enriquecido arriba (error HTTP), relanzarlo
    if (error.status) {
      throw error;
    }
    // Para errores de red u otros errores no HTTP
    console.error('Network or other error:', error.message);
    // Crear un error genérico para problemas de red
    const networkError = new Error(error.message || 'Error de red o CORS. No se pudo conectar con el servidor.');
    // Podríamos añadir un status customizado para errores de red si es útil, ej: networkError.status = 0;
    throw networkError;
  }
};

// Helper functions
// Estas funciones llaman a la función apiClient principal con el método HTTP correcto.
export const get = (endpoint, customHeaders = {}) => apiClient(endpoint, 'GET', null, customHeaders);
// La siguiente línea es la que se menciona como "post @ apiClient.js:87" en el error
export const post = (endpoint, body, customHeaders = {}) => apiClient(endpoint, 'POST', body, customHeaders);
export const put = (endpoint, body, customHeaders = {}) => apiClient(endpoint, 'PUT', body, customHeaders);
export const patch = (endpoint, body, customHeaders = {}) => apiClient(endpoint, 'PATCH', body, customHeaders);
export const del = (endpoint, customHeaders = {}) => apiClient(endpoint, 'DELETE', null, customHeaders);

// Exportar un objeto 'api' para importación fácil
// ASEGÚRATE DE QUE ESTA SECCIÓN SEA CORRECTA:
export const api = {
  get,          // Esto debe ser la función helper 'get'
  post,         // Esto DEBE ser la función helper 'post', NO la función apiClient principal
  put,          // Esto debe ser la función helper 'put'
  patch,        // Esto debe ser la función helper 'patch'
  delete: del,  // Esto debe ser la función helper 'del' (renombrada a delete)
};

// Default export (opcional, pero si se usa, la importación sería diferente)
// export default apiClient; // Si tienes esto, asegúrate de que no cause confusión.
