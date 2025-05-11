<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Inscripcion extends Model
{
    use HasFactory;

    protected $table = 'inscripción'; // CONFIRMADO: debe ser 'inscripción' (singular, con tilde)
    public $timestamps = false; // Asume que no hay columnas created_at/updated_at (solo 'fecha')

    /**
     * Los atributos que son asignables masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'estudiante_id',
        'contacto_id',
        'colegio_id',
        'area1_id',
        'area2_id',
        'olimpiada_version',
        'estado',
        'codigo_comprobante',
        'fecha',
    ];

    /**
     * Los atributos que deben ser convertidos a tipos nativos.
     *
     * @var array
     */
    protected $casts = [
        'fecha' => 'date',
    ];

    /**
     * Obtiene el estudiante asociado a la inscripción.
     */
    public function estudiante()
    {
        // La foreignKey es 'estudiante_id' en esta tabla ('inscripcion')
        // La ownerKey es 'ci' en la tabla 'estudiante'
        return $this->belongsTo(Estudiante::class, 'estudiante_id', 'ci');
    }

    /**
     * Obtiene el contacto asociado a la inscripción.
     */
    public function contacto()
    {
        return $this->belongsTo(Contacto::class, 'contacto_id');
    }

    /**
     * Obtiene el colegio asociado a la inscripción.
     */
    public function colegio()
    {
        return $this->belongsTo(Colegio::class, 'colegio_id');
    }

    /**
     * Obtiene la primera área asociada a la inscripción.
     */
    public function area1()
    {
        return $this->belongsTo(Area::class, 'area1_id');
    }

    /**
     * Obtiene la segunda área asociada a la inscripción (puede ser null).
     */
    public function area2()
    {
        return $this->belongsTo(Area::class, 'area2_id');
    }

    /**
     * Obtiene la olimpiada asociada a la inscripción.
     */
    public function olimpiada()
    {
        return $this->belongsTo(Olimpiada::class, 'olimpiada_version', 'version');
    }
}
