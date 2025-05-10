<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Olimpiada;
use Illuminate\Http\Request;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log; // Para logs si es necesario
use Illuminate\Validation\Rule; // Para reglas de validación
use Illuminate\Validation\ValidationException;

class OlimpiadaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $olimpiadas = Olimpiada::all();
        return response()->json($olimpiadas);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validatedData = $request->validate([
            'version' => 'required|integer|unique:olimpiada,version', // Clave primaria, debe ser única
            'nombre' => 'required|string|max:50',
            'fecha' => 'required|date_format:Y-m-d', // Validar formato fecha AAAA-MM-DD
            'estado' => 'required|string|max:50', // Puedes usar Rule::in(['habilitado', 'cerrado', ...]) si tienes estados fijos
        ]);

        try {
            // Como la PK no es autoincremental, la pasamos directamente
            $olimpiada = Olimpiada::create($validatedData);
            return response()->json($olimpiada, 201); // 201 Created
        } catch (\Exception $e) {
            Log::error('Error creating olimpiada: '.$e->getMessage());
            return response()->json(['message' => 'Error al crear la olimpiada'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($version) // Cambiado para aceptar 'version' directamente
    {
        try {
            // Usamos findOrFail con la clave primaria 'version'
            $olimpiada = Olimpiada::findOrFail($version);
            return response()->json($olimpiada);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Olimpiada no encontrada'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $version) // Cambiado para aceptar 'version'
    {
        try {
            $olimpiada = Olimpiada::findOrFail($version);

            $validatedData = $request->validate([
                // No validamos 'version' aquí porque no debería cambiar
                'nombre' => 'sometimes|required|string|max:50', // 'sometimes' significa que solo valida si está presente
                'fecha' => 'sometimes|required|date_format:Y-m-d',
                'estado' => 'sometimes|required|string|max:50', // Puedes usar Rule::in(...)
            ]);

            $olimpiada->update($validatedData);
            return response()->json($olimpiada);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Olimpiada no encontrada'], 404);
        } catch (ValidationException $e) {
            Log::warning('Error de validación al actualizar olimpiada: ', $e->errors());
            throw $e; // Relanzar para que Laravel maneje la respuesta
        } catch (\Exception $e) {
            Log::error('Error updating olimpiada: '.$e->getMessage());
            return response()->json(['message' => 'Error al actualizar la olimpiada'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($version) // Cambiado para aceptar 'version'
    {
        try {
            $olimpiada = Olimpiada::findOrFail($version);
            $olimpiada->delete();
            // ON DELETE CASCADE en 'inscripción' debería manejar las inscripciones asociadas
            return response()->json(null, 204); // 204 No Content
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Olimpiada no encontrada'], 404);
        } catch (\Exception $e) {
            // Podría fallar si ON DELETE CASCADE no está configurado o falla
            Log::error('Error deleting olimpiada: '.$e->getMessage());
            // Verificar si el error es por restricción de FK (si CASCADE no está activo)
            if (str_contains($e->getMessage(), 'violates foreign key constraint')) {
                 return response()->json(['message' => 'No se puede eliminar la olimpiada porque tiene registros relacionados.'], 409); // 409 Conflict
            }
            return response()->json(['message' => 'Error al eliminar la olimpiada'], 500);
        }
    }
}
