// Esta línea es crucial. Debe coincidir con el nombre de la variable en tu archivo .env (VITE_API_BASE_URL)
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL;

// Verificar si la URL base se cargó correctamente; de lo contrario, mostrar un error claro.
if (!API_BASE_URL) {
  console.error(
    "Error: VITE_API_BASE_URL no está definida. " +
    "Asegúrate de que tu archivo .env en la raíz del frontend exista y contenga VITE_API_BASE_URL=" +
    "y que hayas reiniciado el servidor de desarrollo de Vite."
  );
  // Podrías incluso lanzar un error para detener la carga si la URL base es esencial.
  // throw new Error("VITE_API_BASE_URL is not defined. Please check your .env file and restart the Vite server.");
}

/**
 * Realiza una solicitud fetch a la API.
 * @param {string} endpoint El endpoint de la API al que llamar (ej. '/users').
 * @param {object} options Opciones para la solicitud fetch (método, headers, body, etc.).
 * @returns {Promise<any>} Una promesa que resuelve con los datos JSON de la respuesta.
 * @throws {Error} Si la respuesta de la red no es ok.
 */
async function fetchApi(endpoint, options = {}) {
  const url = `${API_BASE_URL}${endpoint}`;

  // Configuración por defecto de los headers
  const defaultHeaders = {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
    // Puedes añadir otros headers por defecto aquí, como tokens de autenticación
  };

  const config = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
  };

  // Si el cuerpo es un objeto, convertirlo a JSON
  if (config.body && typeof config.body === 'object') {
    config.body = JSON.stringify(config.body);
  }

  try {
    const response = await fetch(url, config);

    if (!response.ok) {
      // Intentar parsear el error del cuerpo si está en JSON
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        // Si el cuerpo del error no es JSON, usar el texto de estado
        errorData = { message: response.statusText };
      }
      // Construir un mensaje de error más informativo
      const error = new Error(
        `Error en la API: ${response.status} ${response.statusText}. ` +
        (errorData.message ? `Mensaje: ${errorData.message}` : '')
      );
      error.response = response; // Adjuntar la respuesta completa al error
      error.data = errorData;     // Adjuntar los datos del error parseados
      throw error;
    }

    // Si la respuesta no tiene contenido (ej. 204 No Content), devolver null o un objeto vacío.
    if (response.status === 204) {
      return null; 
    }

    return response.json(); // Parsear la respuesta como JSON
  } catch (error) {
    console.error('Error en fetchApi:', error.message, 'Endpoint:', endpoint, 'URL completa:', url);
    // Si el error ya tiene 'data' (porque lo lanzamos arriba), no lo sobrescribas.
    if (!error.data) {
        error.data = { message: error.message };
    }
    throw error; // Re-lanzar el error para que pueda ser manejado por quien llama
  }
}

// Exportar métodos de conveniencia
export const api = {
  get: (endpoint, options = {}) => fetchApi(endpoint, { ...options, method: 'GET' }),
  post: (endpoint, body, options = {}) => fetchApi(endpoint, { ...options, method: 'POST', body }),
  put: (endpoint, body, options = {}) => fetchApi(endpoint, { ...options, method: 'PUT', body }),
  delete: (endpoint, options = {}) => fetchApi(endpoint, { ...options, method: 'DELETE' }),
  patch: (endpoint, body, options = {}) => fetchApi(endpoint, { ...options, method: 'PATCH', body }),
};
