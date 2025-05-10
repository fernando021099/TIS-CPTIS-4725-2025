<p align="center"><a href="https://laravel.com" target="_blank"><img src="https://raw.githubusercontent.com/laravel/art/master/logo-lockup/5%20SVG/2%20CMYK/1%20Full%20Color/laravel-logolockup-cmyk-red.svg" width="400" alt="Laravel Logo"></a></p>

## Sobre este proyecto

Backend API para la aplicación Olimpiadas UMSS, desarrollado con Laravel. Provee datos a la interfaz React.

## Instrucciones de instalación para nuevos miembros

### Requisitos previos
- PHP >= 8.1
- Composer
- PostgreSQL
- Git

### Pasos de instalación

1. **Clonar el repositorio**
   ```bash
   git clone <url-del-repositorio>
   cd TIS-CPTIS-4725-2025
   ```

2. **Instalar dependencias del backend**
   ```bash
   cd backend
   composer install
   ```

3. **Configurar el entorno**
   - Copiar el archivo `.env.example` a `.env`
   ```bash
   cp .env.example .env
   ```
   - Editar el archivo `.env` con las credenciales de tu base de datos local:
   ```
   DB_CONNECTION=pgsql
   DB_HOST=localhost
   DB_PORT=5432
   DB_DATABASE=TIS  # Crear esta base de datos en PostgreSQL
   DB_USERNAME=postgres
   DB_PASSWORD=tu_contraseña
   ```

4. **Generar clave de aplicación**
   ```bash
   php artisan key:generate
   ```
   
   La clave de aplicación es un string aleatorio de 32 caracteres que Laravel necesita para:
   - Encriptar cookies y sesiones
   - Proteger datos sensibles
   - Generar tokens seguros contra ataques CSRF (Cross-Site Request Forgery)
   
   Cuando ejecutas `key:generate`, el comando crea automáticamente una clave única y la guarda en 
   tu archivo `.env` en la variable `APP_KEY`. Sin esta clave, muchas funcionalidades de 
   seguridad de Laravel no funcionarán correctamente.

5. **Crear la base de datos**
   - Crear la base de datos "TIS" en PostgreSQL
   - Si usas pgAdmin, crea un nuevo servidor (si no existe) y luego una nueva base de datos llamada "TIS"
   - Alternativamente, desde la línea de comandos:
   ```bash
   psql -U postgres
   CREATE DATABASE "TIS";
   \q
   ```

6. **Configurar la base de datos**
   ```bash
   # Si las migraciones ya están creadas en el proyecto (carpeta database/migrations)
   # solo necesitas ejecutar este comando para aplicarlas a tu base de datos:
   php artisan migrate
   
   # NO es necesario crear nuevas migraciones, ya que estas vienen con el proyecto
   ```
   
   - Alternativamente, puedes importar directamente el script SQL que está en el archivo `Base de datos.txt` 
     usando pgAdmin o la línea de comandos:
   ```bash
   psql -U postgres -d TIS -f "Base de datos.txt"
   ```

7. **Iniciar el servidor**
   ```bash
   php artisan serve
   ```
   El servidor estará disponible en http://localhost:8000

### Probar la conexión

Después de iniciar el servidor, visita http://localhost:8000/db-test para verificar la conexión a la base de datos.

### Endpoints disponibles

- http://localhost:8000/api/olimpiadas
- http://localhost:8000/api/areas
- http://localhost:8000/api/estudiantes
- http://localhost:8000/api/contactos
- http://localhost:8000/api/colegios
- http://localhost:8000/api/inscripciones

### Solución de problemas comunes

Si encuentras errores, intenta:

1. Limpiar la caché:
   ```bash
   php artisan config:clear
   php artisan route:clear
   php artisan cache:clear
   ```

2. Verificar permisos:
   ```bash
   chmod -R 777 storage bootstrap/cache
   ```

3. Comprobar conexión a la base de datos:
   ```bash
   php artisan db:monitor
   ```

## Documentación de Laravel

Laravel tiene la [documentación](https://laravel.com/docs) más extensa y completa entre todos los frameworks modernos de aplicaciones web, lo que facilita su aprendizaje.
