<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion; // Importa el modelo Inscripcion
use App\Models\Estudiante;
use App\Models\Contacto;
use App\Models\Colegio;
use App\Models\Area;
use App\Models\Olimpiada;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB; // Para transacciones
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr; // Para helpers de array

class InscripcionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request) // Añadir Request para query params
    {
        // Cargar relaciones si se solicitan vía query parameter ?_relations=...
        $query = Inscripcion::query();
        if ($request->has('_relations')) {
            $relations = explode(',', $request->input('_relations'));
            // Validar relaciones permitidas si es necesario
            $allowedRelations = ['estudiante', 'contacto', 'colegio', 'area1', 'area2', 'olimpiada'];
            $validRelations = array_intersect($relations, $allowedRelations);
            if (!empty($validRelations)) {
                $query->with($validRelations);
            }
        }

        $inscripciones = $query->get();
        return response()->json($inscripciones);
    }

    /**
     * Store a newly created resource in storage.
     * Este método asume que los datos relacionados (estudiante, contacto, colegio)
     * ya existen o se crean/buscan aquí. Es una implementación básica.
     * La inscripción grupal necesitará lógica diferente, posiblemente en otro método/controlador.
     */
    public function store(Request $request)
    {
        // Iniciar transacción para asegurar atomicidad
        DB::beginTransaction();
        try {
            // 1. Validar datos principales de inscripción y datos anidados
            $validatedData = $request->validate([
                'estudiante' => 'required|array',
                'estudiante.ci' => 'required|string|max:20', // Validar CI
                'estudiante.correo' => 'required|string|email|max:100',
                'estudiante.apellidos' => 'required|string|max:100',
                'estudiante.nombres' => 'required|string|max:100',
                'estudiante.fecha_nacimiento' => 'required|date_format:Y-m-d',
                'estudiante.curso' => 'required|string|max:50',

                'contacto' => 'required|array',
                'contacto.celular' => 'required|string|max:20',
                'contacto.nombre' => 'required|string|max:100',
                'contacto.correo' => 'required|string|email|max:100',
                // 'contacto.relacion' => 'nullable|string|max:50', // Si se añade al modelo Contacto

                'colegio' => 'required|array',
                'colegio.nombre' => 'required|string|max:150',
                'colegio.departamento' => 'required|string|max:100',
                'colegio.provincia' => 'required|string|max:100',

                // IDs o Nombres/Categorías para buscar las áreas
                'area1_id' => 'nullable|integer|exists:area,id', // Si se envía ID directamente
                'area2_id' => 'nullable|integer|exists:area,id', // Si se envía ID directamente
                'area1_nombre' => 'required_without:area1_id|nullable|string|max:100', // Si se envía nombre
                'area1_categoria' => 'required_with:area1_nombre|nullable|string|max:50', // Si se envía nombre
                'area2_nombre' => 'required_without:area2_id|nullable|string|max:100', // Si se envía nombre
                'area2_categoria' => 'required_with:area2_nombre|nullable|string|max:50', // Si se envía nombre

                'olimpiada_version' => 'required|integer|exists:olimpiada,version',
                'estado' => 'required|string|in:pendiente,aprobado,rechazado', // Ajustar estados
                'codigo_comprobante' => 'nullable|string|max:20',
                'fecha' => 'required|date_format:Y-m-d',
                'motivo_rechazo' => 'nullable|string|max:255', // Añadido para update
            ]);

            // 2. Buscar o crear Estudiante (usando CI como clave única)
            $estudiante = Estudiante::updateOrCreate(
                ['ci' => $validatedData['estudiante']['ci']],
                Arr::except($validatedData['estudiante'], ['ci']) // Datos a actualizar/crear
            );

            // 3. Buscar o crear Contacto (podríamos usar email o celular como clave única si tiene sentido)
            // Aquí asumimos creación simple, ajustar si se necesita lógica de búsqueda
            $contacto = Contacto::create($validatedData['contacto']);

            // 4. Buscar o crear Colegio (usando nombre y departamento/provincia como clave compuesta?)
            // Aquí asumimos creación simple, ajustar si se necesita lógica de búsqueda
            $colegio = Colegio::firstOrCreate(
                 [
                    'nombre' => $validatedData['colegio']['nombre'],
                    'departamento' => $validatedData['colegio']['departamento'],
                    'provincia' => $validatedData['colegio']['provincia']
                 ]
                 // No necesita segundo argumento si solo buscamos/creamos con esos campos
            );


            // 5. Buscar IDs de Áreas si se enviaron nombres/categorías
            $area1_id = $validatedData['area1_id'] ?? null;
            if (!$area1_id && isset($validatedData['area1_nombre'])) {
                $area1 = Area::where('nombre', $validatedData['area1_nombre'])
                             ->where('categoria', $validatedData['area1_categoria'])
                             ->first();
                if ($area1) $area1_id = $area1->id;
                // Considerar qué hacer si el área no se encuentra
            }

            $area2_id = $validatedData['area2_id'] ?? null;
             if (!$area2_id && isset($validatedData['area2_nombre'])) {
                $area2 = Area::where('nombre', $validatedData['area2_nombre'])
                             ->where('categoria', $validatedData['area2_categoria'])
                             ->first();
                if ($area2) $area2_id = $area2->id;
                 // Considerar qué hacer si el área no se encuentra
            }


            // 6. Crear la Inscripción
            $inscripcion = Inscripcion::create([
                'estudiante_id' => $estudiante->ci,
                'contacto_id' => $contacto->id,
                'colegio_id' => $colegio->id,
                'area1_id' => $area1_id,
                'area2_id' => $area2_id,
                'olimpiada_version' => $validatedData['olimpiada_version'],
                'estado' => $validatedData['estado'],
                'codigo_comprobante' => $validatedData['codigo_comprobante'] ?? null,
                'fecha' => $validatedData['fecha'],
            ]);

            // Confirmar transacción
            DB::commit();

            // Cargar relaciones para la respuesta
            $inscripcion->load(['estudiante', 'contacto', 'colegio', 'area1', 'area2', 'olimpiada']);

            return response()->json($inscripcion, 201);

        } catch (ValidationException $e) {
            DB::rollBack(); // Revertir transacción en caso de error de validación
            Log::warning('Error de validación al crear inscripción: ', $e->errors());
            throw $e;
        } catch (\Exception $e) {
            DB::rollBack(); // Revertir transacción en caso de error general
            Log::error('Error interno al crear inscripción: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al crear la inscripción.'], 500);
        }
    }


    /**
     * Display the specified resource.
     */
    public function show(Request $request, Inscripcion $inscripcion) // Añadir Request
    {
        // Cargar relaciones si se solicitan vía query parameter ?_relations=...
        if ($request->has('_relations')) {
            $relations = explode(',', $request->input('_relations'));
            $allowedRelations = ['estudiante', 'contacto', 'colegio', 'area1', 'area2', 'olimpiada'];
            $validRelations = array_intersect($relations, $allowedRelations);
             if (!empty($validRelations)) {
                $inscripcion->load($validRelations);
            }
        }
        return response()->json($inscripcion);
    }

    /**
     * Update the specified resource in storage.
     * Principalmente para actualizar estado y motivo_rechazo.
     */
    public function update(Request $request, Inscripcion $inscripcion)
    {
        try {
            // Validar solo los campos que se pueden actualizar
            $validatedData = $request->validate([
                'estado' => 'sometimes|required|string|in:pendiente,aprobado,rechazado',
                'motivo_rechazo' => 'nullable|string|max:255',
                'codigo_comprobante' => 'nullable|string|max:20',
                // Añadir otros campos si se permite actualizarlos
            ]);

            // Limpiar motivo_rechazo si el estado no es 'rechazado'
            if (isset($validatedData['estado']) && $validatedData['estado'] !== 'rechazado') {
                $validatedData['motivo_rechazo'] = null;
            } elseif (!isset($validatedData['estado']) && $inscripcion->estado !== 'rechazado') {
                 // Si no se envía estado y el estado actual no es rechazado, limpiar motivo
                 if (array_key_exists('motivo_rechazo', $validatedData)) {
                     $validatedData['motivo_rechazo'] = null;
                 }
            }


            $inscripcion->update($validatedData);

            // Recargar relaciones si es necesario para la respuesta
            $inscripcion->load(['estudiante', 'contacto', 'colegio', 'area1', 'area2', 'olimpiada']);

            return response()->json($inscripcion);

        } catch (ValidationException $e) {
            Log::warning('Error de validación al actualizar inscripción: ', $e->errors());
            throw $e;
        } catch (\Exception $e) {
            Log::error('Error interno al actualizar inscripción: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al actualizar la inscripción.'], 500);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(Inscripcion $inscripcion)
    {
        try {
            $inscripcion->delete();
            return response()->json(null, 204);
        } catch (\Exception $e) {
            Log::error('Error deleting inscripcion: '.$e->getMessage());
            return response()->json(['message' => 'Error al eliminar la inscripción'], 500);
        }
    }

     /**
     * Store multiple inscriptions (Group Registration).
     * Endpoint: POST /inscripciones/grupo (necesita definir ruta en api.php)
     */
    public function storeGroup(Request $request)
    {
        // Iniciar transacción
        DB::beginTransaction();
        try {
            // 1. Validar datos del tutor y array de inscripciones
            $validatedData = $request->validate([
                'contacto_tutor' => 'required|array',
                'contacto_tutor.celular' => 'required|string|max:20',
                'contacto_tutor.nombre' => 'required|string|max:100',
                'contacto_tutor.correo' => 'required|string|email|max:100',

                'inscripciones' => 'required|array|min:1', // Debe haber al menos una inscripción
                'inscripciones.*.estudiante' => 'required|array',
                'inscripciones.*.estudiante.ci' => 'required|string|max:20',
                'inscripciones.*.estudiante.nombres' => 'required|string|max:100',
                'inscripciones.*.estudiante.apellidos' => 'required|string|max:100',
                // Añadir más validaciones de estudiante si vienen del excel/form
                'inscripciones.*.estudiante.fecha_nacimiento' => 'nullable|date_format:Y-m-d',
                'inscripciones.*.estudiante.curso' => 'nullable|string|max:50',
                'inscripciones.*.estudiante.correo' => 'nullable|string|email|max:100',


                'inscripciones.*.colegio' => 'required|array',
                'inscripciones.*.colegio.nombre' => 'required|string|max:150',
                'inscripciones.*.colegio.departamento' => 'required|string|max:100',
                'inscripciones.*.colegio.provincia' => 'required|string|max:100',

                'inscripciones.*.area1_nombre' => 'required|string|max:100',
                'inscripciones.*.area1_categoria' => 'nullable|string|max:50', // Puede ser null si viene de Excel
                'inscripciones.*.area2_nombre' => 'nullable|string|max:100',
                'inscripciones.*.area2_categoria' => 'nullable|string|max:50',

                // Asumir que la versión de olimpiada es la misma para todo el grupo
                'olimpiada_version' => 'required|integer|exists:olimpiada,version',
            ]);

            // 2. Buscar o crear Contacto Tutor
            // Podríamos buscar por email o celular para evitar duplicados
            $contactoTutor = Contacto::firstOrCreate(
                ['correo' => $validatedData['contacto_tutor']['correo']],
                $validatedData['contacto_tutor']
            );

            $inscripcionesCreadas = [];
            $montoTotal = 0;
            $fechaHoy = now()->toDateString(); // Fecha actual

            // 3. Iterar y crear cada inscripción
            foreach ($validatedData['inscripciones'] as $inscripcionData) {
                 // Buscar o crear Estudiante
                $estudiante = Estudiante::updateOrCreate(
                    ['ci' => $inscripcionData['estudiante']['ci']],
                    // Completar datos faltantes si es necesario
                    array_merge(
                        ['correo' => $inscripcionData['estudiante']['correo'] ?? $inscripcionData['estudiante']['ci'].'@sin-correo.com'], // Correo por defecto si falta
                        Arr::except($inscripcionData['estudiante'], ['ci', 'correo'])
                    )
                );

                // Buscar o crear Colegio
                $colegio = Colegio::firstOrCreate(
                    [
                        'nombre' => $inscripcionData['colegio']['nombre'],
                        'departamento' => $inscripcionData['colegio']['departamento'],
                        'provincia' => $inscripcionData['colegio']['provincia']
                    ]
                );

                // Buscar IDs de Áreas
                $area1_id = null;
                $area1 = Area::where('nombre', $inscripcionData['area1_nombre'])
                             ->when(isset($inscripcionData['area1_categoria']), function ($q) use ($inscripcionData) {
                                 return $q->where('categoria', $inscripcionData['area1_categoria']);
                             })
                             ->first();
                if ($area1) $area1_id = $area1->id;

                $area2_id = null;
                if (isset($inscripcionData['area2_nombre'])) {
                    $area2 = Area::where('nombre', $inscripcionData['area2_nombre'])
                                ->when(isset($inscripcionData['area2_categoria']), function ($q) use ($inscripcionData) {
                                    return $q->where('categoria', $inscripcionData['area2_categoria']);
                                })
                                ->first();
                    if ($area2) $area2_id = $area2->id;
                }

                // Crear Inscripción
                $inscripcion = Inscripcion::create([
                    'estudiante_id' => $estudiante->ci,
                    'contacto_id' => $contactoTutor->id, // Usar ID del tutor grupal
                    'colegio_id' => $colegio->id,
                    'area1_id' => $area1_id,
                    'area2_id' => $area2_id,
                    'olimpiada_version' => $validatedData['olimpiada_version'],
                    'estado' => 'pendiente', // Estado inicial
                    'fecha' => $fechaHoy,
                    // 'codigo_comprobante' => null, // Se genera después?
                ]);

                $inscripcionesCreadas[] = $inscripcion->id;
                // Calcular costo (asumiendo costo fijo por área o inscripción)
                 $costoInscripcion = ($area1 ? $area1->costo : 0) + ($area2 ? $area2->costo : 0);
                 // O un costo fijo por inscripción si es más simple
                 // $costoInscripcion = 15; // Ejemplo
                 $montoTotal += $costoInscripcion > 0 ? $costoInscripcion : ($area1_id || $area2_id ? 15 : 0); // Costo mínimo si hay área
            }

            // 4. Generar datos para la respuesta (similares al modal de pago)
            $registroGrupalId = 'GRP-' . $contactoTutor->id . '-' . time(); // ID temporal
            $codigoPago = 'PAGO-' . strtoupper(substr(md5($registroGrupalId), 0, 6));
            $fechaLimitePago = now()->addDays(3)->toDateString();

            // Confirmar transacción
            DB::commit();

            return response()->json([
                'message' => 'Inscripciones grupales registradas correctamente.',
                'registro_grupal_id' => $registroGrupalId,
                'cantidad_estudiantes' => count($inscripcionesCreadas),
                'monto_total' => $montoTotal,
                'codigo_pago' => $codigoPago,
                'fecha_limite_pago' => $fechaLimitePago,
                'ids_inscripciones' => $inscripcionesCreadas, // Opcional: devolver IDs creados
            ], 201);


        } catch (ValidationException $e) {
            DB::rollBack();
            Log::warning('Error de validación al crear inscripción grupal: ', $e->errors());
            // Devolver errores de validación específicos
            return response()->json(['message' => 'Error de validación.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error interno al crear inscripción grupal: ' . $e->getMessage());
            return response()->json(['message' => 'Error interno al procesar la inscripción grupal.'], 500);
        }
    }
}
