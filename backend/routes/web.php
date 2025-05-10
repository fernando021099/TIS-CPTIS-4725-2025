<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB; // Import DB facade

// Route::get('/', function () { // Eliminar esta ruta
//     return view('welcome');
// });

// Puedes mantener esta ruta para pruebas o eliminarla si ya no es necesaria.
Route::get('/db-test', function () {
    try {
        DB::connection()->getPdo();
        return 'Database connection successful! DB Name: ' . DB::connection()->getDatabaseName();
    } catch (\Exception $e) {
        return 'Database connection failed: ' . $e->getMessage();
    }
});
