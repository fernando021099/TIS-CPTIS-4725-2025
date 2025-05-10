<?php

use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php', // Define explícitamente el archivo de rutas API
        apiPrefix: 'api', // Define explícitamente el prefijo (aunque es el predeterminado)
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware) {
        // No hay middleware global que parezca interferir por ahora
    })
    ->withExceptions(function (Exceptions $exceptions) {
        //
    })->create();
