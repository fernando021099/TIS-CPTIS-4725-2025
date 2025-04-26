<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Olimpiada;
use Illuminate\Http\Request;

class OlimpiadaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Recupera todas las olimpiadas de la base de datos
        $olimpiadas = Olimpiada::all();
        // Devuelve las olimpiadas como una respuesta JSON
        return response()->json($olimpiadas);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Lógica para guardar una nueva olimpiada (se implementará después si es necesario)
        return response()->json(['message' => 'Store method not implemented yet'], 501);
    }

    /**
     * Display the specified resource.
     */
    public function show(Olimpiada $olimpiada)
    {
        // Devuelve la olimpiada específica encontrada por Route Model Binding
        // Nota: Asegúrate que la ruta use 'olimpiada' como parámetro {olimpiada}
        return response()->json($olimpiada);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Olimpiada $olimpiada)
    {
        // Lógica para actualizar una olimpiada (se implementará después si es necesario)
        return response()->json(['message' => 'Update method not implemented yet'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Olimpiada $olimpiada)
    {
        // Lógica para eliminar una olimpiada (se implementará después si es necesario)
        return response()->json(['message' => 'Destroy method not implemented yet'], 501);
    }
}
