<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;
use Illuminate\Validation\Rule;
use Illuminate\Database\QueryException;

class AreaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        $areas = Area::all();
        return response()->json($areas);
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => [
                'required',
                'string',
                'max:100',
                Rule::unique('area')->where(function ($query) use ($request) {
                    return $query->where('categoria', $request->categoria);
                }),
            ],
            'categoria' => 'required|string|max:50',
            'descripcion' => 'nullable|string|max:1000', // Ajustado según tu frontend
            'costo' => 'required|integer|min:0', // La BD tiene costo INT
            'estado' => 'required|string|in:activo,inactivo', // Ajustado según tu frontend
            'modo' => 'nullable|string|max:20',
        ], [
            'nombre.unique' => 'La combinación de nombre y categoría ya existe.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $area = Area::create($validator->validated());

        return response()->json([
            'message' => 'Área registrada exitosamente!',
            'area' => $area
        ], 201);
    }

    /**
     * Display the specified resource.
     */
    public function show(Area $area)
    {
        return response()->json($area);
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, Area $area)
    {
        $validator = Validator::make($request->all(), [
            'nombre' => [
                'required',
                'string',
                'max:100',
                Rule::unique('area')->where(function ($query) use ($request) {
                    return $query->where('categoria', $request->categoria);
                })->ignore($area->id),
            ],
            'categoria' => 'required|string|max:50',
            'descripcion' => 'nullable|string|max:1000',
            'costo' => 'required|integer|min:0',
            'estado' => 'required|string|in:activo,inactivo',
            'modo' => 'nullable|string|max:20',
        ], [
            'nombre.unique' => 'La combinación de nombre y categoría ya existe.',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $area->update($validator->validated());

        return response()->json([
            'message' => 'Área actualizada exitosamente!',
            'area' => $area
        ]);
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Area $area)
    {
        try {
            // Verificar si el área está siendo utilizada en la tabla 'inscripción'
            // Asumiendo que tienes un modelo Inscripcion y relaciones definidas
            // o puedes hacer una consulta directa.
            $isInUseInInscripcion1 = \App\Models\Inscripcion::where('area1_id', $area->id)->exists();
            $isInUseInInscripcion2 = \App\Models\Inscripcion::where('area2_id', $area->id)->exists();

            if ($isInUseInInscripcion1 || $isInUseInInscripcion2) {
                return response()->json(['message' => 'No se puede eliminar el área porque está siendo utilizada en inscripciones.'], 409); // 409 Conflict
            }
            
            $area->delete();
            return response()->json(['message' => 'Área eliminada exitosamente!']);
        } catch (QueryException $e) {
            // Este catch es un fallback, la verificación anterior es más específica.
            // Código 23503 es para PostgreSQL foreign key violation. Otros SGBD pueden tener códigos diferentes.
            // Para MySQL/MariaDB suele ser 1451.
            if ($e->getCode() == "23503" || $e->getCode() == "1451") { 
                return response()->json(['message' => 'No se puede eliminar el área porque está siendo utilizada.'], 409); // 409 Conflict
            }
            return response()->json(['message' => 'Error al eliminar el área: ' . $e->getMessage()], 500);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Error inesperado al eliminar el área: ' . $e->getMessage()], 500);
        }
    }
}
