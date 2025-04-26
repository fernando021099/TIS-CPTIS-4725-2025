<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Olimpiada extends Model
{
    use HasFactory;

    protected $table = 'olimpiada'; // Especifica el nombre de la tabla
    protected $primaryKey = 'version'; // Especifica la clave primaria
    public $incrementing = false; // Indica que la clave primaria no es autoincremental
    protected $keyType = 'int'; // Tipo de la clave primaria

    public $timestamps = false; // Asume que no hay columnas created_at/updated_at

    /**
     * Los atributos que son asignables masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'version',
        'nombre',
        'fecha',
        'estado',
    ];

    /**
     * Obtiene las inscripciones asociadas a la olimpiada.
     */
    public function inscripciones()
    {
        return $this->hasMany(Inscripcion::class, 'olimpiada_version', 'version');
    }
}
