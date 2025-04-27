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
Route::apiResource('inscripciones', InscripcionController::class);

// Ruta específica para inscripción grupal
Route::post('/inscripciones/grupo', [InscripcionController::class, 'storeGroup']);


// Puedes añadir rutas personalizadas aquí si necesitas lógica más específica
// Ejemplo: Obtener áreas activas
// Route::get('/areas-activas', [AreaController::class, 'activas']);
// Ejemplo: Obtener provincias por departamento
// Route::get('/provincias/{departamento}', [ColegioController::class, 'getProvinciasPorDepartamento']);

