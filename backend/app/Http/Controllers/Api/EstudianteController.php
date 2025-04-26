<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Estudiante; // Importa el modelo Estudiante
use Illuminate\Http\Request;

class EstudianteController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Recupera todos los estudiantes de la base de datos
        $estudiantes = Estudiante::all();
        // Devuelve los estudiantes como una respuesta JSON
        return response()->json($estudiantes);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Lógica para guardar un nuevo estudiante (se implementará después si es necesario)
        return response()->json(['message' => 'Store method not implemented yet'], 501);
    }

    /**
     * Display the specified resource.
     */
    public function show(Estudiante $estudiante) // El tipo debe ser Estudiante
    {
        // Devuelve el estudiante específico encontrado por Route Model Binding
        return response()->json($estudiante);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Estudiante $estudiante) // El tipo debe ser Estudiante
    {
        // Lógica para actualizar un estudiante (se implementará después si es necesario)
        return response()->json(['message' => 'Update method not implemented yet'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Estudiante $estudiante) // El tipo debe ser Estudiante
    {
        // Lógica para eliminar un estudiante (se implementará después si es necesario)
        return response()->json(['message' => 'Destroy method not implemented yet'], 501);
    }
}
