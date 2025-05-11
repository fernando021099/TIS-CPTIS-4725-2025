# React + Vite

This template provides a minimal setup to get React working in Vite with HMR and some ESLint rules.

Currently, two official plugins are available:

- [@vitejs/plugin-react](https://github.com/vitejs/vite-plugin-react/blob/main/packages/plugin-react/README.md) uses [Babel](https://babeljs.io/) for Fast Refresh
- [@vitejs/plugin-react-swc](https://github.com/vitejs/vite-plugin-react-swc) uses [SWC](https://swc.rs/) for Fast Refresh

## Expanding the ESLint configuration

If you are developing a production application, we recommend using TypeScript and enable type-aware lint rules. Check out the [TS template](https://github.com/vitejs/vite/tree/main/packages/create-vite/template-react-ts) to integrate TypeScript and [`typescript-eslint`](https://typescript-eslint.io) in your project.

## Configuración del Backend API

1.  Asegúrate de que el backend de Laravel esté corriendo (normalmente en `http://127.0.0.1:8000`).
2.  Crea un archivo `.env` en la raíz del proyecto `frontend` con la siguiente variable, apuntando a la URL base de tu API Laravel:
    ```plaintext
    VITE_API_BASE_URL=http://127.0.0.1:8000/api
    ```
3.  Asegúrate de que el archivo `.env` esté en tu `.gitignore`.
4.  Usa la utilidad `api` exportada desde `src/api/apiClient.js` para interactuar con el backend.

```javascript
import { api } from './api/apiClient';

// Ejemplo de uso:
// async function fetchAreas() {
//   try {
//     const data = await api.get('/areas');
//     console.log(data);
//   } catch (error) {
//     console.error("Error fetching areas:", error);
//   }
// }
```

## Solución de Problemas

### Las llamadas a la API fallan con `/undefined/...` en la URL

Si ves que las solicitudes de red van a una URL como `http://localhost:5173/undefined/ruta-api` (donde `localhost:5173` es tu servidor de desarrollo Vite), significa que la variable de entorno `VITE_API_BASE_URL` no se está cargando correctamente.

Asegúrate de lo siguiente:
1.  El archivo `.env` existe en la raíz de tu proyecto frontend (`c:\Users\DAN\temporal\TIS-CPTIS-4725-2025\frontend\.env`).
2.  El archivo `.env` contiene la línea: `VITE_API_BASE_URL=http://127.0.0.1:8000/api` (ajusta el puerto si tu backend corre en uno diferente).
3.  **Importante:** Después de crear o modificar el archivo `.env`, debes **detener y reiniciar tu servidor de desarrollo Vite**. Vite solo lee las variables de entorno al arrancar.
