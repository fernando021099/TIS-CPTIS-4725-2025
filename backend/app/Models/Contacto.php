<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Contacto extends Model
{
    use HasFactory;

    protected $table = 'contacto'; // Especifica el nombre de la tabla
    public $timestamps = false; // Asume que no hay columnas created_at/updated_at

    /**
     * Los atributos que son asignables masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'celular',
        'nombre',
        'correo',
    ];

    /**
     * Obtiene las inscripciones asociadas al contacto.
     */
    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class, 'contacto_id');
    }
}
