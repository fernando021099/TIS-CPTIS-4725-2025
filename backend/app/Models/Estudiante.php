<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    use HasFactory;

    protected $table = 'estudiante'; // Especifica el nombre de la tabla
    protected $primaryKey = 'ci'; // Clave primaria es 'ci'
    public $incrementing = false; // La clave primaria 'ci' no es autoincremental
    protected $keyType = 'string'; // El tipo de la clave primaria 'ci' es string

    public $timestamps = false; // Asume que no hay columnas created_at/updated_at

    /**
     * Los atributos que son asignables masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'ci',
        'correo',
        'apellidos',
        'nombres',
        'fecha_nacimiento',
        'curso',
    ];

    /**
     * Obtiene las inscripciones asociadas al estudiante.
     */
    public function inscripciones()
    {
        // La foreignKey es 'estudiante_id' en la tabla 'inscripcion'
        // La localKey es 'ci' en la tabla 'estudiante'
        return $this->hasMany(Inscripcion::class, 'estudiante_id', 'ci');
    }
}
