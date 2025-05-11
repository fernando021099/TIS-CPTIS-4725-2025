<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Contacto; // Asegúrate de importar el modelo correcto
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

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
        try {
            $validatedData = $request->validate([
                'celular' => 'required|string|max:20',
                'nombre' => 'required|string|max:100',
                'correo' => 'required|string|email|max:100',
            ]);

            $contacto = Contacto::create($validatedData);
            return response()->json($contacto, 201);

        } catch (ValidationException $e) {
            Log::warning('Error de validación al crear contacto: ', $e->errors());
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error interno al crear contacto: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al crear el contacto.'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Contacto $contacto) // Usa Route Model Binding
    {
        // Devuelve el contacto específico encontrado por Route Model Binding
        return response()->json($contacto);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Contacto $contacto) // Usa Route Model Binding
    {
        try {
            $validatedData = $request->validate([
                'celular' => 'sometimes|required|string|max:20',
                'nombre' => 'sometimes|required|string|max:100',
                'correo' => 'sometimes|required|string|email|max:100',
            ]);

            $contacto->update($validatedData);
            return response()->json($contacto);

        } catch (ValidationException $e) {
            Log::warning('Error de validación al actualizar contacto: ', $e->errors());
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error interno al actualizar contacto: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al actualizar el contacto.'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Contacto $contacto) // Usa Route Model Binding
    {
        try {
            $contacto->delete();
            // ON DELETE SET NULL en 'inscripción' debería poner contacto_id a NULL
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Error deleting contacto: '.$e->getMessage() . ' Trace: ' . $e->getTraceAsString()); // Añadir Trace
             if (str_contains($e->getMessage(), 'violates foreign key constraint')) {
                 // Esto no debería pasar si está SET NULL, pero por si acaso
                 return response()->json(['message' => 'No se puede eliminar el contacto porque tiene registros relacionados que no permiten SET NULL.'], 409);
            }
            return response()->json(['message' => 'Error al eliminar el contacto'], 500);
        }
    }
}
