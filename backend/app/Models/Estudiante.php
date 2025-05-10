<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Estudiante extends Model
{
    use HasFactory;

    protected $table = 'estudiante'; // Especifica el nombre de la tabla
    protected $primaryKey = 'ci'; // Especifica la clave primaria
    public $incrementing = false; // Indica que la clave primaria no es autoincremental
    protected $keyType = 'string'; // Tipo de la clave primaria

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
        return $this->hasMany(Inscripcion::class, 'estudiante_id', 'ci');
    }
}
