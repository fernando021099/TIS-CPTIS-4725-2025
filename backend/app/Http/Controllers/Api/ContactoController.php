<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contacto; // Asegúrate de importar el modelo correcto
use Illuminate\Http\Request;

class ContactoController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        // Recupera todos los contactos de la base de datos
        $contactos = Contacto::all();
        // Devuelve los contactos como una respuesta JSON
        return response()->json($contactos);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        // Lógica para guardar un nuevo contacto (se implementará después si es necesario)
        return response()->json(['message' => 'Store method not implemented yet'], 501);
    }

    /**
     * Display the specified resource.
     */
    public function show(Contacto $contacto) // Asegúrate de que el tipo sea Contacto
    {
        // Devuelve el contacto específico encontrado por Route Model Binding
        return response()->json($contacto);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Contacto $contacto) // Asegúrate de que el tipo sea Contacto
    {
        // Lógica para actualizar un contacto (se implementará después si es necesario)
        return response()->json(['message' => 'Update method not implemented yet'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Contacto $contacto) // Asegúrate de que el tipo sea Contacto
    {
        // Lógica para eliminar un contacto (se implementará después si es necesario)
        return response()->json(['message' => 'Destroy method not implemented yet'], 501);
    }
}
