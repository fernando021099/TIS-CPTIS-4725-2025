<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Colegio; // Importa el modelo Colegio
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

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
        try {
            $validatedData = $request->validate([
                'nombre' => 'required|string|max:150',
                'departamento' => 'required|string|max:100',
                'provincia' => 'required|string|max:100',
            ]);

            $colegio = Colegio::create($validatedData);
            return response()->json($colegio, 201);

        } catch (ValidationException $e) {
            Log::warning('Error de validación al crear colegio: ', $e->errors());
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error interno al crear colegio: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al crear el colegio.'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(Colegio $colegio) // Usa Route Model Binding
    {
        // Devuelve el colegio específico encontrado por Route Model Binding
        return response()->json($colegio);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Colegio $colegio) // Usa Route Model Binding
    {
        try {
            $validatedData = $request->validate([
                'nombre' => 'sometimes|required|string|max:150',
                'departamento' => 'sometimes|required|string|max:100',
                'provincia' => 'sometimes|required|string|max:100',
            ]);

            $colegio->update($validatedData);
            return response()->json($colegio);

        } catch (ValidationException $e) {
            Log::warning('Error de validación al actualizar colegio: ', $e->errors());
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error interno al actualizar colegio: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al actualizar el colegio.'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Colegio $colegio) // Usa Route Model Binding
    {
        try {
            $colegio->delete();
            // ON DELETE SET NULL en 'inscripción' debería poner colegio_id a NULL
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Error deleting colegio: '.$e->getMessage());
            if (str_contains($e->getMessage(), 'violates foreign key constraint')) {
                 // Esto no debería pasar si está SET NULL, pero por si acaso
                 return response()->json(['message' => 'No se puede eliminar el colegio porque tiene registros relacionados.'], 409);
            }
            return response()->json(['message' => 'Error al eliminar el colegio'], 500);
        }
    }
}
