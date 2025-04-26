<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Colegio; // Importa el modelo Colegio
use Illuminate\Http\Request;

class ColegioController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Recupera todos los colegios de la base de datos
        $colegios = Colegio::all();
        // Devuelve los colegios como una respuesta JSON
        return response()->json($colegios);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Lógica para guardar un nuevo colegio (se implementará después si es necesario)
        return response()->json(['message' => 'Store method not implemented yet'], 501);
    }

    /**
     * Display the specified resource.
     */
    public function show(Colegio $colegio) // El tipo debe ser Colegio
    {
        // Devuelve el colegio específico encontrado por Route Model Binding
        return response()->json($colegio);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Colegio $colegio) // El tipo debe ser Colegio
    {
        // Lógica para actualizar un colegio (se implementará después si es necesario)
        return response()->json(['message' => 'Update method not implemented yet'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Colegio $colegio) // El tipo debe ser Colegio
    {
        // Lógica para eliminar un colegio (se implementará después si es necesario)
        return response()->json(['message' => 'Destroy method not implemented yet'], 501);
    }
}
