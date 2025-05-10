<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Colegio extends Model
{
    use HasFactory;

    protected $table = 'colegio'; // Especifica el nombre de la tabla
    public $timestamps = false; // Asume que no hay columnas created_at/updated_at

    /**
     * Los atributos que son asignables masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nombre',
        'departamento',
        'provincia',
    ];

    /**
     * Obtiene las inscripciones asociadas al colegio.
     */
    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class, 'colegio_id');
    }
}
