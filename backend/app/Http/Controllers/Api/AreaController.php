<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Area;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Illuminate\Validation\ValidationException;

class AreaController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index()
    {
        try {
            $areas = Area::orderBy('nombre')
                         ->orderBy('categoria')
                         ->get();
            
            Log::info('Áreas obtenidas correctamente', ['cantidad' => $areas->count()]);
            
            return response()->json($areas);
        } catch (\Exception $e) {
            Log::error('Error al obtener áreas: ' . $e->getMessage());
            return response()->json(['message' => 'Error al obtener las áreas'], 500);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            $validatedData = $request->validate([
                'nombre' => 'required|string|max:100',
                'categoria' => 'required|string|max:50',
                'descripcion' => 'nullable|string',
                'costo' => 'required|numeric|min:0',
                'estado' => 'required|string|in:activo,inactivo',
                'modo' => 'nullable|string|in:normal,unico'
            ]);

            // Verificar que no exista una combinación duplicada de nombre y categoría
            $existingArea = Area::where('nombre', $validatedData['nombre'])
                               ->where('categoria', $validatedData['categoria'])
                               ->first();

            if ($existingArea) {
                return response()->json([
                    'message' => 'Ya existe un área con el mismo nombre y categoría',
                    'errors' => [
                        'categoria' => ['Esta combinación de área y categoría ya existe']
                    ]
                ], 422);
            }

            // Establecer modo por defecto si no se especifica
            if (!isset($validatedData['modo'])) {
                $validatedData['modo'] = ($validatedData['nombre'] === 'ROBOTICA') ? 'unico' : 'normal';
            }

            $area = Area::create($validatedData);

            Log::info('Área creada exitosamente', [
                'id' => $area->id,
                'nombre' => $area->nombre,
                'categoria' => $area->categoria
            ]);

            return response()->json($area, 201);

        } catch (ValidationException $e) {
            Log::warning('Error de validación al crear área: ', $e->errors());
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error interno al crear área: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al crear el área'], 500);
        }
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
        try {
            $validatedData = $request->validate([
                'nombre' => 'sometimes|required|string|max:100',
                'categoria' => 'sometimes|required|string|max:50',
                'descripcion' => 'nullable|string',
                'costo' => 'sometimes|required|numeric|min:0',
                'estado' => 'sometimes|required|string|in:activo,inactivo',
                'modo' => 'nullable|string|in:normal,unico'
            ]);

            // Verificar duplicados solo si se está cambiando nombre o categoría
            if (isset($validatedData['nombre']) || isset($validatedData['categoria'])) {
                $nombre = $validatedData['nombre'] ?? $area->nombre;
                $categoria = $validatedData['categoria'] ?? $area->categoria;

                // CORREGIDO: Solo validar duplicados si realmente cambió nombre o categoría
                $hubocambio = ($nombre !== $area->nombre) || ($categoria !== $area->categoria);
                
                if ($hubocambio) {
                    $existingArea = Area::where('nombre', $nombre)
                                       ->where('categoria', $categoria)
                                       ->where('id', '!=', $area->id)
                                       ->first();

                    if ($existingArea) {
                        Log::warning('Intento de actualizar área con combinación duplicada', [
                            'area_editada_id' => $area->id,
                            'nombre_nuevo' => $nombre,
                            'categoria_nueva' => $categoria,
                            'area_existente_id' => $existingArea->id
                        ]);
                        
                        return response()->json([
                            'message' => 'Ya existe un área con el mismo nombre y categoría',
                            'errors' => [
                                'categoria' => ['Esta combinación de área y categoría ya existe']
                            ]
                        ], 422);
                    }
                }
            }

            $area->update($validatedData);

            Log::info('Área actualizada exitosamente', [
                'id' => $area->id,
                'nombre' => $area->nombre,
                'categoria' => $area->categoria,
                'cambios' => array_keys($validatedData)
            ]);

            return response()->json($area);

        } catch (ValidationException $e) {
            Log::warning('Error de validación al actualizar área: ', $e->errors());
            return response()->json([
                'message' => 'Error de validación',
                'errors' => $e->errors()
            ], 422);
        } catch (\Exception $e) {
            Log::error('Error interno al actualizar área: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al actualizar el área'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Area $area)
    {
        try {
            // Verificar si el área está siendo usada en inscripciones
            $inscripcionesCount = $area->inscripcionesArea1()->count() + $area->inscripcionesArea2()->count();
            
            if ($inscripcionesCount > 0) {
                return response()->json([
                    'message' => 'No se puede eliminar el área porque tiene inscripciones asociadas',
                    'inscripciones_count' => $inscripcionesCount
                ], 422);
            }

            $areaInfo = [
                'id' => $area->id,
                'nombre' => $area->nombre,
                'categoria' => $area->categoria
            ];

            $area->delete();

            Log::info('Área eliminada exitosamente', $areaInfo);

            return response()->json(null, 204);

        } catch (\Exception $e) {
            Log::error('Error al eliminar área: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al eliminar el área'], 500);
        }
    }

    /**
     * Get unique area names
     */
    public function getAreaNames()
    {
        try {
            $areaNames = Area::distinct()
                            ->pluck('nombre')
                            ->sort()
                            ->values();

            return response()->json($areaNames);
        } catch (\Exception $e) {
            Log::error('Error al obtener nombres de áreas: ' . $e->getMessage());
            return response()->json(['message' => 'Error al obtener nombres de áreas'], 500);
        }
    }

    /**
     * Get categories for a specific area
     */
    public function getCategoriesByArea($areaName)
    {
        try {
            $categories = Area::where('nombre', $areaName)
                             ->where('estado', 'activo')
                             ->pluck('categoria')
                             ->sort()
                             ->values();

            return response()->json($categories);
        } catch (\Exception $e) {
            Log::error('Error al obtener categorías por área: ' . $e->getMessage());
            return response()->json(['message' => 'Error al obtener categorías'], 500);
        }
    }
}
