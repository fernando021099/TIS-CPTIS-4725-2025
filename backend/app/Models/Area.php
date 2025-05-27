<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Area extends Model
{
    use HasFactory;

    protected $table = 'area';
    public $timestamps = false;

    /**
     * The attributes that are mass assignable.
     *
     * @var array<int, string>
     */
    protected $fillable = [
        'nombre',
        'categoria',
        'descripcion',
        'estado',
        'costo',
        'modo'
    ];

    /**
     * The attributes that should be cast.
     *
     * @var array
     */
    protected $casts = [
        'costo' => 'decimal:2',
    ];

    /**
     * Get inscriptions that use this area as area1
     */
    public function inscripcionesArea1()
    {
        return $this->hasMany(Inscripcion::class, 'area1_id');
    }

    /**
     * Get inscriptions that use this area as area2
     */
    public function inscripcionesArea2()
    {
        return $this->hasMany(Inscripcion::class, 'area2_id');
    }

    /**
     * Get all inscriptions that use this area (either as area1 or area2)
     */
    public function inscripciones()
    {
        return $this->inscripcionesArea1()->union($this->inscripcionesArea2());
    }

    /**
     * Scope a query to only include active areas.
     */
    public function scopeActive($query)
    {
        return $query->where('estado', 'activo');
    }

    /**
     * Scope a query to filter by area name.
     */
    public function scopeByName($query, $name)
    {
        return $query->where('nombre', $name);
    }

    /**
     * Scope a query to filter by category.
     */
    public function scopeByCategory($query, $category)
    {
        return $query->where('categoria', $category);
    }
}
