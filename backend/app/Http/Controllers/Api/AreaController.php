<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Area;
use Illuminate\Http\Request;

class AreaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Recupera todas las áreas de la base de datos
        $areas = Area::all();
        // Devuelve las áreas como una respuesta JSON
        return response()->json($areas);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Lógica para guardar una nueva área (se implementará después si es necesario)
        return response()->json(['message' => 'Store method not implemented yet'], 501);
    }

    /**
     * Display the specified resource.
     */
    public function show(Area $area)
    {
        // Devuelve el área específica encontrada por Route Model Binding
        return response()->json($area);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Area $area)
    {
        // Lógica para actualizar un área (se implementará después si es necesario)
        return response()->json(['message' => 'Update method not implemented yet'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Area $area)
    {
        // Lógica para eliminar un área (se implementará después si es necesario)
        return response()->json(['message' => 'Destroy method not implemented yet'], 501);
    }
}
