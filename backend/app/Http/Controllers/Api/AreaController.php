<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException; // Importar ValidationException
use Illuminate\Support\Facades\Log; // Importar Log para registrar errores

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
        try {
            // 1. Validar los datos recibidos del frontend
            $validatedData = $request->validate([
                'nombre' => 'required|string|max:100',
                'categoria' => 'required|string|max:50',
                'descripcion' => 'nullable|string|max:255', // Ajustar longitud máxima si es diferente en la BD
                'estado' => 'required|string|in:activo,inactivo', // Asegurar que los valores coincidan
                'costo' => 'required|numeric|min:0',
                'modo' => 'required|string|max:20', // Ajustar longitud máxima si es diferente
            ]);

            // 2. Crear la nueva área en la base de datos
            $area = Area::create($validatedData);

            // 3. Devolver la respuesta JSON con el área creada y estado 201 (Created)
            return response()->json($area, 201);

        } catch (ValidationException $e) {
            // Si la validación falla, Laravel automáticamente devuelve una respuesta 422
            // con los errores de validación. No necesitas hacer nada extra aquí,
            // pero puedes registrar el error si quieres.
            Log::warning('Error de validación al crear área: ', $e->errors());
            throw $e; // Relanzar para que Laravel maneje la respuesta
        } catch (\Exception $e) {
            // Capturar cualquier otro error inesperado durante la creación
            Log::error('Error interno al crear área: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al crear el área. Intente nuevamente.'], 500);
        }
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
        // Similar a store, pero usando $area->update($validatedData)
        return response()->json(['message' => 'Update method not implemented yet'], 501);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Area $area)
    {
        // Lógica para eliminar un área (se implementará después si es necesario)
        // $area->delete(); return response()->json(null, 204);
        return response()->json(['message' => 'Destroy method not implemented yet'], 501);
    }
}
