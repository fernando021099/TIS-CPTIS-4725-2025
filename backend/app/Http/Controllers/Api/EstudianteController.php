<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Estudiante; // Importa el modelo Estudiante
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;

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
        try {
            $validatedData = $request->validate([
                'ci' => 'required|string|max:20|unique:estudiante,ci', // Clave primaria, única
                'correo' => 'required|string|email|max:100',
                'apellidos' => 'required|string|max:100',
                'nombres' => 'required|string|max:100',
                'fecha_nacimiento' => 'required|date_format:Y-m-d',
                'curso' => 'required|string|max:50',
            ]);

            // Como la PK no es autoincremental, la pasamos directamente
            $estudiante = Estudiante::create($validatedData);
            return response()->json($estudiante, 201);

        } catch (ValidationException $e) {
            Log::warning('Error de validación al crear estudiante: ', $e->errors());
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error interno al crear estudiante: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al crear el estudiante.'], 500);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show($ci) // Usar 'ci' como parámetro
    {
        try {
            // Buscar por la clave primaria 'ci'
            $estudiante = Estudiante::findOrFail($ci);
            return response()->json($estudiante);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Estudiante no encontrado'], 404);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, $ci) // Usar 'ci' como parámetro
    {
        try {
            $estudiante = Estudiante::findOrFail($ci);

            $validatedData = $request->validate([
                // 'ci' no se actualiza
                'correo' => 'sometimes|required|string|email|max:100',
                'apellidos' => 'sometimes|required|string|max:100',
                'nombres' => 'sometimes|required|string|max:100',
                'fecha_nacimiento' => 'sometimes|required|date_format:Y-m-d',
                'curso' => 'sometimes|required|string|max:50',
            ]);

            $estudiante->update($validatedData);
            return response()->json($estudiante);

        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Estudiante no encontrado'], 404);
        } catch (ValidationException $e) {
            Log::warning('Error de validación al actualizar estudiante: ', $e->errors());
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error interno al actualizar estudiante: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al actualizar el estudiante.'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy($ci) // Usar 'ci' como parámetro
    {
        try {
            $estudiante = Estudiante::findOrFail($ci);
            $estudiante->delete();
            // ON DELETE CASCADE en 'inscripción' debería manejar las inscripciones
            return response()->json(null, 204);
        } catch (ModelNotFoundException $e) {
            return response()->json(['message' => 'Estudiante no encontrado'], 404);
        } catch (\Exception $e) {
            Log::error('Error deleting estudiante: '.$e->getMessage());
            if (str_contains($e->getMessage(), 'violates foreign key constraint')) {
                 return response()->json(['message' => 'No se puede eliminar el estudiante porque tiene inscripciones asociadas.'], 409);
            }
            return response()->json(['message' => 'Error al eliminar el estudiante'], 500);
        }
    }
}
