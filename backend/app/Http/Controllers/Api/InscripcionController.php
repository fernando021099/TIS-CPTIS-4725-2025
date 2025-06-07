<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Inscripcion;
use App\Models\Estudiante;
use App\Models\Contacto;
use App\Models\Colegio;
use App\Models\Area;
use App\Models\Olimpiada;
use App\Models\Tutoria; // Importar el modelo Tutoria
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\ValidationException;
use Illuminate\Database\Eloquent\ModelNotFoundException;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Arr;

class InscripcionController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request) // Añadir Request para query params
    {
        Log::info('Accediendo al método index de InscripcionController. Prueba de escritura en log.'); // LOG DE PRUEBA

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
     */
    public function store(Request $request)
    {
        // Iniciar transacción para asegurar atomicidad
        DB::beginTransaction();
        Log::info('Inicio del método store en InscripcionController.'); // Log de prueba adicional
        try {
            // 1. Validar datos principales de inscripción y datos anidados
            
            // Verificar primero si es ROBÓTICA para ajustar las reglas de validación
            $isRobotica = $request->input('area1_nombre') === 'ROBÓTICA';
            
            // Reglas base para todos los casos
            $rules = [
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
                'contacto.relacion' => 'required|string|max:50',


                'colegio' => 'required|array',
                'colegio.nombre' => 'required|string|max:150',
                'colegio.departamento' => 'required|string|max:100',
                'colegio.provincia' => 'required|string|max:100',

                'area1_id' => 'nullable|integer|exists:area,id',
                'area1_nombre' => 'required_without:area1_id|nullable|string|max:100',
                'area1_categoria' => 'required_with:area1_nombre|nullable|string|max:50',
                
                'olimpiada_version' => 'required|integer|exists:olimpiada,version', // 'olimpiada' es correcto si esa tabla se llama así
                'estado' => 'required|string|in:pendiente,aprobado,rechazado',
                // 'codigo_comprobante' => 'nullable|string|max:20', // Se generará internamente
                'fecha' => 'required|date_format:Y-m-d',
                'motivo_rechazo' => 'nullable|string|max:255',
            ];
            
            // Ajustar reglas para área2 dependiendo de si es ROBÓTICA
            if ($isRobotica) {
                $rules['area2_id'] = 'nullable|integer|exists:area,id';
                $rules['area2_nombre'] = 'nullable|string|max:100';
                $rules['area2_categoria'] = 'nullable|string|max:50';
            } else {
                $rules['area2_id'] = 'nullable|integer|exists:area,id';
                $rules['area2_nombre'] = 'nullable|string|max:100'; // No requerido si area2_id no se envía
                $rules['area2_categoria'] = 'nullable|string|max:50'; // No requerido si area2_id no se envía
            }
            
            $validatedData = $request->validate($rules);
            // --- VERIFICACIÓN DE INSCRIPCIÓN DUPLICADA POR CI ---
            $ci = $validatedData['estudiante']['ci'];
        $olimpiada_version = $validatedData['olimpiada_version'];
        $yaInscrito = \App\Models\Inscripcion::where('estudiante_id', $ci)
            ->where('olimpiada_version', $olimpiada_version)
            ->exists();
        if ($yaInscrito) {
            DB::rollBack();
            return response()->json([
                'message' => 'CI ya registrado para esta olimpiada'
            ], 409);
        }
        // --- FIN VERIFICACIÓN ---
            // 2. Buscar o crear Estudiante (usando CI como clave única)
            $estudiante = Estudiante::updateOrCreate(
                ['ci' => $validatedData['estudiante']['ci']], 
                Arr::except($validatedData['estudiante'], ['ci']) 
            );

            // 3. Buscar o crear Contacto
            $contacto = Contacto::firstOrCreate(
                ['correo' => $validatedData['contacto']['correo']],
                $validatedData['contacto']
            );


            // 4. Buscar o crear Colegio
            $colegio = Colegio::firstOrCreate(
                [
                    'nombre' => $validatedData['colegio']['nombre'],
                    'departamento' => $validatedData['colegio']['departamento'],
                    'provincia' => $validatedData['colegio']['provincia']
                ]
            );


            // 5. Buscar IDs de Áreas si se enviaron nombres/categorías
            $area1_id = $validatedData['area1_id'] ?? null;
            $area1 = null;
            if (!$area1_id && isset($validatedData['area1_nombre'])) {
                $area1 = Area::where('nombre', $validatedData['area1_nombre'])
                             ->when(isset($validatedData['area1_categoria']), function ($q) use ($validatedData) {
                                 return $q->where('categoria', $validatedData['area1_categoria']);
                             })
                             ->first();
                if ($area1) $area1_id = $area1->id;
            } elseif ($area1_id) {
                $area1 = Area::find($area1_id);
            }

            $area2_id = $validatedData['area2_id'] ?? null;
            $area2 = null;
            if (!$area2_id && isset($validatedData['area2_nombre']) && !empty($validatedData['area2_nombre'])) {
                $area2 = Area::where('nombre', $validatedData['area2_nombre'])
                             ->when(isset($validatedData['area2_categoria']), function ($q) use ($validatedData) {
                                 return $q->where('categoria', $validatedData['area2_categoria']);
                             })
                             ->first();
                if ($area2) $area2_id = $area2->id;
            } elseif ($area2_id) {
                $area2 = Area::find($area2_id);
            }

            // Generar ID único para la inscripción individual (ACORTADO PARA OCR)
            $idUnicoIndividual = 'IND-' . $estudiante->ci;

            // 6. Crear la Inscripción
            $inscripcion = Inscripcion::create([
                'estudiante_id' => $estudiante->ci, 
                'contacto_id' => $contacto->id,
                'colegio_id' => $colegio->id,
                'area1_id' => $area1_id,
                'area2_id' => $area2_id,
                'olimpiada_version' => $validatedData['olimpiada_version'],
                'estado' => $validatedData['estado'],
                'codigo_comprobante' => $idUnicoIndividual, // Usar el ID único individual
                'fecha' => $validatedData['fecha'],
            ]);

            // Calcular monto total de forma simplificada y más robusta
            $montoTotal = 0;
            $costoPorDefecto = 15; // Costo por defecto si un área existe pero su costo es 0, nulo o no numérico en BD

            Log::info('Calculando monto total:', [
                'area1_obj_exists' => !is_null($area1),
                'area1_id' => $area1_id,
                'area2_obj_exists' => !is_null($area2),
                'area2_id' => $area2_id,
            ]);

            if ($area1) { // Si el objeto Area1 se encontró/existe
                // Usar el costo del área si es numérico y mayor a 0, sino el costo por defecto.
                $costoArea1 = (is_numeric($area1->costo) && $area1->costo > 0) ? $area1->costo : $costoPorDefecto;
                $montoTotal += $costoArea1;
                Log::info('Costo Area 1 aplicado:', ['area_id' => $area1->id, 'nombre' => $area1->nombre, 'costo_bd' => $area1->costo, 'costo_aplicado' => $costoArea1]);
            } else {
                Log::info('Area 1 no encontrada o no seleccionada, no se aplica costo para Area 1.');
            }

            if ($area2) { // Si el objeto Area2 se encontró/existe
                // Solo sumar si area2 es diferente de area1 (si area1 también existe y tiene ID)
                // O si area1 no existe (en cuyo caso area2 es la única área con costo potencial)
                if (!$area1 || ($area1 && $area1->id != $area2->id)) {
                    $costoArea2 = (is_numeric($area2->costo) && $area2->costo > 0) ? $area2->costo : $costoPorDefecto;
                    $montoTotal += $costoArea2;
                    Log::info('Costo Area 2 aplicado:', ['area_id' => $area2->id, 'nombre' => $area2->nombre, 'costo_bd' => $area2->costo, 'costo_aplicado' => $costoArea2]);
                } else if ($area1 && $area1->id == $area2->id) {
                    Log::info('Area 2 es la misma que Area 1, no se aplica costo adicional para Area 2.');
                }
            } else {
                Log::info('Area 2 no encontrada o no seleccionada, no se aplica costo para Area 2.');
            }
            
            Log::info('Monto total final calculado:', ['monto' => $montoTotal]);


            $fechaLimitePago = now()->addDays(3)->toDateString();

            // Confirmar transacción
            DB::commit();

            Log::info('Inscripción creada con éxito en store.', ['inscripcion_id' => $inscripcion->id, 'codigo_comprobante' => $idUnicoIndividual]);

            // Devolver una respuesta JSON estructurada
            return response()->json([
                'message' => 'Inscripción registrada correctamente.',
                'id' => $inscripcion->id, // ID numérico de la inscripción
                'registro_id_display' => $idUnicoIndividual, // ID para mostrar en PDF
                'codigo_pago' => $idUnicoIndividual, // Código para el banco
                'monto_total' => $montoTotal,
                'fecha_limite_pago' => $fechaLimitePago,
                'estudiante' => $estudiante->only(['nombres', 'apellidos', 'ci']),
                'contacto' => $contacto->only(['nombre', 'correo', 'celular']),
                'area1' => $area1 ? $area1->only(['nombre', 'categoria']) : null,
                'area2' => $area2 ? $area2->only(['nombre', 'categoria']) : null,
            ], 201);

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
     * Endpoint: POST /inscripción/grupo (necesita definir ruta en api.php como 'inscripción/grupo')
     */
    public function storeGroup(Request $request)
    {
        // Iniciar transacción
        DB::beginTransaction();
        try {
            // 1. Validar datos de tutores (ahora plural) y array de inscripciones
            $validatedData = $request->validate([
                'contactos_tutores' => 'required|array|min:1',
                'contactos_tutores.*.celular' => 'required|string|max:20',
                'contactos_tutores.*.nombre' => 'required|string|max:100',
                'contactos_tutores.*.correo' => 'required|string|email|max:100',

                'inscripciones' => 'required|array|min:1',
                'inscripciones.*.estudiante' => 'required|array',
                'inscripciones.*.estudiante.ci' => 'required|string|max:20',
                'inscripciones.*.estudiante.nombres' => 'required|string|max:100',
                'inscripciones.*.estudiante.apellidos' => 'required|string|max:100',
                'inscripciones.*.estudiante.fecha_nacimiento' => 'required|date_format:Y-m-d',
                'inscripciones.*.estudiante.curso' => 'required|string|max:50',
                'inscripciones.*.estudiante.correo' => 'required|string|email|max:100',

                'inscripciones.*.colegio' => 'required|array',
                'inscripciones.*.colegio.nombre' => 'required|string|max:150',
                'inscripciones.*.colegio.departamento' => 'required|string|max:100',
                'inscripciones.*.colegio.provincia' => 'required|string|max:100',

                // Ajuste para aceptar IDs de área o nombres/categorías
                'inscripciones.*.area1_id' => 'nullable|integer|exists:area,id',
                'inscripciones.*.area1_nombre' => 'required_without:inscripciones.*.area1_id|nullable|string|max:100',
                'inscripciones.*.area1_categoria' => 'nullable|string|max:50', // Ya no es 'required_with' si el ID puede venir solo
                
                'inscripciones.*.area2_id' => 'nullable|integer|exists:area,id',
                'inscripciones.*.area2_nombre' => 'nullable|string|max:100', // No 'required_without' area2_id, puede ser opcional
                'inscripciones.*.area2_categoria' => 'nullable|string|max:50',

                'olimpiada_version' => 'required|integer|exists:olimpiada,version',
            ]);

            // 2. Crear o buscar todos los contactos de tutores
            $contactosTutores = [];
            foreach ($validatedData['contactos_tutores'] as $tutorData) {
                $contactoTutor = Contacto::firstOrCreate(
                    ['correo' => $tutorData['correo']],
                    $tutorData
                );
                $contactosTutores[] = $contactoTutor;
            }

            // Usar el primer tutor como contacto principal para las inscripciones
            $contactoPrincipal = $contactosTutores[0];

            $inscripcionesCreadas = [];
            $montoTotal = 0;
            $fechaHoy = now()->toDateString();
            $olimpiadaVersion = $validatedData['olimpiada_version'];

            // Generar un único ID para el grupo
            $idUnicoGrupo = 'GRP-' . $contactoPrincipal->id . '-' . time();

            // 3. Procesar cada inscripción de estudiante
            foreach ($validatedData['inscripciones'] as $index => $inscripcionData) { // Añadir $index para mensajes de error
                $estudiante = Estudiante::updateOrCreate(
                    ['ci' => $inscripcionData['estudiante']['ci']],
                    Arr::except($inscripcionData['estudiante'], ['ci'])
                );

                $colegio = Colegio::firstOrCreate(
                    [
                        'nombre' => $inscripcionData['colegio']['nombre'],
                        'departamento' => $inscripcionData['colegio']['departamento'],
                        'provincia' => $inscripcionData['colegio']['provincia']
                    ]
                );

                $area1_id = $inscripcionData['area1_id'] ?? null;
                $area1 = null;
                if ($area1_id) {
                    $area1 = Area::find($area1_id);
                } elseif (isset($inscripcionData['area1_nombre'])) {
                    $query = Area::where('nombre', $inscripcionData['area1_nombre']);
                    if (isset($inscripcionData['area1_categoria']) && !empty($inscripcionData['area1_categoria'])) {
                        $query->where('categoria', $inscripcionData['area1_categoria']);
                    }
                    $area1 = $query->first();
                    if ($area1) $area1_id = $area1->id;
                }

                // Asegurarse de que el área 1 exista si se proporcionó algún dato para ella
                if ((isset($inscripcionData['area1_id']) || isset($inscripcionData['area1_nombre'])) && !$area1) {
                    throw ValidationException::withMessages([
                        "inscripciones.{$index}.area1" => 'El Área 1 especificada es inválida o no existe.',
                    ]);
                }
                // Si no se proporcionó area1_id ni area1_nombre, es un error ya que al menos un área es requerida.
                if (!$area1) {
                     throw ValidationException::withMessages([
                        "inscripciones.{$index}.area1" => 'Se requiere al menos un área de inscripción (Área 1).',
                    ]);
                }


                $area2_id = $inscripcionData['area2_id'] ?? null;
                $area2 = null;
                if ($area2_id) {
                    $area2 = Area::find($area2_id);
                } elseif (isset($inscripcionData['area2_nombre']) && !empty($inscripcionData['area2_nombre'])) {
                    $query = Area::where('nombre', $inscripcionData['area2_nombre']);
                     if (isset($inscripcionData['area2_categoria']) && !empty($inscripcionData['area2_categoria'])) {
                        $query->where('categoria', $inscripcionData['area2_categoria']);
                    }
                    $area2 = $query->first();
                    if ($area2) $area2_id = $area2->id;
                }
                
                // Si se intentó especificar area2 (por ID o nombre) pero no se encontró, es un error de validación.
                if ((isset($inscripcionData['area2_id']) || (isset($inscripcionData['area2_nombre']) && !empty($inscripcionData['area2_nombre']))) && !$area2) {
                    throw ValidationException::withMessages([
                        "inscripciones.{$index}.area2" => 'El Área 2 especificada es inválida o no existe.',
                    ]);
                }

                // Lógica de modo 'unico'
                if ($area1 && $area1->modo === 'unico' && $area2) {
                    throw ValidationException::withMessages([
                        "inscripciones.{$index}.areas" => "Si el Área 1 ({$area1->nombre}) es de inscripción única, no se permite un Área 2.",
                    ]);
                }
                
                // Si area1 es 'unico', area2_id debe ser null
                $final_area2_id = ($area1 && $area1->modo === 'unico') ? null : ($area2 ? $area2->id : null);


                $inscripcion = Inscripcion::create([
                    'estudiante_id' => $estudiante->ci,
                    'contacto_id' => $contactoPrincipal->id,
                    'colegio_id' => $colegio->id,
                    'area1_id' => $area1_id, // $area1_id ya está definido y validado
                    'area2_id' => $final_area2_id, // Usar el $final_area2_id ajustado
                    'olimpiada_version' => $olimpiadaVersion,
                    'estado' => 'pendiente',
                    'fecha' => $fechaHoy,
                    'codigo_comprobante' => $idUnicoGrupo,
                ]);

                $inscripcionesCreadas[] = $inscripcion->id;
                
                // Calcular costo de inscripción
                $costoPorDefecto = 15; // Costo por defecto si un área no tiene costo definido o es 0
                $costoInscripcion = 0;
                
                if ($area1) {
                    $costoArea1 = (is_numeric($area1->costo) && $area1->costo > 0) ? $area1->costo : $costoPorDefecto;
                    $costoInscripcion += $costoArea1;
                }
                
                // Sumar costo de area2 solo si area1 no es 'unico' y area2 existe y es diferente de area1
                if ($area1 && $area1->modo !== 'unico' && $area2 && $area1->id != $area2->id) {
                    $costoArea2 = (is_numeric($area2->costo) && $area2->costo > 0) ? $area2->costo : $costoPorDefecto;
                    $costoInscripcion += $costoArea2;
                }
                
                // Si no hay áreas válidas pero se seleccionaron IDs (este caso debería ser cubierto por validaciones anteriores)
                // No obstante, si por alguna razón costoInscripcion es 0 y se intentó inscribir, aplicar costo por defecto.
                if ($costoInscripcion == 0 && $area1_id) { // Solo necesitamos area1_id para esta comprobación
                    $costoInscripcion = $costoPorDefecto;
                }
                
                $montoTotal += $costoInscripcion;
            }

            // 4. Crear registros en la tabla tutoria para todos los tutores
            foreach ($contactosTutores as $contactoTutor) {
                Tutoria::create([
                    'contacto_id' => $contactoTutor->id,
                    'codigo_comprobante' => $idUnicoGrupo,
                ]);
            }

            $fechaLimitePago = now()->addDays(3)->toDateString();

            DB::commit();

            Log::info('Inscripción grupal creada exitosamente', [
                'registro_grupal_id' => $idUnicoGrupo,
                'cantidad_estudiantes' => count($inscripcionesCreadas),
                'cantidad_tutores' => count($contactosTutores),
                'monto_total' => $montoTotal
            ]);

            return response()->json([
                'message' => 'Inscripciones grupales registradas correctamente.',
                'registro_grupal_id' => $idUnicoGrupo,
                'cantidad_estudiantes' => count($inscripcionesCreadas),
                'cantidad_tutores' => count($contactosTutores),
                'monto_total' => $montoTotal,
                'codigo_pago' => $idUnicoGrupo,
                'fecha_limite_pago' => $fechaLimitePago,
                'ids_inscripciones' => $inscripcionesCreadas,
            ], 201);

        } catch (ValidationException $e) {
            DB::rollBack();
            Log::warning('Error de validación al crear inscripción grupal: ', $e->errors());
            return response()->json(['message' => 'Error de validación.', 'errors' => $e->errors()], 422);
        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error interno al crear inscripción grupal: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return response()->json(['message' => 'Error interno al procesar la inscripción grupal.'], 500);
        }
    }

    /**
     * Busca inscripciones por el código de pago/recibo.
     * GET /inscripción/buscar-por-codigo-recibo?codigo=CODIGO_PAGO (necesita definir ruta en api.php como 'inscripción/buscar-por-codigo-recibo')
     */
    public function buscarPorCodigoRecibo(Request $request)
    {
        Log::info('MÉTODO buscarPorCodigoRecibo INICIADO.'); 

        $request->validate([
            'codigo' => 'required|string|max:100', 
        ]);

        $codigoReciboInput = $request->input('codigo');
        Log::info('Código OCR Input CRUDO recibido en buscarPorCodigoRecibo:', ['raw_input' => $codigoReciboInput]);
        
        $codigoReciboLimpio = null;

        // Intentar extraer código IND-
        if (preg_match('/(IND)\s*(-)\s*(\d+)/i', $codigoReciboInput, $matchesInd)) {
            $codigoReciboLimpio = strtoupper($matchesInd[1]) . $matchesInd[2] . $matchesInd[3]; // IND-1234567
            Log::info('Código IND- extraído y normalizado con regex:', ['input' => $codigoReciboInput, 'extraido_normalizado' => $codigoReciboLimpio]);
        } 
        // Si no es IND-, intentar extraer código GRP-
        elseif (preg_match('/(GRP)\s*(-)\s*(\d+-\d+)/i', $codigoReciboInput, $matchesGrp)) { 
            // GRP-IDTUTOR-TIMESTAMP (ej: GRP-32-1747444856)
            $codigoReciboLimpio = strtoupper($matchesGrp[1]) . $matchesGrp[2] . $matchesGrp[3]; 
            Log::info('Código GRP- extraído y normalizado con regex:', ['input' => $codigoReciboInput, 'extraido_normalizado' => $codigoReciboLimpio]);
        } else {
            Log::info('Patrón IND- o GRP- no encontrado con regex. Input no procesado.', ['input' => $codigoReciboInput]);
        }

        if (!$codigoReciboLimpio) {
            Log::warning('No se pudo extraer un código IND- o GRP- válido del input.', ['input' => $codigoReciboInput]);
            return response()->json([], 200); 
        }
        
        $tableName = (new Inscripcion)->getTable(); 

        Log::info('Buscando inscripciones por codigo_comprobante:', [
            'input_original' => $codigoReciboInput,
            'codigo_buscado_limpio' => $codigoReciboLimpio,
            'table_name_from_model' => $tableName 
        ]);

        DB::enableQueryLog();

        // Usar $tableName en la consulta.
        // La comparación se hace en minúsculas para ser consistente, aunque normalizamos a mayúsculas.
        $inscripciones = Inscripcion::whereRaw('LOWER(TRIM("'.$tableName.'".codigo_comprobante)) = ?', [strtolower($codigoReciboLimpio)])
            ->with(['estudiante:ci,nombres,apellidos', 'area1:id,nombre,categoria', 'area2:id,nombre,categoria'])
            ->get();
        
        $queries = DB::getQueryLog();
        Log::info('SQL Queries ejecutadas:', $queries);
        DB::disableQueryLog(); // Opcional: deshabilitar después si no se necesita globalmente

        // Log detallado de las inscripciones recuperadas por Eloquent
        Log::info('Inscripciones recuperadas por Eloquent (antes de formatear):', $inscripciones->toArray());


        Log::info('Resultado de la búsqueda de inscripciones:', [
            'codigo_buscado' => $codigoReciboLimpio,
            'cantidad_encontrada' => $inscripciones->count(),
        ]);

        if ($inscripciones->isEmpty()) {
            return response()->json([], 200); 
        }

        $formattedInscripciones = $inscripciones->map(function ($inscripcion) {
            return [
                'id_inscripcion' => $inscripcion->id,
                // PASO 3 (continuación): El objeto 'estudiante' relacionado se incluye aquí.
                'estudiante' => $inscripcion->estudiante, // Incluye nombre, apellidos, ci
                'area1' => $inscripcion->area1,         // Incluye nombre del área
                'area2' => $inscripcion->area2,         // Incluye nombre del área
            ];
        });


        return response()->json($formattedInscripciones);
    }

    /**
     * Aprueba inscripciones basadas en el código de recibo.
     * POST /pagos/aprobar-por-codigo
     */
    public function aprobarPorCodigoRecibo(Request $request)
    {
        $validatedData = $request->validate([
            'codigo_recibo' => 'required|string|max:100', 
            'nombre_pagador' => 'nullable|string|max:100', // Añadido para el campo OCR "CANCELADO POR"
        ]);

        $codigoReciboInput = $validatedData['codigo_recibo'];
        $nombrePagador = $validatedData['nombre_pagador'] ?? null; // Extraer el nombre del pagador
        
        Log::info('Código OCR Input CRUDO recibido en aprobarPorCodigoRecibo:', [
            'raw_input' => $codigoReciboInput,
            'nombre_pagador' => $nombrePagador
        ]);

        $codigoReciboLimpio = null;
        $tableName = (new Inscripcion)->getTable(); 

        // Intentar extraer código IND-
        if (preg_match('/(IND)\s*(-)\s*(\d+)/i', $codigoReciboInput, $matchesInd)) {
            $codigoReciboLimpio = strtoupper($matchesInd[1]) . $matchesInd[2] . $matchesInd[3];
            Log::info('Código IND- extraído y normalizado con regex en aprobarPorCodigoRecibo:', ['input' => $codigoReciboInput, 'extraido_normalizado' => $codigoReciboLimpio]);
        } 
        // Si no es IND-, intentar extraer código GRP-
        elseif (preg_match('/(GRP)\s*(-)\s*(\d+-\d+)/i', $codigoReciboInput, $matchesGrp)) {
            $codigoReciboLimpio = strtoupper($matchesGrp[1]) . $matchesGrp[2] . $matchesGrp[3];
            Log::info('Código GRP- extraído y normalizado con regex en aprobarPorCodigoRecibo:', ['input' => $codigoReciboInput, 'extraido_normalizado' => $codigoReciboLimpio]);
        } else {
            Log::info('Patrón IND- o GRP- no encontrado con regex en aprobarPorCodigoRecibo. Input no procesado.', ['input' => $codigoReciboInput]);
        }

        if (!$codigoReciboLimpio) {
            Log::warning('No se pudo extraer un código IND- o GRP- válido del input para aprobación.', ['input' => $codigoReciboInput]);
            return response()->json(['message' => 'El código de recibo proporcionado no tiene un formato reconocible.'], 400);
        }

        Log::info('Inicio de aprobarPorCodigoRecibo.', [
            'codigo_recibo_input_original' => $validatedData['codigo_recibo'], 
            'codigo_recibo_limpio' => $codigoReciboLimpio,
            'nombre_pagador' => $nombrePagador,
            'table_name_from_model' => $tableName 
        ]);

        DB::beginTransaction();
        try {
            // Usar $tableName en la consulta
            // La comparación se hace en minúsculas para ser consistente.
            $inscripciones = Inscripcion::whereRaw('LOWER(TRIM("'.$tableName.'".codigo_comprobante)) = ?', [strtolower($codigoReciboLimpio)])->get();

            if ($inscripciones->isEmpty()) {
                DB::rollBack();
                Log::warning('No se encontraron inscripciones para aprobar con el código (búsqueda insensible):', ['codigo_recibo' => $codigoReciboLimpio]);
                return response()->json(['message' => 'No se encontraron inscripciones con el código de recibo proporcionado para aprobar.'], 404);
            }

            $actualizadas = 0;
            foreach ($inscripciones as $inscripcion) {
                // Solo actualizar si está pendiente para evitar re-aprobaciones innecesarias
                if ($inscripcion->estado === 'pendiente') {
                    $inscripcion->estado = 'aprobado';
                    // Guardar el nombre del pagador si se proporcionó
                    if ($nombrePagador) {
                        $inscripcion->nombre_pagador = $nombrePagador;
                    }
                    $inscripcion->save();
                    $actualizadas++;
                }
            }

            DB::commit();

            // Log para verificar el estado después del commit
            Log::info('Verificación post-aprobación para código de recibo:', [
                'codigo_recibo' => $codigoReciboLimpio, 
                'nombre_pagador_guardado' => $nombrePagador,
                'table_name_from_model' => $tableName
            ]);
            // Usar $tableName también en esta consulta de verificación
            $inscripcionesPostAprobacion = Inscripcion::whereRaw('LOWER(TRIM("'.$tableName.'".codigo_comprobante)) = ?', [strtolower($codigoReciboLimpio)])
                                                    ->with(['estudiante:ci,nombres,apellidos']) // Cargar solo lo necesario para el log
                                                    ->get(['id', 'estudiante_id', 'estado', 'codigo_comprobante']);
            Log::info('Inscripciones encontradas post-aprobación:', $inscripcionesPostAprobacion->toArray());


            if ($actualizadas > 0) {
                Log::info('Inscripciones aprobadas correctamente.', [
                    'codigo_recibo' => $codigoReciboLimpio, 
                    'cantidad' => $actualizadas,
                    'nombre_pagador' => $nombrePagador
                ]);
                return response()->json([
                    'message' => 'Inscripciones aprobadas correctamente.', 
                    'cantidad_aprobadas' => $actualizadas,
                    'nombre_pagador_guardado' => $nombrePagador
                ]);
            } else {
                Log::info('No hubo inscripciones pendientes para aprobar.', ['codigo_recibo' => $codigoReciboLimpio]);
                return response()->json(['message' => 'No hubo inscripciones pendientes para aprobar con este código.', 'cantidad_aprobadas' => 0], 200);
            }

        } catch (\Exception $e) {
            DB::rollBack();
            Log::error('Error al aprobar inscripciones por código de recibo: ' . $e->getMessage() . ' Trace: ' . $e->getTraceAsString());
            return response()->json(['message' => 'Error interno al procesar la aprobación.'], 500);
        }
    }
}
