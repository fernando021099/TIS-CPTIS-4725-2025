<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion; // Importa el modelo Inscripcion
use Illuminate\Http\Request;

class InscripcionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Recupera todas las inscripciones de la base de datos
        // Puedes usar with() para cargar relaciones si lo necesitas inmediatamente
        // $inscripciones = Inscripcion::with(['estudiante', 'area1', 'colegio'])->get();
        $inscripciones = Inscripcion::all();
        // Devuelve las inscripciones como una respuesta JSON
        return response()->json($inscripciones);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Lógica para guardar una nueva inscripción (se implementará después si es necesario)
        return response()->json(['message' => 'Store method not implemented yet'], 501);
    }

    /**
     * Display the specified resource.
     */
    public function show(Inscripcion $inscripcion) // El tipo debe ser Inscripcion
    {
        // Carga relaciones si quieres ver detalles relacionados
        // $inscripcion->load(['estudiante', 'contacto', 'colegio', 'area1', 'area2', 'olimpiada']);
        // Devuelve la inscripción específica encontrada por Route Model Binding
        return response()->json($inscripcion);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Inscripcion $inscripcion) // El tipo debe ser Inscripcion
    {
        // Lógica para actualizar una inscripción (se implementará después si es necesario)
        return response()->json(['message' => 'Update method not implemented yet'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inscripcion $inscripcion) // El tipo debe ser Inscripcion
    {
        // Lógica para eliminar una inscripción (se implementará después si es necesario)
        return response()->json(['message' => 'Destroy method not implemented yet'], 501);
    }
}
