# Resumen del Análisis del Proyecto: Olimpiadas UMSS

Este documento resume los puntos clave y la estructura del proyecto Olimpiadas UMSS para referencia futura.

## Componentes Principales
-   **Backend:** Laravel
-   **Frontend:** React (Vite)
-   **Base de Datos:** PostgreSQL

## Puntos Clave para Conexión y Errores del Backend:
1.  **Configuración del Backend (`.env`):**
    *   Variables de base de datos: `DB_CONNECTION`, `DB_HOST`, `DB_PORT`, `DB_DATABASE`, `DB_USERNAME`, `DB_PASSWORD`.
    *   `APP_URL`: URL base de la aplicación Laravel.
    *   `CORS_ALLOWED_ORIGINS`: Dominios permitidos para solicitudes CORS desde el frontend.
2.  **Servidor PostgreSQL:**
    *   Debe estar en ejecución y accesible.
    *   La base de datos (por defecto 'TIS') debe existir.
    *   El usuario de la base de datos debe tener los permisos correctos.
3.  **PHP:**
    *   La extensión `pdo_pgsql` debe estar habilitada.
4.  **Laravel:**
    *   **Caché:** Comandos útiles para limpiar la caché: `php artisan config:clear`, `php artisan route:clear`, `php artisan cache:clear`.
    *   **Permisos de Archivos:** Asegurar permisos de escritura para los directorios `storage` y `bootstrap/cache`.
5.  **Rutas API (Backend):**
    *   Verificar que las rutas definidas en `routes/api.php` coincidan con las llamadas realizadas desde el frontend.
    *   Prestar especial atención a nombres de ruta como `inscripción` (con tilde).
6.  **CORS (Cross-Origin Resource Sharing):**
    *   Si las llamadas del frontend son bloqueadas, revisar la configuración CORS en el backend (tanto en `.env` como en `config/cors.php` si se ha modificado).
7.  **Logs del Backend:**
    *   Ubicación principal: `storage/logs/laravel.log`.
    *   El nivel de log `debug` está activo en el `.env.example`, lo que proporciona información detallada.
8.  **Esquema de la Base de Datos (`Base de datos.txt` y Modelos Eloquent):**
    *   Verificar que las tablas y columnas definidas en el script SQL coincidan con las definiciones en los modelos Eloquent.
    *   **Tabla `inscripción`:** El nombre de la tabla incluye una tilde. El modelo `Inscripcion.php` lo refleja correctamente (`protected $table = 'inscripción';`).
    *   **Tabla `estudiante`:** La clave primaria es `ci` (tipo `VARCHAR` o `string`), y no es autoincremental. El modelo `Estudiante.php` lo maneja bien.
    *   **Tabla `contacto`:** El script `Base de datos.txt` define las columnas: `id`, `celular`, `nombre`, `correo`.
        *   **Posible Discrepancia (a verificar si surgen errores):** El controlador `InscripcionController.php` (en el método `store` y `storeGroup`) incluye `contacto.relacion` en sus reglas de validación. Sin embargo, la columna `relacion` no existe en la definición de la tabla `contacto` en `Base de datos.txt` ni está listada en la propiedad `$fillable` del modelo `Contacto.php`. Esto podría ser intencional para manejar datos de la solicitud que no se persisten directamente en esa columna, o podría ser un punto a revisar si ocurren errores durante la creación/actualización de contactos relacionados con inscripciones.
    *   **Tabla `tutoria`:** Existe para relacionar `contacto_id` con un `codigo_comprobante` (usado en inscripciones grupales).
9.  **Configuración del Frontend (`.env`):**
    *   `VITE_API_BASE_URL`: Debe apuntar a la URL base de la API del backend (ej. `http://127.0.0.1:8000/api`).
    *   **Importante:** Reiniciar el servidor de desarrollo de Vite después de cualquier cambio en el archivo `.env` del frontend.
10. **Lógica de Controladores (Backend - Ejemplo `InscripcionController.php`):**
    *   Maneja lógica compleja para registros individuales y grupales.
    *   Utiliza `(new Model)->getTable()` para obtener dinámicamente nombres de tabla en consultas SQL raw, lo cual es una buena práctica para evitar errores tipográficos con nombres de tabla (especialmente con la tilde en `inscripción`).
    *   La forma en que se manejan `area1_id`/`area2_id` versus `area1_nombre`/`area1_categoria` para buscar registros de `Area` es crucial.
    *   La lógica de cálculo de costos para las inscripciones incluye costos por defecto si los costos de las áreas son inválidos o no están definidos.
    *   La generación de `codigo_comprobante` (ej. `IND-xxxx`, `GRP-xxxx-xxxx`) sigue un formato específico.
    *   El controlador `InscripcionController.php` tiene un logging extensivo que puede ser muy útil para depurar.

## Archivos Clave Analizados:

**Backend (`c:\Users\DAN\temporal\TIS-CPTIS-4725-2025\backend\`):**
*   `Base de datos.txt` (Esquema SQL y datos iniciales)
*   `.env.example` (Configuración de entorno)
*   `config/database.php` (Configuración de conexión a BD)
*   `bootstrap/app.php` (Configuración de la aplicación Laravel, rutas)
*   `routes/web.php` (Rutas web, incluye prueba de conexión a BD)
*   `routes/api.php` (Rutas de la API)
*   `app/Models/`
    *   `Area.php`
    *   `Colegio.php`
    *   `Contacto.php`
    *   `Estudiante.php`
    *   `Inscripcion.php`
    *   `Olimpiada.php`
    *   `Tutoria.php`
*   `app/Http/Controllers/Api/`
    *   `AreaController.php`
    *   `InscripcionController.php` (y otros controladores de API)
*   `README.md` (Instrucciones de instalación y endpoints)

**Frontend (`c:\Users\DAN\temporal\TIS-CPTIS-4725-2025\frontend\`):**
*   `vite.config.js` (Configuración de Vite)
*   `README.md` (Instrucciones de configuración del frontend, variable de entorno API)
*   `src/api/apiClient.js` (Cliente Axios para llamadas a la API)
*   `src/pages/` (Componentes de página de React, ej. `StudentRegistration.jsx`, `AreaList.jsx`, `ComprobantePago.jsx`)

Este resumen debería proporcionar un buen punto de partida para entender el proyecto y abordar problemas futuros.
