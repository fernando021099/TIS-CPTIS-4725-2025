<?php

return [

    /*
    |--------------------------------------------------------------------------
    | Allowed Origins, Allowed Origins Patterns
    |--------------------------------------------------------------------------
    |
    | Specify which origins are allowed to access your application. You can use
    | '*' to allow all origins, but it's recommended to be specific for security.
    | You can also use patterns like `*.example.com`.
    |
    */

    // Permitir el origen del frontend (ej. http://localhost:5173)
    // Es buena práctica usar una variable de entorno, pero para desarrollo rápido puedes poner la URL directamente.
    'allowed_origins' => [
        env('FRONTEND_URL', 'http://localhost:5173'), // Asegúrate que esta sea la URL donde corre tu frontend Vite
        // Puedes añadir 'http://127.0.0.1:5173' si accedes por IP también
    ],

    'allowed_origins_patterns' => [],

    /*
    |--------------------------------------------------------------------------
    | Allowed Methods
    |--------------------------------------------------------------------------
    |
    | Specify which HTTP methods are allowed. '*' allows all methods.
    |
    */

    'allowed_methods' => ['*'], // Permitir todos los métodos (GET, POST, PUT, PATCH, DELETE, OPTIONS)

    /*
    |--------------------------------------------------------------------------
    | Allowed Headers
    |--------------------------------------------------------------------------
    |
    | Specify which HTTP headers are allowed in requests. '*' allows all headers.
    |
    */

    'allowed_headers' => ['*'], // Permitir todos los headers comunes (Content-Type, Accept, Authorization, etc.)

    /*
    |--------------------------------------------------------------------------
    | Exposed Headers
    |--------------------------------------------------------------------------
    |
    | Specify which headers should be exposed to the browser.
    |
    */

    'exposed_headers' => [],

    /*
    |--------------------------------------------------------------------------
    | Max Age
    |--------------------------------------------------------------------------
    |
    | Specifies how long the results of a preflight request (OPTIONS) can be
    | cached in seconds.
    |
    */

    'max_age' => 0, // 0 para desarrollo, puedes aumentarlo en producción

    /*
    |--------------------------------------------------------------------------
    | Supports Credentials
    |--------------------------------------------------------------------------
    |
    | Indicates whether the browser should send cookies or other credentials
    | with the request.
    |
    */

    'supports_credentials' => false, // Mantener en false si no usas autenticación basada en cookies/sesiones para la API

];
