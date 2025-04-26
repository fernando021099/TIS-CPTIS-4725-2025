<?php

use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\DB; // Import DB facade

Route::get('/', function () {
    return view('welcome');
});

// Add this route to test DB connection
Route::get('/db-test', function () {
    try {
        DB::connection()->getPdo();
        return 'Database connection successful! DB Name: ' . DB::connection()->getDatabaseName();
    } catch (\Exception $e) {
        return 'Database connection failed: ' . $e->getMessage();
    }
});
