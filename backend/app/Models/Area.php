<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;

    protected $table = 'area'; // Nombre exacto de la tabla en la base de datos
    public $timestamps = false; // La tabla 'area' no tiene timestamps created_at/updated_at

    /**
     * Los atributos que son asignables masivamente.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nombre',
        'categoria',
        'descripcion',
        'estado',
        'costo',
        'modo',
    ];

    // Si necesitas relaciones inversas (desde Area a Inscripcion), puedes definirlas aquí
    // Por ejemplo, para obtener todas las inscripciones donde esta área es area1
    public function inscripcionesComoArea1()
    {
        return $this->hasMany(Inscripcion::class, 'area1_id');
    }

    // Para obtener todas las inscripciones donde esta área es area2
    public function inscripcionesComoArea2()
    {
        return $this->hasMany(Inscripcion::class, 'area2_id');
    }
}
