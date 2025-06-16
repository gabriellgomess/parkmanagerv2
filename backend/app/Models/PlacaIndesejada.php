<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PlacaIndesejada extends Model
{
    public $timestamps = false;

    protected $table = 'bl_placas_indesejadas';

    protected $fillable = [
        'placa',
        'motivo',
        'usuario',
        'cadastro',
        'marca_modelo',
        'cor'
    ];
}

