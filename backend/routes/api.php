<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\OlimpiadaController;
use App\Http\Controllers\Api\AreaController;
use App\Http\Controllers\Api\EstudianteController;
use App\Http\Controllers\Api\ContactoController;
use App\Http\Controllers\Api\ColegioController;
use App\Http\Controllers\Api\InscripcionController;

// Rutas para autenticación (si las necesitas más adelante)
// Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
//     return $request->user();
// });

// Rutas de recursos API para los modelos
Route::apiResource('olimpiadas', OlimpiadaController::class);
Route::apiResource('areas', AreaController::class);
Route::apiResource('estudiantes', EstudianteController::class)->parameters(['estudiantes' => 'ci']); // Indicar que el parámetro es 'ci'
Route::apiResource('contactos', ContactoController::class);
Route::apiResource('colegios', ColegioController::class);

// Rutas específicas para Inscripcion DEBEN IR ANTES de apiResource para 'inscripción'
Route::get('inscripción/buscar-por-codigo-recibo', [InscripcionController::class, 'buscarPorCodigoRecibo']);
Route::post('inscripción/grupo', [InscripcionController::class, 'storeGroup']);
Route::post('pagos/aprobar-por-codigo', [InscripcionController::class, 'aprobarPorCodigoRecibo']);

// Ahora la ruta de recurso para inscripción
Route::apiResource('inscripción', InscripcionController::class);

// Comenta o elimina esta línea si OCRController no existe aún
Route::post('/ocr', [OCRController::class, 'procesarImagen']);

Route::post('/inscripción/verificar-cis', [InscripcionController::class, 'verificarCIs']);
Route::get('/olimpiada/ultima-version', [OlimpiadaController::class, 'ultimaVersion']);
// Puedes añadir rutas personalizadas aquí si necesitas lógica más específica
// Ejemplo: Obtener áreas activas
// Route::get('/areas-activas', [AreaController::class, 'activas']);
// Ejemplo: Obtener provincias por departamento
// Route::get('/provincias/{departamento}', [ColegioController::class, 'getProvinciasPorDepartamento']);

