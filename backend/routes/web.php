<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB; // Import DB facade

// Route::get('/', function () { // Eliminar esta ruta
//     return view('welcome');
// });

// La funcionalidad de prueba de base de datos ahora está en la ruta raíz.
Route::get('/', function () {
    try {
        DB::connection()->getPdo();
        return 'Database connection successful! DB Name: ' . DB::connection()->getDatabaseName();
    } catch (\Exception $e) {
        return 'Database connection failed: ' . $e->getMessage();
    }
});
