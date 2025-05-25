<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Tutoria extends Model
{
    use HasFactory;

    protected $table = 'tutoria';
    public $timestamps = false;

    protected $fillable = [
        'contacto_id',
        'codigo_comprobante',
    ];

    /**
     * Obtiene el contacto asociado a la tutoría.
     */
    public function contacto()
    {
        return $this->belongsTo(Contacto::class, 'contacto_id');
    }
}
